"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { films } from "@/lib/content";
import { posterGradient } from "@/lib/poster";

export default function Filmography() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <section id="filmography" className="relative px-6 py-28 md:px-10 md:py-40">
      <SectionLabel index="01" title="Selected Filmography" />

      <div className="relative mt-16 border-t border-line">
        {films.map((film, i) => {
          const isActive = activeId === film.id;
          const isOpen = openId === film.id;
          return (
            <div key={film.id} className="border-b border-line">
              <button
                data-cursor="link"
                onClick={() => setOpenId(isOpen ? null : film.id)}
                onMouseEnter={() => setActiveId(film.id)}
                onMouseLeave={() => setActiveId(null)}
                className="group relative flex w-full items-baseline justify-between gap-6 py-7 text-left md:py-9"
              >
                <span className="flex items-baseline gap-4 md:gap-8">
                  <span className="tracked font-body text-xs text-fg-faint">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="font-display text-2xl font-light text-fg-dim transition-colors duration-500 group-hover:text-fg md:text-4xl">
                    {film.title}
                  </span>
                </span>
                <span className="flex shrink-0 items-baseline gap-4 font-body text-xs text-fg-faint md:gap-8 md:text-sm">
                  <span className="hidden md:inline">{film.role}</span>
                  <span>{film.year}</span>
                </span>

                {/* Poster panel reveal */}
                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      initial={{ opacity: 0, y: 16, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.97 }}
                      transition={{ duration: 0.35, ease: "easeOut" }}
                      className="pointer-events-none absolute right-24 top-1/2 z-10 hidden h-40 w-28 -translate-y-1/2 overflow-hidden md:block"
                      style={{ background: posterGradient(film.id) }}
                    >
                      <div className="absolute bottom-2 left-2 tracked font-body text-[9px] text-fg-dim/70">
                        {film.year}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="grid grid-cols-1 gap-6 pb-9 md:grid-cols-[1fr_2fr] md:gap-12">
                      <div
                        className="h-40 w-full md:h-48"
                        style={{ background: posterGradient(film.id) }}
                      />
                      <div className="flex flex-col justify-center gap-4">
                        <p className="font-body text-base font-light leading-relaxed text-fg-dim md:text-lg">
                          {film.synopsis}
                        </p>
                        <ul className="flex flex-col gap-1.5">
                          {film.festivals.map((f) => (
                            <li
                              key={f}
                              className="tracked-tight font-body text-xs text-fg-faint"
                            >
                              {f}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export function SectionLabel({ index, title }: { index: string; title: string }) {
  return (
    <div className="flex items-end justify-between gap-6 border-b border-line pb-6">
      <h2 className="font-display text-3xl font-light text-fg md:text-5xl">{title}</h2>
      <span className="tracked font-body text-xs text-fg-faint">{index}</span>
    </div>
  );
}
