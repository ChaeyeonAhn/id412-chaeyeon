"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./page.module.css";

// The Teletubbies baby sun video, cropped to a square and tiled in a grid of
// small cells that fills the screen. One <video> plays; every frame, its
// center square is drawn into every cell of the canvas.
const VIDEO = "/experiments/w1/baby-sun-grid/baby-sun.mp4";
const CELL = 120; // px, target size of one square

export default function BabySunGrid() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const video = videoRef.current!;
    const ctx = canvas.getContext("2d")!;
    let width = 0;
    let height = 0;
    let frame = 0;

    function resize() {
      const dpr = window.devicePixelRatio || 1;
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function draw() {
      frame = requestAnimationFrame(draw);
      if (video.readyState < 2) return;

      // Whole number of cells; stretch the side a little so the grid covers the screen.
      const cols = Math.max(1, Math.round(width / CELL));
      const rows = Math.max(1, Math.round(height / CELL));
      const side = Math.max(width / cols, height / rows);

      // Center square of the video.
      const s = Math.min(video.videoWidth, video.videoHeight);
      const sx = (video.videoWidth - s) / 2;
      const sy = (video.videoHeight - s) / 2;

      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          ctx.drawImage(video, sx, sy, s, s, x * side, y * side, side, side);
        }
      }
    }

    resize();
    window.addEventListener("resize", resize);
    video.play().catch(() => {});
    draw();
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <main className={styles.root}>
      <canvas ref={canvasRef} className={styles.canvas} />
      <video
        ref={videoRef}
        className={styles.video}
        src={VIDEO}
        muted
        loop
        playsInline
        autoPlay
        onError={() => setMissing(true)}
      />
      {missing && (
        <p className={styles.hint}>
          Put the video at public{VIDEO}
        </p>
      )}
    </main>
  );
}
