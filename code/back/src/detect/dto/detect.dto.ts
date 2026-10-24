import { Transform } from 'class-transformer';
import { Validate } from 'class-validator';
import { Point } from '../types';
import { parseZone, ZoneConstraint } from './zone.validator';

export class DetectDto {
  @Transform(({ value }) => parseZone(value))
  @Validate(ZoneConstraint)
  zone: Point[];
}
