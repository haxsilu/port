"use client";

import { motion, useScroll, useSpring } from "framer-motion";

export default function ScrollProgress({ visible }: { visible: boolean }) {
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <motion.div
      animate={{ opacity: visible ? 1 : 0 }}
      transition={{ duration: 0.8 }}
      className="fixed right-6 top-1/2 z-40 hidden h-40 w-px -translate-y-1/2 bg-line md:block"
    >
      <motion.div
        style={{ scaleY: progress }}
        className="absolute left-0 top-0 h-full w-full origin-top bg-fg"
      />
    </motion.div>
  );
}
