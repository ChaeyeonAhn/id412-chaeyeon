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

// Moves `current` a little toward `target` (amount 0..1), colour by colour, so views change smoothly.
// Both lists are sorted by share, so index i is "the i-th biggest colour" in both.
export function approach(current: Swatch[], target: Swatch[], amount: number): Swatch[] {
  if (target.length === 0) return current; // nobody in view: hold the last palette
  if (current.length === 0) return target;
  return target.map((t, i) => {
    const c = current[i] ?? { ...t, share: 0 };
    return {
      r: c.r + (t.r - c.r) * amount,
      g: c.g + (t.g - c.g) * amount,
      b: c.b + (t.b - c.b) * amount,
      share: c.share + (t.share - c.share) * amount,
    };
  });
}

export function toCss({ r, g, b }: Swatch) {
  return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
}

// A short list of named colours, weighted toward skin, hair and clothing tones.
const NAMES: [string, number, number, number][] = [
  ["JET BLACK", 20, 20, 22],
  ["CHARCOAL", 54, 54, 58],
  ["SLATE", 92, 98, 110],
  ["ASH GREY", 150, 150, 150],
  ["SILVER", 196, 196, 200],
  ["PAPER WHITE", 240, 238, 232],
  ["IVORY", 236, 224, 200],
  ["PORCELAIN", 238, 214, 196],
  ["PEACH", 240, 190, 160],
  ["ROSE BEIGE", 214, 170, 150],
  ["SAND", 206, 176, 136],
  ["HONEY", 200, 150, 90],
  ["TAN", 180, 136, 100],
  ["CARAMEL", 160, 104, 60],
  ["CINNAMON", 140, 84, 56],
  ["CHESTNUT", 110, 64, 44],
  ["COCOA", 86, 56, 42],
  ["ESPRESSO", 56, 38, 30],
  ["MAHOGANY", 100, 40, 34],
  ["BRICK", 160, 60, 46],
  ["CRIMSON", 190, 30, 50],
  ["CORAL", 240, 120, 100],
  ["BLUSH", 230, 160, 170],
  ["MUSTARD", 210, 170, 50],
  ["LEMON", 240, 220, 90],
  ["OLIVE", 110, 110, 50],
  ["MOSS", 90, 120, 70],
  ["FOREST", 40, 80, 50],
  ["MINT", 160, 210, 180],
  ["TEAL", 30, 120, 120],
  ["SKY", 140, 190, 230],
  ["DENIM", 70, 100, 150],
  ["NAVY", 30, 40, 80],
  ["COBALT", 40, 70, 180],
  ["LAVENDER", 180, 160, 210],
  ["PLUM", 100, 50, 90],
];

export function colorName({ r, g, b }: Swatch) {
  let best = NAMES[0][0];
  let bestDist = Infinity;
  for (const [name, nr, ng, nb] of NAMES) {
    const d = (r - nr) ** 2 + (g - ng) ** 2 + (b - nb) ** 2;
    if (d < bestDist) {
      bestDist = d;
      best = name;
    }
  }
  return best;
}
