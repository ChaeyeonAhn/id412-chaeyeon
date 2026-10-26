# Mango Hunt

A game: one pale yellow mango is hidden under a thick pile of yellow maple leaves. Drag to sweep the leaves aside, click the mango when you spot it. The time it took is shown, then play again.

- Route: /experiments/w1/mango-hunt
- Week: W1 · Tech: Canvas
- Inputs: pointer drag (sweep), click (find)
- Parameters (settings panel, top right, foldable): push (0.35), brush (45 px), friction (0.88), leaves (1000), leaf size (140 px)

## How it works
- Each round puts the mango at a random spot (away from the edges), then scatters `leaves` leaves over the whole screen. The mango is drawn first, so the leaves lie on top.
- Dragging adds the drag delta × `push` to every leaf within `brush` of the pointer; bigger leaves get less. Each frame, velocity and spin are multiplied by `friction`.
- A click counts as found only if the pixel under the pointer is solid mango and no leaf has a solid pixel there. The alpha of `leaf.png` and `mango.png` is read once into an array for this (`loadMask`, `solidAt`), so the gaps between a maple leaf's points count as see-through.
- Panel values live in React state and are copied to a ref that the animation loop reads. Changing leaves or leaf size starts a new round.
- `leaf.png` ("Leaf yellow", Wikimedia Commons) and `mango.png` are 240 px cutouts made with macOS Vision, with the edge alpha snapped to on/off for a sharp outline.

## Run
pnpm dev → http://localhost:3000/experiments/w1/mango-hunt

## Status / next
Works. Next: a few decoy leaves that are a bit mango-shaped, or let swept leaves pile up against each other instead of overlapping.
