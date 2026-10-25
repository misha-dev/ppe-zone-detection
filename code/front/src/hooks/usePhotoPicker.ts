import { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import type { UsePhotoPicker } from '../types';
import { createPhotos } from '../utils/image';

export function usePhotoPicker(): UsePhotoPicker {
  const addPhotos = useAppStore((state) => state.addPhotos);
  const [errors, setErrors] = useState<string[]>([]);

  async function pickFiles(files: FileList | null): Promise<void> {
    if (!files?.length) return;
    const selection = await createPhotos(Array.from(files), useAppStore.getState().photos.length);
    setErrors(selection.errors);
    if (selection.photos.length) addPhotos(selection.photos);
  }

  return { errors, pickFiles };
}
