"use client";

import { OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useState } from "react";
import styles from "./page.module.css";
import { color } from "./tokens";

// One teal cube in the middle of the scene. Drag to orbit, scroll to zoom.
// The menu at the bottom left swaps the cube's material and turns the film grain on/off.
const SIZE = 2;

const MATERIALS = ["basic", "lambert", "phong", "standard", "physical", "toon", "wireframe"] as const;
type Material = (typeof MATERIALS)[number];

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
      return <meshBasicMaterial color={color.accent} wireframe />; // only the edges of the triangles
  }
}

export default function OrbitCube() {
  const [material, setMaterial] = useState<Material>("standard");
  const [noise, setNoise] = useState(false);

  return (
    <main className={styles.root}>
      <div className={noise ? `${styles.art} ${styles.grain}` : styles.art}>
        <Canvas dpr={[1, 2]} camera={{ position: [4, 3, 5], fov: 45 }}>
          <ambientLight intensity={0.6} />
          <directionalLight position={[5, 8, 4]} intensity={2} />

          <mesh>
            <boxGeometry args={[SIZE, SIZE, SIZE]} />
            <CubeMaterial kind={material} />
          </mesh>

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
        </div>
      </nav>
    </main>
  );
}
