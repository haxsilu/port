"use client";

import { useEffect } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { director } from "@/lib/content";

const nameParts = director.name.split(" ");

export default function Hero({ start }: { start: boolean }) {
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 40, damping: 20 });
  const sy = useSpring(my, { stiffness: 40, damping: 20 });
  const glowX = useTransform(sx, (v) => `${50 + v * 12}%`);
  const glowY = useTransform(sy, (v) => `${50 + v * 12}%`);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mx.set(e.clientX / window.innerWidth - 0.5);
      my.set(e.clientY / window.innerHeight - 0.5);
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [mx, my]);

  return (
    <section
      id="top"
      className="relative flex min-h-[100svh] flex-col justify-center overflow-hidden px-6 md:px-10"
    >
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.08]"
        style={{
          background: useTransform(
            [glowX, glowY],
            ([gx, gy]) =>
              `radial-gradient(600px circle at ${gx} ${gy}, rgba(244,243,239,0.9), transparent 70%)`
          ),
        }}
      />

      <div className="relative z-10 max-w-5xl">
        <div className="mb-8 flex gap-3 overflow-hidden">
          {nameParts.map((part, i) => (
            <motion.span
              key={part}
              initial={{ y: "110%" }}
              animate={{ y: start ? "0%" : "110%" }}
              transition={{
                delay: 0.15 + i * 0.12,
                duration: 1.1,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="font-display block text-[13vw] font-light leading-[0.95] tracking-tight text-fg md:text-[7vw]"
            >
              {part}
            </motion.span>
          ))}
        </div>

        <div className="overflow-hidden">
          <motion.p
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: start ? "0%" : "100%", opacity: start ? 1 : 0 }}
            transition={{ delay: 0.55, duration: 0.9, ease: "easeOut" }}
            className="tracked font-body text-xs text-fg-dim md:text-sm"
          >
            {director.roles.join(" • ")}
          </motion.p>
        </div>

        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: start ? 1 : 0, y: start ? 0 : 14 }}
          transition={{ delay: 0.8, duration: 1, ease: "easeOut" }}
          className="text-balance mt-10 max-w-xl font-body text-base font-light leading-relaxed text-fg-dim md:text-lg"
        >
          {director.manifesto}
        </motion.p>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: start ? 1 : 0 }}
        transition={{ delay: 1.3, duration: 1 }}
        className="absolute bottom-10 left-6 flex items-center gap-3 md:left-10"
      >
        <motion.span
          animate={{ height: [8, 24, 8] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          className="w-px bg-fg-faint"
        />
        <span className="tracked font-body text-[10px] text-fg-faint">SCROLL</span>
      </motion.div>
    </section>
  );
}
