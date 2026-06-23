import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { CanvasModel } from '../../CanvasModel';
import type { Coordinate } from '../../Coordinate';
import { Square } from '../../Drawables/Square';
import { Piece } from '../../Pieces/Piece';
import PieceEditor, { type PieceEditorHandle } from '../PieceEditor';
import { Scene, type SceneCanvases, type SceneProps } from './Scene';

type SquareState = {
  piece?: Piece;
  attackedBy: Set<string>;
};

type MainSceneProps = {
  canvasScale?: number;
  size?: number;
};

const directions: Array<Coordinate> = [
  { x: 1, y: 0 },
  { x: 0, y: 1 },
  { x: -1, y: 0 },
  { x: 0, y: -1 },
];

const knightOffsets: Array<Coordinate> = [
  { x: 1, y: 2 },
  { x: 2, y: 1 },
  { x: 2, y: -1 },
  { x: 1, y: -2 },
  { x: -1, y: -2 },
  { x: -2, y: -1 },
  { x: -2, y: 1 },
  { x: -1, y: 2 },
];

export default function MainScene({
  canvasScale = 2,
  size = 100,
}: MainSceneProps = {}): React.JSX.Element {
  const plane = useMemo(
    () => ({ x: { min: -size, max: size }, y: { min: -size, max: size } }),
    [size],
  );
  const numPoints = useMemo(
    () => (plane.x.max - plane.x.min) * (plane.y.max - plane.y.min),
    [plane],
  );

  const sceneCanvasesRef = useRef<SceneCanvases | null>(null);
  const canvasModelRef = useRef<CanvasModel | null>(null);
  const [sceneProps, setSceneProps] = useState<SceneProps | null>(null);

  const editor1Ref = useRef<PieceEditorHandle | null>(null);
  const editor2Ref = useRef<PieceEditorHandle | null>(null);

  const draw = useCallback(
    (pieces: Array<Piece>) => {
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
        const { x: dx, y: dy } = directions[dirIndex % 4]!;
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
    },
    [numPoints],
  );

  const handleReset = (): void => {
    editor1Ref.current?.reset();
    editor2Ref.current?.reset();
    draw([
      new Piece('#111111', ({ x, y }) =>
        knightOffsets.map(({ x: dx, y: dy }) => ({ x: x + dx, y: y + dy })),
      ),
      new Piece('#cc0000', ({ x, y }) =>
        knightOffsets.map(({ x: dx, y: dy }) => ({ x: x + dx, y: y + dy })),
      ),
    ]);
  };

  const handleRender = useCallback((): void => {
    const p1 = editor1Ref.current?.getPiece();
    const p2 = editor2Ref.current?.getPiece();
    if (p1 && p2) draw([p1, p2]);
  }, [draw]);

  useEffect(() => {
    if (!sceneCanvasesRef.current?.background) {
      return;
    }

    const backgroundCanvasContext = sceneCanvasesRef.current.background.getContext('2d');
    if (!backgroundCanvasContext) {
      throw new Error('Could not get background canvas drawing context');
    }

    canvasModelRef.current = new CanvasModel(backgroundCanvasContext, canvasScale, plane);

    handleRender();
  }, [handleRender, canvasScale, plane]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: 16,
        padding: 16,
      }}
    >
      <div style={{ display: 'flex', gap: 32, alignItems: 'flex-start' }}>
        <PieceEditor
          ref={editor1Ref}
          radius={3}
          initialColor="#111111"
          initialAttackOffsets={knightOffsets}
        />
        <PieceEditor
          ref={editor2Ref}
          radius={3}
          initialColor="#cc0000"
          initialAttackOffsets={knightOffsets}
        />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignSelf: 'center' }}>
          <button onClick={handleRender} style={{ padding: '8px 20px', fontSize: 14 }}>
            Render
          </button>
          <button onClick={handleReset} style={{ padding: '8px 20px', fontSize: 14 }}>
            Reset
          </button>
        </div>
      </div>
      <div style={{ position: 'relative' }}>
        <Scene ref={sceneCanvasesRef} background={sceneProps?.background} />
      </div>
    </div>
  );
}
