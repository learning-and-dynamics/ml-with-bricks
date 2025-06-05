export interface DataPoint {
  x: number;
  y: number;
  id: string;
}

export interface FruitStyle {
  label: string;
  emoji: string | null;
  fillColor: string;
}

export interface KNNData {
  id: string;
  color: number[];
  length: number;
  label: string;
}

export interface KNNInferData extends Omit<KNNData, "label"> {
  label?: string;
}

export interface LRData {
  id: string;
  distance: number;
  power: number;
}

export type CrawlerActionStatus = "unpicked" | "picked" | "started" | "done";

export type CrawlerActionType = "exploration" | "exploitation";
export type CrawlerMarkovChainMode = "rewards" | "qTable" | "epsilon";

export interface PingpongerSettings {
  distanceSensorPort: string;
  leftMotorPort: string;
  rightMotorPort: string;
  isInverted: boolean;
}

export interface CrawlerSettings {
  distanceSensorPort: string;
  bigMotorPort: string;
  smallMotorPort: string;
  smallMotorSpeed: number;
  bigMotorSpeed: number;
}

export interface FruitPredictorSettings {
  distanceSensorPort: string;
  colorSensorPort: string;
}


export interface TunnelData {
  action: string;
  payload: Record<string, any>;
}
