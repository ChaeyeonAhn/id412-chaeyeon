// The vertex shader places the full-screen triangle. It never changes.
export const VERTEX_SHADER = `#version 300 es
in vec2 a_position;

void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

// Shared by every tab: uniforms, the sun video, a random number.
const COMMON = `#version 300 es
precision highp float;

uniform vec2 u_resolution;
uniform float u_time;
uniform sampler2D u_video;

out vec4 outputColor;

const float TAU = 6.2831853;
const float SUN_R = 0.2; // radius of the sun disk in the middle, in screen heights

// q: a square around the sun's face, -0.5..0.5 on both axes → colour from the video.
// The video is 474x624 (portrait); the face sits a bit above the middle (y = 0.58 from the bottom).
vec3 sun(vec2 q) {
  q = clamp(q, -0.5, 0.5);
  return texture(u_video, vec2(0.5 + q.x, 0.58 + q.y * 0.76)).rgb;
}

// The sun cut out as a round disk of radius R around (0, 0).
vec3 sunDisk(vec2 p, float R) {
  return sun(p / (2.0 * R)) * smoothstep(R, R - 0.02, length(p));
}

// A random number 0..1 that is always the same for the same p.
float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}
`;

// RIPPLE: Creation as it is, but every repeated cell shows the sun's face
// instead of only a glowing dot. Same push, same r/g/b time offset.
const RIPPLE = `${COMMON}
void main() {
  vec3 c;
  float l;
  float z = u_time;
  float aspect = u_resolution.x / u_resolution.y;

  for (int i = 0; i < 3; i++) {
    vec2 uv = gl_FragCoord.xy / u_resolution;
    vec2 p = uv - 0.5;
    p.x *= aspect;
    z += 0.07;
    l = length(p);
    uv += p / l * (sin(z) + 1.0) * abs(sin(l * 9.0 - z - z));

    vec2 cell = mod(uv, 1.0) - 0.5;
    vec2 q = vec2(cell.x * aspect, cell.y);                         // keep the face round
    float face = sun(q * 1.1)[i] * smoothstep(0.5, 0.25, length(q)); // the face, faded at the edge
    c[i] = face * 0.6 + 0.01 / length(cell);                        // + Creation's glow dot
  }

  outputColor = vec4(1.0 - exp(-c * 0.35 / l), 1.0); // brighter towards the centre, never clipped
}
`;

// DOTS: the sun drawn as a round mosaic of glowing dots. Creation's push moves the
// grid, so rings of dots carry pieces of the sun outward. One pass (no r/g/b split),
// so every dot keeps the sun's real colour.
const DOTS = `${COMMON}
const float N = 40.0;    // dots across the screen height
const float SIZE = 0.6;  // the sun's size when nothing is pushed, in screen heights

void main() {
  float z = u_time;
  vec2 p0 = (gl_FragCoord.xy - 0.5 * u_resolution) / u_resolution.y; // centre (0, 0), height 1
  float l = length(p0);

  // the push points inward here: a pixel reads from closer to the centre, so the picture flows out
  vec2 p = p0 - p0 / l * (sin(z) + 1.0) * abs(sin(l * 9.0 - z - z)) * 0.25;

  vec2 g = p * N;
  vec2 f = fract(g) - 0.5;              // position inside this dot's cell
  vec2 q = (floor(g) + 0.5) / N / SIZE; // the cell's centre on the sun
  float inside = step(length(q), 0.5);  // round sun
  float glow = clamp(0.12 / length(f) - 0.24, 0.0, 2.0); // 0 at the cell edge, bright in the middle

  outputColor = vec4(sun(q) * inside * glow, 1.0);
}
`;

// BURST: the sun in the middle, and particles flying out of it in every direction.
// Particles live on a grid in (angle, log radius); sliding the grid outward over time
// moves them out, and log radius makes them grow and speed up as they leave.
const BURST = `${COMMON}
void main() {
  vec2 p = (gl_FragCoord.xy - 0.5 * u_resolution) / u_resolution.y;
  float r = length(p);
  float a = atan(p.y, p.x);
  vec2 dir = p / r;
  float R = SUN_R * (1.0 + 0.06 * sin(u_time * 2.0)); // the sun breathes

  vec3 col = sunDisk(p, R);

  for (int k = 0; k < 3; k++) {
    float fk = float(k);
    float count = 90.0 + fk * 70.0; // particles around the circle in this layer
    float rows = count / TAU;       // rows per log radius, so cells stay roughly square
    float x = a / TAU * count;
    float column = floor(x);
    float speed = 0.15 + 0.35 * hash(vec2(column, fk)); // each ray has its own speed
    float y = (log(r) - u_time * speed) * rows;

    vec2 id = vec2(column, floor(y));
    vec2 f = vec2(fract(x), fract(y)) - 0.5;
    f += (vec2(hash(id + 3.1), hash(id + 7.7)) - 0.5) * 0.3; // jitter inside the cell
    float on = step(0.55, hash(id + fk * 17.0));             // only some cells hold a particle
    float size = 0.12 + 0.13 * hash(id + 1.3);
    float d = smoothstep(size, 0.0, length(vec2(f.x, f.y * 0.6))); // a little stretched outward

    // its colour: a pixel of the sun somewhere between the centre and the rim, in its direction
    vec3 c = sun(dir * 0.5 * hash(id + 5.2));
    float fade = smoothstep(R * 0.9, R * 1.5, r) * smoothstep(1.2, 0.4, r);
    col += c * d * on * fade * 1.6;
  }

  outputColor = vec4(col, 1.0);
}
`;

// RAYS: the sun's light smeared outward (a zoom blur), then cut into dashes
// that race out along thin rays.
const RAYS = `${COMMON}
const int STEPS = 32;

void main() {
  vec2 p = (gl_FragCoord.xy - 0.5 * u_resolution) / u_resolution.y;
  float r = length(p);
  float a = atan(p.y, p.x);
  float R = SUN_R * (1.0 + 0.06 * sin(u_time * 2.0));

  // walk from this pixel toward the centre and add up the sun along the way
  vec3 rays = vec3(0.0);
  for (int k = 0; k < STEPS; k++) {
    float s = 1.0 - float(k) / float(STEPS) * 0.92;
    rays += sunDisk(p * s, R);
  }
  rays /= float(STEPS);

  // thin rays (angle slices), each with dashes moving outward at its own speed
  float slices = 240.0;
  float slice = floor(a / TAU * slices);
  float across = fract(a / TAU * slices) - 0.5;
  float speed = 0.3 + 0.7 * hash(vec2(slice, 1.0));
  float dash = fract(log(r) * 3.0 - u_time * speed + hash(vec2(slice, 2.0)));
  float mask = smoothstep(0.0, 0.08, dash) * smoothstep(0.45, 0.2, dash)
             * smoothstep(0.5, 0.1, abs(across))
             * step(0.3, hash(vec2(slice, 3.0)));

  float outside = smoothstep(R * 0.95, R * 1.05, r);
  vec3 col = sunDisk(p, R) + rays * (0.25 + 2.2 * mask) * outside;

  outputColor = vec4(col, 1.0);
}
`;

// One entry per tab, in order.
export const MODES = [
  { name: "Ripple", fragment: RIPPLE },
  { name: "Dots", fragment: DOTS },
  { name: "Burst", fragment: BURST },
  { name: "Rays", fragment: RAYS },
];
