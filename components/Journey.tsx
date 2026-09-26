"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { milestones } from "@/lib/content";
import { SectionLabel } from "./Filmography";

export default function Journey() {
  return (
    <section id="journey" className="relative px-6 py-28 md:px-10 md:py-40">
      <SectionLabel index="05" title="The Journey" />

      <div className="relative mt-16 max-w-3xl">
        <div className="absolute left-[3.2rem] top-0 h-full w-px bg-line md:left-[4.5rem]" />
        <ul className="flex flex-col">
          {milestones.map((award, i) => (
            <motion.li
              key={`${award.year}-${award.title}`}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ duration: 0.7, delay: i * 0.05, ease: "easeOut" }}
              className="relative grid grid-cols-[3.2rem_1fr] items-baseline gap-6 py-6 md:grid-cols-[4.5rem_1fr] md:gap-10 md:py-7"
            >
              <span className="font-body text-xs text-fg-faint md:text-sm">
                {award.year}
              </span>
              <span className="absolute left-[3.2rem] top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-fg md:left-[4.5rem]" />
              <div className="pl-6 md:pl-8">
                <h4 className="font-display text-lg font-semibold tracking-tight text-fg md:text-2xl">
                  {award.title}
                </h4>
                <p className="mt-1 font-body text-sm font-light text-fg-dim">
                  {award.detail}
                </p>
                {award.image && (
                  <figure className="mt-6 max-w-lg">
                    <div className="relative w-full overflow-hidden bg-black">
                      <Image
                        src={award.image}
                        alt={award.imageAlt ?? ""}
                        width={award.imageWidth ?? 2000}
                        height={award.imageHeight ?? 1333}
                        sizes="(max-width: 768px) 100vw, 32rem"
                        className="h-auto w-full"
                      />
                    </div>
                    {award.imageCredit && (
                      <figcaption className="tracked mt-3 font-body text-[10px] text-fg-faint">
                        {award.imageCredit}
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
