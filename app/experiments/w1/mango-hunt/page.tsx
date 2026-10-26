"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./page.module.css";

// One mango hidden under a pile of yellow leaves. Drag to sweep leaves away,
// click the mango when you see it. The panel changes how the sweep feels.
const DEFAULTS = {
  count: 1000, // number of leaves, enough to cover the screen several times over
  leafSize: 140, // px, largest leaf width; the smallest is half of it
  push: 0.35, // how much of the drag speed a leaf picks up
  brush: 45, // px, how close to the pointer a leaf has to be to get pushed
  friction: 0.88, // 0..1, velocity kept each frame
};
type Params = typeof DEFAULTS;

const SLIDERS: { key: keyof Params; label: string; min: number; max: number; step: number }[] = [
  { key: "push", label: "push", min: 0.05, max: 1.5, step: 0.05 },
  { key: "brush", label: "brush", min: 10, max: 150, step: 5 },
  { key: "friction", label: "friction", min: 0.5, max: 0.98, step: 0.01 },
  { key: "count", label: "leaves", min: 100, max: 2500, step: 100 },
  { key: "leafSize", label: "leaf size", min: 60, max: 240, step: 10 },
];

const MANGO_WIDTH = 90; // px
const LEAF_ASPECT = 257 / 240; // height / width of leaf.png
const MANGO_ASPECT = 116 / 240; // height / width of mango.png

type Item = { x: number; y: number; vx: number; vy: number; angle: number; spin: number; w: number; h: number };

// The alpha channel of an image, so we can ask "is this pixel see-through?".
type Mask = { width: number; height: number; alpha: Uint8ClampedArray };

function loadMask(src: string, onLoad: (image: HTMLImageElement, mask: Mask) => void) {
  const image = new Image();
  image.onload = () => {
    const off = document.createElement("canvas");
    off.width = image.width;
    off.height = image.height;
    const offCtx = off.getContext("2d")!;
    offCtx.drawImage(image, 0, 0);
    const data = offCtx.getImageData(0, 0, image.width, image.height).data;
    const alpha = new Uint8ClampedArray(image.width * image.height);
    for (let i = 0; i < alpha.length; i++) alpha[i] = data[i * 4 + 3];
    onLoad(image, { width: image.width, height: image.height, alpha });
  };
  image.src = src;
  return image;
}

// Is point (px, py) on a solid pixel of this item's image (not its transparent background)?
function solidAt(item: Item, mask: Mask | null, px: number, py: number) {
  if (!mask) return false;
  const dx = px - item.x;
  const dy = py - item.y;
  const cos = Math.cos(-item.angle);
  const sin = Math.sin(-item.angle);
  // Undo the item's position and rotation, then map to a pixel of the image.
  const u = Math.floor(((dx * cos - dy * sin) / item.w + 0.5) * mask.width);
  const v = Math.floor(((dx * sin + dy * cos) / item.h + 0.5) * mask.height);
  if (u < 0 || v < 0 || u >= mask.width || v >= mask.height) return false;
  return mask.alpha[v * mask.width + u] > 0;
}

export default function MangoHunt() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [params, setParams] = useState(DEFAULTS);
  const paramsRef = useRef(params);
  const [open, setOpen] = useState(true);
  const [foundTime, setFoundTime] = useState<number | null>(null);
  const restartRef = useRef(() => {});

  useEffect(() => {
    paramsRef.current = params;
  }, [params]);

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

    let leafMask: Mask | null = null;
    let mangoMask: Mask | null = null;
    const leafImage = loadMask("/experiments/w1/mango-hunt/leaf.png", (_, mask) => (leafMask = mask));
    const mangoImage = loadMask("/experiments/w1/mango-hunt/mango.png", (_, mask) => (mangoMask = mask));

    let leaves: Item[] = [];
    let mango: Item;
    let found = false;
    let startTime = 0;

    // New round: hide the mango somewhere, then cover the whole screen with leaves.
    function restart() {
      const { count, leafSize } = paramsRef.current;
      mango = {
        x: width * (0.15 + Math.random() * 0.7),
        y: height * (0.15 + Math.random() * 0.7),
        vx: 0, vy: 0, spin: 0,
        angle: Math.random() * Math.PI * 2,
        w: MANGO_WIDTH,
        h: MANGO_WIDTH * MANGO_ASPECT,
      };
      leaves = Array.from({ length: count }, () => {
        const w = leafSize * (0.5 + Math.random() * 0.5);
        return {
          x: Math.random() * width,
          y: Math.random() * height,
          vx: 0, vy: 0, spin: 0,
          angle: Math.random() * Math.PI * 2,
          w,
          h: w * LEAF_ASPECT,
        };
      });
      found = false;
      startTime = performance.now();
      setFoundTime(null);
    }
    restart();
    restartRef.current = restart;

    const pointer = { x: 0, y: 0, down: false };

    function onDown(event: PointerEvent) {
      pointer.down = true;
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      // Found it only if the mango is under the pointer and no leaf covers that exact pixel.
      const { x, y } = pointer;
      if (!found && solidAt(mango, mangoMask, x, y) && !leaves.some((l) => solidAt(l, leafMask, x, y))) {
        found = true;
        setFoundTime((performance.now() - startTime) / 1000);
      }
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

      const { push, brush, leafSize } = paramsRef.current;
      for (const l of leaves) {
        const distance = Math.hypot(l.x - pointer.x, l.y - pointer.y);
        if (distance > brush + l.w / 2) continue;
        // Bigger leaves are heavier: they pick up less speed.
        const weight = (leafSize / 2) / l.w;
        l.vx += dx * push * weight;
        l.vy += dy * push * weight;
        l.spin += (Math.random() - 0.5) * 0.2 * push;
      }
    }

    function drawItem(item: Item, image: HTMLImageElement) {
      ctx.save();
      ctx.translate(item.x, item.y);
      ctx.rotate(item.angle);
      ctx.drawImage(image, -item.w / 2, -item.h / 2, item.w, item.h);
      ctx.restore();
    }

    let frame = 0;
    function draw() {
      const { friction } = paramsRef.current;
      ctx.fillStyle = "black";
      ctx.fillRect(0, 0, width, height);

      // Mango first, so the leaves lie on top of it.
      drawItem(mango, mangoImage);
      if (found) {
        ctx.beginPath();
        ctx.ellipse(mango.x, mango.y, mango.w * 0.7, mango.w * 0.7, 0, 0, Math.PI * 2);
        ctx.strokeStyle = "white";
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      for (const l of leaves) {
        l.x += l.vx;
        l.y += l.vy;
        l.angle += l.spin;
        l.vx *= friction;
        l.vy *= friction;
        l.spin *= friction;
        drawItem(l, leafImage);
      }

      frame = requestAnimationFrame(draw);
    }
    draw();

    window.addEventListener("resize", resize);
    canvas.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointermove", onMove);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  // Leaf count and size only make sense on a fresh pile, so changing them starts a new round.
  useEffect(() => {
    restartRef.current();
  }, [params.count, params.leafSize]);

  return (
    <main className={styles.root}>
      <canvas ref={canvasRef} className={styles.canvas} />

      <div className={styles.panel}>
        <button className={styles.toggle} onClick={() => setOpen(!open)}>
          {open ? "▾ settings" : "▸ settings"}
        </button>
        {open && (
          <div className={styles.controls}>
            {SLIDERS.map((s) => (
              <label key={s.key} className={styles.row}>
                <span>{s.label}</span>
                <input
                  type="range"
                  min={s.min}
                  max={s.max}
                  step={s.step}
                  value={params[s.key]}
                  onChange={(e) => setParams({ ...params, [s.key]: Number(e.target.value) })}
                />
                <span className={styles.value}>{params[s.key]}</span>
              </label>
            ))}
            <div className={styles.buttons}>
              <button onClick={() => restartRef.current()}>new round</button>
              <button onClick={() => setParams(DEFAULTS)}>reset</button>
            </div>
          </div>
        )}
      </div>

      {foundTime !== null && (
        <div className={styles.found}>
          <p>Found the mango in {foundTime.toFixed(1)}s</p>
          <button onClick={() => restartRef.current()}>play again</button>
        </div>
      )}
    </main>
  );
}
