// Draws a number as Roman numerals with straight lines, to match the digital-clock look.
// Romans had no zero; 0 is shown as N (for "nulla").

const NUMERALS: [number, string][] = [
  [100, "C"], [90, "XC"], [50, "L"], [40, "XL"],
  [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"],
];

function toRoman(value: number) {
  if (value === 0) return "N";
  let result = "";
  for (const [amount, letters] of NUMERALS) {
    while (value >= amount) {
      result += letters;
      value -= amount;
    }
  }
  return result;
}

// Each letter is an SVG path in a box 22 units tall.
const LETTERS: Record<string, { width: number; path: string }> = {
  I: { width: 2, path: "M1 1 V21" },
  V: { width: 10, path: "M1 1 L5 21 L9 1" },
  X: { width: 10, path: "M1 1 L9 21 M9 1 L1 21" },
  L: { width: 8, path: "M1 1 V21 H7" },
  C: { width: 8, path: "M7 1 H1 V21 H7" }, // square C, like the square 0
  N: { width: 10, path: "M1 21 V1 L9 21 V1" },
};
const GAP = 2;

export default function RomanNumeral({ value, className }: { value: number; className?: string }) {
  // Place the letters side by side, then size the viewBox to fit them all.
  let x = 0;
  const letters = toRoman(value)
    .split("")
    .map((char, i) => {
      const letter = LETTERS[char];
      const element = <path key={i} d={letter.path} transform={`translate(${x} 0)`} />;
      x += letter.width + GAP;
      return element;
    });

  return (
    <svg viewBox={`0 0 ${x - GAP} 22`} className={className}>
      {letters}
    </svg>
  );
}
