"use client";

import { useEffect, useRef } from "react";
import styles from "./page.module.css";

// Starter for Web Assignment 1: a canvas loop where every visual choice is a parameter.
// Replace draw() with your own idea; keep the params → input wiring.
const params = {
  count: 12, // how many things          ← mouse X
  size: 40, // px, how big they are       ← mouse Y
  speed: 1, // how fast time runs         ← scroll wheel
  hue: 200, // 0..360, color              ← arrow keys ←/→
};

export default function ParamsStarter() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hudRef = useRef<HTMLPreElement>(null);

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

    // Inputs only write into params. All drawing happens in the loop.
    function onMove(event: PointerEvent) {
      params.count = Math.round(3 + (event.clientX / width) * 30);
      params.size = 10 + (event.clientY / height) * 90;
    }
    function onWheel(event: WheelEvent) {
      params.speed = Math.min(5, Math.max(0, params.speed - event.deltaY * 0.001));
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "ArrowLeft") params.hue = (params.hue + 350) % 360;
      if (event.key === "ArrowRight") params.hue = (params.hue + 10) % 360;
    }

    let time = 0;
    let last = performance.now();
    let frame = 0;
    function draw(now: number) {
      time += ((now - last) / 1000) * params.speed;
      last = now;

      ctx.fillStyle = "black";
      ctx.fillRect(0, 0, width, height);

      // Placeholder visual: a ring of circles that breathes over time.
      const cx = width / 2;
      const cy = height / 2;
      const ring = Math.min(width, height) * 0.3;
      for (let i = 0; i < params.count; i++) {
        const angle = (i / params.count) * Math.PI * 2 + time;
        const r = params.size * (0.6 + 0.4 * Math.sin(time * 2 + i));
        ctx.beginPath();
        ctx.arc(cx + Math.cos(angle) * ring, cy + Math.sin(angle) * ring, r, 0, Math.PI * 2);
        ctx.strokeStyle = `hsl(${params.hue + i * 4}, 80%, 65%)`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      hudRef.current!.textContent = Object.entries(params)
        .map(([key, value]) => `${key.padEnd(6)} ${value.toFixed(2)}`)
        .join("\n");

      frame = requestAnimationFrame(draw);
    }
    frame = requestAnimationFrame(draw);

    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("wheel", onWheel);
    window.addEventListener("keydown", onKey);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <main className={styles.root}>
      <canvas ref={canvasRef} className={styles.canvas} />
      <pre ref={hudRef} className={styles.hud} />
    </main>
  );
}
