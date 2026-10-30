# Params Starter

Starter for Web Assignment 1: a ring of colored circles that rotates and breathes, with every visual choice pulled out into a `params` object and hooked to an input. The visual is a placeholder to replace.

- Route: /experiments/w1/params-starter
- Week: W1 · Tech: Canvas
- Inputs: mouse position, scroll wheel, arrow keys, time
- Parameters: count (mouse X), size (mouse Y), speed (wheel), hue (←/→)

## How it works
- `params` at the top of `page.tsx` is the single list of parameters. Edit it first when the idea changes.
- Input handlers only write into `params`; the `requestAnimationFrame` loop reads them every frame.
- `time` advances by real elapsed seconds × `params.speed`, so speed 0 freezes the animation.
- The top-left readout prints the live parameter values. Remove it when done.

## Run
pnpm dev → http://localhost:3000/experiments/w1/params-starter

## Status / next
Scaffold only. Next: pick the idea, rename the folder after what it does, replace the ring in `draw()`, and update this README.
