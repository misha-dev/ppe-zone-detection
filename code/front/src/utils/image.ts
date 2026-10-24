import { ACCEPTED_TYPES, MAX_FILE_SIZE_MB } from '../constants';

export function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Не удалось открыть изображение'));
    image.src = URL.createObjectURL(file);
  });
}

export function validateFile(file: File): string | null {
  if (!ACCEPTED_TYPES.includes(file.type)) return 'Поддерживаются только JPEG, PNG и WebP';
  if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) return `Файл больше ${MAX_FILE_SIZE_MB} МБ`;
  return null;
}
