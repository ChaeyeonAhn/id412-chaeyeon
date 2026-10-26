# Mango Sweep

500 pale yellow mangoes scattered at random over a black screen. Drag with the mouse (or a finger) to sweep them away; they slide, spin, and pile up where you push them, or leave the screen.

- Route: /experiments/w1/mango-sweep
- Week: W1 · Tech: Canvas
- Inputs: pointer drag
- Parameters: COUNT (500), BRUSH (60 px), PUSH (0.8), FRICTION (0.92), MIN/MAX_WIDTH (50–120 px)

## How it works
- Each mango has a position, velocity, angle, spin and width. All are random at the start.
- While the pointer is down, `pointermove` finds the mangoes within `BRUSH` of the pointer and adds the drag delta (× `PUSH`) to their velocity. Bigger mangoes get less, so they feel heavier.
- The `requestAnimationFrame` loop moves every mango by its velocity, then multiplies velocity and spin by `FRICTION`, so they glide to a stop.
- `mango.png` is a 300 px copy of the sharp-edged mango-cutout image so drawing 500 of them stays fast.

## Run
pnpm dev → http://localhost:3000/experiments/w1/mango-sweep

## Status / next
Works. Mangoes don't bump into each other, so swept ones stack on top. Next: collisions so they pile up like a real heap, or a key to scatter them again.
