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

export interface ApiError {
  message?: string | string[];
}

export type Step = 'upload' | 'result';

export type PersonStatus = 'violation' | 'ok';

export type DrawFn = (ctx: CanvasRenderingContext2D, scale: number) => void;

export interface Photo {
  id: string;
  file: File;
  image: HTMLImageElement;
  result: DetectResult | null;
  error: string | null;
}

export interface DetectOutcome {
  id: string;
  result: DetectResult | null;
  error: string | null;
}

export interface PhotoSelection {
  photos: Photo[];
  errors: string[];
}

export type PhotoStatus = PersonStatus | 'error' | 'pending';

export interface AppState {
  photos: Photo[];
  selectedId: string | null;
  checked: boolean;
  addPhotos: (photos: Photo[]) => void;
  removePhoto: (id: string) => void;
  selectPhoto: (id: string) => void;
  setOutcomes: (outcomes: DetectOutcome[]) => void;
  reset: () => void;
}

export interface UsePhotoPicker {
  errors: string[];
  pickFiles: (files: FileList | null) => Promise<void>;
}

export interface PhotoGalleryProps {
  photos: Photo[];
  selectedId?: string | null;
  disabled?: boolean;
  onSelect?: (id: string) => void;
  onRemove?: (id: string) => void;
}

export interface ErrorListProps {
  errors: string[];
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

export interface SummaryProps {
  photos: Photo[];
}

export interface PeopleListProps {
  people: Person[];
}
