import { Box, DetectResult, ImageSize, Person } from './types';

function toPerson(box: Box, helmet: boolean, vest: boolean): Person {
  return { box, helmet, vest, violation: !(helmet && vest) };
}

export function buildMockResult({ width, height }: ImageSize): DetectResult {
  const personWidth = width * 0.12;
  const personHeight = height * 0.5;
  const footY = height * 0.9;

  function boxAt(shareX: number): Box {
    const centerX = width * shareX;
    return [centerX - personWidth / 2, footY - personHeight, centerX + personWidth / 2, footY].map(Math.round) as Box;
  }

  const people = [toPerson(boxAt(0.25), false, true), toPerson(boxAt(0.5), true, true), toPerson(boxAt(0.75), true, false)];

  return { violation: people.some((person) => person.violation), people };
}
