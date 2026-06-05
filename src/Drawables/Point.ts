import { CanvasModel } from '../CanvasModel';
import { Constants } from '../Constants';
import type { Coordinate } from '../Coordinate';
import { Drawable } from './Drawable';

export type PointArgs = {
  coordinate: Coordinate;
  color?: string;
};

export class Point extends Drawable {
  private static RADIUS = 3;

  private _coordinate: Coordinate;

  constructor({ coordinate, color }: PointArgs) {
    super(color);
    this._coordinate = coordinate;
  }

  get coordinate(): Coordinate {
    return this._coordinate;
  }

  draw = (canvasModel: CanvasModel): void => {
    const p = this.mapCoordsToCanvas(this._coordinate, canvasModel);

    canvasModel.context.beginPath();
    canvasModel.context.fillStyle = this.color;
    canvasModel.context.arc(p.x, p.y, Point.RADIUS, 0, Constants.TWO_PI);
    canvasModel.context.closePath();
    canvasModel.context.fill();
  };
}
