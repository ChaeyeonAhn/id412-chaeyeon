"use client";

import { useEffect, useRef } from "react";
import styles from "./page.module.css";
import { color, font, teal } from "./tokens";

// 20 years of S&P 500 daily closes, drawn as a bundle of threads that follow the price.
// Calm days keep the threads tight; volatile days make them spread and fray.
const THREADS = 28;
const SPACING = 2.2; // px between threads on a calm day
const FRAY = 90; // px, how far threads wander on the most volatile day
const SPEED = 12; // trading days revealed per frame
const VOL_EASE = 0.05; // 0..1, smoothing of daily volatility (lower = smoother)

type Day = { date: string; close: number; change: number; vol: number };

async function loadDays(): Promise<Day[]> {
  const text = await (await fetch("/experiments/w1/sp500-threads/sp500.csv")).text();
  const rows = text.trim().split("\n").slice(1);
  const days: Day[] = [];
  let vol = 0;
  rows.forEach((row, i) => {
    const [date, close] = row.split(",");
    const c = Number(close);
    const change = i === 0 ? 0 : c / days[i - 1].close - 1;
    vol += (Math.abs(change) - vol) * VOL_EASE; // running average of |daily change|
    days.push({ date, close: c, change, vol });
  });
  const maxVol = Math.max(...days.map((d) => d.vol));
  days.forEach((d) => (d.vol /= maxVol)); // 0..1
  return days;
}

// "#rrggbb" a → b at t, as an rgb() string. One two-colour gradient across the threads.
function mix(a: string, b: string, t: number) {
  const pa = parseInt(a.slice(1), 16);
  const pb = parseInt(b.slice(1), 16);
  const ch = (shift: number) =>
    Math.round(((pa >> shift) & 255) * (1 - t) + ((pb >> shift) & 255) * t);
  return `rgb(${ch(16)}, ${ch(8)}, ${ch(0)})`;
}

export default function Sp500Threads() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    let width = 0;
    let height = 0;
    let days: Day[] = [];
    let head = 0; // how many days are revealed so far
    let mouseX = -1;
    let frame = 0;

    function resize() {
      const dpr = window.devicePixelRatio || 1;
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();

    function draw(time: number) {
      ctx.fillStyle = color.bg;
      ctx.fillRect(0, 0, width, height);
      if (days.length === 0) {
        frame = requestAnimationFrame(draw);
        return;
      }

      head = Math.min(days.length, head + SPEED);
      const margin = Math.max(24, width * 0.06);
      const top = height * 0.18;
      const bottom = height * 0.78;
      const logs = days.map((d) => Math.log(d.close));
      const minLog = Math.min(...logs);
      const maxLog = Math.max(...logs);
      const xOf = (i: number) => margin + (i / (days.length - 1)) * (width - margin * 2);
      const yOf = (i: number) => bottom - ((logs[i] - minLog) / (maxLog - minLog)) * (bottom - top);

      // About one point every 2 px. Each point takes the most volatile day in its step,
      // so short crashes are not skipped.
      const step = Math.max(1, Math.floor(days.length / ((width - margin * 2) / 2)));
      const t = time / 1000;

      for (let k = 0; k < THREADS; k++) {
        const offset = k - (THREADS - 1) / 2; // -n..n, 0 is the middle thread
        ctx.beginPath();
        for (let i = 0; i < head; i += step) {
          let vol = 0;
          for (let j = i; j < Math.min(i + step, head); j++) vol = Math.max(vol, days[j].vol);
          const wander = Math.sin(i * 0.013 + k * 2.1 + t * 0.6) + Math.sin(i * 0.031 - k * 1.3);
          const y = yOf(i) + offset * SPACING * (1 + vol * 3) + wander * vol * vol * FRAY * 0.5;
          if (i === 0) ctx.moveTo(xOf(i), y);
          else ctx.lineTo(xOf(i), y);
        }
        ctx.strokeStyle = mix(teal[900], teal[300], k / (THREADS - 1));
        ctx.globalAlpha = 0.55;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
      ctx.globalAlpha = 1;

      // Labels: mono, uppercase, quiet.
      ctx.font = `12px ${font.mono}`;
      ctx.textBaseline = "alphabetic";
      ctx.fillStyle = color.text3;
      const last = days[head - 1];
      ctx.textAlign = "left";
      ctx.fillText("S&P 500 / DAILY CLOSE / LOG SCALE", margin, height - 32);
      ctx.textAlign = "right";
      ctx.fillText(`${days[0].date.slice(0, 4)} — ${last.date}`, width - margin, height - 32);

      // Hover: a hairline and a readout for the day under the mouse.
      if (mouseX >= margin && mouseX <= width - margin) {
        const i = Math.round(((mouseX - margin) / (width - margin * 2)) * (days.length - 1));
        if (i < head) {
          const d = days[i];
          const x = xOf(i);
          ctx.fillStyle = color.text;
          ctx.fillRect(Math.round(x), top - 40, 1, bottom - top + 80);
          const sign = d.change >= 0 ? "+" : "";
          const lines = [
            d.date,
            d.close.toLocaleString("en-US", { maximumFractionDigits: 2 }),
            `${sign}${(d.change * 100).toFixed(2)}%`,
            `VOL ${(d.vol * 100).toFixed(0)}`,
          ];
          const right = x > width / 2;
          ctx.textAlign = right ? "right" : "left";
          ctx.fillStyle = color.text2;
          lines.forEach((line, n) => ctx.fillText(line, x + (right ? -8 : 8), top - 28 + n * 16));
        }
      }

      frame = requestAnimationFrame(draw);
    }
    frame = requestAnimationFrame(draw);

    loadDays().then((loaded) => (days = loaded));

    function onMove(event: PointerEvent) {
      mouseX = event.clientX;
    }
    function onLeave() {
      mouseX = -1;
    }
    function onClick() {
      head = 0; // replay
    }

    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onMove);
    document.addEventListener("pointerleave", onLeave);
    canvas.addEventListener("click", onClick);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
      canvas.removeEventListener("click", onClick);
    };
  }, []);

  return (
    <main className={`${styles.root} ${styles.grain}`}>
      <canvas ref={canvasRef} className={styles.canvas} />
    </main>
  );
}
