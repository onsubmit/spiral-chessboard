import { useCallback, useEffect, useRef, useState } from 'react';

import { CanvasModel } from '../../CanvasModel';
import { Square } from '../../Drawables/Square';
import { Scene, type SceneCanvases, type SceneProps } from './Scene';

type Piece = 'black' | 'red';

type SquareState = {
  piece?: Piece;
  attackedByBlack?: boolean;
  attackedByRed?: boolean;
};

const CANVAS_SCALE = 1;

const size = 100;
const plane = {
  x: { min: -size, max: size },
  y: { min: -size, max: size },
};
const numPoints = (plane.x.max - plane.x.min) * (plane.y.max - plane.y.min);

const directions: Array<[number, number]> = [
  [1, 0],
  [0, 1],
  [-1, 0],
  [0, -1],
];

export default function MainScene(): React.JSX.Element {
  const sceneCanvasesRef = useRef<SceneCanvases | null>(null);
  const canvasModelRef = useRef<CanvasModel | null>(null);
  const [sceneProps, setSceneProps] = useState<SceneProps | null>(null);

  const draw = useCallback(() => {
    const canvasModel = canvasModelRef.current;
    if (!canvasModel) {
      return;
    }

    // Build ordered spiral path
    const spiralPath: Array<[number, number]> = [];
    let x = 0;
    let y = 0;
    let dirIndex = 0;
    let runLength = 1;
    while (spiralPath.length < numPoints) {
      const [dx, dy] = directions[dirIndex % 4];
      for (let step = 0; step < runLength && spiralPath.length < numPoints; step++) {
        spiralPath.push([x, y]);
        x += dx;
        y += dy;
      }

      dirIndex++;
      if (dirIndex % 2 === 0) {
        runLength++;
      }
    }

    // Place knights along the spiral
    const chessboard = new Map<string, SquareState>();

    const getState = (cx: number, cy: number): SquareState => {
      const key = `${cx},${cy}`;
      if (!chessboard.has(key)) {
        chessboard.set(key, {});
      }

      return chessboard.get(key);
    };

    const placePiece = (cx: number, cy: number, piece: Piece): void => {
      getState(cx, cy).piece = piece;
      for (const [ax, ay] of getKnightAttackCoordinates(cx, cy)) {
        const state = getState(ax, ay);
        if (piece === 'black') {
          state.attackedByBlack = true;
        } else {
          state.attackedByRed = true;
        }
      }
    };

    // Black knight always starts at (0,0)
    placePiece(0, 0, 'black');

    let nextPiece: Piece = 'red';
    let blackPtr = 1;
    let redPtr = 1;
    let canPlace = true;
    while (canPlace) {
      canPlace = false;
      const start = nextPiece === 'black' ? blackPtr : redPtr;
      for (let i = start; i < spiralPath.length; i++) {
        const [sx, sy] = spiralPath[i];
        const state = chessboard.get(`${sx},${sy}`) ?? {};
        const blockedByOpponent = nextPiece === 'red' ? state.attackedByBlack : state.attackedByRed;
        if (!state.piece && !blockedByOpponent) {
          placePiece(sx, sy, nextPiece);
          if (nextPiece === 'black') {
            blackPtr = i + 1;
          } else {
            redPtr = i + 1;
          }

          nextPiece = nextPiece === 'red' ? 'black' : 'red';
          canPlace = true;
          break;
        }
      }
    }

    // Draw squares
    const drawables: Array<Square> = [];
    for (const [px, py] of spiralPath) {
      const state = chessboard.get(`${px},${py}`) ?? {};
      const color = state.piece ?? 'white';

      drawables.push(new Square({ bottomLeft: { x: px, y: py }, size: 1, color }));
    }

    setSceneProps({
      background: {
        canvasModel,
        drawables,
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

      canvasModelRef.current = new CanvasModel(backgroundCanvasContext, CANVAS_SCALE, plane);
    }

    draw();
  }, [draw]);

  return <Scene ref={sceneCanvasesRef} background={sceneProps?.background} />;
}

function getKnightAttackCoordinates(x: number, y: number): Array<[number, number]> {
  return [
    [x + 1, y + 2],
    [x + 2, y + 1],
    [x + 2, y - 1],
    [x + 1, y - 2],
    [x - 1, y - 2],
    [x - 2, y - 1],
    [x - 2, y + 1],
    [x - 1, y + 2],
  ];
}
