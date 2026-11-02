# Mango Pixelate

A photo of a mango, stretched to the full browser width and centered on a black screen, drawn as a grid of square blocks. ▲ ▼ buttons at the bottom right change the grid size by 1 px, and clicking a block paints it a random color.

- Route: /experiments/w1/mango-pixelate
- Week: W1 · Tech: Canvas
- Inputs: click (paint a block), ▲ ▼ buttons (grid size), window size
- Parameters: block (16 px at start, MIN_BLOCK 2 to MAX_BLOCK 80)

## How it works
- The photo is drawn at the browser width, read back with `getImageData`, and each cell is filled with `fillRect` in the color at its center.
- Clicks are saved as painted rectangles in screen px (`paintsRef`), not as grid cells. When the grid is redrawn at a new size, every cell a painted rectangle overlaps takes its color, so painting survives size changes.
- `block` is React state. No animation loop: a `useEffect` redraws when the image loads, when `block` changes, and on `resize`. A click only fills its one cell.
- Cell edges are rounded to whole device pixels (`fillCell`), so there are no thin seams at zoom levels like 1.8×.
- `mango.jpg` is the 1920 px version of "Mango fruit Nam Dok Mai" (Wikimedia Commons).

## Run
pnpm dev → http://localhost:3000/experiments/w1/mango-pixelate

## Status / next
Works. Next: average all pixels in a block instead of the center one.
