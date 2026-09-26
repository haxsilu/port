"use client";

import Image from "next/image";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { behindTheScenes, films, filmographyIntro, filmStills } from "@/lib/content";
import { posterGradient } from "@/lib/poster";

export default function Filmography() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <section id="filmography" className="relative px-6 py-28 md:px-10 md:py-40">
      <SectionLabel index="01" title="Selected Filmography" />

      <motion.p
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-10%" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="text-balance mt-8 max-w-xl font-body text-base font-light leading-relaxed text-fg-dim"
      >
        {filmographyIntro}
      </motion.p>

      <div className="relative mt-14 border-t border-line">
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
                  <span
                    lang={film.lang}
                    className="font-display text-2xl font-semibold tracking-tight text-fg-dim transition-colors duration-500 group-hover:text-fg md:text-4xl"
                  >
                    {film.title}
                  </span>
                </span>
                <span className="flex shrink-0 items-baseline gap-4 font-body text-xs text-fg-faint md:gap-8 md:text-sm">
                  <span className="hidden md:inline">{film.role}</span>
                  <span className="flex items-baseline gap-2">
                    {film.videoId && (
                      <span
                        aria-hidden="true"
                        className="text-[0.6em] leading-none text-fg-dim transition-colors duration-500 group-hover:text-fg"
                      >
                        &#9654;
                      </span>
                    )}
                    {film.format}
                  </span>
                </span>

                {/* Poster panel reveal */}
                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      initial={{ opacity: 0, y: 16, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.97 }}
                      transition={{ duration: 0.35, ease: "easeOut" }}
                      // 16:9, not a portrait poster: these frames carry the
                      // film's title across the middle, and a portrait crop
                      // would cut the words off at both ends.
                      className="pointer-events-none absolute right-24 top-1/2 z-10 hidden aspect-video w-56 -translate-y-1/2 overflow-hidden bg-black md:block"
                      style={
                        film.poster ? undefined : { background: posterGradient(film.id) }
                      }
                    >
                      {film.poster && (
                        <Image
                          src={film.poster}
                          alt=""
                          fill
                          sizes="224px"
                          className="object-cover"
                        />
                      )}
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
                    <div className="grid grid-cols-1 gap-6 pb-9 md:grid-cols-[2fr_1fr] md:gap-12">
                      {film.videoId ? (
                        <div className="relative aspect-video w-full overflow-hidden bg-black">
                          <iframe
                            // Mounted only while the row is open, so four
                            // players never load at once.
                            src={`https://www.youtube-nocookie.com/embed/${film.videoId}?rel=0&modestbranding=1`}
                            title={film.title}
                            loading="lazy"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            className="absolute inset-0 h-full w-full"
                          />
                        </div>
                      ) : (
                        <div
                          className="h-40 w-full md:h-48"
                          style={{ background: posterGradient(film.id) }}
                        />
                      )}
                      <div className="flex flex-col justify-center gap-4">
                        <p className="font-body text-base font-light leading-relaxed text-fg-dim md:text-lg">
                          {film.synopsis}
                        </p>
                        <p className="tracked-tight font-body text-xs text-fg-faint md:hidden">
                          {film.role}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    <div className="mt-28 md:mt-40">
      <span className="tracked font-body text-xs text-fg-faint">STILLS</span>
      {/* Two columns rather than a fixed grid: these frames are 16:9, 3:2 and
          4:3, and a common cell would crop them unevenly. */}
      <div className="mt-6 gap-3 md:columns-2 md:gap-4 [&>*]:mb-3 md:[&>*]:mb-4">
        {[...filmStills, ...behindTheScenes.filter((b) => b.orientation === "portrait")].map((still) => (
          <figure
            key={still.src}
            className="relative block w-full break-inside-avoid overflow-hidden bg-black"
          >
            <Image
              src={still.src}
              alt={still.alt}
              width={still.width ?? (still.orientation === "portrait" ? 1333 : 1280)}
              height={still.height ?? (still.orientation === "portrait" ? 2000 : 720)}
              sizes="(max-width: 768px) 100vw, 45vw"
              className="h-auto w-full"
            />
          </figure>
        ))}
      </div>
    </div>
    </section>
  );
}

export function SectionLabel({ index, title }: { index: string; title: string }) {
  return (
    <div className="flex items-end justify-between gap-6 border-b border-line pb-6">
      <h2 className="font-display text-3xl font-semibold tracking-tight text-fg md:text-5xl">{title}</h2>
      <span className="tracked font-body text-xs text-fg-faint">{index}</span>
    </div>
  );
}
