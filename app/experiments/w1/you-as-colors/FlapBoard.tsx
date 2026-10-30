"use client";

import { useEffect, useRef, useState } from "react";
import { colorName, toCss, type Swatch } from "./palette";
import styles from "./page.module.css";

// 2. A split-flap board, like a station departures board or a café's "now brewing" sign.
//    Each row: colour chip, colour name, share, and the change since the last board,
//    like a stock ticker. Letters flip one step at a time until they reach the new text.
const CHARS = " ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789%▲▼-";
const NAME_LEN = 11;
const ROW_LEN = NAME_LEN + 10; // name, share "42%", change "▲ 3"
const BOARD_EVERY = 2500; // ms between two new boards, so the flaps have time to settle
const FLIP_EVERY = 45; // ms per flap step

function rowText(s: Swatch, before: number | undefined) {
  const share = Math.round(s.share * 100);
  const diff = before === undefined ? 0 : share - before;
  const change = diff > 0 ? "▲" + String(diff).padStart(2) : diff < 0 ? "▼" + String(-diff).padStart(2) : " --";
  return (colorName(s).padEnd(NAME_LEN) + " " + (share + "%").padStart(4) + "  " + change).padEnd(ROW_LEN);
}

export function FlapBoard({ swatches, rows }: { swatches: Swatch[]; rows: number }) {
  const blank = " ".repeat(ROW_LEN);
  const [shown, setShown] = useState<string[]>(() => Array(rows).fill(blank));
  const [chips, setChips] = useState<string[]>(() => Array(rows).fill("#111"));

  const latest = useRef(swatches);
  useEffect(() => {
    latest.current = swatches;
  }, [swatches]);

  useEffect(() => {
    let target: string[] = Array(rows).fill(blank);
    let before = new Map<string, number>(); // share per colour name on the last board

    function newBoard() {
      const list = latest.current;
      if (list.length === 0) return;
      target = Array.from({ length: rows }, (_, i) => (list[i] ? rowText(list[i], before.get(colorName(list[i]))) : blank));
      before = new Map(list.map((s) => [colorName(s), Math.round(s.share * 100)]));
      setChips(Array.from({ length: rows }, (_, i) => (list[i] ? toCss(list[i]) : "#111")));
    }

    // Every character that is not there yet moves one step along CHARS.
    function flip() {
      setShown((rowsNow) =>
        rowsNow.map((row, r) =>
          [...row]
            .map((ch, c) => (ch === target[r][c] ? ch : CHARS[(CHARS.indexOf(ch) + 1) % CHARS.length]))
            .join(""),
        ),
      );
    }

    newBoard();
    const boardTimer = setInterval(newBoard, BOARD_EVERY);
    const flipTimer = setInterval(flip, FLIP_EVERY);
    return () => {
      clearInterval(boardTimer);
      clearInterval(flipTimer);
    };
  }, [rows, blank]);

  return (
    <div className={styles.board}>
      {shown.map((row, r) => (
        <div key={r} className={styles.boardRow}>
          <span className={styles.flap} style={{ background: chips[r] }} />
          {[...row].map((ch, c) => (
            // A new key for every new letter replays the flip animation.
            <span key={`${c}-${ch}`} className={styles.flap}>
              {ch}
            </span>
          ))}
        </div>
      ))}
    </div>
  );
}
