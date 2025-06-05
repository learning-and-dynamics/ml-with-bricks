export type MessageID = number;
type CRCValue = number;

export abstract class BaseMessage {
  abstract get ID(): MessageID;
  abstract serialize(): Uint8Array;
}

export class InfoRequest extends BaseMessage {
  get ID(): MessageID {
    return 0x00;
  }

  serialize(): Uint8Array {
    return new Uint8Array([this.ID]);
  }

  toString(): string {
    return "InfoRequest()";
  }
}

export class InfoResponse extends BaseMessage {
  get ID(): MessageID {
    return 0x01;
  }
  rpcMajor: number;
  rpcMinor: number;
  rpcBuild: number;
  firmwareMajor: number;
  firmwareMinor: number;
  firmwareBuild: number;
  maxPacketSize: number;
  maxMessageSize: number;
  maxChunkSize: number;
  productGroupDevice: number;

  constructor(
    rpcMajor: number,
    rpcMinor: number,
    rpcBuild: number,
    firmwareMajor: number,
    firmwareMinor: number,
    firmwareBuild: number,
    maxPacketSize: number,
    maxMessageSize: number,
    maxChunkSize: number,
    productGroupDevice: number
  ) {
    super();
    this.rpcMajor = rpcMajor;
    this.rpcMinor = rpcMinor;
    this.rpcBuild = rpcBuild;
    this.firmwareMajor = firmwareMajor;
    this.firmwareMinor = firmwareMinor;
    this.firmwareBuild = firmwareBuild;
    this.maxPacketSize = maxPacketSize;
    this.maxMessageSize = maxMessageSize;
    this.maxChunkSize = maxChunkSize;
    this.productGroupDevice = productGroupDevice;
  }

  serialize(): Uint8Array {
    const buffer = new Uint8Array(21);
    buffer[0] = this.ID;
    buffer[1] = this.rpcMajor;
    buffer[2] = this.rpcMinor;
    // and so on, this is a simplified example
    return buffer;
  }

  toString(): string {
    return `InfoResponse(rpcVersion=${this.rpcMajor}.${this.rpcMinor}.${this.rpcBuild}, firmwareVersion=${this.firmwareMajor}.${this.firmwareMinor}.${this.firmwareBuild}, maxPacketSize=${this.maxPacketSize}, maxChunkSize=${this.maxChunkSize})`;
  }
}

export class DeviceNotificationRequest extends BaseMessage {
  get ID(): MessageID {
    return 0x28;
  }
  intervalMs: number;

  constructor(intervalMs: number) {
    super();
    this.intervalMs = intervalMs;
  }

  serialize(): Uint8Array {
    const buffer = new Uint8Array(3);
    buffer[0] = this.ID;
    new DataView(buffer.buffer, 1, 2).setUint16(0, this.intervalMs, true);
    return buffer;
  }

  toString(): string {
    return `DeviceNotificationRequest(intervalMs=${this.intervalMs})`;
  }
}

export class DeviceNotificationResponse extends BaseMessage {
  get ID(): MessageID {
    return 0x29;
  }
  success: boolean;

  constructor(success: boolean) {
    super();
    this.success = success;
  }

  serialize(): Uint8Array {
    const buffer = new Uint8Array(2);
    buffer[0] = this.ID;
    buffer[1] = this.success ? 0 : 1;
    return buffer;
  }

  toString(): string {
    return `DeviceNotificationResponse(success=${this.success})`;
  }
}

export class DeviceNotification extends BaseMessage {
  get ID(): MessageID {
    return 0x3c;
  }
  size: number;
  messages: Array<[string, any]>;

  constructor(size: number, messages: Array<[string, any]>) {
    super();
    this.size = size;
    this.messages = messages;
  }

  serialize(): Uint8Array {
    // Simplified implementation
    return new Uint8Array([this.ID]);
  }

  toString(): string {
    const updated = this.messages.map((m) => m[0]);
    return `DeviceNotification(${updated.join(", ")})`;
  }
}

export class ClearSlotRequest extends BaseMessage {
  get ID(): MessageID {
    return 0x46;
  }
  slot: number;

  constructor(slot: number) {
    super();
    this.slot = slot;
  }

  serialize(): Uint8Array {
    const buffer = new Uint8Array(2);
    buffer[0] = this.ID;
    buffer[1] = this.slot;
    return buffer;
  }

  toString(): string {
    return `ClearSlotRequest(slot=${this.slot})`;
  }
}

export class ClearSlotResponse extends BaseMessage {
  get ID(): MessageID {
    return 0x47;
  }
  success: boolean;

  constructor(success: boolean) {
    super();
    this.success = success;
  }

  serialize(): Uint8Array {
    const buffer = new Uint8Array(2);
    buffer[0] = this.ID;
    buffer[1] = this.success ? 0 : 1;
    return buffer;
  }

  toString(): string {
    return `ClearSlotResponse(success=${this.success})`;
  }
}

export class TunnelMessage extends BaseMessage {
  // Static constant for the ID (as per the Python implementation)
  get ID(): MessageID {
    return 0x32;
  }
  text: string;

  constructor(text: string) {
    super();
    this.text = text;
  }

  // Serialize method, mimicking the Python 'serialize' function
  serialize(): Uint8Array {
    const textBytes = new TextEncoder().encode(this.text); // Convert string to bytes (UTF-8)
    const length = textBytes.length;

    // Create an ArrayBuffer for the serialized message
    const buffer = new Uint8Array(3 + length); // 1 byte for ID, 2 bytes for length, and the text bytes
    buffer[0] = this.ID; // Set the ID at the first byte
    new DataView(buffer.buffer, 1, 2).setUint16(0, length, true); // Set length (little-endian) at bytes 1 and 2

    // Text bytes (UTF-8 encoded string)
    buffer.set(textBytes, 3);

    return buffer;
  }

  // String representation of the object
  toString(): string {
    return `${this.constructor.name}(text=${JSON.stringify(this.text)})`;
  }
}

export class TunnelMessageChunk extends BaseMessage {
  // Static constant for the ID (as per the Python implementation)
  get ID(): MessageID {
    return 0x32;
  }

  bytes: Uint8Array;
  frameId: number;
  frameTotal: number;

  constructor(bytes: Uint8Array, frameId: number, frameTotal: number) {
    super();
    this.bytes = bytes;
    this.frameId = frameId;
    this.frameTotal = frameTotal;
  }

  // Serialize method, mimicking the Python 'serialize' function
  serialize(): Uint8Array {
    // Create buffer for the chunk: 1 byte for ID, 2 bytes for length, 1 byte for frameId, 1 byte for frameTotal
    const buffer = new Uint8Array(5 + this.bytes.length); // 5 = 1 for ID, 2 for length, 1 for frameId, 1 for frameTotal


    // Set the length (2 bytes): The length of the chunk in bytes
    buffer[0] = this.ID; // Set the ID at the first byte
    new DataView(buffer.buffer, 1, 2).setUint16(0, this.bytes.length + 2, true); // Set the length at bytes 1 and 2
    buffer[3] = this.frameId; // Set the frameId at byte 3
    buffer[4] = this.frameTotal; // Set the frameTotal at byte 4
    buffer.set(this.bytes, 5); 

    return buffer;
  }

  // String representation of the object
  toString(): string {
    return `${this.constructor.name}(frameId=${this.frameId}, frameTotal=${this.frameTotal}, bytes=${this.bytes})`;
  }
}

export class StartFileUploadRequest extends BaseMessage {
  get ID(): MessageID {
    return 0x0c;
  }
  fileName: string;
  slot: number;
  crc: CRCValue;

  constructor(fileName: string, slot: number, crc: CRCValue) {
    super();
    this.fileName = fileName;
    this.slot = slot;
    this.crc = crc;
  }

  serialize(): Uint8Array {
    const filenameBytes = new TextEncoder().encode(this.fileName + "\0"); // Null-terminated string
    const buffer = new Uint8Array(6 + filenameBytes.length);
    buffer[0] = this.ID;
    buffer.set(filenameBytes, 1);
    buffer[1 + filenameBytes.length] = this.slot;
    new DataView(buffer.buffer, 2 + filenameBytes.length, 4).setUint32(
      0,
      this.crc,
      true
    );
    return buffer;
  }

  toString(): string {
    return `StartFileUploadRequest(fileName="${this.fileName}", slot=${this.slot}, crc=${this.crc})`;
  }
}

export class StartFileUploadResponse extends BaseMessage {
  get ID(): MessageID {
    return 0x0d;
  }
  success: boolean;

  constructor(success: boolean) {
    super();
    this.success = success;
  }

  serialize(): Uint8Array {
    const buffer = new Uint8Array(2);
    buffer[0] = this.ID;
    buffer[1] = this.success ? 0 : 1;
    return buffer;
  }

  toString(): string {
    return `StartFileUploadResponse(success=${this.success})`;
  }
}

export class TransferChunkRequest extends BaseMessage {
  get ID(): MessageID {
    return 0x10;
  }
  runningCrc: CRCValue;
  chunk: Uint8Array;

  constructor(runningCrc: CRCValue, chunk: Uint8Array) {
    super();
    this.runningCrc = runningCrc;
    this.chunk = chunk;
  }

  serialize(): Uint8Array {
    const buffer = new Uint8Array(7 + this.chunk.length);
    buffer[0] = this.ID;
    new DataView(buffer.buffer, 1, 4).setUint32(0, this.runningCrc, true);
    new DataView(buffer.buffer, 5, 2).setUint16(0, this.chunk.length, true);
    buffer.set(this.chunk, 7);
    return buffer;
  }

  toString(): string {
    return `TransferChunkRequest(runningCrc=${this.runningCrc}, chunkSize=${this.chunk.length})`;
  }
}

export class TransferChunkResponse extends BaseMessage {
  get ID(): MessageID {
    return 0x11;
  }
  success: boolean;

  constructor(success: boolean) {
    super();
    this.success = success;
  }

  serialize(): Uint8Array {
    const buffer = new Uint8Array(2);
    buffer[0] = this.ID;
    buffer[1] = this.success ? 0 : 1;
    return buffer;
  }

  toString(): string {
    return `TransferChunkResponse(success=${this.success})`;
  }
}

export class ProgramFlowRequest extends BaseMessage {
  get ID(): MessageID {
    return 0x1e;
  }
  stop: boolean;
  slot: number;

  constructor(stop: boolean, slot: number) {
    super();
    this.stop = stop;
    this.slot = slot;
  }

  serialize(): Uint8Array {
    const buffer = new Uint8Array(3);
    buffer[0] = this.ID;
    buffer[1] = this.stop ? 1 : 0;
    buffer[2] = this.slot;
    return buffer;
  }

  toString(): string {
    return `ProgramFlowRequest(stop=${this.stop}, slot=${this.slot})`;
  }
}

export class ProgramFlowResponse extends BaseMessage {
  get ID(): MessageID {
    return 0x1f;
  }
  success: boolean;

  constructor(success: boolean) {
    super();
    this.success = success;
  }

  serialize(): Uint8Array {
    const buffer = new Uint8Array(2);
    buffer[0] = this.ID;
    buffer[1] = this.success ? 0 : 1;
    return buffer;
  }

  toString(): string {
    return `ProgramFlowResponse(success=${this.success})`;
  }
}

export class ConsoleNotification extends BaseMessage {
  get ID(): MessageID {
    return 0x21;
  }
  text: string;

  constructor(text: string) {
    super();
    this.text = text;
  }

  serialize(): Uint8Array {
    const textBytes = new TextEncoder().encode(this.text);
    const buffer = new Uint8Array(1 + textBytes.length);
    buffer[0] = this.ID;
    buffer.set(textBytes, 1);
    return buffer;
  }

  toString(): string {
    return `ConsoleNotification(text="${this.text}")`;
  }
}

export class ProgramFlowNotification extends BaseMessage {
  get ID(): MessageID {
    return 0x20;
  }
  stop: boolean;

  constructor(stop: boolean) {
    super();
    this.stop = stop;
  }

  serialize(): Uint8Array {
    const buffer = new Uint8Array(2); // ID (1 byte) + stop (1 byte)
    buffer[0] = this.ID;
    buffer[1] = this.stop ? 1 : 0; // Use 1 for true and 0 for false
    return buffer;
  }

  // String representation of the object
  toString(): string {
    return `ProgramFlowNotification(stop=${this.stop})`;
  }
}

export function deserializeMessage(data: Uint8Array): BaseMessage {
  if (data.length === 0) {
    throw new Error("Empty data buffer");
  }

  const messageId = data[0];

  switch (messageId) {
    case 0x01: // InfoResponse
      const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
      return new InfoResponse(
        data[1], // rpcMajor
        data[2], // rpcMinor
        view.getUint16(3, true), // rpcBuild
        data[5], // firmwareMajor
        data[6], // firmwareMinor
        view.getUint16(7, true), // firmwareBuild
        view.getUint16(9, true), // maxPacketSize
        view.getUint16(11, true), // maxMessageSize
        view.getUint16(13, true), // maxChunkSize
        view.getUint16(15, true) // productGroupDevice
      );

    case 0x29: // DeviceNotificationResponse
      return new DeviceNotificationResponse(data[1] === 0);

    case 0x3c: // DeviceNotification
      const size = new DataView(data.buffer, data.byteOffset + 1, 2).getUint16(
        0,
        true
      );
      // Parse device messages (simplified for this example)
      const messages: Array<[string, any]> = [];
      let offset = 3;
      while (offset < data.length) {
        const deviceId = data[offset];
        // This would need to be expanded to handle all device types properly
        if (deviceId === 0x00) {
          messages.push(["Battery", data[offset + 1]]);
          offset += 2;
        } else if (deviceId === 0x01) {
          messages.push(["IMU", "data"]);
          offset += 23; // Skip IMU data structure
        } else {
          break;
        }
      }
      return new DeviceNotification(size, messages);

    case 0x47: // ClearSlotResponse
      return new ClearSlotResponse(data[1] === 0);

    case 0x0d: // StartFileUploadResponse
      return new StartFileUploadResponse(data[1] === 0);

    case 0x11: // TransferChunkResponse
      return new TransferChunkResponse(data[1] === 0);

    case 0x1f: // ProgramFlowResponse
      return new ProgramFlowResponse(data[1] === 0);

    case 0x21: // ConsoleNotification
      const textBytes0x21 = data.slice(1).filter((b) => b !== 0); // Remove null bytes
      const text0x21 = new TextDecoder().decode(textBytes0x21);
      return new ConsoleNotification(text0x21);

    case 0x32: // TunnelMessageChunk
      const frameId = data[3];
      const frameTotal = data[4];
      const textLength = new DataView(data.buffer, data.byteOffset + 1, 2).getUint16(0, true);
      const textBytes0x32 = data.slice(5, 5 + textLength);

      return new TunnelMessageChunk(textBytes0x32, frameId, frameTotal);

    case 0x20: // ProgramFlowNotification
      if (data.length !== 2) {
        throw new Error("Invalid data length for ProgramFlowNotification");
      }
      const stop = data[1] === 1;
      return new ProgramFlowNotification(stop);

    default:
      throw new Error(`Unknown message ID: ${messageId}`);
  }
}
