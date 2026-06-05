import { CanvasModel } from '../CanvasModel';
import { Colors } from '../Colors';
import type { Coordinate } from '../Coordinate';

export abstract class Drawable {
  protected color: string;

  constructor(color?: string) {
    this.color = color ?? Colors.veryLightGrey;
  }

  abstract draw(canvasModel: CanvasModel): void;

  protected mapCoordsToCanvas = (c: Coordinate, canvasModel: CanvasModel): Coordinate => {
    return {
      x: Math.round(
        ((c.x - canvasModel.cartesianPlane.x.min) / canvasModel.cartesianDimensions.width) *
          canvasModel.canvasDimensions.width,
      ),
      y: Math.round(
        canvasModel.canvasDimensions.height -
          ((c.y - canvasModel.cartesianPlane.y.min) / canvasModel.cartesianDimensions.height) *
            canvasModel.canvasDimensions.height,
      ),
    };
  };

  protected scaleLengthToCanvas = (length: number, canvasModel: CanvasModel): number =>
    length * canvasModel.canvasScale;
}
