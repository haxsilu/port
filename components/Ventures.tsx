"use client";

import { motion } from "framer-motion";
import { ventures, vision } from "@/lib/content";
import { SectionLabel } from "./Filmography";

export default function Ventures() {
  return (
    <section id="ventures" className="relative px-6 py-28 md:px-10 md:py-40">
      <SectionLabel index="06" title="Ventures" />

      <ul className="mt-16 flex max-w-4xl flex-col">
        {ventures.map((v, i) => (
          <motion.li
            key={v.id}
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 0.8, delay: i * 0.08, ease: "easeOut" }}
            className="grid grid-cols-1 gap-3 border-t border-line py-10 md:grid-cols-[minmax(0,260px)_1fr] md:gap-12 md:py-12"
          >
            <h4 className="font-display text-xl font-semibold tracking-tight text-fg md:text-2xl">
              {v.name}
            </h4>
            <p className="max-w-xl font-body text-base font-light leading-relaxed text-fg-dim">
              {v.description}
            </p>
          </motion.li>
        ))}
      </ul>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-10%" }}
        transition={{ duration: 0.9, ease: "easeOut" }}
        className="text-balance font-display mt-16 max-w-3xl border-t border-line pt-14 text-xl font-semibold leading-snug tracking-tight text-fg md:text-3xl"
      >
        {vision}
      </motion.p>
    </section>
  );
}
