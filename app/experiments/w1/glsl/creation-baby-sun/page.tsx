"use client";

import { useEffect, useRef, useState } from "react";
import { createRenderer, type Renderer } from "./renderer";
import { MODES, VERTEX_SHADER } from "./shader";
import styles from "./page.module.css";

// The Teletubbies baby sun video run through shaders built on Danilo Guanabara's
// "Creation": the sun in the middle, spreading out into particles.
// Tabs at the bottom-left switch between four takes on the idea.
const VIDEO = "/experiments/w1/glsl/creation-baby-sun/baby-sun.mp4";

export default function CreationBabySun() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mode, setMode] = useState(2); // start on Burst
  const modeRef = useRef(mode); // the render loop reads the tab from here

  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl2");
    if (!gl) return;

    let renderer: Renderer;
    try {
      renderer = createRenderer(gl, VERTEX_SHADER, MODES.map((m) => m.fragment));
    } catch (error) {
      console.error(error);
      return;
    }

    // Hidden video, only used as a texture.
    const video = document.createElement("video");
    video.src = VIDEO;
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.play().catch(() => {});

    const resize = () => {
      renderer.resize(innerWidth, innerHeight, Math.min(devicePixelRatio || 1, 2));
    };
    let frame = 0;
    const render = (now: number) => {
      renderer.render(modeRef.current, now / 1000, video);
      frame = requestAnimationFrame(render);
    };

    addEventListener("resize", resize);
    resize();
    frame = requestAnimationFrame(render);

    return () => {
      removeEventListener("resize", resize);
      cancelAnimationFrame(frame);
      video.pause();
      video.removeAttribute("src");
      video.load();
      renderer.destroy();
    };
  }, []);

  return (
    <main className={styles.root}>
      <canvas ref={canvasRef} className={styles.canvas} />
      <nav className={styles.tabs}>
        {MODES.map((m, i) => (
          <button
            key={m.name}
            type="button"
            className={styles.tab}
            aria-pressed={i === mode}
            onClick={() => setMode(i)}
          >
            {m.name}
          </button>
        ))}
      </nav>
      <a
        className={styles.credit}
        href="http://www.pouet.net/prod.php?which=57245"
        target="_blank"
        rel="noreferrer"
      >
        Based on: Creation / Danilo Guanabara
      </a>
    </main>
  );
}
