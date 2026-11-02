# Mango Pixelate

A photo of a mango, stretched to the full browser width and centered on a black screen, drawn as big square pixels. Redraws when the window is resized.

- Route: /experiments/w1/mango-pixelate
- Week: W1 · Tech: Canvas
- Inputs: window size
- Parameters: BLOCK (16 px, size of one pixel block)

## How it works
- The photo is drawn with `drawImage` at the browser width; its height follows the image's aspect ratio.
- `getImageData` reads every pixel of the canvas back as an array of r, g, b, a numbers (in device pixels, so × `devicePixelRatio`).
- The canvas is walked in `BLOCK`-sized steps. Each block is filled with `fillRect` in the color of the pixel at its center.
- No animation loop: it draws once when the image loads, and again on `resize`.
- `mango.jpg` is the 1920 px version of "Mango fruit Nam Dok Mai" (Wikimedia Commons), the same photo the mango-sweep cutout came from.

## Run
pnpm dev → http://localhost:3000/experiments/w1/mango-pixelate

## Status / next
Works. Next: average all pixels in a block instead of the center one, or let the mouse change `BLOCK`.
