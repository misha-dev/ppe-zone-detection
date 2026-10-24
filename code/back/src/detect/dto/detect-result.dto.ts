import { ApiProperty } from '@nestjs/swagger';
import { Box } from '../types';

export class PersonDto {
  @ApiProperty({ type: [Number], example: [120, 220, 180, 400], description: 'x1, y1, x2, y2 в пикселях фото' })
  box: Box;

  @ApiProperty()
  helmet: boolean;

  @ApiProperty()
  vest: boolean;

  @ApiProperty({ description: 'Нет каски или жилета' })
  violation: boolean;
}

export class DetectResultDto {
  @ApiProperty()
  violation: boolean;

  @ApiProperty({ type: [PersonDto] })
  people: PersonDto[];
}
