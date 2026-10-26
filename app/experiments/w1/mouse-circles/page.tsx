"use client";

import { useEffect, useRef } from "react";
import styles from "./page.module.css";

// A chain of circles following the mouse. The first one eases toward the cursor,
// every other one eases toward the circle in front of it.
const COUNT = 40;
const EASE = 0.25; // 0..1, how far a circle moves toward its target each frame
const MAX_RADIUS = 28; // px, the head of the chain; the tail shrinks to 0

export default function MouseCircles() {
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

    const mouse = { x: width / 2, y: height / 2 };
    const circles = Array.from({ length: COUNT }, () => ({ x: mouse.x, y: mouse.y }));

    function onMove(event: PointerEvent) {
      mouse.x = event.clientX;
      mouse.y = event.clientY;
    }

    let frame = 0;
    function draw() {
      // Move: each circle chases the one before it (the first chases the mouse).
      circles.forEach((circle, i) => {
        const target = i === 0 ? mouse : circles[i - 1];
        circle.x += (target.x - circle.x) * EASE;
        circle.y += (target.y - circle.y) * EASE;
      });

      // Draw tail first so the head ends up on top.
      ctx.fillStyle = "black";
      ctx.fillRect(0, 0, width, height);
      for (let i = COUNT - 1; i >= 0; i--) {
        const t = 1 - i / COUNT; // 1 at the head, near 0 at the tail
        ctx.beginPath();
        ctx.arc(circles[i].x, circles[i].y, MAX_RADIUS * t, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255, 255, 255, ${t})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      frame = requestAnimationFrame(draw);
    }
    draw();

    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onMove);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  return (
    <main className={styles.root}>
      <canvas ref={canvasRef} className={styles.canvas} />
    </main>
  );
}
