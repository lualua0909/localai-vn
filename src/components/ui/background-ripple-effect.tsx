"use client";
import React, { useCallback, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export const BackgroundRippleEffect = ({
  rows = 8,
  cols = 27,
  cellSize = 56,
}: {
  rows?: number;
  cols?: number;
  cellSize?: number;
}) => {
  const [clickedCell, setClickedCell] = useState<{
    row: number;
    col: number;
  } | null>(null);
  const [rippleKey, setRippleKey] = useState(0);
  const gridRef = useRef<HTMLDivElement>(null);

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      const grid = gridRef.current;
      if (!grid) return;

      const rect = grid.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const col = Math.floor(x / cellSize);
      const row = Math.floor(y / cellSize);

      if (row >= 0 && row < rows && col >= 0 && col < cols) {
        setClickedCell({ row, col });
        setRippleKey((k) => k + 1);
      }
    },
    [cellSize, rows, cols],
  );

  return (
    <div
      className={cn(
        "absolute inset-0 z-[5] h-full w-full cursor-pointer",
        "[--cell-border-color:#a1a1aa] [--cell-fill-color:#e4e4e7] [--cell-shadow-color:#71717a]",
        "dark:[--cell-border-color:#3f3f46] dark:[--cell-fill-color:#18181b] dark:[--cell-shadow-color:#27272a]",
      )}
      onClick={handleClick}
    >
      <div className="relative h-auto w-auto overflow-hidden">
        <DivGrid
          ref={gridRef}
          key={`base-${rippleKey}`}
          rows={rows}
          cols={cols}
          cellSize={cellSize}
          borderColor="var(--cell-border-color)"
          fillColor="var(--cell-fill-color)"
          clickedCell={clickedCell}
        />
      </div>
    </div>
  );
};

type DivGridProps = {
  className?: string;
  rows: number;
  cols: number;
  cellSize: number;
  borderColor: string;
  fillColor: string;
  clickedCell: { row: number; col: number } | null;
};

const DivGrid = React.forwardRef<HTMLDivElement, DivGridProps>(
  (
    {
      className,
      rows = 7,
      cols = 30,
      cellSize = 56,
      borderColor = "#3f3f46",
      fillColor = "rgba(14,165,233,0.3)",
      clickedCell = null,
    },
    ref,
  ) => {
    const cells = useMemo(
      () => Array.from({ length: rows * cols }, (_, idx) => idx),
      [rows, cols],
    );

    const gridStyle: React.CSSProperties = {
      display: "grid",
      gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`,
      gridTemplateRows: `repeat(${rows}, ${cellSize}px)`,
      width: cols * cellSize,
      height: rows * cellSize,
      marginInline: "auto",
      WebkitMaskImage:
        "radial-gradient(ellipse at top, black 20%, transparent 70%)",
      maskImage:
        "radial-gradient(ellipse at top, black 20%, transparent 70%)",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "pointer-events-none relative opacity-80 dark:opacity-60",
          className,
        )}
        style={gridStyle}
      >
        {cells.map((idx) => {
          const rowIdx = Math.floor(idx / cols);
          const colIdx = idx % cols;
          const distance = clickedCell
            ? Math.hypot(clickedCell.row - rowIdx, clickedCell.col - colIdx)
            : 0;
          const delay = clickedCell ? Math.max(0, distance * 55) : 0;
          const duration = 200 + distance * 80;

          const animationStyle: React.CSSProperties = clickedCell
            ? {
                animation: `cellRipple ${duration}ms ease-out ${delay}ms none`,
              }
            : {};

          return (
            <div
              key={idx}
              className="cell relative border-[0.5px] opacity-60 will-change-transform dark:opacity-40 dark:shadow-[0px_0px_40px_1px_var(--cell-shadow-color)_inset]"
              style={{
                backgroundColor: fillColor,
                borderColor: borderColor,
                ...animationStyle,
              }}
            />
          );
        })}
      </div>
    );
  },
);

DivGrid.displayName = "DivGrid";
