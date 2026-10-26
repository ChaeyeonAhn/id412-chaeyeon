"use client";

import { Html } from "@react-three/drei";
import type { ThreeEvent } from "@react-three/fiber";
import { useLayoutEffect, useRef } from "react";
import * as THREE from "three";
import styles from "./page.module.css";
import { color, teal } from "./tokens";

export type Day = { date: string; close: number; volume: number };

// The box the data lives in: x = time, y = close, z = volume.
export const BOX = { x: 12, y: 6, z: 4 };
const RADIUS = 0.035; // size of one day's sphere

// Day i → position inside the box (box centred on the origin).
export function positionOf(days: Day[], i: number, range: Range) {
  const d = days[i];
  return new THREE.Vector3(
    (i / (days.length - 1) - 0.5) * BOX.x,
    ((d.close - range.minClose) / (range.maxClose - range.minClose) - 0.5) * BOX.y,
    ((d.volume - range.minVolume) / (range.maxVolume - range.minVolume) - 0.5) * BOX.z,
  );
}

export type Range = { minClose: number; maxClose: number; minVolume: number; maxVolume: number };

type Props = {
  days: Day[];
  range: Range;
  hovered: number;
  onHover: (i: number) => void;
};

export function Chart({ days, range, hovered, onHover }: Props) {
  const meshRef = useRef<THREE.InstancedMesh>(null);

  // Place every sphere once. One InstancedMesh draws all ~5000 in a single call.
  useLayoutEffect(() => {
    const mesh = meshRef.current!;
    const matrix = new THREE.Matrix4();
    days.forEach((_, i) => {
      matrix.setPosition(positionOf(days, i, range));
      mesh.setMatrixAt(i, matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
    mesh.computeBoundingSphere();
  }, [days, range]);

  const half = { x: BOX.x / 2, y: BOX.y / 2, z: BOX.z / 2 };
  const fmt = (n: number) => n.toLocaleString("en-US", { maximumFractionDigits: 0 });

  return (
    <>
      <ambientLight intensity={1.2} />
      <directionalLight position={[5, 10, 8]} intensity={1.5} />

      {/* The box: 12 thin edges. */}
      <lineSegments>
        <edgesGeometry args={[new THREE.BoxGeometry(BOX.x, BOX.y, BOX.z)]} />
        <lineBasicMaterial color={teal[200]} />
      </lineSegments>

      <instancedMesh
        ref={meshRef}
        args={[undefined, undefined, days.length]}
        onPointerMove={(e: ThreeEvent<PointerEvent>) => {
          e.stopPropagation();
          if (e.instanceId !== undefined) onHover(e.instanceId);
        }}
        onPointerOut={() => onHover(-1)}
      >
        <sphereGeometry args={[RADIUS, 8, 6]} />
        <meshStandardMaterial color={teal[500]} roughness={0.6} />
      </instancedMesh>

      {/* The hovered day: a bigger black sphere on top. */}
      {hovered >= 0 && (
        <mesh position={positionOf(days, hovered, range)}>
          <sphereGeometry args={[RADIUS * 3, 16, 12]} />
          <meshBasicMaterial color={color.black} />
        </mesh>
      )}

      {/* Axis labels at the box edges. */}
      <Html position={[0, -half.y - 0.4, half.z]} center className={styles.axis}>
        TIME {days[0].date.slice(0, 4)} → {days[days.length - 1].date.slice(0, 4)}
      </Html>
      <Html position={[-half.x - 0.3, 0, half.z]} center className={styles.axis}>
        CLOSE {fmt(range.minClose)} → {fmt(range.maxClose)}
      </Html>
      <Html position={[half.x + 0.3, -half.y, 0]} center className={styles.axis}>
        VOLUME →
      </Html>
    </>
  );
}
