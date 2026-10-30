# Camera Palette Views

The colour palette of the person in the camera (mostly skin and hair, then clothes), shown live two ways side by side: falling circles on the left, a split-flap board on the right. A small camera view sits bottom right; "hide camera" / "show camera" toggles it (hidden, it still feeds the palette). Variant of `camera-reflection`.

- Route: /experiments/w1/camera-palette-views
- Week: W1 · Tech: Canvas, MediaPipe
- Inputs: camera
- Parameters: `colors`, `paletteEvery` (in `params` at the top of `page.tsx`)
- Library: `@mediapipe/tasks-vision` (person segmentation). Model and runtime load from the web, so it needs internet.

## How it works
- Palette (`page.tsx`, `palette.ts`): every `paletteEvery` ms the selfie segmenter gives a 0..1 "is this the person" mask. The frame is shrunk to 96×54, pixels with mask ≥ 0.5 are kept, and k-means boils them down to `colors` colours, sorted by share.
- Every view eases toward the newest palette (`approach()` in `palette.ts`), so changes are smooth.
- Circles (`Circles.tsx`): circles keep falling and pile up (simple physics: gravity, circles pushed apart, walls). Each new circle picks its colour weighted by the current shares, so a growing colour shows up more often and the pile slowly turns into the new palette. When the pile is full, the oldest circles shrink away.
- Board (`FlapBoard.tsx`): a split-flap board. Each row is a colour chip, the nearest colour name (`colorName()`), its share and the change since the last board (▲ / ▼, like a stock ticker). A new board every 2.5 s; letters flip one step at a time until they reach it.
- `canvasLoop.ts`: a full-size 2D canvas plus a `requestAnimationFrame` loop, used by the circles.

## Run
pnpm dev → http://localhost:3000/experiments/w1/camera-palette-views (allow camera access). Before the camera starts the page is plain black with only the button.

## Status / next
Both views render (checked with a fixed test palette). Next: check with a real camera, tune the colour names and the board timing.
