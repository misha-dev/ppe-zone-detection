import { BadRequestException, Body, Controller, HttpCode, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBadGatewayResponse, ApiBadRequestResponse, ApiBody, ApiConsumes, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { ALLOWED_MIME_TYPES, IMAGE_FIELD, MAX_FILE_SIZE_BYTES } from '../constants';
import { DetectService } from './detect.service';
import { DetectDto } from './dto/detect.dto';
import { DetectResultDto } from './dto/detect-result.dto';
import { imageFileFilter } from './file-filter';
import { DetectResult } from './types';

@ApiTags('detect')
@Controller('detect')
export class DetectController {
  constructor(private readonly detectService: DetectService) {}

  @Post()
  @HttpCode(200)
  @UseInterceptors(FileInterceptor(IMAGE_FIELD, { limits: { fileSize: MAX_FILE_SIZE_BYTES }, fileFilter: imageFileFilter }))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: [IMAGE_FIELD, 'zone'],
      properties: {
        [IMAGE_FIELD]: { type: 'string', format: 'binary', description: `${ALLOWED_MIME_TYPES.join(', ')}, до ${MAX_FILE_SIZE_BYTES / 1024 / 1024} МБ` },
        zone: { type: 'string', example: '[[100,200],[400,200],[400,500],[100,500]]', description: 'Точки многоугольника зоны в пикселях фото' },
      },
    },
  })
  @ApiOkResponse({ type: DetectResultDto })
  @ApiBadRequestResponse({ description: 'Нет фото или неверная зона' })
  @ApiBadGatewayResponse({ description: 'Сервис нейросетей недоступен' })
  detect(@UploadedFile() image: Express.Multer.File | undefined, @Body() dto: DetectDto): Promise<DetectResult> {
    if (!image) throw new BadRequestException('Фото не передано');
    return this.detectService.detect(image, dto.zone);
  }
}
