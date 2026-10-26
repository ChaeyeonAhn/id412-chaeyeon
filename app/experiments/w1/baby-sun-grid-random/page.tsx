"use client";

import { useEffect, useRef } from "react";
import styles from "./page.module.css";

// Like ../baby-sun-grid, but out of sync: a small pool of hidden videos, each
// started at a random time, and every cell draws a randomly picked one.
// (One <video> per cell would be ~100 decoders; a pool looks the same.)
const VIDEO = "/experiments/w1/baby-sun-grid/baby-sun.mp4";
const CELL = 120; // px, target size of one square
const POOL = 12; // how many differently-timed copies of the video play

export default function BabySunGridRandom() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    let width = 0;
    let height = 0;
    let cols = 0;
    let rows = 0;
    let picks: number[] = []; // which pool video each cell shows
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
      picks = Array.from({ length: cols * rows }, () =>
        Math.floor(Math.random() * POOL),
      );
    }

    function draw() {
      frame = requestAnimationFrame(draw);
      const side = Math.max(width / cols, height / rows);

      for (let i = 0; i < picks.length; i++) {
        const video = videos[picks[i]];
        if (video.readyState < 2) continue;
        // Center square of the video.
        const s = Math.min(video.videoWidth, video.videoHeight);
        const sx = (video.videoWidth - s) / 2;
        const sy = (video.videoHeight - s) / 2;
        const x = (i % cols) * side;
        const y = Math.floor(i / cols) * side;
        ctx.drawImage(video, sx, sy, s, s, x, y, side, side);
      }
    }

    resize();
    window.addEventListener("resize", resize);
    draw();
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
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
