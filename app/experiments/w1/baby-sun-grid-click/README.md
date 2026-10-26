# Baby Sun Grid (Click)

The Teletubbies baby sun video tiled in small squares, each cell at a random point in the video (like `baby-sun-grid-random`). Click a cell and it gets a new random look: rotated by 90° steps, mirrored, and/or color-inverted.

- Route: /experiments/w1/baby-sun-grid-click
- Week: W1 · Tech: Canvas
- Inputs: click (per cell), time (the videos), window size
- Parameters: `CELL` (120 px, target cell size), `POOL` (12 differently-timed videos)

## How it works
- `POOL` hidden `<video>` elements play the same file, each jumped to a random `currentTime`. Every cell picks one at random.
- Each cell stores `{ video, turns, flip, invert }`. A click finds the cell under the pointer (`clientX / side`, `clientY / side`) and re-rolls turns (0–3), flip and invert until at least one of them changes.
- Drawing a cell: `translate` to its center, `rotate(turns × 90°)`, `scale(-1, 1)` if flipped, `ctx.filter = "invert(1)"` if inverted, then `drawImage` the video's center square. `save`/`restore` around each cell.
- Resizing the window rebuilds the grid, so all cells go back to normal.
- Reuses the video file from `baby-sun-grid`.

## Run
pnpm dev → http://localhost:3000/experiments/w1/baby-sun-grid-click

## Status / next
Works. Next: drag across cells to transform many at once, or a short spin animation between looks.
