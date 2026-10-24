import { useMutation, type UseMutationResult } from '@tanstack/react-query';
import { detect } from '../api/detect';
import type { DetectRequest, DetectResult } from '../types';

export function useDetect(): UseMutationResult<DetectResult, Error, DetectRequest> {
  return useMutation({ mutationFn: detect });
}
