# Mango

One photo of a mango, centered on a black full-screen page. Nothing reacts yet.

- Route: /experiments/w1/mango
- Week: W1 · Tech: HTML/CSS
- Inputs: none
- Parameters: none

## How it works
- The image lives in `public/experiments/w1/mango/mango.jpg` and is loaded with a plain `<img>`.
- `.root` is fixed full-screen and centers the image with flexbox; `max-width/max-height: 100%` keeps it inside the window.
- Image: "Hapus Mango" from Wikimedia Commons.

## Run
pnpm dev → http://localhost:3000/experiments/w1/mango

## Status / next
Works. Next: draw it into a canvas and play with its pixels, or make it follow the mouse.
