"use client";

import { useEffect, useRef } from "react";
import styles from "./page.module.css";

// A mango photo, stretched to the browser width, then pixelated:
// the canvas is cut into BLOCK × BLOCK squares and each square is filled with one color.
const BLOCK = 16; // px, size of one pixel block

export default function MangoPixelate() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d", { willReadFrequently: true })!;

    const image = new Image();
    image.src = "/experiments/w1/mango-pixelate/mango.jpg";

    function draw() {
      if (!image.complete) return;
      const dpr = window.devicePixelRatio || 1;
      const width = window.innerWidth;
      const height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // 1. Draw the photo as wide as the browser, centered vertically.
      const imageHeight = width * (image.height / image.width);
      const top = (height - imageHeight) / 2;
      ctx.fillStyle = "black";
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(image, 0, top, width, imageHeight);

      // 2. Read every pixel back (in device pixels: 4 numbers r, g, b, a per pixel).
      const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

      // 3. Paint over it, one square per block, with the color at the block's center.
      for (let y = 0; y < height; y += BLOCK) {
        for (let x = 0; x < width; x += BLOCK) {
          const px = Math.floor((x + BLOCK / 2) * dpr);
          const py = Math.floor((y + BLOCK / 2) * dpr);
          if (px >= canvas.width || py >= canvas.height) continue;
          const i = (py * canvas.width + px) * 4;
          ctx.fillStyle = `rgb(${pixels[i]}, ${pixels[i + 1]}, ${pixels[i + 2]})`;
          ctx.fillRect(x, y, BLOCK, BLOCK);
        }
      }
    }

    image.onload = draw;
    window.addEventListener("resize", draw);
    return () => window.removeEventListener("resize", draw);
  }, []);

  return (
    <main className={styles.root}>
      <canvas ref={canvasRef} className={styles.canvas} />
    </main>
  );
}
