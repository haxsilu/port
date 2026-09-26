"use client";

import { motion } from "framer-motion";
import { ventures, vision } from "@/lib/content";
import { SectionLabel } from "./Filmography";

// Spectrum Connect is a product, not a production house. Kept apart from the
// film companies so visitors don't read it as part of the filmmaking work.
export default function Platform() {
  const platform = ventures.find((v) => v.kind === "platform");
  if (!platform) return null;

  return (
    <section id="platform" className="relative px-6 py-28 md:px-10 md:py-40">
      <SectionLabel index="07" title="Platform" />

      <div className="mt-16 max-w-4xl">
        <motion.h3
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          className="font-display text-3xl font-semibold tracking-tight text-fg md:text-5xl"
        >
          {platform.name}
        </motion.h3>

        <motion.p
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 0.85, delay: 0.08, ease: "easeOut" }}
          className="text-balance mt-6 max-w-xl font-body text-base font-light leading-relaxed text-fg-dim md:text-lg"
        >
          {platform.description}
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 0.9, delay: 0.12, ease: "easeOut" }}
          className="text-balance mt-14 max-w-3xl border-t border-line pt-12 font-display text-xl font-semibold leading-snug tracking-tight text-fg md:text-3xl"
        >
          {vision}
        </motion.p>
      </div>
    </section>
  );
}
