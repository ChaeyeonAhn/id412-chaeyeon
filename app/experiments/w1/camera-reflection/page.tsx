"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./page.module.css";

// Placeholder: the webcam drawn onto a full-screen canvas, mirrored like a mirror.
// The reflection effect itself is still to be decided; it goes in draw().
const params = {};

export default function CameraReflection() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [started, setStarted] = useState(false);
  const [status, setStatus] = useState("");

  async function start() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      videoRef.current!.srcObject = stream;
      setStarted(true);
    } catch {
      setStatus(window.isSecureContext ? "camera blocked" : "camera needs https");
    }
  }

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const video = videoRef.current!;
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

      if (video.videoWidth > 0) {
        // Cover the screen with the video (like object-fit: cover), flipped horizontally.
        const scale = Math.max(width / video.videoWidth, height / video.videoHeight);
        const w = video.videoWidth * scale;
        const h = video.videoHeight * scale;
        ctx.save();
        ctx.translate(width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(video, (width - w) / 2, (height - h) / 2, w, h);
        ctx.restore();

        // Reflection goes here. `now` is milliseconds since the page loaded.
      }

      frame = requestAnimationFrame(draw);
    }
    frame = requestAnimationFrame(draw);

    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      (video.srcObject as MediaStream | null)?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  return (
    <main className={styles.root}>
      <video ref={videoRef} className={styles.video} autoPlay playsInline muted />
      <canvas ref={canvasRef} className={styles.canvas} />
      {!started && (
        <button className={styles.button} onClick={start}>
          {status || "start camera"}
        </button>
      )}
    </main>
  );
}
