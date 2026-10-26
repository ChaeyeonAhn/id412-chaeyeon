"use client";

import { useState } from "react";
import styles from "./page.module.css";

// Lower-right button that opens a small panel with two color inputs.
export default function Controls({
  neon,
  activeNeon,
  onNeonChange,
  onActiveNeonChange,
}: {
  neon: string;
  activeNeon: string;
  onNeonChange: (color: string) => void;
  onActiveNeonChange: (color: string) => void;
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
        </div>
      )}
      <button
        className={styles.toggle}
        onClick={() => setOpen(!open)}
        aria-label="Toggle color picker"
      >
        {open ? "×" : "color"}
      </button>
    </div>
  );
}
