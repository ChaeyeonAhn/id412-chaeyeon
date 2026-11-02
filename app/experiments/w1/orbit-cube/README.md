# Orbit Cube

A single teal cube in an empty white scene. Drag to orbit the camera around it, scroll to zoom. A text menu at the bottom left swaps the cube's material and turns film grain on or off.

- Route: /experiments/w1/orbit-cube
- Week: W1 · Tech: Three.js
- Inputs: drag (orbit), scroll (zoom), right-drag (pan), menu clicks
- Parameters: SIZE (2), MATERIALS list, camera position (4, 3, 5), zoom range 3–20 — all in `page.tsx`

## How it works
- `<Canvas>` from `@react-three/fiber` sets up the renderer, scene and camera.
- One `<mesh>`: `boxGeometry` + the material picked in the menu, all in the accent teal from `tokens.ts` (cheney design system).
- `CubeMaterial` switches between basic, lambert, phong, standard, physical, toon and wireframe. Basic and wireframe ignore light; the rest react to it differently.
- Ambient light fills the shadows, one directional light gives the faces different shades.
- `<OrbitControls>` from `@react-three/drei` moves the camera; `enableDamping` makes it glide after you let go.
- Film grain is a CSS overlay on the canvas, off by default.

## Run
pnpm dev → http://localhost:3000/experiments/w1/orbit-cube

## Status / next
Works. Next: sliders for roughness / shininess, or rotate the cube with `useFrame`.
