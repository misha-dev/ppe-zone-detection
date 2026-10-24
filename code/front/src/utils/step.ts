import type { AppState, Step } from '../types';

export function getStep({ result }: AppState): Step {
  return result ? 'result' : 'upload';
}
