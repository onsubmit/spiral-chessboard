import { useCallback, useEffect, useRef, useState } from 'react';

import { CanvasModel } from '../../CanvasModel';
import { Square } from '../../Drawables/Square';
import { Knight } from '../../Pieces/Knight';
import type { Piece } from '../../Pieces/Piece';
import { Scene, type SceneCanvases, type SceneProps } from './Scene';

type SquareState = {
  piece?: Piece;
  attackedBy: Set<string>;
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

const pieces: Array<Piece> = [new Knight('black'), new Knight('red')];

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
      const [dx, dy] = directions[dirIndex % 4]!;
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

    // Place pieces along the spiral
    const chessboard = new Map<string, SquareState>();

    const getState = (cx: number, cy: number): SquareState => {
      const key = `${cx},${cy}`;
      const existing = chessboard.get(key);
      if (existing) return existing;
      const state: SquareState = { attackedBy: new Set() };
      chessboard.set(key, state);
      return state;
    };

    const placePiece = (cx: number, cy: number, piece: Piece): void => {
      getState(cx, cy).piece = piece;
      for (const { x: ax, y: ay } of piece.getAttackCoordinates({ x: cx, y: cy })) {
        getState(ax, ay).attackedBy.add(piece.color);
      }
    };

    // First piece always starts at (0,0)
    placePiece(0, 0, pieces[0]!);

    const ptrs = pieces.map(() => 1);
    let pieceIndex = 1;
    let canPlace = true;
    while (canPlace) {
      canPlace = false;
      const piece = pieces[pieceIndex % pieces.length]!;
      const opponents = pieces.filter((_, i) => i % pieces.length !== pieceIndex % pieces.length);
      const ptr = ptrs[pieceIndex % pieces.length]!;

      for (let i = ptr; i < spiralPath.length; i++) {
        const [sx, sy] = spiralPath[i]!;
        const state = chessboard.get(`${sx},${sy}`);
        const attackedByOpponent = opponents.some((op) => state?.attackedBy.has(op.color));
        if (!state?.piece && !attackedByOpponent) {
          placePiece(sx, sy, piece);
          ptrs[pieceIndex % pieces.length] = i + 1;
          pieceIndex++;
          canPlace = true;
          break;
        }
      }
    }

    // Draw squares
    const drawables: Array<Square> = [];
    for (const [px, py] of spiralPath) {
      const state = chessboard.get(`${px},${py}`);
      const color = state?.piece?.color ?? 'white';
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
