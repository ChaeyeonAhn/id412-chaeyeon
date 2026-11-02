import * as THREE from "three";

// Painting the "areas" of the wireframe.
//
// Every point inside the cube's outline is covered by exactly two triangles:
// one on the front, one on the back. All the lines you see are triangle edges,
// so one area on screen = (front triangle on screen) ∩ (back triangle on screen).
// We cut that area out in 2D, then project it back onto the 3D triangles,
// so it stays glued to the faces when the camera moves.

export type Patch = { points: THREE.Vector3[]; color: string };

// The 12 triangles of a box geometry (the cube sits at the origin, so local = world).
export function trianglesOf(geometry: THREE.BufferGeometry): THREE.Triangle[] {
  const pos = geometry.getAttribute("position");
  const index = geometry.getIndex()!;
  const triangles: THREE.Triangle[] = [];
  for (let i = 0; i < index.count; i += 3) {
    const [a, b, c] = [0, 1, 2].map((k) => new THREE.Vector3().fromBufferAttribute(pos, index.getX(i + k)));
    triangles.push(new THREE.Triangle(a, b, c));
  }
  return triangles;
}

// The area under the pointer, as a polygon on the front triangle and on the back triangle.
export function areaAt(
  pointer: THREE.Vector2,
  ray: THREE.Ray,
  camera: THREE.Camera,
  triangles: THREE.Triangle[],
): { front: THREE.Vector3[]; back: THREE.Vector3[] } | null {
  // Which triangles does the ray pass through, nearest first?
  const hits: { tri: THREE.Triangle; distance: number }[] = [];
  const hit = new THREE.Vector3();
  for (const tri of triangles) {
    if (ray.intersectTriangle(tri.a, tri.b, tri.c, false, hit)) {
      hits.push({ tri, distance: hit.distanceTo(ray.origin) });
    }
  }
  if (hits.length < 2) return null;
  hits.sort((p, q) => p.distance - q.distance);
  const front = hits[0].tri;
  const back = hits[hits.length - 1].tri;

  // Cut the area out on screen: the front triangle clipped by the back triangle.
  const area = clip(toScreen(front, camera), toScreen(back, camera));
  if (area.length < 3) return null;

  return {
    front: area.map((p) => onTriangle(p, front, camera)),
    back: area.map((p) => onTriangle(p, back, camera)),
  };
}

// Triangle corners → screen position (-1..1).
function toScreen(tri: THREE.Triangle, camera: THREE.Camera): THREE.Vector2[] {
  return [tri.a, tri.b, tri.c].map((p) => {
    const v = p.clone().project(camera);
    return new THREE.Vector2(v.x, v.y);
  });
}

// Screen position → the 3D point on the triangle's plane that the camera sees there.
function onTriangle(p: THREE.Vector2, tri: THREE.Triangle, camera: THREE.Camera): THREE.Vector3 {
  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(p, camera);
  const plane = tri.getPlane(new THREE.Plane());
  return raycaster.ray.intersectPlane(plane, new THREE.Vector3())!;
}

// Sutherland–Hodgman: keep the part of `subject` that lies inside the convex `window`.
function clip(subject: THREE.Vector2[], window: THREE.Vector2[]): THREE.Vector2[] {
  // Make the window counter-clockwise so "inside" is always on the left of each edge.
  if (signedArea(window) < 0) window = [...window].reverse();

  let out = subject;
  for (let i = 0; i < window.length; i++) {
    const a = window[i];
    const b = window[(i + 1) % window.length];
    const input = out;
    out = [];
    for (let j = 0; j < input.length; j++) {
      const p = input[j];
      const q = input[(j + 1) % input.length];
      const pIn = side(a, b, p) >= 0;
      const qIn = side(a, b, q) >= 0;
      if (pIn) out.push(p);
      if (pIn !== qIn) out.push(crossing(a, b, p, q));
    }
  }
  return out;
}

// > 0 when p is left of the line a→b.
function side(a: THREE.Vector2, b: THREE.Vector2, p: THREE.Vector2): number {
  return (b.x - a.x) * (p.y - a.y) - (b.y - a.y) * (p.x - a.x);
}

// Where the segment p→q crosses the line a→b.
function crossing(a: THREE.Vector2, b: THREE.Vector2, p: THREE.Vector2, q: THREE.Vector2): THREE.Vector2 {
  const sp = side(a, b, p);
  const sq = side(a, b, q);
  return p.clone().lerp(q, sp / (sp - sq));
}

function signedArea(poly: THREE.Vector2[]): number {
  let sum = 0;
  for (let i = 0; i < poly.length; i++) {
    const p = poly[i];
    const q = poly[(i + 1) % poly.length];
    sum += p.x * q.y - q.x * p.y;
  }
  return sum / 2;
}
