"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

// Rendered via next/dynamic with ssr:false (see page.tsx) — this never runs
// on the server, so reading matchMedia in the initializer is safe.
function isFinePointer() {
  return window.matchMedia("(hover: hover) and (pointer: fine)").matches;
}

export default function CustomCursor() {
  const [enabled] = useState(isFinePointer);
  const [hovering, setHovering] = useState(false);
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const springX = useSpring(x, { stiffness: 500, damping: 40, mass: 0.4 });
  const springY = useSpring(y, { stiffness: 500, damping: 40, mass: 0.4 });

  useEffect(() => {
    if (!enabled) return;

    const move = (event: PointerEvent) => {
      x.set(event.clientX);
      y.set(event.clientY);
    };

    const over = (event: PointerEvent) => {
      const target = event.target as HTMLElement;
      setHovering(Boolean(target.closest("[data-cursor='link']")));
    };

    window.addEventListener("pointermove", move);
    window.addEventListener("pointerover", over);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerover", over);
    };
  }, [enabled, x, y]);

  if (!enabled) return null;

  return (
    <motion.div
      className="cursor-dot"
      style={{ x: springX, y: springY }}
      animate={{ scale: hovering ? 3.2 : 1 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
    />
  );
}
