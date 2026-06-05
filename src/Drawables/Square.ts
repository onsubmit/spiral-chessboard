import { CanvasModel } from '../CanvasModel';
import type { Coordinate } from '../Coordinate';
import { Drawable } from './Drawable';

export type SquareArgs = {
  bottomLeft: Coordinate;
  size: number;
  color?: string;
};

export class Square extends Drawable {
  private _bottomLeft: Coordinate;
  private _size: number;

  constructor({ bottomLeft, size, color }: SquareArgs) {
    super(color);
    this._bottomLeft = bottomLeft;
    this._size = size;
  }

  draw = (canvasModel: CanvasModel): void => {
    const bottomLeft = this.mapCoordsToCanvas(this._bottomLeft, canvasModel);
    const topRight = this.mapCoordsToCanvas(
      { x: this._bottomLeft.x + this._size, y: this._bottomLeft.y + this._size },
      canvasModel,
    );

    canvasModel.context.fillStyle = this.color;
    canvasModel.context.fillRect(
      bottomLeft.x,
      topRight.y,
      topRight.x - bottomLeft.x,
      bottomLeft.y - topRight.y,
    );
  };
}
