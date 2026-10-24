import { UnsupportedMediaTypeException } from '@nestjs/common';
import { ALLOWED_MIME_TYPES } from '../constants';
import { FileFilterCallback } from './types';

export function imageFileFilter(_req: unknown, file: Express.Multer.File, callback: FileFilterCallback): void {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    callback(null, true);
    return;
  }
  callback(new UnsupportedMediaTypeException(`Допустимые форматы: ${ALLOWED_MIME_TYPES.join(', ')}`), false);
}
