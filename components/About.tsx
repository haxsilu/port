"use client";

import { motion } from "framer-motion";
import { about } from "@/lib/content";
import { SectionLabel } from "./Filmography";

export default function About() {
  return (
    <section id="about" className="relative px-6 py-28 md:px-10 md:py-40">
      <SectionLabel index="03" title="About" />

      <div className="mt-16 grid grid-cols-1 gap-12 md:grid-cols-[minmax(0,320px)_1fr] md:gap-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          className="relative aspect-[3/4] w-full max-w-sm overflow-hidden"
          style={{
            background:
              "radial-gradient(120% 100% at 30% 0%, rgba(80,80,78,1) 0%, rgba(10,10,10,1) 60%)",
          }}
        >
          <div className="absolute inset-0 mix-blend-overlay" />
        </motion.div>

        <div>
          <motion.h3
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 0.9, ease: "easeOut" }}
            className="text-balance font-display max-w-2xl text-2xl font-semibold leading-snug tracking-tight text-fg md:text-4xl"
          >
            {about.heading}
          </motion.h3>

          <div className="mt-10 flex max-w-xl flex-col gap-6">
            {about.paragraphs.map((p, i) => (
              <motion.p
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-10%" }}
                transition={{ duration: 0.8, delay: i * 0.08, ease: "easeOut" }}
                className="font-body text-base font-light leading-relaxed text-fg-dim"
              >
                {p}
              </motion.p>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
