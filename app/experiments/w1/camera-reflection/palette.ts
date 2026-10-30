// Turns a list of pixel colours into a few main colours with k-means.
// k-means: start with k guesses, give every pixel to its nearest guess,
// move each guess to the average of its pixels, repeat.

export type Swatch = { r: number; g: number; b: number; share: number };

type RGB = [number, number, number];

export function palette(pixels: RGB[], k: number, rounds = 10): Swatch[] {
  if (pixels.length < k) return [];

  // First guesses: k pixels spread evenly through the list.
  let centers: RGB[] = [];
  for (let i = 0; i < k; i++) centers.push([...pixels[Math.floor((i * pixels.length) / k)]]);

  let counts: number[] = [];
  for (let round = 0; round < rounds; round++) {
    const sums: RGB[] = centers.map(() => [0, 0, 0]);
    counts = centers.map(() => 0);
    for (const p of pixels) {
      const c = nearest(p, centers);
      sums[c][0] += p[0];
      sums[c][1] += p[1];
      sums[c][2] += p[2];
      counts[c]++;
    }
    // A guess with no pixels keeps its place.
    centers = centers.map((old, c) =>
      counts[c] > 0 ? [sums[c][0] / counts[c], sums[c][1] / counts[c], sums[c][2] / counts[c]] : old,
    );
  }

  return centers
    .map(([r, g, b], c) => ({ r: Math.round(r), g: Math.round(g), b: Math.round(b), share: counts[c] / pixels.length }))
    .filter((s) => s.share > 0)
    .sort((a, b) => b.share - a.share);
}

function nearest(p: RGB, centers: RGB[]) {
  let best = 0;
  let bestDist = Infinity;
  centers.forEach((c, i) => {
    const d = (p[0] - c[0]) ** 2 + (p[1] - c[1]) ** 2 + (p[2] - c[2]) ** 2;
    if (d < bestDist) {
      bestDist = d;
      best = i;
    }
  });
  return best;
}

export function toHex({ r, g, b }: Swatch) {
  return "#" + [r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("");
}
