import { API_URL } from '../constants';
import type { ApiError, DetectRequest, DetectResult, Point } from '../types';

async function getErrorMessage(response: Response): Promise<string> {
  const fallback = `Ошибка сервера (${response.status})`;
  try {
    const { message }: ApiError = await response.json();
    return Array.isArray(message) ? message.join('; ') : (message ?? fallback);
  } catch {
    return fallback;
  }
}

function roundPoint([x, y]: Point): Point {
  return [Math.round(x), Math.round(y)];
}

export async function detect({ file, zone }: DetectRequest): Promise<DetectResult> {
  const form = new FormData();
  form.append('image', file);
  form.append('zone', JSON.stringify(zone.map(roundPoint)));

  const response = await fetch(`${API_URL}/detect`, { method: 'POST', body: form });
  if (!response.ok) throw new Error(await getErrorMessage(response));
  return response.json();
}
