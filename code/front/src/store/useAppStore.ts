import { create } from 'zustand';
import type { AppState } from '../types';

export const useAppStore = create<AppState>()((set) => ({
  file: null,
  image: null,
  result: null,
  setImage: (file, image) => set({ file, image, result: null }),
  setResult: (result) => set({ result }),
  reset: () => set({ file: null, image: null, result: null }),
}));
