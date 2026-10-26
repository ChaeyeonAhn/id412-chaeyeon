"use client";

import { useState } from "react";
import styles from "./page.module.css";

// Lower-right button that opens a small panel: two neon colors and arabic/roman numerals.
export default function Controls({
  neon,
  activeNeon,
  roman,
  onNeonChange,
  onActiveNeonChange,
  onRomanChange,
}: {
  neon: string;
  activeNeon: string;
  roman: boolean;
  onNeonChange: (color: string) => void;
  onActiveNeonChange: (color: string) => void;
  onRomanChange: (roman: boolean) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className={styles.picker}>
      {open && (
        <div className={styles.panel}>
          <label className={styles.row}>
            grid
            <input type="color" value={neon} onChange={(e) => onNeonChange(e.target.value)} />
          </label>
          <label className={styles.row}>
            ticking
            <input
              type="color"
              value={activeNeon}
              onChange={(e) => onActiveNeonChange(e.target.value)}
            />
          </label>
          <div className={styles.row}>
            <button
              className={roman ? styles.option : `${styles.option} ${styles.selected}`}
              onClick={() => onRomanChange(false)}
            >
              123
            </button>
            <button
              className={roman ? `${styles.option} ${styles.selected}` : styles.option}
              onClick={() => onRomanChange(true)}
            >
              XII
            </button>
          </div>
        </div>
      )}
      <button
        className={styles.toggle}
        onClick={() => setOpen(!open)}
        aria-label="Toggle options"
      >
        {open ? "×" : "options"}
      </button>
    </div>
  );
}
