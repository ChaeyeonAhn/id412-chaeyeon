# Kaonashi Follow

Kaonashi (No-Face, from Spirited Away) follows the mouse on a pale paper background, slowly and silently, with a trail of faint copies behind him. The cursor is hidden, so he is the cursor.

- Route: /experiments/w1/kaonashi-follow
- Week: W1 · Tech: Canvas
- Inputs: mouse position (pointer, so touch works too)
- Parameters: COUNT (12), EASE (0.12), HEIGHT (220 px)

## How it works
- Same loop as `../mouse-circles`, but each circle is now an image. Copy 0 eases toward the mouse and copy i eases toward copy i−1.
- The front copy is fully opaque. The ones behind fade out (`globalAlpha`), which reads as his translucent presence.
- The image is placed so the cursor sits on his mask, not on the top edge of the image.
- Image: `public/experiments/w1/kaonashi-follow/kaonashi.png`. It is cut out of Studio Ghibli's official free still `chihiro020.jpg` (ghibli.jp/works/chihiro, "free to use within common sense"). The background was removed with rembg (u2net). In that frame he is see-through, so the body was filled solid black and the mask kept as is.

## Run
pnpm dev → http://localhost:3000/experiments/w1/kaonashi-follow

## Status / next
Works. Next: make him lean toward the direction he moves, or make him fade when the mouse stops.
