import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { getRandomString } from "../utils/getRandomString";

export type PortState = "closed" | "closing" | "open" | "opening";

export type SerialMessage = {
  value: string;
  timestamp: number;
};

export interface SpikeMessageObject {
  m: string;
  p: Record<string, any>;
}

type SerialMessageCallback = (message: SpikeMessageObject) => void;

interface StartCodeOptions {
  experimentName: string;
  slotId: number;
  name: string;
  // codeReplacements?: CodeReplacement[];
  onProgress?: (percentage: number) => void;
  onStart?: () => Promise<any>;
}

export interface SerialContextValue {
  canUseSerial: boolean;
  portState: PortState;
  codeStatus: "on" | "uploading" | "off";
  isMessagingEnabled: boolean;

  connect(): Promise<boolean>;
  disconnect(): void;

  subscribe(callback: SerialMessageCallback): () => void;
  unsubscribeAll(): void;

  write(lines: string[]): void;
  sendCommand(action: string, params: Record<string, any>): Promise<any>;
  startCode(options: StartCodeOptions): void;
  stopCode(): void;
}

export const SerialContext = createContext<SerialContextValue>({
  canUseSerial: false,
  connect: () => Promise.resolve(false),
  disconnect: () => {},
  portState: "closed",
  codeStatus: "off",
  isMessagingEnabled: false,
  subscribe: () => () => {},
  unsubscribeAll: () => {},
  write: () => {},
  startCode: () => {},
  stopCode: () => {},
  sendCommand: () => Promise.resolve(false),
});

export const useSerial = () => useContext(SerialContext);

const SerialProvider = ({ children }: PropsWithChildren) => {
  const [canUseSerial] = useState(() => "serial" in navigator);

  const [portState, setPortState] = useState<PortState>("closed");
  const [codeStatus, setCodeStatus] = useState<"on" | "uploading" | "off">(
    "off"
  );

  const portRef = useRef<SerialPort | null>(null);

  const readerRef = useRef<ReadableStreamDefaultReader | null>(null);
  const readerClosedPromiseRef = useRef<Promise<void>>(Promise.resolve());

  const writerRef = useRef<WritableStreamDefaultWriter | null>(null);
  const writerClosedPromiseRef = useRef<Promise<void>>(Promise.resolve());

  const currentSubscriberIdRef = useRef<number>(0);
  const subscribersRef = useRef<Map<number, SerialMessageCallback>>(new Map());

  const vmInitializedPromiseRef = useRef<Promise<any> | undefined>();

  //   const printBufferRef = useRef<string>("");

  const pendingRequestsRef = useRef<
    Map<
      string,
      {
        resolve: (value: any) => void;
        reject: (reason?: any) => void;
      }
    >
  >(new Map());

  const isMessagingEnabled =
    portState === "open" && codeStatus === "on" && !!portRef.current?.writable;

  /**
   * Subscribes a callback function to the message event.
   *
   * @param callback the callback function to subscribe
   */

  const subscribe = (callback: SerialMessageCallback) => {
    const id = currentSubscriberIdRef.current;
    subscribersRef.current.set(id, callback);
    currentSubscriberIdRef.current++;

    return () => {
      subscribersRef.current.delete(id);
    };
  };

  const unsubscribeAll = () => {
    subscribersRef.current.clear();
  };

  /**
   * Extracts messages from plain serial stream.
   */

  const write = async (lines: string[]) => {
    const port = portRef.current;
    if (!port?.writable) {
      console.error("Port is unwritable.");
      return;
    }
    if (!writerRef.current) {
      // Opening the write channel if there is no one
      const textEncoder = new TextEncoderStream();
      writerRef.current = textEncoder.writable.getWriter();
      writerClosedPromiseRef.current = textEncoder.readable.pipeTo(
        port.writable
      );
      // Creating a promise that will be resolved once writer finished the packets before the closure
      // writerClosedPromiseRef.current = writerRef.current.closed;
    }
    try {
      for (const line of lines) {
        await writerRef.current?.write(line);
      }
    } catch (error) {
      console.error("Failed to write to the serial. Error: ", error);
    }
  };

  const sendCommand = (
    action: string,
    params: Record<string, any> | string = {}
  ): Promise<any> => {
    if (!portRef.current?.writable) {
      return Promise.reject();
    }

    return new Promise<any>((resolve, reject) => {
      const id = getRandomString(4);
      const msg = { m: action, p: params, i: id };

      pendingRequestsRef.current.set(id, { resolve, reject });

      const raw = JSON.stringify(msg) + "\r";
      write([raw]);

      // Timeout after 5s
      const timeoutMs = 5000;
      setTimeout(() => {
        if (pendingRequestsRef.current.has(id)) {
          pendingRequestsRef.current.delete(id);
          // reject(new Error("Command timed out."));
          console.error("Command timed out. Content: ", raw);
        }
      }, timeoutMs);
    });
  };

  const stopCode = async () => {
    sendCommand("program_terminate");
    setCodeStatus("off");
  };

  const startCode = async ({
    experimentName,
    slotId,
    name,
    onProgress,
    onStart,
  }: // onStart,
  StartCodeOptions) => {
    setCodeStatus("uploading");

    if (onProgress) {
      onProgress(0);
    }

    try {
      const response = await fetch(
        `/api/get-script?experimentName=${experimentName}`
      );
      let { content: unencodedCode } = await response.json();

      // codeReplacements.forEach(({ target, replacement }) => {
      //   unencodedCode = unencodedCode.replaceAll(target, replacement);
      // });

      const code = new TextEncoder().encode(unencodedCode);

      const size = code.byteLength;

      const startResp = await sendCommand("start_write_program", {
        slotid: slotId,
        size,
        filename: "__init__.py",
        meta: {
          created: Date.now(),
          modified: Date.now(),
          // base64-encode the name if provided
          name: Buffer.from(name).toString("base64"),
          type: "scratch",
          project_id: getRandomString(12),
        },
      });
      // startResp => { blocksize, transferid }
      const blockSize: number = startResp.blocksize;
      const transferId: string = startResp.transferid;

      // 2) Chunk the code into blockSize pieces
      let offset = 0;
      let bytesRemaining = size;

      while (bytesRemaining > 0) {
        const chunkLength = Math.min(blockSize, bytesRemaining);
        const chunk = code.slice(offset, offset + chunkLength);

        // Base64 encode
        const chunkArr = Array.from(chunk);
        const chunkB64 = btoa(String.fromCharCode(...chunkArr));

        await sendCommand("write_package", {
          transferid: transferId,
          data: chunkB64,
        });

        offset += chunkLength;
        bytesRemaining -= chunkLength;

        if (onProgress) {
          const pct = Math.round((offset / size) * 100);
          onProgress(pct);
        }
      }

      vmInitializedPromiseRef.current = new Promise((resolve, reject) => {
        let resolved = false;
        const unsubscribe = subscribe((message) => {
          if (message.m === "vm_initialized") {
            resolved = true;
            resolve(true);
            unsubscribe();
          }
        });
        setTimeout(() => {
          if (!resolved) {
            console.error("VM init timeout");
            reject();
            unsubscribe();
          }
        }, 5000);
      });

      await sendCommand("program_execute", { slotid: slotId });

      await vmInitializedPromiseRef.current;

      if (!!onStart) {
        await onStart();
      }

      setCodeStatus("on");
    } catch (error) {
      console.error("uploadProgram error:", error);
      setCodeStatus("off");
      throw error;
    }
  };

  const handleIncomingLine = (data: string) => {
    let json: any;
    let isPlainPrint = false;

    // 1) Try parse as JSON
    try {
      json = JSON.parse(data);
      // If it's just a number, treat it as plain print
      if (typeof json === "number") {
        isPlainPrint = true;
      }
    } catch {
      // Not valid JSON => plain print
      isPlainPrint = true;
    }

    // 2) If plain print => log it
    if (isPlainPrint) {
      console.log("Plain print: ", data);
      return;
    }

    // 3) It's JSON => check for i, m, e, etc.
    try {
      const id = json["i"];
      const message = json["m"];

      // If there's an ID & pending request => resolve or reject
      if (id && pendingRequestsRef.current.has(id)) {
        const { resolve } = pendingRequestsRef.current.get(id)!;
        pendingRequestsRef.current.delete(id);

        if (json["e"]) {
          // base64 decode if your hub sends it that way
          const errMsg = atob(json["e"]);
          console.error("Error came from SPIKE: ", errMsg);
          // reject(new Error(errMsg));
        } else {
          resolve(json["r"]);
        }
      }
      // If there's a "message" => handle userProgram.print or errors
      else if (message) {
        switch (message) {
          case "userProgram.print":
            // console.log(message);
            // base64 decode p["value"]
            if (json["p"] && json["p"]["value"]) {
              const val = atob(json["p"]["value"]);
              console.log(val.replace(/\n/g, "\r\n"));
            }
            // Optionally sendResponse to ack
            if (id) {
              sendResponse(id);
            }
            break;

          case "user_program_error":
            if (json["p"]) {
              const line1 = atob(json["p"][3] ?? "");
              const line2 = atob(json["p"][4] ?? "");
              console.error(line1.replace(/\n/g, "\r\n"));
              console.error(line2.replace(/\n/g, "\r\n"));
              console.info("\r\n");
            }
            break;

          case "runtime_error":
            if (json["p"]) {
              const errText = atob(json["p"][3] ?? "");
              console.error(errText.replace(/\n/g, "\r\n"));
              console.info("\r\n");
            }
            break;

          // default:
          //   console.log("Unknown message:", message, json);
          //   break;
        }
      }
      // If there's no "id"/"m", just pass to subscribers
      if (typeof message === typeof "") {
        subscribersRef.current.forEach((cb) => cb(json as SpikeMessageObject));
      }
    } catch (err) {
      console.error("handleIncomingLine error:", err);
    }
  };

  const sendResponse = (id: string, response: Record<string, any> = {}) => {
    const msg = { i: id, r: response };
    const raw = JSON.stringify(msg) + "\r";
    write([raw]);
  };

  const readUntilClosed = async () => {
    const port = portRef.current;
    if (port?.readable) {
      const textDecoder = new TextDecoderStream();
      const readableStreamClosed = port.readable.pipeTo(textDecoder.writable);

      readerRef.current = textDecoder.readable.getReader();

      let buffer = "";
      try {
        while (true) {
          const { value, done } = await readerRef.current.read();
          if (done) break;
          if (value) {
            buffer += value;
            // Split on "\r"
            const lines = buffer.split("\r");
            buffer = lines.pop() || ""; // leftover chunk

            for (const line of lines) {
              handleIncomingLine(line);
            }
          }
        }
      } catch (err) {
        console.error("Read loop error:", err);
      } finally {
        await readableStreamClosed?.catch(() => {});
      }
    }
  };

  /**
   * Attempts to open the given port.
   */
  const openPort = async (port: SerialPort) => {
    try {
      await port.open({ baudRate: 115200 });
      portRef.current = port;
      setPortState("open");
    } catch (error) {
      setPortState("closed");
      console.error("Could not open port. Error: ", error);
    }
  };

  const manualConnectToPort = async () => {
    if (canUseSerial && portState === "closed") {
      setPortState("opening");
      try {
        const port = await navigator.serial.requestPort();
        await openPort(port);
        return true;
      } catch (error) {
        setPortState("closed");
        console.log("User did not select port. Error: ", error);
      }
    }
    return false;
  };

  const manualDisconnectFromPort = async () => {
    if (canUseSerial && portState === "open") {
      const port = portRef.current;
      if (port) {
        setPortState("closing");

        // Cancel any reading from port
        readerRef.current?.cancel();
        await readerClosedPromiseRef.current.then(
          () => (readerRef.current = null)
        );

        // Cancel any writing to port
        writerRef.current?.close();
        await writerClosedPromiseRef.current.then(
          () => (writerRef.current = null)
        );

        // Close and nullify the port
        await port.close();
        portRef.current = null;

        // Update port state
        setPortState("closed");
      }
    }
  };

  /**
   * Event handler for when the port is disconnected unexpectedly.
   */
  const onPortDisconnect = async () => {
    // Wait for the reader to finish it's current loop
    await readerClosedPromiseRef.current;
    // Wait for the writer to finish processing chunks. // TODO: test behavior with delays in code
    await writerClosedPromiseRef.current;
    // Update state
    readerRef.current = null;
    readerClosedPromiseRef.current = Promise.resolve();
    writerRef.current = null;
    writerClosedPromiseRef.current = Promise.resolve();
    portRef.current = null;
    setPortState("closed");
  };

  // Handles attaching the reader and disconnect listener when the port is open
  useEffect(() => {
    const port = portRef.current;
    if (portState === "open" && port) {
      // When the port is open, read until closed
      const aborted = { current: false };
      readerRef.current?.cancel();
      readerClosedPromiseRef.current.then(() => {
        if (!aborted.current) {
          readerRef.current = null;
          readerClosedPromiseRef.current = readUntilClosed();
        }
      });

      // Attach a listener for when the device is disconnected
      navigator.serial.addEventListener("disconnect", onPortDisconnect);

      return () => {
        aborted.current = true;
        navigator.serial.removeEventListener("disconnect", onPortDisconnect);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [portState]);

  return (
    <SerialContext.Provider
      value={{
        canUseSerial,
        subscribe,
        unsubscribeAll,
        portState,
        codeStatus,
        isMessagingEnabled,
        startCode,
        write,
        stopCode,
        sendCommand,
        connect: manualConnectToPort,
        disconnect: manualDisconnectFromPort,
      }}
    >
      {children}
    </SerialContext.Provider>
  );
};

export default SerialProvider;
