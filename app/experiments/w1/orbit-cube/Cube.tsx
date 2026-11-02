"use client";

import type { ThreeEvent } from "@react-three/fiber";
import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { areaAt, trianglesOf, type Patch } from "./paint";
import { color, teal } from "./tokens";

export const MATERIALS = ["basic", "lambert", "phong", "standard", "physical", "toon", "wireframe"] as const;
export type Material = (typeof MATERIALS)[number];

const SIZE = 2;
const PAINT = [teal[100], teal[200], teal[300], teal[400], teal[500], teal[600], teal[700], teal[800], teal[900]];

type Props = {
  material: Material;
  patches: Patch[];
  onPaint: (newPatches: Patch[]) => void;
};

// The cube. In wireframe, a click paints the area under the pointer with a random teal;
// the paint is stored as 3D polygons on the faces, so it stays put when you orbit.
export function Cube({ material, patches, onPaint }: Props) {
  const box = useMemo(() => new THREE.BoxGeometry(SIZE, SIZE, SIZE), []);
  const triangles = useMemo(() => trianglesOf(box), [box]);
  const paintable = material === "wireframe";

  function paint(e: ThreeEvent<MouseEvent>) {
    if (!paintable || e.delta > 4) return; // a drag is an orbit, not a click
    const area = areaAt(e.pointer, e.ray, e.camera, triangles);
    if (!area) return;

    const fill = PAINT[Math.floor(Math.random() * PAINT.length)];
    // Randomly leave the colour on the front face, the back face, or both.
    const where = ["front", "back", "both"][Math.floor(Math.random() * 3)];
    const added: Patch[] = [];
    if (where !== "back") added.push({ points: area.front, color: fill });
    if (where !== "front") added.push({ points: area.back, color: fill });
    onPaint(added);
  }

  return (
    <>
      <mesh
        geometry={box}
        renderOrder={paintable ? 10000 : 0}
        onClick={paint}
        onPointerOver={() => paintable && (document.body.style.cursor = "pointer")}
        onPointerOut={() => (document.body.style.cursor = "")}
      >
        <CubeMaterial kind={material} />
      </mesh>

      {paintable && patches.map((p, i) => <PatchMesh key={i} patch={p} order={i + 1} />)}
    </>
  );
}

function CubeMaterial({ kind }: { kind: Material }) {
  switch (kind) {
    case "basic":
      return <meshBasicMaterial color={color.accent} />; // flat colour, ignores light
    case "lambert":
      return <meshLambertMaterial color={color.accent} />; // matte, no highlight
    case "phong":
      return <meshPhongMaterial color={color.accent} shininess={80} />; // shiny highlight
    case "standard":
      return <meshStandardMaterial color={color.accent} roughness={0.5} />; // physically based
    case "physical":
      return <meshPhysicalMaterial color={color.accent} roughness={0.2} clearcoat={1} />; // standard + clear coat
    case "toon":
      return <meshToonMaterial color={color.accent} />; // cartoon steps of light
    case "wireframe":
      // Lines always drawn on top of the paint, so every area stays outlined.
      return <meshBasicMaterial color={color.accent} wireframe depthTest={false} />;
  }
}

// One painted polygon. Later patches win over earlier ones on the same face (polygonOffset).
function PatchMesh({ patch, order }: { patch: Patch; order: number }) {
  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry().setFromPoints(patch.points);
    const index: number[] = [];
    for (let i = 1; i < patch.points.length - 1; i++) index.push(0, i, i + 1); // convex → fan
    g.setIndex(index);
    return g;
  }, [patch]);

  useEffect(() => () => geometry.dispose(), [geometry]);

  return (
    <mesh geometry={geometry} raycast={() => null}>
      <meshBasicMaterial
        color={patch.color}
        side={THREE.DoubleSide}
        polygonOffset
        polygonOffsetFactor={-1}
        polygonOffsetUnits={-order}
      />
    </mesh>
  );
}
