# Camera Reflection

Placeholder: the webcam fills the screen, mirrored like a mirror. Which reflection effect to draw on top is still open.

- Route: /experiments/w1/camera-reflection
- Week: W1 · Tech: Canvas
- Inputs: camera
- Parameters: none yet (`params` in `page.tsx` is empty)

## How it works
- "start camera" calls `getUserMedia` and puts the stream into a hidden `<video>`.
- The `requestAnimationFrame` loop draws the current video frame onto the canvas each frame, scaled to cover the screen and flipped horizontally.
- The reflection effect goes under the "Reflection goes here" comment in `draw()`.
- The camera tracks are stopped when the page unmounts.

## Run
pnpm dev → http://localhost:3000/experiments/w1/camera-reflection (allow camera access). Deployed on Vercel it works too, since that is https.

## Status / next
Mirrored camera works. Next: decide the reflection, fill `params`, hook two of them to the camera (brightness, motion, position) or another input.
