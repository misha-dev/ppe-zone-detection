import { API_URL } from '../constants';
import type { ApiError, DetectResult } from '../types';

async function getErrorMessage(response: Response): Promise<string> {
  const fallback = `Ошибка сервера (${response.status})`;
  try {
    const { message }: ApiError = await response.json();
    return Array.isArray(message) ? message.join('; ') : (message ?? fallback);
  } catch {
    return fallback;
  }
}

export async function detect(file: File): Promise<DetectResult> {
  const form = new FormData();
  form.append('image', file);

  const response = await fetch(`${API_URL}/detect`, { method: 'POST', body: form });
  if (!response.ok) throw new Error(await getErrorMessage(response));
  return response.json();
}
