import { useMutation, type UseMutationResult } from '@tanstack/react-query';
import { detectMany } from '../api/detect';
import type { DetectOutcome, Photo } from '../types';

export function useDetect(): UseMutationResult<DetectOutcome[], Error, Photo[]> {
  return useMutation({ mutationFn: detectMany });
}
