"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { instagram } from "@/lib/content";

export default function Instagram() {
  // An empty grid is worse than no grid, so the whole block stands down
  // until there are posts to show.
  if (instagram.posts.length === 0) return null;

  return (
    <section id="instagram" className="relative px-6 pb-8 pt-28 md:px-10 md:pt-40">
      <div className="flex items-baseline justify-between gap-6">
        <span className="tracked font-body text-xs text-fg-faint">INSTAGRAM</span>
        <a
          data-cursor="link"
          href={instagram.profileUrl}
          target="_blank"
          rel="noreferrer noopener"
          className="tracked font-body text-xs text-fg-faint transition-colors duration-300 hover:text-fg"
        >
          {instagram.handle}
        </a>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4">
        {instagram.posts.map((post, i) => (
          <motion.a
            key={post.src}
            data-cursor="link"
            href={post.href ?? instagram.profileUrl}
            target="_blank"
            rel="noreferrer noopener"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 0.7, delay: i * 0.05, ease: "easeOut" }}
            // Square, because that is the shape the grid is read in.
            className="group relative block aspect-square w-full overflow-hidden bg-black"
          >
            <Image
              src={post.src}
              alt={post.alt}
              width={1080}
              height={1080}
              sizes="(max-width: 640px) 50vw, 30vw"
              className="h-full w-full object-cover transition-opacity duration-500 group-hover:opacity-75"
            />
          </motion.a>
        ))}
      </div>

      <a
        data-cursor="link"
        href={instagram.profileUrl}
        target="_blank"
        rel="noreferrer noopener"
        className="tracked mt-6 inline-block font-body text-xs text-fg-dim transition-colors duration-300 hover:text-fg"
      >
        {instagram.cta} &rarr;
      </a>
    </section>
  );
}
