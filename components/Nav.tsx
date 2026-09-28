"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const LINKS = [
  { label: "Films", href: "#filmography" },
  { label: "Work", href: "#work" },
  { label: "Editing", href: "#editing" },
  { label: "About", href: "#about" },
  { label: "Behind the Lens", href: "#behind-the-lens" },
  { label: "Spectrum Verse", href: "#spectrum-verse" },
  { label: "Contact", href: "#contact" },
];

export default function Nav({ visible }: { visible: boolean }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Only claim the scroll lock while the menu is actually open, so this
  // doesn't stomp on the intro sequence's own lock during the reveal.
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const go = (href: string) => {
    setOpen(false);
    document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <motion.header
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : -12 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 backdrop-blur-md transition-[padding,border-color,background-color] duration-500 md:px-10 ${
          scrolled ? "border-b border-line bg-bg/70 py-4" : "border-b border-transparent bg-transparent py-7"
        }`}
      >
        <button
          data-cursor="link"
          onClick={() => go("#top")}
          className="font-display text-sm font-semibold tracked-tight text-fg"
        >
          PULINDU PANSILU
        </button>

        <button
          data-cursor="link"
          onClick={() => setOpen((v) => !v)}
          className="tracked font-body text-[11px] text-fg"
        >
          {open ? "CLOSE" : "MENU"}
        </button>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ clipPath: "inset(0 0 100% 0)" }}
            animate={{ clipPath: "inset(0 0 0% 0)" }}
            exit={{ clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: 0.6, ease: [0.76, 0, 0.24, 1] }}
            className="fixed inset-0 z-40 flex flex-col items-center justify-center gap-6 bg-bg"
          >
            {LINKS.map((link, i) => (
              <motion.button
                key={link.href}
                data-cursor="link"
                onClick={() => go(link.href)}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + i * 0.06, duration: 0.6, ease: "easeOut" }}
                className="font-display text-4xl md:text-6xl font-semibold tracking-tight text-fg-dim transition-colors duration-300 hover:text-fg"
              >
                {link.label}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
