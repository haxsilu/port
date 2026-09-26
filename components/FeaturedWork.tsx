"use client";

import { motion } from "framer-motion";
import { featuredProjects } from "@/lib/content";
import { posterGradient } from "@/lib/poster";
import { SectionLabel } from "./Filmography";

export default function FeaturedWork() {
  return (
    <section id="work" className="relative px-6 py-28 md:px-10 md:py-40">
      <SectionLabel index="02" title="Featured Work" />

      <div className="mt-20 flex flex-col gap-28 md:gap-40">
        {featuredProjects.map((project, i) => (
          <motion.article
            key={project.id}
            initial={{ opacity: 0, y: 48 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-15%" }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className={`grid grid-cols-1 items-center gap-10 md:grid-cols-2 md:gap-16 ${
              i % 2 === 1 ? "md:[&>*:first-child]:order-2" : ""
            }`}
          >
            <Frame id={project.id} embedUrl={project.embedUrl} title={project.title} />

            <div>
              <span className="tracked font-body text-xs text-fg-faint">{project.year}</span>
              <h3 className="font-display mt-4 text-4xl font-semibold tracking-tight text-fg md:text-5xl">
                {project.title}
              </h3>
              <p className="text-balance mt-6 max-w-md font-body text-base font-light leading-relaxed text-fg-dim">
                {project.description}
              </p>
            </div>
          </motion.article>
        ))}
      </div>

      <BehindTheScenesStrip />
    </section>
  );
}

function Frame({
  id,
  embedUrl,
  title,
}: {
  id: string;
  embedUrl?: string;
  title: string;
}) {
  if (embedUrl) {
    return (
      <div className="relative aspect-video w-full overflow-hidden bg-black">
        <iframe
          src={embedUrl}
          title={title}
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          className="h-full w-full"
        />
      </div>
    );
  }

  return (
    <div
      data-cursor="link"
      className="group relative aspect-video w-full cursor-pointer overflow-hidden"
      style={{ background: posterGradient(id) }}
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10" />
      <div className="absolute left-4 top-4 tracked font-body text-[9px] text-fg-dim/60">
        16:9 &middot; REEL
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full border border-fg/40 transition-transform duration-500 group-hover:scale-110">
          <div
            className="ml-1 h-0 w-0"
            style={{
              borderTop: "8px solid transparent",
              borderBottom: "8px solid transparent",
              borderLeft: "12px solid var(--fg)",
              opacity: 0.85,
            }}
          />
        </div>
      </div>
      <div className="absolute bottom-4 right-4 tracked font-body text-[9px] text-fg-dim/60">
        TRAILER
      </div>
    </div>
  );
}

function BehindTheScenesStrip() {
  const ids = ["bts-01", "bts-02", "bts-03", "bts-04"];
  return (
    <div className="mt-28 md:mt-40">
      <span className="tracked font-body text-xs text-fg-faint">BEHIND THE SCENES</span>
      <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        {ids.map((id) => (
          <div
            key={id}
            className="aspect-[4/5] w-full"
            style={{ background: posterGradient(id) }}
          />
        ))}
      </div>
    </div>
  );
}
