import { ApiProperty } from '@nestjs/swagger';
import { Box, Point } from '../types';

export class PersonDto {
  @ApiProperty({ type: [Number], example: [120, 220, 180, 400], description: 'x1, y1, x2, y2' })
  box: Box;

  @ApiProperty()
  helmet: boolean;

  @ApiProperty()
  vest: boolean;

  @ApiProperty()
  inZone: boolean;

  @ApiProperty()
  violation: boolean;
}

export class DetectResultDto {
  @ApiProperty()
  violation: boolean;

  @ApiProperty({ type: 'array', items: { type: 'array', items: { type: 'number' } }, example: [[100, 200], [400, 200], [400, 500], [100, 500]] })
  zone: Point[];

  @ApiProperty({ type: [PersonDto] })
  people: PersonDto[];
}
