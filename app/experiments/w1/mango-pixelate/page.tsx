"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./page.module.css";

// A mango photo, stretched to the browser width, then pixelated into a grid of blocks.
// - The slider at the bottom right sets the block size.
// - Click a block to give it a random color. Painted spots survive a block size change.
// - Hover: blocks near the mouse turn into soft, rounded jelly that wobbles as the mouse moves.
const MIN_BLOCK = 2; // px
const MAX_BLOCK = 80; // px
const JELLY_RADIUS = 90; // px, how far from the mouse blocks turn to jelly
const WOBBLE = 0.02; // how much mouse speed squashes and stretches a block
const STIFFNESS = 0.15; // how hard a squashed block springs back to its shape
const DAMPING = 0.8; // 0..1, wobble speed kept each frame

// Spring state of one block that is (or was just) jelly.
type Jelly = {
  sx: number; // width scale, 1 = normal
  sy: number; // height scale
  vx: number; // speed of sx
  vy: number; // speed of sy
  round: number; // 0 = sharp square, 1 = full jelly
};

function randomColor() {
  const r = Math.floor(Math.random() * 256);
  const g = Math.floor(Math.random() * 256);
  const b = Math.floor(Math.random() * 256);
  return `rgb(${r}, ${g}, ${b})`;
}

export default function MangoPixelate() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [block, setBlock] = useState(16); // px, size of one block (shown on the slider)
  const blockRef = useRef(block); // the same value, for the animation loop

  // Load the photo once.
  useEffect(() => {
    const img = new Image();
    img.onload = () => setImage(img);
    img.src = "/experiments/w1/mango-pixelate/mango.jpg";
  }, []);

  useEffect(() => {
    if (!image) return;
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;

    // The grid only changes on a click or a new block size, so it is drawn once into its
    // own canvas and copied to the screen every frame.
    const grid = document.createElement("canvas");
    const gridCtx = grid.getContext("2d", { willReadFrequently: true })!;

    let width = 0;
    let height = 0;
    let dpr = 1;

    // One color per grid cell, or null where the cell is off the photo.
    let size = 0; // block size the grid was built with
    let cols = 0;
    let rows = 0;
    let cells: (string | null)[] = [];

    // Painted spots in screen px. Kept apart from the grid so they survive a new block size.
    const paints: { x: number; y: number; size: number; color: string }[] = [];

    // Blocks that are jelly right now, by cell index.
    let jellies = new Map<number, Jelly>();
    const mouse = { x: -9999, y: -9999 };

    // Cell edges rounded to whole device pixels, so neighbors meet without a thin seam.
    function cellRect(col: number, row: number) {
      const x0 = Math.round(col * size * dpr) / dpr;
      const y0 = Math.round(row * size * dpr) / dpr;
      const x1 = Math.round((col + 1) * size * dpr) / dpr;
      const y1 = Math.round((row + 1) * size * dpr) / dpr;
      return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
    }

    function buildGrid() {
      size = blockRef.current;
      cols = Math.ceil(width / size);
      rows = Math.ceil(height / size);
      jellies = new Map();

      // 1. Draw the photo as wide as the browser, centered vertically, and read its pixels back.
      const imageHeight = width * (image!.height / image!.width);
      const top = (height - imageHeight) / 2;
      gridCtx.clearRect(0, 0, width, height);
      gridCtx.drawImage(image!, 0, top, width, imageHeight);
      const pixels = gridCtx.getImageData(0, 0, grid.width, grid.height).data;

      // 2. One block per cell that covers the photo, in the color at the cell's center.
      cells = [];
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const y = row * size;
          if (y + size <= top || y >= top + imageHeight) {
            cells.push(null);
            continue;
          }
          const px = Math.min(Math.floor((col * size + size / 2) * dpr), grid.width - 1);
          const py = Math.min(Math.floor((y + size / 2) * dpr), grid.height - 1);
          const i = (py * grid.width + px) * 4;
          cells.push(`rgb(${pixels[i]}, ${pixels[i + 1]}, ${pixels[i + 2]})`);
        }
      }

      // 3. Painted spots win: every cell they overlap takes their color (later paints on top).
      for (const p of paints) {
        const col0 = Math.floor(p.x / size);
        const col1 = Math.floor((p.x + p.size - 1) / size);
        const row0 = Math.floor(p.y / size);
        const row1 = Math.floor((p.y + p.size - 1) / size);
        for (let row = row0; row <= row1 && row < rows; row++) {
          for (let col = col0; col <= col1 && col < cols; col++) {
            if (cells[row * cols + col]) cells[row * cols + col] = p.color;
          }
        }
      }

      // 4. Draw the blocks.
      gridCtx.clearRect(0, 0, width, height);
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const color = cells[row * cols + col];
          if (!color) continue;
          const r = cellRect(col, row);
          gridCtx.fillStyle = color;
          gridCtx.fillRect(r.x, r.y, r.w, r.h);
        }
      }
    }

    function resize() {
      dpr = window.devicePixelRatio || 1;
      width = window.innerWidth;
      height = window.innerHeight;
      for (const c of [canvas, grid]) {
        c.width = Math.round(width * dpr);
        c.height = Math.round(height * dpr);
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      gridCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildGrid();
    }

    // How jelly a block is: 1 right under the mouse, 0 at JELLY_RADIUS and beyond.
    function closeness(col: number, row: number) {
      const cx = col * size + size / 2;
      const cy = row * size + size / 2;
      return Math.max(0, 1 - Math.hypot(cx - mouse.x, cy - mouse.y) / JELLY_RADIUS);
    }

    // Call fn for every cell index within JELLY_RADIUS of the mouse.
    function forCellsNearMouse(fn: (i: number, k: number) => void) {
      const col0 = Math.max(0, Math.floor((mouse.x - JELLY_RADIUS) / size));
      const col1 = Math.min(cols - 1, Math.floor((mouse.x + JELLY_RADIUS) / size));
      const row0 = Math.max(0, Math.floor((mouse.y - JELLY_RADIUS) / size));
      const row1 = Math.min(rows - 1, Math.floor((mouse.y + JELLY_RADIUS) / size));
      for (let row = row0; row <= row1; row++) {
        for (let col = col0; col <= col1; col++) {
          const i = row * cols + col;
          const k = closeness(col, row);
          if (cells[i] && k > 0) fn(i, k);
        }
      }
    }

    function jellyAt(i: number) {
      let j = jellies.get(i);
      if (!j) {
        j = { sx: 1, sy: 1, vx: 0, vy: 0, round: 0 };
        jellies.set(i, j);
      }
      return j;
    }

    let frame = 0;
    function draw() {
      if (blockRef.current !== size) buildGrid();

      ctx.fillStyle = "black";
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(grid, 0, 0, width, height);

      // Blocks under the mouse become jelly.
      forCellsNearMouse((i) => jellyAt(i));

      // Spring every jelly block back toward its square shape; drop the ones that are back.
      for (const [i, j] of jellies) {
        const col = i % cols;
        const row = Math.floor(i / cols);
        j.vx = (j.vx + (1 - j.sx) * STIFFNESS) * DAMPING;
        j.vy = (j.vy + (1 - j.sy) * STIFFNESS) * DAMPING;
        // Keep the squash within limits, so a block never flips inside out.
        j.sx = Math.min(Math.max(j.sx + j.vx, 0.6), 1.4);
        j.sy = Math.min(Math.max(j.sy + j.vy, 0.6), 1.4);
        j.round += (closeness(col, row) - j.round) * 0.15;
        const still = Math.abs(j.sx - 1) + Math.abs(j.sy - 1) + Math.abs(j.vx) + Math.abs(j.vy);
        if (j.round < 0.01 && still < 0.005) jellies.delete(i);
      }

      // Cover the square blocks under the jellies with black first, then draw the jellies,
      // so a wobbling block can bulge over its neighbor without being cut off.
      ctx.fillStyle = "black";
      for (const i of jellies.keys()) {
        const r = cellRect(i % cols, Math.floor(i / cols));
        ctx.fillRect(r.x, r.y, r.w, r.h);
      }
      for (const [i, j] of jellies) {
        const color = cells[i];
        if (!color) continue;
        const cx = (i % cols) * size + size / 2;
        const cy = Math.floor(i / cols) * size + size / 2;
        const shrink = 1 - 0.15 * j.round; // jelly blocks pull in a little, leaving soft gaps
        const w = size * shrink * j.sx;
        const h = size * shrink * j.sy;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.roundRect(cx - w / 2, cy - h / 2, w, h, Math.min(w, h) * 0.45 * j.round);
        ctx.fill();
      }

      frame = requestAnimationFrame(draw);
    }

    function onMove(event: PointerEvent) {
      const dx = event.clientX - mouse.x;
      const dy = event.clientY - mouse.y;
      const first = mouse.x === -9999;
      mouse.x = event.clientX;
      mouse.y = event.clientY;
      if (first) return;
      // Moving sideways stretches nearby blocks wide and flat, moving up/down tall and thin.
      forCellsNearMouse((i, k) => {
        const j = jellyAt(i);
        const push = Math.min(Math.max((Math.abs(dx) - Math.abs(dy)) * WOBBLE, -0.2), 0.2) * k;
        j.vx += push;
        j.vy -= push;
      });
    }

    function onLeave() {
      mouse.x = -9999;
      mouse.y = -9999;
    }

    // Paint the block under the pointer, with a little bounce.
    function onClick(event: MouseEvent) {
      const col = Math.floor(event.clientX / size);
      const row = Math.floor(event.clientY / size);
      const i = row * cols + col;
      if (!cells[i]) return;
      const color = randomColor();
      cells[i] = color;
      paints.push({ x: col * size, y: row * size, size, color });
      const r = cellRect(col, row);
      gridCtx.fillStyle = color;
      gridCtx.fillRect(r.x, r.y, r.w, r.h);
      jellyAt(i).vx += 0.15;
      jellyAt(i).vy -= 0.15;
    }

    resize();
    draw();
    window.addEventListener("resize", resize);
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerleave", onLeave);
    canvas.addEventListener("click", onClick);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerleave", onLeave);
      canvas.removeEventListener("click", onClick);
    };
  }, [image]);

  return (
    <main className={styles.root}>
      <canvas ref={canvasRef} className={styles.canvas} />
      <label className={styles.control}>
        <span>pixel {block}px</span>
        <input
          type="range"
          min={MIN_BLOCK}
          max={MAX_BLOCK}
          value={block}
          onChange={(event) => {
            const value = Number(event.target.value);
            blockRef.current = value;
            setBlock(value);
          }}
        />
      </label>
    </main>
  );
}
