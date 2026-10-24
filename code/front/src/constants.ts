import type { PersonStatus, Step } from './types';

export const API_URL = import.meta.env.VITE_API_URL ?? '/api';
export const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const MAX_FILE_SIZE_MB = 10;

export const STEPS: { id: Step; label: string }[] = [
  { id: 'upload', label: 'Фото' },
  { id: 'result', label: 'Результат' },
];

export const COLORS = {
  violation: '#ef4444',
  ok: '#22c55e',
  outside: '#94a3b8',
  label: '#ffffff',
};

export const STATUS_LABELS: Record<PersonStatus, string> = {
  violation: 'Нарушение',
  ok: 'В порядке',
  outside: 'Вне зоны',
};

export const LINE_WIDTH = 3;
export const LABEL_FONT_SIZE = 16;
