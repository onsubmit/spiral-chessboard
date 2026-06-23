import type { Coordinate } from '../Coordinate';
import { Piece } from './Piece';

export class Knight extends Piece {
  constructor(color: string) {
    super(color, getAttackCoordinates);
  }
}

function getAttackCoordinates({ x, y }: Coordinate): Array<Coordinate> {
  return [
    { x: x + 1, y: y + 2 },
    { x: x + 2, y: y + 1 },
    { x: x + 2, y: y - 1 },
    { x: x + 1, y: y - 2 },
    { x: x - 1, y: y - 2 },
    { x: x - 2, y: y - 1 },
    { x: x - 2, y: y + 1 },
    { x: x - 1, y: y + 2 },
  ];
}
