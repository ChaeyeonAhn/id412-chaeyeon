// cheney design system — tokens for JS/TS, canvas, shaders (v1).
// 원본: WebstormProjects/design-system/DESIGN.md

export const color = {
  bg: '#ffffff',
  bgSubtle: '#fafafa',
  text: '#111111',
  text2: '#5c5c5c',
  text3: '#8a8a8a',
  line: '#e6e6e6',
  accent: '#227280',
  accentHover: '#1b5d68',
  accentTint: '#eef5f6',
  black: '#0a0a0a',
  white: '#ffffff',
} as const;

export const teal = {
  50: '#eef5f6',
  100: '#d3e6e9',
  200: '#a8cdd3',
  300: '#6fa9b2',
  400: '#3f8b96',
  500: '#227280',
  600: '#1b5d68',
  700: '#154951',
  800: '#0f353b',
  900: '#0a2327',
} as const;

/** 작품 비주얼에 허용되는 전체 팔레트: 흑 → 틸 → 백 */
export const artPalette = [
  color.black,
  teal[900], teal[800], teal[700], teal[600], teal[500],
  teal[400], teal[300], teal[200], teal[100], teal[50],
  color.white,
] as const;

/** '#rrggbb' → [r, g, b] (0~1). GLSL uniform, Three.js Color 등에 사용 */
export function rgb01(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

export const font = {
  sans: '"Pretendard Variable", Pretendard, -apple-system, system-ui, sans-serif',
  mono: '"Geist Mono", ui-monospace, "SF Mono", Menlo, monospace',
} as const;

export const fontSize = { h1: 32, h2: 24, h3: 20, body: 16, small: 14, label: 12 } as const;
export const fontWeight = { regular: 400, bold: 600 } as const;

export const space = [0, 4, 8, 12, 16, 24, 32, 48, 64, 96, 128] as const;
export const radius = { sm: 2, md: 4 } as const;
export const width = { text: 640, media: 960 } as const;

export const motion = {
  fast: 150,
  base: 250,
  slow: 400,
  ease: [0.2, 0, 0, 1] as const,
  scrambleMax: 600,
} as const;

/** css: grain.css 오버레이 불투명도(0.1~0.2) / glsl: applyGrain 진폭(0.04~0.08). 스케일이 달라 따로 둔다 */
export const grain = { css: 0.15, glsl: 0.06 } as const;
