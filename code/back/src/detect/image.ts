import { BadRequestException } from '@nestjs/common';
import { imageSize } from 'image-size';
import { ImageSize } from './types';

export function getImageSize(image: Express.Multer.File): ImageSize {
  try {
    const { width, height } = imageSize(new Uint8Array(image.buffer));
    return { width, height };
  } catch {
    throw new BadRequestException('Не удалось прочитать изображение');
  }
}
