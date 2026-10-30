"use client";

import { useEffect, useRef } from "react";
import { useCanvasLoop } from "./canvasLoop";
import { toCss, type Swatch } from "./palette";

// 1. Circles keep falling from the top and pile up at the bottom. Each new circle
//    picks its colour by the current shares: a 40% colour is picked 40% of the time,
//    so the pile slowly turns into the newest palette. The oldest circles shrink away
//    to make room, so the pile never overflows.
const SPAWN_PER_SECOND = 8;
const GRAVITY = 1400; // px per second²
const FILL = 0.55; // how much of the panel the pile may cover before old circles go
const SHRINK_TIME = 0.6; // seconds a leaving circle takes to disappear

type Ball = {
  x: number;
  y: number;
  px: number; // position last frame: speed is (x - px, y - py)
  py: number;
  r: number;
  size: number; // full radius; r shrinks from this when leaving
  color: string;
  leaving: number; // seconds since it started leaving, -1 if staying
};

// Pick a swatch at random, weighted by share.
function pick(swatches: Swatch[]) {
  const total = swatches.reduce((sum, s) => sum + s.share, 0);
  let roll = Math.random() * total;
  for (const s of swatches) {
    roll -= s.share;
    if (roll <= 0) return s;
  }
  return swatches[swatches.length - 1];
}

export function Circles({ swatches }: { swatches: Swatch[] }) {
  const target = useRef(swatches);
  useEffect(() => {
    target.current = swatches;
  }, [swatches]);

  const balls = useRef<Ball[]>([]);
  const toSpawn = useRef(0);
  const last = useRef(0);

  const canvasRef = useCanvasLoop((ctx, width, height, now) => {
    const dt = Math.min((now - (last.current || now)) / 1000, 1 / 30);
    last.current = now;
    const list = balls.current;
    const size = Math.min(width, height) / 30;

    // New circles enter at the top.
    if (target.current.length > 0) toSpawn.current += dt * SPAWN_PER_SECOND;
    while (toSpawn.current >= 1) {
      toSpawn.current -= 1;
      const r = size * (0.7 + Math.random() * 0.6);
      const x = r + Math.random() * (width - r * 2);
      list.push({ x, y: -r, px: x, py: -r, r, size: r, color: toCss(pick(target.current)), leaving: -1 });
    }

    // Too many: the oldest staying circle starts to leave.
    const max = Math.floor((width * height * FILL) / (Math.PI * size * size));
    const staying = list.filter((b) => b.leaving < 0).length;
    if (staying > max) list.find((b) => b.leaving < 0)!.leaving = 0;

    // Move: keep last frame's speed (a little damped) and add gravity.
    for (const b of list) {
      const vx = (b.x - b.px) * 0.99;
      const vy = (b.y - b.py) * 0.99;
      b.px = b.x;
      b.py = b.y;
      b.x += vx;
      b.y += vy + GRAVITY * dt * dt;
      if (b.leaving >= 0) {
        b.leaving += dt;
        b.r = b.size * Math.max(0, 1 - b.leaving / SHRINK_TIME);
      }
    }

    // Push overlapping circles apart and keep them inside the panel. A few rounds settle the pile.
    for (let round = 0; round < 4; round++) {
      for (let i = 0; i < list.length; i++) {
        const a = list[i];
        for (let j = i + 1; j < list.length; j++) {
          const b = list[j];
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const dist = Math.hypot(dx, dy);
          const overlap = a.r + b.r - dist;
          if (overlap > 0 && dist > 0) {
            const push = overlap / dist / 2;
            a.x -= dx * push;
            a.y -= dy * push;
            b.x += dx * push;
            b.y += dy * push;
          }
        }
        a.x = Math.min(Math.max(a.x, a.r), width - a.r);
        a.y = Math.min(a.y, height - a.r);
      }
    }

    balls.current = list.filter((b) => b.leaving < SHRINK_TIME);

    ctx.fillStyle = "#0b0b0b";
    ctx.fillRect(0, 0, width, height);
    for (const b of balls.current) {
      ctx.fillStyle = b.color;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      ctx.fill();
    }
  });

  return <canvas ref={canvasRef} />;
}
