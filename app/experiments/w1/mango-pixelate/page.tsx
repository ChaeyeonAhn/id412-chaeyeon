"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./page.module.css";

// A mango photo, covering the whole screen, pixelated into a grid of blocks.
// - The ▲ ▼ buttons at the bottom right change the block size by 1 px.
// - Click a block to give it a random color. Painted spots survive a block size change.
const MIN_BLOCK = 2; // px
const MAX_BLOCK = 80; // px

function randomColor() {
  const r = Math.floor(Math.random() * 256);
  const g = Math.floor(Math.random() * 256);
  const b = Math.floor(Math.random() * 256);
  return `rgb(${r}, ${g}, ${b})`;
}

export default function MangoPixelate() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [block, setBlock] = useState(16); // px, size of one block
  // Painted spots in screen px. Kept apart from the grid so they survive a new block size.
  const paintsRef = useRef<{ x: number; y: number; size: number; color: string }[]>([]);

  // Load the photo once.
  useEffect(() => {
    const img = new Image();
    img.onload = () => setImage(img);
    img.src = "/experiments/w1/mango-pixelate/mango.jpg";
  }, []);

  // Redraw when the photo is ready, the block size changes, or the window resizes.
  useEffect(() => {
    if (!image) return;
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
    const paints = paintsRef.current;
    let dpr = 1;
    let cols = 0;
    let cells: string[] = []; // one color per cell

    // Cell edges rounded to whole device pixels, so neighbors meet without a thin seam.
    function fillCell(col: number, row: number, color: string) {
      const x0 = Math.round(col * block * dpr) / dpr;
      const y0 = Math.round(row * block * dpr) / dpr;
      const x1 = Math.round((col + 1) * block * dpr) / dpr;
      const y1 = Math.round((row + 1) * block * dpr) / dpr;
      ctx.fillStyle = color;
      ctx.fillRect(x0, y0, x1 - x0, y1 - y0);
    }

    function draw() {
      dpr = window.devicePixelRatio || 1;
      const width = window.innerWidth;
      const height = window.innerHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.ceil(width / block);
      const rows = Math.ceil(height / block);

      // 1. Draw the photo so it covers the whole screen (the bigger of the two scales,
      //    centered, the overflow cropped), and read its pixels back.
      const scale = Math.max(width / image!.width, height / image!.height);
      const imageWidth = image!.width * scale;
      const imageHeight = image!.height * scale;
      ctx.drawImage(
        image!,
        (width - imageWidth) / 2,
        (height - imageHeight) / 2,
        imageWidth,
        imageHeight,
      );
      const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

      // 2. One block per cell, in the color at the cell's center.
      cells = [];
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const px = Math.min(Math.floor((col * block + block / 2) * dpr), canvas.width - 1);
          const py = Math.min(Math.floor((row * block + block / 2) * dpr), canvas.height - 1);
          const i = (py * canvas.width + px) * 4;
          cells.push(`rgb(${pixels[i]}, ${pixels[i + 1]}, ${pixels[i + 2]})`);
        }
      }

      // 3. Painted spots win: every cell they overlap takes their color (later paints on top).
      for (const p of paints) {
        const col0 = Math.floor(p.x / block);
        const col1 = Math.floor((p.x + p.size - 1) / block);
        const row0 = Math.floor(p.y / block);
        const row1 = Math.floor((p.y + p.size - 1) / block);
        for (let row = row0; row <= row1 && row < rows; row++) {
          for (let col = col0; col <= col1 && col < cols; col++) {
            cells[row * cols + col] = p.color;
          }
        }
      }

      // 4. Paint over the photo, one square per block.
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          fillCell(col, row, cells[row * cols + col]);
        }
      }
    }

    // Paint the block under the pointer.
    function onClick(event: MouseEvent) {
      const col = Math.floor(event.clientX / block);
      const row = Math.floor(event.clientY / block);
      if (!cells[row * cols + col]) return;
      const color = randomColor();
      cells[row * cols + col] = color;
      paints.push({ x: col * block, y: row * block, size: block, color });
      fillCell(col, row, color);
    }

    draw();
    window.addEventListener("resize", draw);
    canvas.addEventListener("click", onClick);
    return () => {
      window.removeEventListener("resize", draw);
      canvas.removeEventListener("click", onClick);
    };
  }, [image, block]);

  return (
    <main className={styles.root}>
      <canvas ref={canvasRef} className={styles.canvas} />
      <div className={styles.control}>
        <span>grid {block}px</span>
        <div className={styles.arrows}>
          <button
            aria-label="Bigger grid"
            disabled={block >= MAX_BLOCK}
            onClick={() => setBlock(Math.min(block + 1, MAX_BLOCK))}
          >
            ▲
          </button>
          <button
            aria-label="Smaller grid"
            disabled={block <= MIN_BLOCK}
            onClick={() => setBlock(Math.max(block - 1, MIN_BLOCK))}
          >
            ▼
          </button>
        </div>
      </div>
    </main>
  );
}
