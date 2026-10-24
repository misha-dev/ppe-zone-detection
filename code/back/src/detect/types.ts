export type Box = [number, number, number, number];

export interface Person {
  box: Box;
  helmet: boolean;
  vest: boolean;
  violation: boolean;
}

export interface DetectResult {
  violation: boolean;
  people: Person[];
}

export interface ImageSize {
  width: number;
  height: number;
}

export type FileFilterCallback = (error: Error | null, acceptFile: boolean) => void;
