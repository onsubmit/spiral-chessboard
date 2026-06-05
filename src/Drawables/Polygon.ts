import { CanvasModel } from '../CanvasModel';
import { Drawable } from './Drawable';
import { LineSegment } from './LineSegment';
import { Point } from './Point';

export type PolygonArgs = {
  points: Array<Point>;
  color?: string;
};

export class Polygon extends Drawable {
  private _lineSegments: Array<LineSegment>;

  constructor({ points, color }: PolygonArgs) {
    super(color);
    this._lineSegments = [];

    for (let i = 0, len = points.length; i < len; i++) {
      const point1 = points[i]!;
      const point2 = points[(i + 1) % len]!;
      const segment = new LineSegment({ point1, point2, color: this.color });
      this._lineSegments.push(segment);
    }
  }

  get lineSegments(): Array<LineSegment> {
    return this._lineSegments;
  }

  draw = (canvasModel: CanvasModel): void => {
    this._lineSegments.forEach((segment) => segment.draw(canvasModel));
  };
}
