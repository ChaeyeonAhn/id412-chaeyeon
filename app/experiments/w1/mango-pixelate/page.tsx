"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./page.module.css";

// A mango photo, stretched to the browser width, then pixelated:
// the canvas is cut into block × block squares and each square is filled with one color.
// The slider at the bottom right sets the block size.
const MIN_BLOCK = 2; // px
const MAX_BLOCK = 80; // px

export default function MangoPixelate() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [block, setBlock] = useState(16); // px, size of one pixel block

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

    function draw() {
      const dpr = window.devicePixelRatio || 1;
      const width = window.innerWidth;
      const height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // 1. Draw the photo as wide as the browser, centered vertically.
      const imageHeight = width * (image!.height / image!.width);
      const top = (height - imageHeight) / 2;
      ctx.fillStyle = "black";
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(image!, 0, top, width, imageHeight);

      // 2. Read every pixel back (in device pixels: 4 numbers r, g, b, a per pixel).
      const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

      // 3. Paint over it, one square per block, with the color at the block's center.
      for (let y = 0; y < height; y += block) {
        for (let x = 0; x < width; x += block) {
          const px = Math.floor((x + block / 2) * dpr);
          const py = Math.floor((y + block / 2) * dpr);
          if (px >= canvas.width || py >= canvas.height) continue;
          const i = (py * canvas.width + px) * 4;
          ctx.fillStyle = `rgb(${pixels[i]}, ${pixels[i + 1]}, ${pixels[i + 2]})`;
          ctx.fillRect(x, y, block, block);
        }
      }
    }

    draw();
    window.addEventListener("resize", draw);
    return () => window.removeEventListener("resize", draw);
  }, [image, block]);

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
          onChange={(event) => setBlock(Number(event.target.value))}
        />
      </label>
    </main>
  );
}
