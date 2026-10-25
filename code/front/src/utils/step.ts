import type { AppState, Step } from '../types';

export function getStep({ checked }: AppState): Step {
  return checked ? 'result' : 'upload';
}
