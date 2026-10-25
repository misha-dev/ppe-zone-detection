import type { Photo, PhotoStatus } from '../types';

export function getPhotoStatus({ result, error }: Photo): PhotoStatus {
  if (error) return 'error';
  if (!result) return 'pending';
  return result.violation ? 'violation' : 'ok';
}
