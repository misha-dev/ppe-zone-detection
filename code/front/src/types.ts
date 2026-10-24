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

export interface DetectRequest {
  file: File;
  zone: Point[];
}

export interface ApiError {
  message?: string | string[];
}

export type Step = 'upload' | 'result';

export type PersonStatus = 'violation' | 'ok' | 'outside';

export type DrawFn = (ctx: CanvasRenderingContext2D, scale: number) => void;

export interface AppState {
  file: File | null;
  image: HTMLImageElement | null;
  result: DetectResult | null;
  setImage: (file: File, image: HTMLImageElement) => void;
  setResult: (result: DetectResult | null) => void;
  reset: () => void;
}

export interface StepsProps {
  current: Step;
}

export interface ImageCanvasProps {
  image: HTMLImageElement;
  draw?: DrawFn;
}

export interface VerdictProps {
  violation: boolean;
  violators: number;
  people: number;
}

export interface PeopleListProps {
  people: Person[];
}
