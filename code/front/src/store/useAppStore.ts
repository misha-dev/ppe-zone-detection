import { create } from 'zustand';
import type { AppState } from '../types';

export const useAppStore = create<AppState>()((set) => ({
  photos: [],
  selectedId: null,
  checked: false,
  addPhotos: (photos) =>
    set((state) => ({
      photos: [...state.photos, ...photos],
      selectedId: state.selectedId ?? photos[0]?.id ?? null,
    })),
  removePhoto: (id) =>
    set((state) => {
      const photos = state.photos.filter((photo) => {
        if (photo.id === id) URL.revokeObjectURL(photo.image.src);
        return photo.id !== id;
      });
      return {
        photos,
        selectedId: state.selectedId === id ? (photos[0]?.id ?? null) : state.selectedId,
      };
    }),
  selectPhoto: (id) => set({ selectedId: id }),
  setOutcomes: (outcomes) =>
    set((state) => ({
      checked: true,
      photos: state.photos.map((photo) => {
        const outcome = outcomes.find((item) => item.id === photo.id);
        return outcome ? { ...photo, result: outcome.result, error: outcome.error } : photo;
      }),
    })),
  reset: () =>
    set((state) => {
      state.photos.forEach((photo) => URL.revokeObjectURL(photo.image.src));
      return { photos: [], selectedId: null, checked: false };
    }),
}));
