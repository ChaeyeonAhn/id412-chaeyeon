# Camera Reflection

The webcam, mirrored like a mirror. Along the bottom, the colour palette of the person in the camera: the colours that stand for them.

- Route: /experiments/w1/camera-reflection
- Week: W1 · Tech: Canvas
- Inputs: camera
- Parameters: `colors`, `paletteEvery` (in `params` at the top of `page.tsx`)
- Library: `@mediapipe/tasks-vision` (person segmentation). Model and runtime load from the web, so it needs internet.

## How it works
- "start camera" calls `getUserMedia` and puts the stream into a hidden `<video>`.
- Each frame, the video is drawn onto the canvas, scaled to cover the screen and flipped horizontally.
- Palette: every `paletteEvery` ms, MediaPipe's selfie segmenter gives a mask saying, per pixel, how sure it is that pixel is a person (0..1). The frame is shrunk to 96×54, pixels with mask ≥ 0.5 are kept, and k-means (`palette.ts`) boils them down to `colors` main colours. Each chip's width is its share of the person's pixels. Under 2% person pixels → "no person found".
- The camera tracks are stopped when the page unmounts.

## Run
pnpm dev → http://localhost:3000/experiments/w1/camera-reflection (allow camera access). Deployed on Vercel it works too, since that is https.

## Status / next
Mirrored camera works. Person palette is built; check it with a real camera. Next: use the palette for something (e.g. tint the reflection with it).
