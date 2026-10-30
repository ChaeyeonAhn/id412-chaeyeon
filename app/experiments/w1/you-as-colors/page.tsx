"use client";

import { useEffect, useRef, useState } from "react";
import { FilesetResolver, ImageSegmenter } from "@mediapipe/tasks-vision";
import { Circles } from "./Circles";
import { FlapBoard } from "./FlapBoard";
import { palette, type Swatch } from "./palette";
import styles from "./page.module.css";

// The colour palette of the person in the camera, shown two ways side by side:
// falling circles (left) and a split-flap board (right). A small camera view can be shown bottom right.
// MediaPipe finds the person; only their pixels go into the palette.
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

export default function CameraPaletteViews() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [started, setStarted] = useState(false);
  const [status, setStatus] = useState("");
  const [swatches, setSwatches] = useState<Swatch[]>([]);
  const [modelReady, setModelReady] = useState(false);
  const [showCamera, setShowCamera] = useState(true);

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
    const video = videoRef.current!;
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
    function updatePalette() {
      if (!segmenter || video.videoWidth === 0) return;
      const result = segmenter.segmentForVideo(video, performance.now());
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

    const timer = setInterval(updatePalette, params.paletteEvery);
    return () => {
      cancelled = true;
      clearInterval(timer);
      segmenter?.close();
      (video.srcObject as MediaStream | null)?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  const note = !started ? "" : !modelReady ? "loading person model…" : swatches.length === 0 ? "no person found" : "";

  return (
    <main className={`${styles.root} ${started ? "" : styles.waiting}`}>
      {/* The two views appear only once the camera is on. */}
      {started && (
        <>
          <section className={styles.cell}>
            <Circles swatches={swatches} />
          </section>
          <section className={styles.cell}>
            <FlapBoard swatches={swatches} rows={params.colors} />
          </section>
        </>
      )}

      {/* Small mirrored camera view, so you can see what is being read. Hidden, it still feeds the palette. */}
      <video
        ref={videoRef}
        className={`${styles.video} ${started && showCamera ? "" : styles.hidden}`}
        autoPlay
        playsInline
        muted
      />
      {started && (
        <button className={styles.toggle} onClick={() => setShowCamera(!showCamera)}>
          {showCamera ? "hide camera" : "show camera"}
        </button>
      )}
      {note && <span className={styles.note}>{note}</span>}
      {!started && (
        <button className={styles.button} onClick={start}>
          {status || "start camera"}
        </button>
      )}
    </main>
  );
}
