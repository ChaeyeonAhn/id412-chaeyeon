# Baby Sun Grid (Click)

The Teletubbies baby sun video tiled in small squares that fill the screen, each cell at a random point in the video. Click a cell and it gets a new random look: rotated by 90° steps, mirrored, and/or color-inverted.

![Baby Sun Grid](../../../../public/experiments/w1/baby-sun-grid-click/screenshot.jpg)

- Route: /experiments/w1/baby-sun-grid-click
- Week: W1 · Tech: Canvas
- Inputs: click (per cell), time (the videos), window size
- Parameters: `CELL` (120 px, target cell size), `POOL` (12 differently-timed videos)

## How it works
- `POOL` hidden `<video>` elements play `baby-sun.mp4`, each jumped to a random `currentTime`. Every cell picks one at random; a pool instead of one video per cell, since ~100 videos decoding at once would be heavy.
- Each cell shows the center square of its video (side = the shorter edge). Columns and rows are `round(screen / CELL)`, the side stretched slightly so the grid covers the screen.
- Each cell stores `{ video, turns, flip, invert }`. A click finds the cell under the pointer (`clientX / side`, `clientY / side`) and re-rolls turns (0–3), flip and invert until at least one of them changes.
- Drawing a cell: `translate` to its center, `rotate(turns × 90°)`, `scale(-1, 1)` if flipped, `ctx.filter = "invert(1)"` if inverted, then `drawImage` the video's center square. `save`/`restore` around each cell.
- Resizing the window rebuilds the grid, so all cells go back to normal.
- `baby-sun.mp4`: 474×624, 17 s, a screen recording converted with ffmpeg, audio removed. The Facebook embed of the original video is blocked by Facebook, so the page uses a local file instead of an iframe.

## Run
pnpm dev → http://localhost:3000/experiments/w1/baby-sun-grid-click

## Status / next
Works. Next: drag across cells to transform many at once, or a short spin animation between looks.
