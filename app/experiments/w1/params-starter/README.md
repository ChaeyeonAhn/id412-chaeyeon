# Params Starter

Empty placeholder for Web Assignment 1: a black full-screen canvas with a running animation loop and nothing drawn yet.

- Route: /experiments/w1/params-starter
- Week: W1 · Tech: Canvas (placeholder; may switch to GLSL / Three.js)
- Inputs: none yet
- Parameters: none yet (`params` in `page.tsx` is empty)

## How it works
- `useEffect` sizes the canvas to the window × `devicePixelRatio` and starts a `requestAnimationFrame` loop.
- `draw(now)` clears to black every frame; the drawing goes below that.
- `params` at the top of `page.tsx` is where the 3–5 parameters go.

## Run
pnpm dev → http://localhost:3000/experiments/w1/params-starter

## Status / next
Empty. Next: pick the idea and the input, rename the folder after what it does, fill `params` and `draw()`, update this README.
