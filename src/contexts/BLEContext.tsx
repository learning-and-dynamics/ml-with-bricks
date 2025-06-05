"use client";

import {
  createContext,
  PropsWithChildren,
  useContext,
  useRef,
  useState,
} from "react";
import { TunnelData } from "../types/types";
import { LegoBleConnector } from "../utils/bleConnector";
import {
  ConsoleNotification,
  ProgramFlowNotification,
} from "../utils/bleMessages";

export type ConnectionStatus = "closed" | "closing" | "open" | "opening";
export type CodeStatus = "on" | "uploading" | "off";

type BLEDataCallback = (message: TunnelData) => void;

interface StartProgramOptions {
  code: string;
  onStart: () => Promise<any>;
  onProgress: (percentage: number) => void;
}

export interface BLEContextValue {
  canUseBLE: boolean;
  disconnect(): void;
  connect(): Promise<void>;
  subscribe(callback: BLEDataCallback): () => void;
  connectionStatus: ConnectionStatus;
  stopProgram(): Promise<boolean>;
  startProgram(options: StartProgramOptions): Promise<void>;
  codeStatus: CodeStatus;
  sendTunnelData(data: TunnelData): Promise<void>;
}

export const BLEContext = createContext<BLEContextValue>({
  canUseBLE: false,
  disconnect: () => { },
  connect: () => Promise.resolve(),
  connectionStatus: "closed",
  subscribe: () => () => { },
  stopProgram: () => Promise.resolve(true),
  startProgram: () => Promise.resolve(),
  sendTunnelData: () => Promise.resolve(),
  codeStatus: "off",
});

export const useBLE = () => useContext(BLEContext);

const BLEProvider = ({ children }: PropsWithChildren) => {
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>("closed");
  const [codeStatus, setCodeStatus] = useState<CodeStatus>("off");
  const [canUseBLE] = useState(() => "bluetooth" in navigator);
  const connectorRef = useRef<LegoBleConnector>(new LegoBleConnector());

  const SLOT = 8; // Static slot

  const connect = async () => {
    connectorRef.current.removeAllListeners();

    connectorRef.current.on("connected", () => {
      setConnectionStatus("open");
    });

    connectorRef.current.on("disconnected", () => {
      setConnectionStatus("closed");
    });

    connectorRef.current.on(
      "programFlowNotification",
      (notification: ProgramFlowNotification) => {
        if (codeStatus === "uploading") return;
        setCodeStatus(notification.stop ? "off" : "on");
      }
    );

    connectorRef.current.on(
      "consoleNotification",
      (notification: ConsoleNotification) => {
        console.log(`Hub console notification:\n${notification.text}`);
      }
    );

    setConnectionStatus("opening");
    try {
      await connectorRef.current.connect();
    } catch (err) {
      setConnectionStatus("closed");
    }
  };

  const disconnect = () => {
    setConnectionStatus("closing");
    connectorRef.current.disconnect();
    connectorRef.current.removeAllListeners();
  };

  const startProgram = async ({
    code,
    onStart,
    onProgress,
  }: StartProgramOptions) => {
    setCodeStatus("uploading");
    try {
      await connectorRef.current.clearSlot(SLOT);
      await connectorRef.current.uploadProgram(
        code,
        SLOT,
        "program.py",
        onProgress
      );
      connectorRef.current.removeAllListeners("tunnelData");

      const tunnelInit = new Promise((resolve, reject) => {
        let resolved = false;
        const resolver = (data: TunnelData) => {
          if (data.action === "program_start") {
            resolved = true;
            resolve(true);
            connectorRef.current.off("tunnelData", resolver);
          }
        }
        connectorRef.current.on("tunnelData", resolver);
        setTimeout(() => {
          if (!resolved) {
            console.error("VM init timeout");
            reject();
            connectorRef.current.off("tunnelData", resolver);
          }
        }, 5000);
      });

      await connectorRef.current.startProgram(SLOT);
      console.log("PROGRAM STARTED");
      await tunnelInit;
      console.log("TUNNEL INITIALIZED");
      await onStart();
      setCodeStatus("on");
    } catch (err) {
      setCodeStatus("off");
    }
  };

  const stopProgram = () => connectorRef.current.stopProgram(SLOT);


  const subscribe = (callback: BLEDataCallback) => {
    connectorRef.current.on("tunnelData", callback);

    // return unsubscribe function
    return () => {
      connectorRef.current.off("tunnelData", callback);
    };
  };

  const sendTunnelData = ({ action, payload }: TunnelData) =>
    connectorRef.current.sendTunnelData({ action, payload });

  return (
    <BLEContext.Provider
      value={{
        canUseBLE,
        codeStatus,
        connectionStatus,
        connect,
        disconnect,
        subscribe,
        stopProgram,
        startProgram,
        sendTunnelData,
      }}
    >
      {children}
    </BLEContext.Provider>
  );
};

export default BLEProvider;
