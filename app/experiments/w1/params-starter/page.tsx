"use client";

import { useEffect, useRef } from "react";
import styles from "./page.module.css";

// Placeholder for Web Assignment 1: a full-screen canvas and an empty loop.
// Put your 3–5 parameters here, then hook at least two of them to an input.
const params = {};

export default function ParamsStarter() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    let width = 0;
    let height = 0;

    function resize() {
      const dpr = window.devicePixelRatio || 1;
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();

    let frame = 0;
    function draw(now: number) {
      ctx.fillStyle = "black";
      ctx.fillRect(0, 0, width, height);

      // Draw here. `now` is milliseconds since the page loaded.

      frame = requestAnimationFrame(draw);
    }
    frame = requestAnimationFrame(draw);

    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <main className={styles.root}>
      <canvas ref={canvasRef} className={styles.canvas} />
    </main>
  );
}
