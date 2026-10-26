# Mango Cutout

The same mango as `mango`, with the photo background (leaves, branch) removed, floating on a black full-screen page.

- Route: /experiments/w1/mango-cutout
- Week: W1 · Tech: HTML/CSS
- Inputs: none
- Parameters: none

## How it works
- `public/experiments/w1/mango-cutout/mango.png` is a transparent PNG cut from `mango/mango.jpg`.
- The cutout was made once, offline, with macOS Vision's subject lifting (`VNGenerateForegroundInstanceMaskRequest`), the same thing as "Lift subject" in Photos. The page just shows the PNG.
- Layout is copied from `mango`: fixed full-screen root, image centered with flexbox.

## Run
pnpm dev → http://localhost:3000/experiments/w1/mango-cutout

## Status / next
Works. Next: since the background is transparent now, move it with the mouse or scatter many mangoes on a canvas.
