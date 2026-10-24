import { COLORS, LABEL_FONT_SIZE, LINE_WIDTH } from '../constants';
import type { Person } from '../types';
import { getPersonStatus } from './person';

export function drawPeople(ctx: CanvasRenderingContext2D, people: Person[], scale: number): void {
  const fontSize = LABEL_FONT_SIZE * scale;
  ctx.font = `600 ${fontSize}px system-ui, sans-serif`;
  ctx.textBaseline = 'top';

  people.forEach((person, index) => {
    const [x1, y1, x2, y2] = person.box;
    const color = COLORS[getPersonStatus(person)];

    ctx.strokeStyle = color;
    ctx.lineWidth = LINE_WIDTH * scale;
    ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);

    const label = `${index + 1}`;
    const padding = 4 * scale;
    const labelWidth = ctx.measureText(label).width + padding * 2;
    const labelHeight = fontSize + padding * 2;
    const labelY = Math.max(y1 - labelHeight, 0);
    ctx.fillStyle = color;
    ctx.fillRect(x1, labelY, labelWidth, labelHeight);
    ctx.fillStyle = COLORS.label;
    ctx.fillText(label, x1 + padding, labelY + padding);
  });
}
