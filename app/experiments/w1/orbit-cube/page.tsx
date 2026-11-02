"use client";

import { OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useState } from "react";
import { Cube, MATERIALS, type Material } from "./Cube";
import type { Patch } from "./paint";
import styles from "./page.module.css";

// One teal cube in the middle of the scene. Drag to orbit, scroll to zoom.
// The menu at the bottom left swaps the cube's material and turns the film grain on/off.
// In wireframe, click an area between the lines to paint it.
export default function OrbitCube() {
  const [material, setMaterial] = useState<Material>("standard");
  const [noise, setNoise] = useState(false);
  const [patches, setPatches] = useState<Patch[]>([]);

  return (
    <main className={styles.root}>
      <div className={noise ? `${styles.art} ${styles.grain}` : styles.art}>
        <Canvas dpr={[1, 2]} camera={{ position: [4, 3, 5], fov: 45 }}>
          <ambientLight intensity={0.6} />
          <directionalLight position={[5, 8, 4]} intensity={2} />

          <Cube
            material={material}
            patches={patches}
            onPaint={(added) => setPatches((old) => [...old, ...added])}
          />

          <OrbitControls enableDamping minDistance={3} maxDistance={20} />
        </Canvas>
      </div>

      <nav className={styles.menu}>
        <div className={styles.row}>
          {MATERIALS.map((m) => (
            <button
              key={m}
              className={m === material ? `${styles.option} ${styles.selected}` : styles.option}
              onClick={() => setMaterial(m)}
            >
              {m}
            </button>
          ))}
        </div>
        <div className={styles.row}>
          <button
            className={noise ? `${styles.option} ${styles.selected}` : styles.option}
            onClick={() => setNoise(!noise)}
          >
            noise {noise ? "on" : "off"}
          </button>
          {material === "wireframe" && patches.length > 0 && (
            <button className={styles.option} onClick={() => setPatches([])}>
              clear paint
            </button>
          )}
        </div>
      </nav>
    </main>
  );
}
