"use client";

import { OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import styles from "./page.module.css";
import { color } from "./tokens";

// One teal cube in the middle of the scene. Drag to orbit, scroll to zoom.
const SIZE = 2;

export default function OrbitCube() {
  return (
    <main className={styles.root}>
      <div className={styles.grain}>
        <Canvas dpr={[1, 2]} camera={{ position: [4, 3, 5], fov: 45 }}>
          <ambientLight intensity={0.6} />
          <directionalLight position={[5, 8, 4]} intensity={2} />

          <mesh>
            <boxGeometry args={[SIZE, SIZE, SIZE]} />
            <meshStandardMaterial color={color.accent} />
          </mesh>

          <OrbitControls enableDamping minDistance={3} maxDistance={20} />
        </Canvas>
      </div>
    </main>
  );
}
