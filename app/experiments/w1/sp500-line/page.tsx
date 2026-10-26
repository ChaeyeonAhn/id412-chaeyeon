"use client";

import { useEffect, useRef } from "react";
import styles from "./page.module.css";
import { color, font, teal } from "./tokens";

// 20 years of S&P 500 daily closes as one plain line. Hover to read a day.
type Day = { date: string; close: number };

async function loadDays(): Promise<Day[]> {
  const text = await (await fetch("/experiments/w1/sp500-line/sp500.csv")).text();
  return text
    .trim()
    .split("\n")
    .slice(1)
    .map((row) => {
      const [date, close] = row.split(",");
      return { date, close: Number(close) };
    });
}

export default function Sp500Line() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    let width = 0;
    let height = 0;
    let days: Day[] = [];
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

    function draw() {
      ctx.fillStyle = color.bg;
      ctx.fillRect(0, 0, width, height);

      if (days.length > 0) {
        const margin = Math.max(24, width * 0.06);
        const top = height * 0.18;
        const bottom = height * 0.82;
        const closes = days.map((d) => d.close);
        const min = Math.min(...closes);
        const max = Math.max(...closes);
        const xOf = (i: number) => margin + (i / (days.length - 1)) * (width - margin * 2);
        const yOf = (i: number) => bottom - ((closes[i] - min) / (max - min)) * (bottom - top);

        // The line: one point per trading day.
        ctx.beginPath();
        days.forEach((_, i) => (i === 0 ? ctx.moveTo(xOf(i), yOf(i)) : ctx.lineTo(xOf(i), yOf(i))));
        ctx.strokeStyle = teal[600];
        ctx.lineWidth = 1;
        ctx.stroke();

        // Labels: mono, quiet.
        ctx.font = `12px ${font.mono}`;
        ctx.fillStyle = color.text3;
        ctx.textAlign = "left";
        ctx.fillText("S&P 500 / DAILY CLOSE", margin, height - 32);
        ctx.textAlign = "right";
        ctx.fillText(`${days[0].date} — ${days[days.length - 1].date}`, width - margin, height - 32);

        // Hover: a hairline, a dot on the line, and the day's date and close.
        if (mouseX >= margin && mouseX <= width - margin) {
          const i = Math.round(((mouseX - margin) / (width - margin * 2)) * (days.length - 1));
          const x = xOf(i);
          const y = yOf(i);
          ctx.fillStyle = color.line;
          ctx.fillRect(Math.round(x), top - 40, 1, bottom - top + 40);
          ctx.beginPath();
          ctx.arc(x, y, 3, 0, Math.PI * 2);
          ctx.fillStyle = color.text;
          ctx.fill();
          const right = x > width / 2;
          ctx.textAlign = right ? "right" : "left";
          ctx.fillStyle = color.text2;
          ctx.fillText(days[i].date, x + (right ? -8 : 8), top - 28);
          ctx.fillText(days[i].close.toLocaleString("en-US"), x + (right ? -8 : 8), top - 12);
        }
      }

      frame = requestAnimationFrame(draw);
    }
    draw();

    loadDays().then((loaded) => (days = loaded));

    function onMove(event: PointerEvent) {
      mouseX = event.clientX;
    }
    function onLeave() {
      mouseX = -1;
    }

    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onMove);
    document.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <main className={`${styles.root} ${styles.grain}`}>
      <canvas ref={canvasRef} className={styles.canvas} />
    </main>
  );
}
