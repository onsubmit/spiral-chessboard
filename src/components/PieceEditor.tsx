import { forwardRef, useImperativeHandle, useRef, useState } from 'react';

import type { Coordinate } from '../Coordinate';
import { Piece } from '../Pieces/Piece';

type Props = {
  radius: number;
  initialColor: string;
  initialAttackOffsets?: Array<Coordinate>;
};

export type PieceEditorHandle = {
  getPiece: () => Piece;
  reset: () => void;
};

const CELL_SIZE = 24;
const ATTACK_COLOR = '#999';
const GRID_LINE_COLOR = '#ccc';

const PieceEditor = forwardRef<PieceEditorHandle, Props>(function PieceEditor(
  { radius, initialColor, initialAttackOffsets = [] },
  ref,
) {
  const [centerColor, setCenterColor] = useState(initialColor);
  const [attackOffsets, setAttackOffsets] = useState<Set<string>>(
    () => new Set(initialAttackOffsets.map(({ x, y }) => `${x},${y}`)),
  );

  const centerColorRef = useRef(centerColor);
  centerColorRef.current = centerColor;
  const attackOffsetsRef = useRef(attackOffsets);
  attackOffsetsRef.current = attackOffsets;

  useImperativeHandle(ref, () => ({
    getPiece: (): Piece =>
      new Piece(centerColorRef.current, ({ x, y }) =>
        Array.from(attackOffsetsRef.current).map((key) => {
          const comma = key.indexOf(',');
          return {
            x: x + Number(key.slice(0, comma)),
            y: y + Number(key.slice(comma + 1)),
          };
        }),
      ),
    reset: (): void => {
      setCenterColor(initialColor);
      setAttackOffsets(new Set(initialAttackOffsets.map(({ x, y }) => `${x},${y}`)));
    },
  }));

  const size = 2 * radius + 1;

  const toggleAttack = (dx: number, dy: number): void => {
    const key = `${dx},${dy}`;
    setAttackOffsets((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  return (
    <table
      style={{
        borderCollapse: 'collapse',
        background: 'white',
        userSelect: 'none',
      }}
    >
      <tbody>
        {Array.from({ length: size }, (_, rowIdx) => {
          const dy = radius - rowIdx;
          return (
            <tr key={rowIdx}>
              {Array.from({ length: size }, (_, colIdx) => {
                const dx = colIdx - radius;
                const isCenter = dx === 0 && dy === 0;
                const isAttack = attackOffsets.has(`${dx},${dy}`);

                const bgColor = isCenter ? centerColor : isAttack ? ATTACK_COLOR : 'white';

                return (
                  <td
                    key={colIdx}
                    onClick={() => {
                      if (!isCenter) toggleAttack(dx, dy);
                    }}
                    style={{
                      width: CELL_SIZE,
                      height: CELL_SIZE,
                      border: `1px solid ${GRID_LINE_COLOR}`,
                      backgroundColor: bgColor,
                      cursor: isCenter ? 'default' : 'pointer',
                      position: 'relative',
                      boxSizing: 'border-box',
                    }}
                  >
                    {isCenter && (
                      <input
                        type="color"
                        value={centerColor}
                        onChange={(e) => setCenterColor(e.target.value)}
                        style={{
                          position: 'absolute',
                          inset: 0,
                          opacity: 0,
                          width: '100%',
                          height: '100%',
                          cursor: 'pointer',
                          padding: 0,
                          border: 'none',
                        }}
                      />
                    )}
                  </td>
                );
              })}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
});

export default PieceEditor;
