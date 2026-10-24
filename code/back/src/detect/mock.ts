import { Box, DetectResult, Person, Point } from './types';
import { getBounds, getFootPoint, isPointInPolygon } from './geometry';

function toPerson(box: Box, helmet: boolean, vest: boolean, zone: Point[]): Person {
  const inZone = isPointInPolygon(getFootPoint(box), zone);
  return { box, helmet, vest, inZone, violation: inZone && !(helmet && vest) };
}

export function buildMockResult(zone: Point[]): DetectResult {
  const [minX, minY, maxX, maxY] = getBounds(zone);
  const width = maxX - minX;
  const height = maxY - minY;
  const personWidth = width * 0.12;
  const personHeight = height * 0.5;
  const footY = minY + height * 0.9;

  function boxAt(shareX: number): Box {
    const centerX = minX + width * shareX;
    return [centerX - personWidth / 2, footY - personHeight, centerX + personWidth / 2, footY];
  }

  const people = [
    toPerson(boxAt(0.25), false, true, zone),
    toPerson(boxAt(0.5), true, true, zone),
    toPerson(boxAt(0.75), true, false, zone),
  ];

  return { violation: people.some((person) => person.violation), zone, people };
}
