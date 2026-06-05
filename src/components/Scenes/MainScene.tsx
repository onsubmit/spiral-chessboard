import { useCallback, useEffect, useRef, useState } from 'react';

import { CanvasModel } from '../../CanvasModel';
import { Colors } from '../../Colors';
import { Square } from '../../Drawables/Square';
import { Scene, type SceneCanvases, type SceneProps } from './Scene';

function MainScene(): React.JSX.Element {
  const CANVAS_SCALE = 40;

  const sceneCanvasesRef = useRef<SceneCanvases | null>(null);
  const canvasModelRef = useRef<CanvasModel | null>(null);
  const [sceneProps, setSceneProps] = useState<SceneProps | null>(null);

  const draw = useCallback(() => {
    const canvasModel = canvasModelRef.current;
    if (!canvasModel) {
      return;
    }

    const points: Array<Square> = [];
    const numPoints = 240;

    const directions: Array<[number, number]> = [
      [1, 0], // e
      [0, 1], // n
      [-1, 0], // w
      [0, -1], // s
    ];

    let x = 0;
    let y = 0;
    let pointIndex = 0;
    let runLength = 1;
    let dirIndex = 0;

    while (pointIndex < numPoints) {
      const [dx, dy] = directions[dirIndex % directions.length]!;
      for (let step = 0; step < runLength && pointIndex < numPoints; step++) {
        points.push(
          new Square({
            bottomLeft: { x, y },
            size: 1,
            color: ((): string => {
              switch (pointIndex % 4) {
                case 0:
                  return Colors.red;
                case 1:
                  return Colors.black;
                case 2:
                  return Colors.white;
                case 3:
                  return Colors.blue;
              }
            })(),
          }),
        );
        pointIndex++;
        x += dx;
        y += dy;
      }
      dirIndex++;
      if (dirIndex % 2 === 0) {
        runLength++;
      }
    }

    setSceneProps({
      background: {
        canvasModel,
        drawables: points,
      },
    });
  }, []);

  useEffect(() => {
    if (!sceneCanvasesRef.current?.background) {
      return;
    }

    if (!canvasModelRef.current) {
      const backgroundCanvasContext = sceneCanvasesRef.current.background.getContext('2d');
      if (!backgroundCanvasContext) {
        throw new Error('Could not get background canvas drawing context');
      }

      canvasModelRef.current = new CanvasModel(backgroundCanvasContext, CANVAS_SCALE, {
        x: { min: -10, max: 10 },
        y: { min: -10, max: 10 },
      });
    }

    draw();
  }, [draw]);

  return <Scene ref={sceneCanvasesRef} background={sceneProps?.background} />;
}

export default MainScene;
