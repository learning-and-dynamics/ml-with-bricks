"use client";

import { EventEmitter } from "events";
import {
  ClearSlotRequest,
  ClearSlotResponse,
  DeviceNotificationRequest,
  DeviceNotificationResponse,
  InfoRequest,
  InfoResponse,
  ProgramFlowRequest,
  ProgramFlowResponse,
  StartFileUploadRequest,
  StartFileUploadResponse,
  TransferChunkRequest,
  TransferChunkResponse,
  BaseMessage,
  MessageID,
  DeviceNotification,
  ConsoleNotification,
  deserializeMessage,
  ProgramFlowNotification,
  TunnelMessageChunk,
} from "./bleMessages";
import crc from "./crc";
import cobs from "./cobs";
import { createDeferred, Deferred } from "./createDeferred";

type TunnelMessageItem = {
  chunks: TunnelMessageChunk[];
  deferred: Deferred<void>;
};

export class LegoBleConnector extends EventEmitter {
  private device: BluetoothDevice | null = null;
  private server: BluetoothRemoteGATTServer | null = null;
  private service: BluetoothRemoteGATTService | null = null;
  private rxCharacteristic: BluetoothRemoteGATTCharacteristic | null = null;
  private txCharacteristic: BluetoothRemoteGATTCharacteristic | null = null;
  private infoResponse: InfoResponse | null = null;
  private pendingResponse: {
    id: MessageID;
    resolve: (message: BaseMessage) => void;
  } | null = null;

  private chunksMap: Map<number, Uint8Array> = new Map();
  private totalChunks: number = 0;
  private tunnelMessageQueue: TunnelMessageItem[] = [];
  private isProcessingTunnel = false;

  // Constants
  private readonly SERVICE_UUID = "0000fd02-0000-1000-8000-00805f9b34fb";
  private readonly RX_CHARACTERISTIC_UUID =
    "0000fd02-0001-1000-8000-00805f9b34fb";
  private readonly TX_CHARACTERISTIC_UUID =
    "0000fd02-0002-1000-8000-00805f9b34fb";
  private readonly DEFAULT_NOTIFICATION_INTERVAL_MS = 5000;
  private readonly BANDWIDTH = 8192 / 16; // 512 bytes/sec

  constructor() {
    super();

    // // Check if Web Bluetooth API is available
    // if (!navigator.bluetooth) {
    //   throw new Error("Web Bluetooth API is not available in this browser");
    // }
  }

  /**
   * Connect to a LEGO hub device
   */
  async connect(): Promise<void> {
    try {
      console.log("Scanning for LEGO® hubs...");

      // Request device with specific service UUID
      this.device = await navigator.bluetooth.requestDevice({
        filters: [{ services: [this.SERVICE_UUID] }],
      });

      console.log(`Hub detected! ${this.device.name || "Unnamed device"}`);

      // Set up disconnect listener
      this.device.addEventListener("gattserverdisconnected", () => {
        console.log("Connection lost.");
        this.emit("disconnected");
        this.removeAllListeners();
      });

      // Handle potential undefined for GATT
      const server = await this.device.gatt?.connect();
      if (!server) {
        throw new Error("Failed to connect to GATT server");
      }
      this.server = server;

      // Get the primary service
      this.service = await this.server.getPrimaryService(this.SERVICE_UUID);

      // Get characteristics
      this.rxCharacteristic = await this.service.getCharacteristic(
        this.RX_CHARACTERISTIC_UUID
      );
      this.txCharacteristic = await this.service.getCharacteristic(
        this.TX_CHARACTERISTIC_UUID
      );



      // Start notifications
      await this.txCharacteristic.startNotifications();
      this.txCharacteristic.addEventListener(
        "characteristicvaluechanged",
        this.handleNotification.bind(this)
      );

      // Initialize communication with info request
      this.infoResponse = (await this.sendRequest(
        new InfoRequest(),
        0x01
      )) as InfoResponse;

      // Enable device notifications
      const notificationResponse = (await this.sendRequest(
        new DeviceNotificationRequest(this.DEFAULT_NOTIFICATION_INTERVAL_MS),
        0x29
      )) as DeviceNotificationResponse;

      if (!notificationResponse.success) {
        throw new Error("Failed to enable notifications");
      }

      this.emit("connected");
    } catch (error) {
      console.error("Connection error:", error);
      this.disconnect();
      this.removeAllListeners();
      throw error;
    }
  }

  /**
   * Disconnect from the hub
   */
  disconnect(): void {
    if (this.server && this.server.connected) {
      this.server.disconnect();
    }

    this.device = null;
    this.server = null;
    this.service = null;
    this.rxCharacteristic = null;
    this.txCharacteristic = null;
    this.infoResponse = null;
    this.pendingResponse = null;
  }

  /**
   * Clear a program slot on the hub
   */
  async clearSlot(slot: number): Promise<boolean> {
    try {
      const response = (await this.sendRequest(
        new ClearSlotRequest(slot),
        0x47
      )) as ClearSlotResponse;
      return response.success;
    } catch (error) {
      console.warn("ClearSlotRequest was not acknowledged:", error);
      return false;
    }
  }

  /**
   * Upload a program to a slot on the hub
   */
  async uploadProgram(
    program: string,
    slot: number,
    filename: string = "program.py",
    onProgress: (percentage: number) => void = () => { }
  ): Promise<boolean> {
    try {
      const programData = new TextEncoder().encode(program);
      const programCrc = crc(programData, 0);

      // Start upload
      const startUploadResponse = (await this.sendRequest(
        new StartFileUploadRequest(filename, slot, programCrc),
        0x0d
      )) as StartFileUploadResponse;

      if (!startUploadResponse.success) {
        console.error("Start file upload was not acknowledged");
        return false;
      }
      onProgress(0);

      // Transfer in chunks
      let runningCrc = 0;
      const chunkSize = this.infoResponse?.maxChunkSize || 512;

      for (let i = 0; i < programData.length; i += chunkSize) {
        const chunk = programData.slice(i, i + chunkSize);
        runningCrc = crc(chunk, runningCrc);

        const transferChunkRequest = new TransferChunkRequest(
          runningCrc,
          chunk
        );

        const chunkResponse = (await this.sendRequest(
          transferChunkRequest,
          0x11
        )) as TransferChunkResponse;

        if (!chunkResponse.success) {
          console.error(`Failed to transfer chunk at offset ${i}`);
          return false;
        }

        onProgress(Math.round((i / programData.length) * chunkSize * 100));
      }

      return true;
    } catch (error) {
      console.error("Program upload error:", error);
      return false;
    }
  }

  /**
   * Start a program in a specific slot
   */
  async startProgram(slot: number): Promise<boolean> {
    try {
      const response = (await this.sendRequest(
        new ProgramFlowRequest(false, slot),
        0x1f
      )) as ProgramFlowResponse;

      return response.success;
    } catch (error) {
      console.error("Failed to start program:", error);
      return false;
    }
  }

  /**
   * Stop a program in a specific slot
   */
  async stopProgram(slot: number): Promise<boolean> {
    try {
      const response = (await this.sendRequest(
        new ProgramFlowRequest(true, slot),
        0x1f
      )) as ProgramFlowResponse;

      return response.success;
    } catch (error) {
      console.error("Failed to stop program:", error);
      return false;
    }
  }

  /**
   * Handle notifications from the hub
   */
  private handleNotification(event: Event): void {
    const characteristic = event.target as BluetoothRemoteGATTCharacteristic;
    if (!characteristic.value) {
      console.log("Received notification with no value");
      return;
    }

    // Fixed buffer handling to avoid typing issues
    const buffer = characteristic.value.buffer;
    const data = new Uint8Array(buffer.slice(0));

    // Check if the message is complete
    if (data.length === 0 || data[data.length - 1] !== cobs.DELIMITER) {
      console.log("Received incomplete message");
      return;
    }

    try {
      // Decode and deserialize the message
      const unpacked = cobs.unpack(data);
      const message = deserializeMessage(unpacked);

      // Resolve pending request if the IDs match
      if (this.pendingResponse && message.ID === this.pendingResponse.id) {
        const resolver = this.pendingResponse.resolve;
        this.pendingResponse = null;
        resolver(message);
      }

      // this.emit("message", message);

      // Special handling for specific notification types
      if (message instanceof DeviceNotification) {
        this.emit("deviceNotification", message);
      } else if (message instanceof ConsoleNotification) {
        this.emit("consoleNotification", message);
      } else if (message instanceof ProgramFlowNotification) {
        this.emit("programFlowNotification", message);
      } else if (message instanceof TunnelMessageChunk) {
        const { frameId, frameTotal, bytes } = message;

        if (this.totalChunks === 0) {
          this.totalChunks = frameTotal;
        }

        this.chunksMap.set(frameId, bytes);

        if (this.chunksMap.size === this.totalChunks) {
          const allChunks = Array.from({ length: this.totalChunks }, (_, i) =>
            this.chunksMap.get(i) || new Uint8Array()
          );
          const fullMessage = new Uint8Array(allChunks.reduce((sum, chunk) => sum + chunk.length, 0));

          let offset = 0;
          allChunks.forEach(chunk => {
            fullMessage.set(chunk, offset);
            offset += chunk.length;
          });

          const reassembledMessage = new TextDecoder().decode(fullMessage);

          this.chunksMap.clear();
          this.totalChunks = 0;
          try {
            const messageObject = JSON.parse(reassembledMessage);
            if (!messageObject.action || !messageObject.payload) {
              throw new Error();
            }
            this.emit("tunnelData", messageObject);

          }
          catch {
            console.error("Unparsable string received: ", reassembledMessage)
          }
        }
      }
    } catch (error) {
      console.error("Error processing message:", error);
    }
  }

  /**
   * Send a message to the hub
   */
  async sendMessage(message: BaseMessage): Promise<void> {
    if (!this.rxCharacteristic) {
      console.log("Message not sent. Not connected to a hub.");
      return;
    }

    // console.log(`Sending: ${message}`);

    // Serialize and pack the message
    const payload = message.serialize();
    const frame = cobs.pack(payload);

    // Use the max_packet_size from the info response if available
    const packetSize = this.infoResponse?.maxPacketSize || frame.length;

    // Send the frame in packets
    for (let i = 0; i < frame.length; i += packetSize) {
      const packet = frame.slice(i, i + packetSize);
      await this.rxCharacteristic.writeValue(packet);
    }
  }

  /**
   * Send a message and wait for a specific response
   */
  private sendRequest(
    message: BaseMessage,
    responseId: MessageID
  ): Promise<BaseMessage> {
    return new Promise<BaseMessage>((resolve, reject) => {
      // Set up the pending response
      if (this.pendingResponse) {
        reject(new Error("Another request is already in progress"));
        return;
      }

      this.pendingResponse = { id: responseId, resolve };

      // Send the message
      this.sendMessage(message).catch(reject);

      // Set a timeout for the response
      setTimeout(() => {
        if (this.pendingResponse?.id === responseId) {
          this.pendingResponse = null;
          reject(new Error(`Request timed out. Message: ${message}`));
        }
      }, 10000); // 10 second timeout
    });
  }

  async sendTunnelData(data: string | object): Promise<void> {
    const encoded = new TextEncoder().encode(
      typeof data === "string" ? data : JSON.stringify(data)
    );

    const maxChunkSize = this.infoResponse?.maxChunkSize || 512;
    const maxMessageSize = maxChunkSize - 5;
    const totalFrames = Math.ceil(encoded.length / maxMessageSize);

    const chunks = [];
    for (let i = 0; i < encoded.length; i += maxMessageSize) {
      const chunk = encoded.slice(i, i + maxMessageSize);
      chunks.push(new TunnelMessageChunk(chunk, i, totalFrames));
    }

    const deferred = createDeferred<void>();

    this.tunnelMessageQueue.push({ chunks, deferred });
    this.processTunnelQueue();

    return deferred.promise;
  }

  private async processTunnelQueue() {
    if (this.isProcessingTunnel) return;
    this.isProcessingTunnel = true;


    while (this.tunnelMessageQueue.length > 0) {
      const { chunks, deferred } = this.tunnelMessageQueue.shift()!;

      for (const tunnelMessageChunk of chunks) {
        const packetSize = tunnelMessageChunk.serialize().length;
        const delay = Math.floor((1000 * packetSize) / this.BANDWIDTH); // ms
        await this.sendMessage(tunnelMessageChunk);
        await new Promise((res) => setTimeout(res, delay));
      }

      deferred.resolve();
    }

    this.isProcessingTunnel = false;
  }
}
