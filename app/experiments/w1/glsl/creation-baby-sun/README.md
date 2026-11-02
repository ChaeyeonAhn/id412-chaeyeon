# Creation × Baby Sun

The Teletubbies baby sun video in the middle of the screen, spreading out into particles. Four tabs at the bottom-left, four takes on the idea, built on Danilo Guanabara's "Creation" shader (credit bottom-right).

- Route: /experiments/w1/glsl/creation-baby-sun
- Week: W1 · Tech: GLSL (WebGL2, video texture)
- Inputs: time, the video, tab click
- Parameters: `SUN_R` (sun disk radius), `N` / `SIZE` (Dots), `count` / `speed` (Burst), `slices` (Rays)

## Tabs
- **Ripple**: Creation as it is, but every repeated cell shows the sun's face. Face → kaleidoscope petals and back.
- **Dots**: the sun as a round mosaic of glowing dots; Creation's push throws rings of dots outward.
- **Burst**: the sun disk in the middle, particles flying out in every direction, each coloured by a pixel of the sun.
- **Rays**: the sun's light smeared outward (zoom blur), cut into dashes racing out along thin rays.

## How it works
- `shader.ts`: one fragment shader per tab plus a shared `COMMON` part (`sun(q)` reads the video, `hash` for randomness). `MODES` lists the tabs.
- `renderer.ts`: compiles all four shaders once. Every frame it copies the current video frame into a texture and draws with the chosen one.
- `sun(q)` crops a square around the face: the video is portrait, the face sits a bit above the middle.
- Burst places particles on a grid in (angle, log radius) and slides it outward with time; log radius makes them grow and speed up as they leave.
- `baby-sun.mp4` is a copy of the one in `baby-sun-grid-click`.

## Run
pnpm dev → http://localhost:3000/experiments/w1/glsl/creation-baby-sun

## Status / next
All four tabs work. Shader edits need a page reload (the shaders compile once). Next: mouse moves the sun, or click to make it burst.
