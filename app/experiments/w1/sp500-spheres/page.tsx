"use client";

import { OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useEffect, useMemo, useState } from "react";
import { Chart, type Day } from "./Chart";
import styles from "./page.module.css";

// The S&P 500 line in a 3D box you can orbit: each trading day is one small sphere.
// x = time, y = close, z = volume.
async function loadDays(): Promise<Day[]> {
  const text = await (await fetch("/experiments/w1/sp500-spheres/sp500.csv")).text();
  const days: Day[] = [];
  text
    .trim()
    .split("\n")
    .slice(1)
    .forEach((row) => {
      const [date, close, volume] = row.split(",");
      // One day in the data has volume 0 (a gap in the source); reuse the day before.
      const v = Number(volume) || days[days.length - 1]?.volume || 0;
      days.push({ date, close: Number(close), volume: v });
    });
  return days;
}

export default function Sp500Spheres() {
  const [days, setDays] = useState<Day[]>([]);
  const [hovered, setHovered] = useState(-1);

  useEffect(() => {
    loadDays().then(setDays);
  }, []);

  const range = useMemo(() => {
    const closes = days.map((d) => d.close);
    const volumes = days.map((d) => d.volume);
    return {
      minClose: Math.min(...closes),
      maxClose: Math.max(...closes),
      minVolume: Math.min(...volumes),
      maxVolume: Math.max(...volumes),
    };
  }, [days]);

  const day = hovered >= 0 ? days[hovered] : null;

  return (
    <main className={styles.root}>
      <div className={styles.grain}>
        <Canvas dpr={[1, 2]} camera={{ position: [4, 4, 14], fov: 45 }}>
          {days.length > 0 && (
            <Chart days={days} range={range} hovered={hovered} onHover={setHovered} />
          )}
          <OrbitControls minDistance={4} maxDistance={30} />
        </Canvas>
      </div>

      <p className={styles.readout}>
        {day
          ? `${day.date} / CLOSE ${day.close.toLocaleString("en-US")} / VOL ${(day.volume / 1e9).toFixed(2)}B`
          : "S&P 500 / DAILY CLOSE / ONE SPHERE PER DAY"}
      </p>
      <p className={styles.caption}>drag to orbit · scroll to zoom · hover a sphere</p>
    </main>
  );
}
