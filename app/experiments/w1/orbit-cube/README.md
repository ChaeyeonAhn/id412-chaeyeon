# Orbit Cube

A single teal cube in an empty white scene. Drag to orbit the camera around it, scroll to zoom. A text menu at the bottom left swaps the cube's material and turns film grain on or off. In wireframe, click an area between the lines to paint it a random teal; orbit and the paint stays on the 3D faces, broken into new shapes.

- Route: /experiments/w1/orbit-cube
- Week: W1 · Tech: Three.js
- Inputs: drag (orbit), scroll (zoom), right-drag (pan), click (paint, wireframe only), menu clicks
- Parameters: SIZE, MATERIALS, PAINT (teal 100–900) in `Cube.tsx`; camera position and zoom range in `page.tsx`

## How it works
- `<Canvas>` from `@react-three/fiber` sets up the renderer, scene and camera. `page.tsx` holds the menu and the state (material, noise, painted patches).
- `Cube.tsx`: one `<mesh>` with the material picked in the menu, all in teal from `tokens.ts` (cheney design system). Basic and wireframe ignore light; the rest react to it differently.
- Painting (`paint.ts`): every point inside the cube's outline is covered by one front and one back triangle. The clicked area = front triangle ∩ back triangle on screen (polygon clipping). That 2D area is projected back onto both triangles' planes, giving a 3D polygon on each.
- Each click randomly keeps the colour on the front face, the back face, or both. Patches are drawn only in wireframe; lines are drawn on top so areas stay outlined. A later patch wins over an earlier one on the same face.
- Ambient light fills the shadows, one directional light gives the faces different shades.
- `<OrbitControls>` from `@react-three/drei` moves the camera; `enableDamping` makes it glide after you let go.
- Film grain is a CSS overlay on the canvas, off by default.

## Run
pnpm dev → http://localhost:3000/experiments/w1/orbit-cube

## Status / next
Works. Clicking exactly on a line can pick a neighbouring area. Next: show the paint on the solid materials too, or undo the last click.
