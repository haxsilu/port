"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { behindTheLensIntro, milestones } from "@/lib/content";
import { SectionLabel } from "./Filmography";

export default function BehindTheLens() {
  return (
    <section id="behind-the-lens" className="relative px-6 py-28 md:px-10 md:py-40">
      <SectionLabel index="05" title="Behind the Lens" />

      <motion.p
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-10%" }}
        transition={{ duration: 0.85, ease: "easeOut" }}
        className="text-balance mt-8 max-w-xl font-body text-base font-light leading-relaxed text-fg-dim md:text-lg"
      >
        {behindTheLensIntro}
      </motion.p>

      <div className="relative mt-16 max-w-3xl">
        <div className="absolute left-[4.2rem] top-0 h-full w-px bg-line md:left-[6rem]" />
        <ul className="flex flex-col">
          {milestones.map((m, i) => (
            <motion.li
              key={`${m.year}-${m.title}`}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ duration: 0.7, delay: i * 0.05, ease: "easeOut" }}
              className="relative grid grid-cols-[4.2rem_1fr] items-baseline gap-6 py-6 md:grid-cols-[6rem_1fr] md:gap-10 md:py-7"
            >
              <span className="font-body text-xs text-fg-faint md:text-sm">
                {m.year}
              </span>
              <span className="absolute left-[4.2rem] top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-fg md:left-[6rem]" />
              <div className="pl-6 md:pl-8">
                <h4 className="font-display text-lg font-semibold tracking-tight text-fg md:text-2xl">
                  {m.title}
                </h4>
                <p className="mt-1 font-body text-sm font-light text-fg-dim">
                  {m.detail}
                </p>
                {m.image && (
                  <figure className="mt-6 max-w-lg">
                    <div className="relative w-full overflow-hidden bg-black">
                      <Image
                        src={m.image}
                        alt={m.imageAlt ?? ""}
                        width={m.imageWidth ?? 2000}
                        height={m.imageHeight ?? 1333}
                        sizes="(max-width: 768px) 100vw, 32rem"
                        className="h-auto w-full"
                      />
                    </div>
                    {m.imageCredit && (
                      <figcaption className="tracked mt-3 font-body text-[10px] text-fg-faint">
                        {m.imageCredit}
                      </figcaption>
                    )}
                  </figure>
                )}
              </div>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
}
