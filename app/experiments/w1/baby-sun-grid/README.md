# Baby Sun Grid

The Teletubbies baby sun video, cropped to a square and tiled in small cells that fill the whole screen. All cells play in sync.

- Route: /experiments/w1/baby-sun-grid
- Week: W1 · Tech: Canvas
- Inputs: time (the video), window size
- Parameters: `CELL` (120 px, target cell size), `VIDEO` (file path)

## How it works
- One hidden `<video>` (muted, looped, autoplay) plays `public/experiments/w1/baby-sun-grid/baby-sun.mp4` (474×624, 17 s, a screen recording converted with ffmpeg, audio removed).
- Each frame, the center square of the video (side = shorter edge) is drawn with `drawImage` into every cell of a full-screen canvas.
- Columns and rows are `round(screen / CELL)`; the cell side is stretched slightly so the grid always covers the screen, the overflow is cut off.
- The Facebook embed of this video is blocked by Facebook ("contains content owned by someone else"), so the page uses a local file instead of an iframe.

## Run
pnpm dev → http://localhost:3000/experiments/w1/baby-sun-grid

## Status / next
Works. Next: offset each cell's playback time so the suns rise in a wave.
