import { HttpService } from '@nestjs/axios';
import { BadGatewayException, Injectable, Logger } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { IMAGE_FIELD, ML_MOCK, ML_URL } from '../constants';
import { getImageSize } from './image';
import { buildMockResult } from './mock';
import { DetectResult } from './types';

@Injectable()
export class DetectService {
  private readonly logger = new Logger(DetectService.name);

  constructor(private readonly http: HttpService) {}

  async detect(image: Express.Multer.File): Promise<DetectResult> {
    const size = getImageSize(image);
    if (ML_MOCK) return buildMockResult(size);

    const form = new FormData();
    form.append(IMAGE_FIELD, new Blob([new Uint8Array(image.buffer)], { type: image.mimetype }), image.originalname);

    try {
      const { data } = await firstValueFrom(this.http.post<DetectResult>(`${ML_URL}/detect`, form));
      return data;
    } catch (error) {
      this.logger.error(`ML request failed: ${error instanceof Error ? error.message : String(error)}`);
      throw new BadGatewayException('Сервис нейросетей недоступен');
    }
  }
}
