import { useEffect, useRef } from "react";

// A 2D canvas that fills its parent and calls draw() every frame.
// Shared by the canvas views of this page so each one only has to say what to draw.
export function useCanvasLoop(draw: (ctx: CanvasRenderingContext2D, width: number, height: number, now: number) => void) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawRef = useRef(draw);
  useEffect(() => {
    drawRef.current = draw;
  });

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    let width = 0;
    let height = 0;

    function resize() {
      const dpr = window.devicePixelRatio || 1;
      width = canvas.parentElement!.clientWidth;
      height = canvas.parentElement!.clientHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();

    let frame = 0;
    function loop(now: number) {
      drawRef.current(ctx, width, height, now);
      frame = requestAnimationFrame(loop);
    }
    frame = requestAnimationFrame(loop);

    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return canvasRef;
}
