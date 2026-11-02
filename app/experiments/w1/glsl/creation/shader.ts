// The vertex shader places the full-screen triangle. It never changes.
export const VERTEX_SHADER = `#version 300 es
in vec2 a_position;

void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

// "Creation" by Danilo Guanabara (http://www.pouet.net/prod.php?which=57245),
// ported from Shadertoy: iTime → u_time, iResolution → u_resolution.
// Three passes, one per colour channel (r, g, b), each a little later in time (z += 0.07).
// Each pass pushes uv outward from the centre by a rippling amount, then draws a
// glowing dot in every repeated 1x1 cell. The small time offset splits the colours.
export const FRAGMENT_SHADER = `#version 300 es
precision highp float;

uniform vec2 u_resolution;
uniform float u_time;

out vec4 outputColor;

void main() {
  vec3 c;
  float l;
  float z = u_time;

  for (int i = 0; i < 3; i++) {
    vec2 uv = gl_FragCoord.xy / u_resolution;
    vec2 p = uv - 0.5;                       // centre at (0, 0)
    p.x *= u_resolution.x / u_resolution.y;  // keep circles round
    z += 0.07;                               // this channel is a bit later in time
    l = length(p);                           // distance from the centre

    // push uv away from the centre; the push pulses with time and ripples with distance
    uv += p / l * (sin(z) + 1.0) * abs(sin(l * 9.0 - z - z));

    // repeat space in 1x1 cells, glow brighter the closer to each cell's centre
    c[i] = 0.01 / length(mod(uv, 1.0) - 0.5);
  }

  // divide by l: brighter towards the centre. Alpha is 1 (the original wrote time there).
  outputColor = vec4(c / l, 1.0);
}
`;
