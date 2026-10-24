import { ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { MIN_ZONE_POINTS } from '../../constants';

function isPoint(value: unknown): boolean {
  return (
    Array.isArray(value) &&
    value.length === 2 &&
    value.every((coordinate) => typeof coordinate === 'number' && Number.isFinite(coordinate) && coordinate >= 0)
  );
}

@ValidatorConstraint({ name: 'zone' })
export class ZoneConstraint implements ValidatorConstraintInterface {
  validate(value: unknown): boolean {
    return Array.isArray(value) && value.length >= MIN_ZONE_POINTS && value.every(isPoint);
  }

  defaultMessage(): string {
    return `zone должна быть JSON-массивом минимум из ${MIN_ZONE_POINTS} точек [x, y] с неотрицательными числами`;
  }
}

export function parseZone(value: unknown): unknown {
  if (typeof value !== 'string') return value;
  try {
    return JSON.parse(value);
  } catch {
    return undefined;
  }
}
