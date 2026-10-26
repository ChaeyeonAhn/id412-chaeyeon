# Mouse Circles

A chain of hollow white circles on black that follows the mouse. The head sits close to the cursor and the rest trail behind, getting smaller and fainter, like a tail.

- Route: /experiments/w1/mouse-circles
- Week: W1 · Tech: Canvas
- Inputs: mouse position (pointer, so touch works too)
- Parameters: COUNT (40), EASE (0.25), MAX_RADIUS (28 px)

## How it works
- `pointermove` only writes the latest position into `mouse`. All drawing happens in the `requestAnimationFrame` loop.
- Each frame, circle 0 moves `EASE` of the way to the mouse, and circle i moves `EASE` of the way to circle i−1. That chained easing is what makes the trail.
- Radius and opacity both scale with `t = 1 - i / COUNT`, so the tail fades out.
- The tail is drawn first so the head ends up on top. The canvas is sized to `innerWidth/innerHeight` × `devicePixelRatio`.

## Run
pnpm dev → http://localhost:3000/experiments/w1/mouse-circles

## Status / next
Works. Next: tie the radius to mouse speed, or leave the old frames on screen (semi-transparent clear) so the trail turns into a drawing.
