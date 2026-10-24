export const PORT = Number(process.env.PORT ?? 3000);
export const ML_URL = process.env.ML_URL ?? 'http://localhost:8000';
export const ML_MOCK = process.env.ML_MOCK === 'true';
export const ML_TIMEOUT_MS = 60_000;
export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
export const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const MIN_ZONE_POINTS = 3;
export const IMAGE_FIELD = 'image';
