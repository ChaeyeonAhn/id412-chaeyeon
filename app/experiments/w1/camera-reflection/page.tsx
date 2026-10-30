"use client";

import { useEffect, useRef, useState } from "react";
import { FilesetResolver, ImageSegmenter } from "@mediapipe/tasks-vision";
import { palette, toHex, type Swatch } from "./palette";
import styles from "./page.module.css";

// The mirrored webcam. MediaPipe finds the person in the camera and the colours of
// their pixels only are boiled down to a small palette: the person's colours.
const params = {
  colors: 5, // how many colours in the palette
  paletteEvery: 500, // ms between two palette updates
};

// The person-segmentation model and the MediaPipe runtime, both loaded from the web.
const MODEL =
  "https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_segmenter/float16/latest/selfie_segmenter.tflite";
const WASM = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.2.0/wasm";

// The camera frame is shrunk to this size before reading colours: plenty for a palette, and fast.
const SAMPLE_W = 96;
const SAMPLE_H = 54;

export default function CameraReflection() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [started, setStarted] = useState(false);
  const [status, setStatus] = useState("");
  const [swatches, setSwatches] = useState<Swatch[]>([]);
  const [modelReady, setModelReady] = useState(false);

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

    // Small canvas used to read the colours of the camera frame.
    const sample = document.createElement("canvas");
    sample.width = SAMPLE_W;
    sample.height = SAMPLE_H;
    const sctx = sample.getContext("2d", { willReadFrequently: true })!;

    let segmenter: ImageSegmenter | null = null;
    let cancelled = false;
    (async () => {
      const vision = await FilesetResolver.forVisionTasks(WASM);
      const created = await ImageSegmenter.createFromOptions(vision, {
        baseOptions: { modelAssetPath: MODEL, delegate: "GPU" },
        runningMode: "VIDEO",
        outputConfidenceMasks: true,
        outputCategoryMask: false,
      });
      if (cancelled) return created.close();
      segmenter = created;
      setModelReady(true);
    })();

    // Ask MediaPipe where the person is, then keep only their pixels and make a palette.
    function updatePalette(now: number) {
      const result = segmenter!.segmentForVideo(video, now);
      const masks = result.confidenceMasks;
      if (!masks || masks.length === 0) return result.close();
      // The last mask is "how sure am I this pixel is the person", 0..1 per pixel.
      const mask = masks[masks.length - 1];
      const person = mask.getAsFloat32Array();

      sctx.drawImage(video, 0, 0, SAMPLE_W, SAMPLE_H);
      const rgba = sctx.getImageData(0, 0, SAMPLE_W, SAMPLE_H).data;
      const pixels: [number, number, number][] = [];
      for (let y = 0; y < SAMPLE_H; y++) {
        for (let x = 0; x < SAMPLE_W; x++) {
          // Same spot in the mask, which has its own size.
          const mx = Math.floor((x / SAMPLE_W) * mask.width);
          const my = Math.floor((y / SAMPLE_H) * mask.height);
          if (person[my * mask.width + mx] < 0.5) continue;
          const i = (y * SAMPLE_W + x) * 4;
          pixels.push([rgba[i], rgba[i + 1], rgba[i + 2]]);
        }
      }
      result.close();

      // Fewer than 2% of the frame is the person: treat it as nobody there.
      setSwatches(pixels.length > SAMPLE_W * SAMPLE_H * 0.02 ? palette(pixels, params.colors) : []);
    }

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
    let lastPalette = 0;
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

        if (segmenter && now - lastPalette > params.paletteEvery) {
          lastPalette = now;
          updatePalette(now);
        }
      }

      frame = requestAnimationFrame(draw);
    }
    frame = requestAnimationFrame(draw);

    window.addEventListener("resize", resize);
    return () => {
      cancelled = true;
      segmenter?.close();
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      (video.srcObject as MediaStream | null)?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  return (
    <main className={styles.root}>
      <video ref={videoRef} className={styles.video} autoPlay playsInline muted />
      <canvas ref={canvasRef} className={styles.canvas} />
      {started && (
        <div className={styles.palette}>
          {!modelReady && <span className={styles.note}>loading person model…</span>}
          {modelReady && swatches.length === 0 && <span className={styles.note}>no person found</span>}
          {swatches.map((s) => (
            <div key={toHex(s)} className={styles.swatch} style={{ flexGrow: s.share }}>
              <div className={styles.chip} style={{ background: toHex(s) }} />
              <span className={styles.label}>
                {toHex(s)} · {Math.round(s.share * 100)}%
              </span>
            </div>
          ))}
        </div>
      )}
      {!started && (
        <button className={styles.button} onClick={start}>
          {status || "start camera"}
        </button>
      )}
    </main>
  );
}
