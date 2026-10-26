# Baby Sun Grid (Random)

The Teletubbies baby sun video tiled in small squares that fill the screen, like `baby-sun-grid`, but every cell is at a different point in the video, so the suns rise and set out of sync.

- Route: /experiments/w1/baby-sun-grid-random
- Week: W1 · Tech: Canvas
- Inputs: time (the videos), window size
- Parameters: `CELL` (120 px, target cell size), `POOL` (12 differently-timed videos)

## How it works
- `POOL` hidden `<video>` elements play the same file (`/experiments/w1/baby-sun-grid/baby-sun.mp4`), each jumped to a random `currentTime` when it loads.
- Each cell gets a random pool index (re-rolled on resize). Every frame, the center square of that cell's video is drawn into it with `drawImage`.
- A pool instead of one video per cell: ~100 videos decoding at once would be heavy, and with random picks 12 timings already look random.
- Reuses the video file from `baby-sun-grid`; no new asset.

## Run
pnpm dev → http://localhost:3000/experiments/w1/baby-sun-grid-random

## Status / next
Works. Next: random playback speed per video too, or re-roll a cell's pick on hover.
