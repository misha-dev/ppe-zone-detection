import { useState, type ChangeEvent, type DragEvent, type FC } from 'react';
import { ACCEPTED_TYPES, MAX_FILE_SIZE_MB, MAX_FILES } from '../constants';
import { usePhotoPicker } from '../hooks/usePhotoPicker';
import { ErrorList } from './ErrorList';

export const Uploader: FC = () => {
  const { errors, pickFiles } = usePhotoPicker();
  const [isDragging, setIsDragging] = useState(false);

  function handleChange(event: ChangeEvent<HTMLInputElement>): void {
    void pickFiles(event.target.files);
    event.target.value = '';
  }

  function handleDrop(event: DragEvent<HTMLLabelElement>): void {
    event.preventDefault();
    setIsDragging(false);
    void pickFiles(event.dataTransfer.files);
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
        <input type="file" accept={ACCEPTED_TYPES.join(',')} onChange={handleChange} multiple hidden />
        <span className="dropzone__title">Перетащите фото сюда или нажмите, чтобы выбрать</span>
        <span className="dropzone__hint">
          JPEG, PNG или WebP, до {MAX_FILE_SIZE_MB} МБ, не больше {MAX_FILES} фото
        </span>
      </label>
      <ErrorList errors={errors} />
    </section>
  );
};
