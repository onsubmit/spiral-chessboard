import type { Coordinate } from '../Coordinate';

export class Piece {
  readonly color: string;
  readonly getAttackCoordinates: (coordinate: Coordinate) => Array<Coordinate>;

  constructor(color: string, getAttackCoordinates: (coordinate: Coordinate) => Array<Coordinate>) {
    this.color = color;
    this.getAttackCoordinates = getAttackCoordinates;
  }
}
