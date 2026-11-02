# Mango Pixelate

A photo of a mango, stretched to the full browser width and centered on a black screen, drawn as big square pixels. A slider at the bottom right sets the pixel size; clicking a block paints it a random color.

- Route: /experiments/w1/mango-pixelate
- Week: W1 · Tech: Canvas
- Inputs: slider (pixel size), click (recolor a block), window size
- Parameters: block (16 px at start, slider from MIN_BLOCK 2 to MAX_BLOCK 80 px)

## How it works
- The photo is drawn with `drawImage` at the browser width; its height follows the image's aspect ratio.
- `getImageData` reads every pixel of the canvas back as an array of r, g, b, a numbers (in device pixels, so × `devicePixelRatio`).
- The canvas is walked in `block`-sized steps. Each block is filled with `fillRect` in the color of the pixel at its center.
- A click finds its block with `Math.floor(clientX / block)` and `Math.floor(clientY / block)`, stores a random color for it in a `Map` keyed `"column,row"`, and redraws. Clicked blocks use that color instead of the photo's. Clicking again picks a new color; changing the pixel size clears them.
- `block` is React state, set by the slider. No animation loop: a `useEffect` redraws when the image loads, when `block` changes, and on `resize`.
- `mango.jpg` is the 1920 px version of "Mango fruit Nam Dok Mai" (Wikimedia Commons), the same photo the mango-sweep cutout came from.

## Run
pnpm dev → http://localhost:3000/experiments/w1/mango-pixelate

## Status / next
Works. Next: average all pixels in a block instead of the center one.
