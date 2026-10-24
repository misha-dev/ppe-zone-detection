import { useMutation, type UseMutationResult } from '@tanstack/react-query';
import { detect } from '../api/detect';
import type { DetectResult } from '../types';

export function useDetect(): UseMutationResult<DetectResult, Error, File> {
  return useMutation({ mutationFn: detect });
}
