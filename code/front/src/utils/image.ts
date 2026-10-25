import { ACCEPTED_TYPES, MAX_FILE_SIZE_MB, MAX_FILES } from '../constants';
import type { Photo, PhotoSelection } from '../types';

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

let lastPhotoId = 0;

function createPhotoId(): string {
  lastPhotoId += 1;
  return String(lastPhotoId);
}

async function createPhoto(file: File): Promise<Photo> {
  const validationError = validateFile(file);
  if (validationError) throw new Error(validationError);
  const image = await loadImage(file);
  return { id: createPhotoId(), file, image, result: null, error: null };
}

export async function createPhotos(files: File[], currentCount: number): Promise<PhotoSelection> {
  const available = Math.max(MAX_FILES - currentCount, 0);
  const accepted = files.slice(0, available);
  const errors = files.length > available ? [`Можно загрузить не больше ${MAX_FILES} фото`] : [];
  const settled = await Promise.allSettled(accepted.map(createPhoto));

  const photos = settled.flatMap((item, index) => {
    if (item.status === 'fulfilled') return [item.value];
    const message = item.reason instanceof Error ? item.reason.message : 'Не удалось открыть изображение';
    errors.push(`${accepted[index].name}: ${message}`);
    return [];
  });

  return { photos, errors };
}
