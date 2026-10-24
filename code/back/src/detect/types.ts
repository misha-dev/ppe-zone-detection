export type Point = [number, number];

export type Box = [number, number, number, number];

export interface Person {
  box: Box;
  helmet: boolean;
  vest: boolean;
  inZone: boolean;
  violation: boolean;
}

export interface DetectResult {
  violation: boolean;
  zone: Point[];
  people: Person[];
}

export type FileFilterCallback = (error: Error | null, acceptFile: boolean) => void;
