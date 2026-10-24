import type { Person, PersonStatus } from '../types';

export function getPersonStatus({ violation }: Person): PersonStatus {
  return violation ? 'violation' : 'ok';
}
