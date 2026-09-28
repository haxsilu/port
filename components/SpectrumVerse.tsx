"use client";

import { motion } from "framer-motion";
import { spectrumVerse, ventures } from "@/lib/content";
import { SectionLabel } from "./Filmography";

// The three ventures sat in two separate sections before. They belong
// together under Spectrum Verse — the `role` line is what now keeps
// Spectrum Connect from reading as a production house.
export default function SpectrumVerse() {
  return (
    <section id="spectrum-verse" className="relative px-6 py-28 md:px-10 md:py-40">
      <SectionLabel index="06" title="Ventures" />

      <div className="mt-16 max-w-5xl">
        <motion.h3
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          className="font-display text-4xl font-semibold tracking-tight text-fg md:text-7xl"
        >
          {spectrumVerse.title}
        </motion.h3>

        <motion.p
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 0.85, delay: 0.08, ease: "easeOut" }}
          className="text-balance mt-8 max-w-2xl font-body text-base font-light leading-relaxed text-fg-dim md:text-lg"
        >
          {spectrumVerse.intro}
        </motion.p>

        <ul className="mt-16 flex flex-col">
          {ventures.map((v, i) => (
            <motion.li
              key={v.id}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ duration: 0.8, delay: i * 0.08, ease: "easeOut" }}
              className="grid grid-cols-1 gap-4 border-t border-line py-10 md:grid-cols-[minmax(0,300px)_1fr] md:gap-12 md:py-12"
            >
              <div>
                <span className="tracked font-body text-[10px] text-fg-faint">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h4 className="mt-3 font-display text-xl font-semibold tracking-tight text-fg md:text-3xl">
                  {v.name}
                </h4>
                <p className="mt-2 font-body text-xs font-light text-fg-faint">
                  {v.role} · {v.status}
                </p>
              </div>
              <p className="max-w-xl self-center font-body text-base font-light leading-relaxed text-fg-dim">
                {v.description}
              </p>
            </motion.li>
          ))}
        </ul>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 0.9, delay: 0.12, ease: "easeOut" }}
          className="text-balance mt-16 max-w-3xl border-t border-line pt-12 font-display text-xl font-semibold leading-snug tracking-tight text-fg md:text-3xl"
        >
          {spectrumVerse.closing}
        </motion.p>
      </div>
    </section>
  );
}
