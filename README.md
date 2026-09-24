# Film Director Portfolio

A cinematic, black-and-white portfolio for a film director/editor. Built with
Next.js (App Router), Tailwind CSS v4, and Framer Motion.

## Running it

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The intro sequence
(dark void → light → particle burst → reveal) plays once per browser session;
clear session storage or open an incognito window to see it again, or click
**SKIP** during the intro.

## Structure

- `lib/content.ts` — **all site copy and data lives here**: the director's
  name, roles, manifesto, film list, festival selections, featured projects,
  awards timeline, bio, email, and social links. Edit this one file to put in
  the real person's content.
- `components/IntroSequence.tsx` — the opening "birth of a universe" sequence:
  a breathing point of light, a click-to-enter ritual, a canvas particle
  burst, and a synthesized (Web Audio, no audio files needed) rising tone.
  Respects `prefers-reduced-motion` (skips straight to the site) and only
  plays once per session.
- `components/Hero.tsx`, `Filmography.tsx`, `FeaturedWork.tsx`, `About.tsx`,
  `AwardsTimeline.tsx`, `Contact.tsx` — the page sections, in the order
  they're rendered from `app/page.tsx`.
- `lib/poster.ts` — generates the grayscale placeholder "posters"/frames used
  for films, trailers, and behind-the-scenes imagery until real artwork is
  available.

## Swapping in real content

1. **Copy**: edit `lib/content.ts`.
2. **Posters / stills / portrait**: the placeholders in `Filmography.tsx`,
   `FeaturedWork.tsx`, and `About.tsx` are plain `<div>`s with a generated
   gradient background. Replace them with `next/image` once you have real
   photography — the surrounding layout (hover reveal, aspect ratios) doesn't
   need to change.
3. **Trailers**: give a `featuredProjects` entry in `lib/content.ts` an
   `embedUrl` (a Vimeo or YouTube embed URL) and `FeaturedWork.tsx` will
   render an `<iframe>` instead of the placeholder frame automatically.
4. **Fonts/palette**: design tokens (`--bg`, `--fg`, `--fg-dim`, `--fg-faint`,
   `--line`) live in `app/globals.css`; the two typefaces (Fraunces for
   display, Inter for body) are loaded in `app/layout.tsx`.

## Notes

- The palette is intentionally fixed to black/white regardless of system
  light/dark mode — that's the design, not a bug.
- The custom cursor and mouse-parallax light in the hero only activate on
  fine-pointer (mouse) devices; touch devices get the default cursor and no
  parallax.
