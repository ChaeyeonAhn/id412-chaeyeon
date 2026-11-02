# Creation

Danilo Guanabara's "Creation" shader, full screen: glowing dots ripple out from the centre in rings, and the red, green and blue channels drift apart into colour fringes over time. Credit link bottom-right.

- Route: /experiments/w1/glsl/creation
- Week: W1 · Tech: GLSL (WebGL2, no Three.js)
- Inputs: time
- Parameters: `0.07` (time gap between colour channels), `9.0` (ripple frequency), `0.01` (dot glow size)

## How it works
- `shader.ts` (GLSL), `renderer.ts` (copied from hello-fragment-shader), `page.tsx` (canvas, loop, credit).
- Ported from Shadertoy: `iTime` → `u_time`, `iResolution` → `u_resolution`, `mainImage` → `main`.
- The loop runs three times, once per colour channel, each slightly later in time. That offset is where the colour comes from.
- Each pass pushes uv away from the centre by a pulsing ripple, then `mod(uv, 1.0)` repeats space so every cell draws one glowing dot.
- Alpha is fixed to 1.0 (the original put time there, which would fade the canvas against the page).

## Run
pnpm dev → http://localhost:3000/experiments/w1/glsl/creation

## Status / next
Faithful port, works. Next: bring in `u_mouse` (move the centre, or change the ripple with mouse x).

Credit: http://www.pouet.net/prod.php?which=57245 (Danilo Guanabara)
