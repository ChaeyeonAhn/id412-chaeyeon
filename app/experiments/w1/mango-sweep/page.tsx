"use client";

import { useEffect, useRef } from "react";
import styles from "./page.module.css";

// 500 mangoes scattered on the screen. Drag to sweep them away:
// mangoes near the pointer get pushed in the drag direction and slide until friction stops them.
const COUNT = 500;
const BRUSH = 60; // px, how close to the pointer a mango has to be to get pushed
const PUSH = 0.8; // how much of the drag speed a mango picks up
const FRICTION = 0.92; // 0..1, velocity kept each frame
const MIN_WIDTH = 50; // px
const MAX_WIDTH = 120; // px

export default function MangoSweep() {
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

    const image = new Image();
    image.src = "/experiments/w1/mango-sweep/mango.png";
    const aspect = 145 / 300; // height / width of mango.png

    const mangoes = Array.from({ length: COUNT }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: 0,
      vy: 0,
      angle: Math.random() * Math.PI * 2,
      spin: 0,
      w: MIN_WIDTH + Math.random() * (MAX_WIDTH - MIN_WIDTH),
    }));

    const pointer = { x: 0, y: 0, down: false };

    function onDown(event: PointerEvent) {
      pointer.down = true;
      pointer.x = event.clientX;
      pointer.y = event.clientY;
    }

    function onUp() {
      pointer.down = false;
    }

    function onMove(event: PointerEvent) {
      const dx = event.clientX - pointer.x;
      const dy = event.clientY - pointer.y;
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      if (!pointer.down) return;

      for (const m of mangoes) {
        const distance = Math.hypot(m.x - pointer.x, m.y - pointer.y);
        if (distance > BRUSH + m.w / 2) continue;
        // Bigger mangoes are heavier: they pick up less speed.
        const weight = MIN_WIDTH / m.w;
        m.vx += dx * PUSH * weight;
        m.vy += dy * PUSH * weight;
        m.spin += (Math.random() - 0.5) * 0.2;
      }
    }

    let frame = 0;
    function draw() {
      ctx.fillStyle = "black";
      ctx.fillRect(0, 0, width, height);

      for (const m of mangoes) {
        m.x += m.vx;
        m.y += m.vy;
        m.angle += m.spin;
        m.vx *= FRICTION;
        m.vy *= FRICTION;
        m.spin *= FRICTION;

        const h = m.w * aspect;
        ctx.save();
        ctx.translate(m.x, m.y);
        ctx.rotate(m.angle);
        ctx.drawImage(image, -m.w / 2, -h / 2, m.w, h);
        ctx.restore();
      }

      frame = requestAnimationFrame(draw);
    }
    draw();

    window.addEventListener("resize", resize);
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointermove", onMove);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  return (
    <main className={styles.root}>
      <canvas ref={canvasRef} className={styles.canvas} />
    </main>
  );
}
