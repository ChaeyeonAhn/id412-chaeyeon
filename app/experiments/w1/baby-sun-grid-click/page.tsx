"use client";

import { useEffect, useRef } from "react";
import styles from "./page.module.css";

// The Teletubbies baby sun video, cropped to a square and tiled in small cells
// that fill the screen. A small pool of hidden videos plays, each started at a
// random time, and every cell draws a randomly picked one (one <video> per
// cell would be ~100 decoders). Clicking a cell gives it a new random look:
// rotated by 0/90/180/270°, maybe mirrored, maybe color-inverted.
const VIDEO = "/experiments/w1/baby-sun-grid-click/baby-sun.mp4";
const CELL = 120; // px, target size of one square
const POOL = 12; // how many differently-timed copies of the video play

type Cell = {
  video: number; // which pool video it shows
  turns: number; // quarter turns, 0..3
  flip: boolean; // mirrored left-right
  invert: boolean; // colors inverted
};

function randomLook(cell: Cell): Cell {
  // Re-roll until something changes, so every click is visible.
  let next = cell;
  while (
    next.turns === cell.turns &&
    next.flip === cell.flip &&
    next.invert === cell.invert
  ) {
    next = {
      video: cell.video,
      turns: Math.floor(Math.random() * 4),
      flip: Math.random() < 0.5,
      invert: Math.random() < 0.5,
    };
  }
  return next;
}

export default function BabySunGridClick() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    let width = 0;
    let height = 0;
    let cols = 0;
    let rows = 0;
    let side = 0;
    let cells: Cell[] = [];
    let frame = 0;

    const videos = Array.from({ length: POOL }, () => {
      const video = document.createElement("video");
      video.src = VIDEO;
      video.muted = true;
      video.loop = true;
      video.playsInline = true;
      video.addEventListener(
        "loadedmetadata",
        () => {
          video.currentTime = Math.random() * video.duration;
          video.play().catch(() => {});
        },
        { once: true },
      );
      return video;
    });

    function resize() {
      const dpr = window.devicePixelRatio || 1;
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.max(1, Math.round(width / CELL));
      rows = Math.max(1, Math.round(height / CELL));
      side = Math.max(width / cols, height / rows);
      cells = Array.from({ length: cols * rows }, () => ({
        video: Math.floor(Math.random() * POOL),
        turns: 0,
        flip: false,
        invert: false,
      }));
    }

    function onClick(e: PointerEvent) {
      const x = Math.floor(e.clientX / side);
      const y = Math.floor(e.clientY / side);
      const i = y * cols + x;
      if (x < cols && cells[i]) cells[i] = randomLook(cells[i]);
    }

    function draw() {
      frame = requestAnimationFrame(draw);

      for (let i = 0; i < cells.length; i++) {
        const cell = cells[i];
        const video = videos[cell.video];
        if (video.readyState < 2) continue;
        // Center square of the video.
        const s = Math.min(video.videoWidth, video.videoHeight);
        const sx = (video.videoWidth - s) / 2;
        const sy = (video.videoHeight - s) / 2;

        // Move to the cell's center, then rotate / mirror around it.
        ctx.save();
        ctx.translate((i % cols) * side + side / 2, Math.floor(i / cols) * side + side / 2);
        ctx.rotate((cell.turns * Math.PI) / 2);
        if (cell.flip) ctx.scale(-1, 1);
        ctx.filter = cell.invert ? "invert(1)" : "none";
        ctx.drawImage(video, sx, sy, s, s, -side / 2, -side / 2, side, side);
        ctx.restore();
      }
    }

    resize();
    window.addEventListener("resize", resize);
    canvas.addEventListener("pointerdown", onClick);
    draw();
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("pointerdown", onClick);
      videos.forEach((video) => {
        video.pause();
        video.removeAttribute("src");
        video.load();
      });
    };
  }, []);

  return (
    <main className={styles.root}>
      <canvas ref={canvasRef} className={styles.canvas} />
    </main>
  );
}
