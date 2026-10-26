"use client";

import { useEffect, useState } from "react";
import SevenSegment from "./SevenSegment";
import styles from "./page.module.css";

// A full-screen grid of square cells showing 0–9 as neon digital-clock digits.
// Hover a cell and it turns into a timer that ticks up; leave it and it freezes.
const CELL_SIZE = 36; // px, smaller = denser grid
const MAX_COUNT = 100;
const INTERVAL = 100; // ms

function Cell({ digit }: { digit: number }) {
  const [count, setCount] = useState(digit);
  const [hovered, setHovered] = useState(false);

  // Only the hovered cell runs an interval.
  useEffect(() => {
    if (!hovered) return;
    const id = setInterval(() => {
      setCount((previous) => (previous >= MAX_COUNT ? 0 : previous + 1));
    }, INTERVAL);
    return () => clearInterval(id);
  }, [hovered]);

  const className = hovered
    ? `${styles.cell} ${styles.active}`
    : count !== digit
      ? `${styles.cell} ${styles.stopped}`
      : styles.cell;

  return (
    <div
      className={className}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <SevenSegment value={count} className={styles.number} digitClassName={styles.digit} />
    </div>
  );
}

export default function TimeInterval() {
  const [grid, setGrid] = useState({ columns: 0, rows: 0 });

  // Enough square cells to cover the window; the last row/column may be cut off.
  useEffect(() => {
    function resize() {
      setGrid({
        columns: Math.ceil(window.innerWidth / CELL_SIZE),
        rows: Math.ceil(window.innerHeight / CELL_SIZE),
      });
    }
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  const cells = [];
  for (let i = 0; i < grid.columns * grid.rows; i++) {
    cells.push(<Cell key={i} digit={i % 10} />);
  }

  return (
    <main
      className={styles.container}
      style={{ gridTemplateColumns: `repeat(${grid.columns}, ${CELL_SIZE}px)` }}
    >
      {cells}
    </main>
  );
}
