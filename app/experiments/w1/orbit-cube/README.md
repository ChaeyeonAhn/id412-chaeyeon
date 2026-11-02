# Orbit Cube

A single teal cube in an empty white scene. Drag to orbit the camera around it, scroll to zoom.

- Route: /experiments/w1/orbit-cube
- Week: W1 · Tech: Three.js
- Inputs: drag (orbit), scroll (zoom), right-drag (pan)
- Parameters: SIZE (2) in `page.tsx`, camera position (4, 3, 5), zoom range 3–20

## How it works
- `<Canvas>` from `@react-three/fiber` sets up the renderer, scene and camera.
- One `<mesh>`: `boxGeometry` + `meshStandardMaterial` in the accent teal from `tokens.ts` (cheney design system).
- Ambient light fills the shadows, one directional light gives the faces different shades.
- `<OrbitControls>` from `@react-three/drei` moves the camera; `enableDamping` makes it glide after you let go.
- Film grain is a CSS overlay on top of the canvas.

## Run
pnpm dev → http://localhost:3000/experiments/w1/orbit-cube

## Status / next
Works. Next: rotate the cube with `useFrame`, or add more cubes.
