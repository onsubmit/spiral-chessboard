import { CanvasModel } from '../CanvasModel';
import { Drawable } from './Drawable';
import { Point } from './Point';

export type LineSegmentArgs = {
  point1: Point;
  point2: Point;
  color?: string;
};

export class LineSegment extends Drawable {
  private _point1: Point;
  private _point2: Point;

  constructor({ point1, point2, color }: LineSegmentArgs) {
    super(color);
    this._point1 = point1;
    this._point2 = point2;
  }

  draw = (canvasModel: CanvasModel): void => {
    const p1 = this.mapCoordsToCanvas(this._point1.coordinate, canvasModel);
    const p2 = this.mapCoordsToCanvas(this._point2.coordinate, canvasModel);
    canvasModel.context.beginPath();
    canvasModel.context.strokeStyle = this.color;
    canvasModel.context.lineWidth = 0.5;
    canvasModel.context.moveTo(p1.x, p1.y);
    canvasModel.context.lineTo(p2.x, p2.y);
    canvasModel.context.stroke();
  };

  split = (numPoints: number): Array<Point> => {
    const points: Array<Point> = [];

    if (numPoints < 0) {
      throw new Error(`numPoints must be non-negative`);
    }

    if (numPoints === 0) {
      return [];
    }

    const { x: x1, y: y1 } = this._point1.coordinate;
    const { x: x2, y: y2 } = this._point2.coordinate;
    const vecX = (x2 - x1) / numPoints;
    const vecY = (y2 - y1) / numPoints;

    for (let i = 0; i < numPoints; i++) {
      points.push(new Point({ coordinate: { x: x1 + vecX * i, y: y1 + vecY * i } }));
    }

    return points;
  };
}
