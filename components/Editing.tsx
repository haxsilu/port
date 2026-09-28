"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { editCategories, editedWork, editing } from "@/lib/content";
import LiteVideo from "./LiteVideo";
import { SectionLabel } from "./Filmography";

export default function Editing() {
  return (
    <section id="editing" className="relative px-6 py-28 md:px-10 md:py-40">
      <SectionLabel index="03" title="Editing &amp; Post" />

      <motion.p
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-10%" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="text-balance mt-8 max-w-2xl font-body text-base font-light leading-relaxed text-fg-dim md:text-lg"
      >
        {editing.intro}
      </motion.p>

      {editing.reelVideoId && (
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-8%" }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="relative mt-14 aspect-video w-full overflow-hidden bg-black"
        >
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${editing.reelVideoId}?rel=0&modestbranding=1`}
            title="Editing reel"
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 h-full w-full"
          />
        </motion.div>
      )}

      {/* Photo left, the craft beside it — the portrait frame left a column of
          dead space when the text sat underneath it. */}
      <div className="mt-14 grid grid-cols-1 gap-10 md:grid-cols-[minmax(0,400px)_1fr] md:gap-16">
        <div>
        {editing.stills.map((still, i) => (
          <motion.figure
            key={still.src}
            initial={{ opacity: 0, y: 26 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-8%" }}
            transition={{ duration: 0.95, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full overflow-hidden bg-black"
          >
            <Image
              src={still.src}
              alt={still.alt}
              width={still.width}
              height={still.height}
              sizes="(max-width: 768px) 100vw, 400px"
              className="h-auto w-full"
            />
          </motion.figure>
        ))}
        </div>

        <div className="md:pt-1">
        <ul className="flex flex-col">
          {editing.disciplines.map((d, i) => (
            <motion.li
              key={d.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ duration: 0.8, delay: i * 0.08, ease: "easeOut" }}
              className="grid grid-cols-1 gap-2 border-t border-line py-7 first:border-t-0 first:pt-0 md:grid-cols-[minmax(0,160px)_1fr] md:gap-8"
            >
              <h4 className="font-display text-lg font-semibold tracking-tight text-fg md:text-xl">
                {d.name}
              </h4>
              <p className="max-w-md font-body text-sm font-light leading-relaxed text-fg-dim md:text-base">
                {d.description}
              </p>
            </motion.li>
          ))}
        </ul>

        </div>
      </div>

      <div className="mt-16">
        <h3 className="tracked font-body text-[11px] text-fg-faint">SELECTED EDITS</h3>

        {editCategories.map((cat) => {
          const items = editedWork.filter((w) => w.category === cat.id);
          if (!items.length) return null;
          return (
            <div key={cat.id} className="mt-10 border-t border-line pt-8">
              <h4 className="font-display text-lg font-semibold tracking-tight text-fg md:text-xl">
                {cat.label}
              </h4>
              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 md:gap-5">
                {items.map((w, i) => (
                  <motion.figure
                    key={w.id}
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-8%" }}
                    transition={{ duration: 0.9, delay: (i % 2) * 0.08, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <LiteVideo
                      videoId={w.videoId}
                      src={w.src}
                      thumb={w.thumb}
                      title={w.title}
                      square={w.square}
                    />
                    <figcaption className="mt-3 flex items-baseline justify-between gap-4">
                      <span className="font-display text-base font-semibold tracking-tight text-fg">
                        {w.title}
                      </span>
                      <span className="font-body text-xs text-fg-faint">{w.format}</span>
                    </figcaption>
                  </motion.figure>
                ))}
              </div>
            </div>
          );
        })}
      </div>

    </section>
  );
}
