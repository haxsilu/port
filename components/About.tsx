"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { about, capabilities } from "@/lib/content";
import { SectionLabel } from "./Filmography";

export default function About() {
  return (
    <section id="about" className="relative px-6 py-28 md:px-10 md:py-40">
      <SectionLabel index="04" title="About" />

      <div className="mt-16 grid grid-cols-1 gap-12 md:grid-cols-[minmax(0,320px)_1fr] md:gap-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          // The portrait is 2:3; held at its own ratio rather than forced into
          // a 3:4 frame, which would crop the top of the head. self-start
          // stops the grid stretching this column to the height of the bio
          // beside it, which left a black panel hanging below the photo.
          className="relative w-full max-w-sm self-start overflow-hidden"
        >
          <Image
            src={about.portrait}
            alt={about.portraitAlt}
            width={about.portraitWidth}
            height={about.portraitHeight}
            sizes="(max-width: 768px) 100vw, 320px"
            className="h-auto w-full"
          />
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

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="mt-14"
          >
            <h4 className="tracked font-body text-[11px] text-fg-faint">WHAT I DO</h4>
            <ul className="mt-5 flex flex-wrap gap-x-8 gap-y-2.5">
              {capabilities.map((item) => (
                <li key={item} className="font-body text-sm font-light text-fg-dim">
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
