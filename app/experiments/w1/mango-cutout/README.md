# Mango Cutout

A high-res photo of a mango with its background removed, floating on a black full-screen page.

- Route: /experiments/w1/mango-cutout
- Week: W1 · Tech: HTML/CSS
- Inputs: none
- Parameters: none

## How it works
- `public/experiments/w1/mango-cutout/mango.png` is a transparent PNG (2000×967), cut from "Mango fruit Nam Dok Mai" (a pale yellow Thai mango) on Wikimedia Commons.
- The cutout was made once, offline, with macOS Vision's subject lifting (`VNGenerateForegroundInstanceMaskRequest`), the same thing as "Lift subject" in Photos. Its soft alpha edge was then snapped to on/off (alpha ≥ 160 → opaque, else transparent) so the outline is sharp. The page just shows the PNG.
- Fixed full-screen root, image centered with flexbox; `max-width/max-height: 100%` keeps it inside the window.

## Run
pnpm dev → http://localhost:3000/experiments/w1/mango-cutout

## Status / next
Works. Next: since the background is transparent now, move it with the mouse or scatter many mangoes on a canvas.
