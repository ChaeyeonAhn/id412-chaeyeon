# Time Interval

A dense full-screen grid of square cells showing 0–9. Hover a cell and it becomes a timer that ticks up; move away and it freezes at that count.

- Route: /experiments/w1/time-interval
- Week: W1 · Tech: React state + setInterval, CSS Modules
- Inputs: mouse hover, time
- Parameters: CELL_SIZE (36 px), MAX_COUNT (100), INTERVAL (100 ms)

## How it works
- On load and on resize, the page computes how many `CELL_SIZE` squares cover the window (rounded up, overflow hidden).
- Each `Cell` starts at `index % 10` and keeps its own `count` and `hovered` state.
- `onMouseEnter` starts a `setInterval` in that cell only; `onMouseLeave` clears it, so the count stays where it stopped.
- Counts wrap from `MAX_COUNT` back to 0. Gray = untouched, white = frozen timer, inverted = ticking.
- `CELL_SIZE` also appears in `page.module.css` (`grid-auto-rows`); change both together.

## Run
pnpm dev → http://localhost:3000/experiments/w1/time-interval

## Status / next
Works. Next: let stopped timers slowly drift back to their digit, or tie speed to mouse velocity.
