import type { FC } from 'react';
import { useDetect } from '../hooks/useDetect';
import { useAppStore } from '../store/useAppStore';
import { getImageZone } from '../utils/image';
import { ImageCanvas } from './ImageCanvas';

export const Preview: FC = () => {
  const file = useAppStore((state) => state.file);
  const image = useAppStore((state) => state.image);
  const setResult = useAppStore((state) => state.setResult);
  const reset = useAppStore((state) => state.reset);
  const { mutate, isPending, error } = useDetect();

  function handleChangePhotoClick(): void {
    reset();
  }

  function handleCheckClick(): void {
    if (!file || !image) return;
    mutate({ file, zone: getImageZone(image) }, { onSuccess: (result) => setResult(result) });
  }

  if (!image) return null;

  return (
    <section className="card">
      <p className="hint">Опасной зоной считается всё фото.</p>
      <ImageCanvas image={image} />
      {error && <p className="error">{error.message}</p>}
      <div className="actions">
        <button type="button" className="button" onClick={handleChangePhotoClick} disabled={isPending}>
          Другое фото
        </button>
        <button type="button" className="button button--primary" onClick={handleCheckClick} disabled={isPending}>
          {isPending ? 'Проверяем…' : 'Проверить'}
        </button>
      </div>
    </section>
  );
};
