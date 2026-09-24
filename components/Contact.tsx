"use client";

import { motion } from "framer-motion";
import { director } from "@/lib/content";

export default function Contact() {
  return (
    <section
      id="contact"
      className="relative flex min-h-[80vh] flex-col items-center justify-center px-6 py-28 text-center md:px-10"
    >
      <motion.span
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="tracked font-body text-xs text-fg-faint"
      >
        05 &mdash; CONTACT
      </motion.span>

      <motion.a
        data-cursor="link"
        href={`mailto:${director.email}`}
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.9, delay: 0.1, ease: "easeOut" }}
        className="group relative mt-8 font-display text-3xl font-light text-fg sm:text-5xl md:text-6xl"
      >
        {director.email}
        <span className="absolute -bottom-2 left-0 h-px w-full origin-left scale-x-0 bg-fg transition-transform duration-500 ease-out group-hover:scale-x-100" />
      </motion.a>

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.3 }}
        className="mt-16 flex flex-wrap items-center justify-center gap-x-8 gap-y-3"
      >
        {director.socials.map((s) => (
          <a
            key={s.label}
            data-cursor="link"
            href={s.href}
            target="_blank"
            rel="noreferrer noopener"
            className="tracked font-body text-xs text-fg-faint transition-colors duration-300 hover:text-fg"
          >
            {s.label}
          </a>
        ))}
      </motion.div>

      <p className="mt-24 font-body text-[11px] text-fg-faint">
        &copy; {new Date().getFullYear()} {director.name}. All rights reserved.
      </p>
    </section>
  );
}
