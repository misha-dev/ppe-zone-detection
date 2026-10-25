import type { ChangeEvent, FC } from 'react';
import { ACCEPTED_TYPES, MAX_FILES } from '../constants';
import { useDetect } from '../hooks/useDetect';
import { usePhotoPicker } from '../hooks/usePhotoPicker';
import { useAppStore } from '../store/useAppStore';
import { ErrorList } from './ErrorList';
import { ImageCanvas } from './ImageCanvas';
import { PhotoGallery } from './PhotoGallery';

export const Preview: FC = () => {
  const photos = useAppStore((state) => state.photos);
  const removePhoto = useAppStore((state) => state.removePhoto);
  const setOutcomes = useAppStore((state) => state.setOutcomes);
  const reset = useAppStore((state) => state.reset);
  const { errors, pickFiles } = usePhotoPicker();
  const { mutate, isPending, error } = useDetect();

  function handleAddChange(event: ChangeEvent<HTMLInputElement>): void {
    void pickFiles(event.target.files);
    event.target.value = '';
  }

  function handleRemove(id: string): void {
    removePhoto(id);
  }

  function handleClearClick(): void {
    reset();
  }

  function handleCheckClick(): void {
    mutate(photos, { onSuccess: (outcomes) => setOutcomes(outcomes) });
  }

  if (photos.length === 0) return null;

  return (
    <section className="card">
      {photos.length === 1 ? (
        <ImageCanvas image={photos[0].image} />
      ) : (
        <PhotoGallery photos={photos} disabled={isPending} onRemove={handleRemove} />
      )}
      <ErrorList errors={error ? [...errors, error.message] : errors} />
      <div className="actions">
        <button type="button" className="button" onClick={handleClearClick} disabled={isPending}>
          {photos.length === 1 ? 'Другое фото' : 'Очистить'}
        </button>
        <label className={`button${isPending || photos.length >= MAX_FILES ? ' button--disabled' : ''}`}>
          <input
            type="file"
            accept={ACCEPTED_TYPES.join(',')}
            onChange={handleAddChange}
            disabled={isPending || photos.length >= MAX_FILES}
            multiple
            hidden
          />
          Добавить фото
        </label>
        <button type="button" className="button button--primary" onClick={handleCheckClick} disabled={isPending}>
          {isPending ? 'Проверяем…' : photos.length === 1 ? 'Проверить' : `Проверить ${photos.length} фото`}
        </button>
      </div>
    </section>
  );
};
