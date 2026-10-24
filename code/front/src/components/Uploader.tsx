import { useState, type ChangeEvent, type DragEvent, type FC } from 'react';
import { ACCEPTED_TYPES, MAX_FILE_SIZE_MB } from '../constants';
import { useAppStore } from '../store/useAppStore';
import { loadImage, validateFile } from '../utils/image';

export const Uploader: FC = () => {
  const setImage = useAppStore((state) => state.setImage);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  async function selectFile(file: File | undefined): Promise<void> {
    if (!file) return;
    const validationError = validateFile(file);
    setError(validationError);
    if (validationError) return;
    try {
      setImage(file, await loadImage(file));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Не удалось открыть изображение');
    }
  }

  function handleChange(event: ChangeEvent<HTMLInputElement>): void {
    void selectFile(event.target.files?.[0]);
    event.target.value = '';
  }

  function handleDrop(event: DragEvent<HTMLLabelElement>): void {
    event.preventDefault();
    setIsDragging(false);
    void selectFile(event.dataTransfer.files[0]);
  }

  function handleDragOver(event: DragEvent<HTMLLabelElement>): void {
    event.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave(): void {
    setIsDragging(false);
  }

  return (
    <section className="card">
      <label
        className={`dropzone${isDragging ? ' dropzone--active' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <input type="file" accept={ACCEPTED_TYPES.join(',')} onChange={handleChange} hidden />
        <span className="dropzone__title">Перетащите фото сюда или нажмите, чтобы выбрать</span>
        <span className="dropzone__hint">JPEG, PNG или WebP, до {MAX_FILE_SIZE_MB} МБ</span>
      </label>
      {error && <p className="error">{error}</p>}
    </section>
  );
};
