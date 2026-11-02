# Mango Pixelate

A photo of a mango, stretched to the full browser width and centered on a black screen, drawn as a grid of square blocks. A slider at the bottom right sets the block size, clicking a block paints it a random color, and blocks near the mouse turn into soft, rounded jelly that wobbles as the mouse moves.

- Route: /experiments/w1/mango-pixelate
- Week: W1 · Tech: Canvas
- Inputs: mouse position (hover), click (paint a block), slider (block size), window size
- Parameters: block (16 px at start, 2–80), JELLY_RADIUS (90 px), WOBBLE (0.02), STIFFNESS (0.15), DAMPING (0.8)

## How it works
- The photo is drawn at the browser width, read back with `getImageData`, and each cell gets the color at its center. The blocks are drawn once into an offscreen `grid` canvas that is copied to the screen every frame.
- Clicks are saved as painted rectangles in screen px (`paints`), not as grid cells. When the grid is rebuilt for a new block size, every cell a painted rectangle overlaps takes its color, so painting survives size changes.
- Jelly: cells within `JELLY_RADIUS` of the mouse get spring state (`sx`, `sy` scale and speed). Mouse movement squashes them (sideways → wide, up/down → tall), and every frame a spring pulls them back. Their corner radius and size follow how close the mouse is. Settled cells far from the mouse are dropped and drawn as plain squares again.
- Jelly cells are drawn on top: black over the square first, then a `roundRect`.
- Cell edges are rounded to whole device pixels (`cellRect`), so there are no thin seams at zoom levels like 1.8×.
- `mango.jpg` is the 1920 px version of "Mango fruit Nam Dok Mai" (Wikimedia Commons).

## Run
pnpm dev → http://localhost:3000/experiments/w1/mango-pixelate

## Status / next
Works. The jelly is subtle at small block sizes. Next: tune WOBBLE/STIFFNESS for a bouncier feel, or let the jelly blocks drift away from the mouse a little.
