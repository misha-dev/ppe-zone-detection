import { HttpService } from '@nestjs/axios';
import { BadGatewayException, Injectable, Logger } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { IMAGE_FIELD, ML_MOCK, ML_URL } from '../constants';
import { buildMockResult } from './mock';
import { DetectResult, Point } from './types';

@Injectable()
export class DetectService {
  private readonly logger = new Logger(DetectService.name);

  constructor(private readonly http: HttpService) {}

  async detect(image: Express.Multer.File, zone: Point[]): Promise<DetectResult> {
    if (ML_MOCK) return buildMockResult(zone);

    const form = new FormData();
    form.append(IMAGE_FIELD, new Blob([new Uint8Array(image.buffer)], { type: image.mimetype }), image.originalname);
    form.append('zone', JSON.stringify(zone));

    try {
      const { data } = await firstValueFrom(this.http.post<DetectResult>(`${ML_URL}/detect`, form));
      return data;
    } catch (error) {
      this.logger.error(`ML request failed: ${error instanceof Error ? error.message : String(error)}`);
      throw new BadGatewayException('Сервис нейросетей недоступен');
    }
  }
}
