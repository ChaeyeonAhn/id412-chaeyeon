"use client";

import { useEffect, useState, type CSSProperties } from "react";
import Controls from "./Controls";
import RomanNumeral from "./RomanNumeral";
import SevenSegment from "./SevenSegment";
import styles from "./page.module.css";

// A full-screen grid of square cells showing 0–9 as neon digital-clock digits (or Roman numerals).
// Hover a cell and it turns into a timer that ticks up; leave it and it freezes.
const CELL_SIZE = 36; // px, smaller = denser grid
const MAX_COUNT = 100;
const INTERVAL = 100; // ms
const DEFAULT_NEON = "#00f0ff";
const DEFAULT_ACTIVE_NEON = "#ff2bd6";

function Cell({ digit, roman }: { digit: number; roman: boolean }) {
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
      {roman ? (
        <span className={styles.number}>
          <RomanNumeral value={count} className={styles.roman} />
        </span>
      ) : (
        <SevenSegment value={count} className={styles.number} digitClassName={styles.digit} />
      )}
    </div>
  );
}

export default function TimeInterval() {
  const [grid, setGrid] = useState({ columns: 0, rows: 0 });
  const [neon, setNeon] = useState(DEFAULT_NEON);
  const [activeNeon, setActiveNeon] = useState(DEFAULT_ACTIVE_NEON);
  const [roman, setRoman] = useState(false);

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
    cells.push(<Cell key={i} digit={i % 10} roman={roman} />);
  }

  return (
    <main
      className={styles.container}
      // The colors are CSS variables, read by page.module.css.
      style={
        {
          gridTemplateColumns: `repeat(${grid.columns}, ${CELL_SIZE}px)`,
          "--neon": neon,
          "--active-neon": activeNeon,
        } as CSSProperties
      }
    >
      {cells}
      <Controls
        neon={neon}
        activeNeon={activeNeon}
        roman={roman}
        onNeonChange={setNeon}
        onActiveNeonChange={setActiveNeon}
        onRomanChange={setRoman}
      />
    </main>
  );
}
