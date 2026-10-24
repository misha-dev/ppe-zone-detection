import type { Person, PersonStatus } from '../types';

export function getPersonStatus({ violation, inZone }: Person): PersonStatus {
  if (violation) return 'violation';
  return inZone ? 'ok' : 'outside';
}
