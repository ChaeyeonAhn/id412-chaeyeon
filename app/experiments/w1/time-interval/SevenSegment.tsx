// Draws a number like a digital clock: each digit is 7 bars (segments) in an SVG.
//
//    aaa
//   f   b
//    ggg
//   e   c
//    ddd

const SEGMENTS = {
  a: "1.4,1 2.4,0 9.6,0 10.6,1 9.6,2 2.4,2",
  b: "11,1.4 12,2.4 12,9.6 11,10.6 10,9.6 10,2.4",
  c: "11,11.4 12,12.4 12,19.6 11,20.6 10,19.6 10,12.4",
  d: "1.4,21 2.4,20 9.6,20 10.6,21 9.6,22 2.4,22",
  e: "1,11.4 2,12.4 2,19.6 1,20.6 0,19.6 0,12.4",
  f: "1,1.4 2,2.4 2,9.6 1,10.6 0,9.6 0,2.4",
  g: "1.4,11 2.4,10 9.6,10 10.6,11 9.6,12 2.4,12",
};

// Which segments light up for each digit 0–9.
const DIGITS = [
  "abcdef", "bc", "abdeg", "abcdg", "bcfg",
  "acdfg", "acdefg", "abc", "abcdefg", "abcdfg",
];

function Digit({ digit, className }: { digit: number; className?: string }) {
  return (
    <svg viewBox="0 0 12 22" className={className}>
      {DIGITS[digit].split("").map((name) => (
        <polygon key={name} points={SEGMENTS[name as keyof typeof SEGMENTS]} />
      ))}
    </svg>
  );
}

export default function SevenSegment({
  value,
  className,
  digitClassName,
}: {
  value: number;
  className?: string;
  digitClassName?: string;
}) {
  return (
    <span className={className}>
      {String(value)
        .split("")
        .map((char, i) => (
          <Digit key={i} digit={Number(char)} className={digitClassName} />
        ))}
    </span>
  );
}
