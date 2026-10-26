"use client";

import { useEffect, useRef } from "react";
import styles from "./page.module.css";

// Kaonashi following the mouse, with a trail of fading copies behind him.
// Same chained easing as ../mouse-circles: the first one chases the cursor,
// every other one chases the one in front of it.
const COUNT = 12;
const EASE = 0.12; // 0..1, how far each copy moves toward its target each frame
const HEIGHT = 220; // px, height of the front Kaonashi
const IMAGE = "/experiments/w1/kaonashi-follow/kaonashi.png";

export default function KaonashiFollow() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const image = new Image();
    image.src = IMAGE;
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
    const ghosts = Array.from({ length: COUNT }, () => ({ x: mouse.x, y: mouse.y }));

    function onMove(event: PointerEvent) {
      mouse.x = event.clientX;
      mouse.y = event.clientY;
    }

    let frame = 0;
    function draw() {
      ghosts.forEach((ghost, i) => {
        const target = i === 0 ? mouse : ghosts[i - 1];
        ghost.x += (target.x - ghost.x) * EASE;
        ghost.y += (target.y - ghost.y) * EASE;
      });

      ctx.clearRect(0, 0, width, height);
      if (image.complete && image.naturalWidth > 0) {
        const w = (HEIGHT * image.naturalWidth) / image.naturalHeight;
        // Tail first so the front Kaonashi is drawn on top.
        for (let i = COUNT - 1; i >= 0; i--) {
          // The cursor sits on the mask, a little below the top of the image.
          ctx.globalAlpha = i === 0 ? 1 : 0.35 * (1 - i / COUNT);
          ctx.drawImage(image, ghosts[i].x - w / 2, ghosts[i].y - HEIGHT * 0.12, w, HEIGHT);
        }
        ctx.globalAlpha = 1;
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
