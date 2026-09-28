# Film Director Portfolio

A cinematic, black-and-white portfolio for a film director/editor. Built with
Next.js (App Router), Tailwind CSS v4, and Framer Motion.

## Running it

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The intro sequence plays
on **every** load: Earth hangs in the void, and clicking flies the camera in
on one continuous zoom that ends over Sri Lanka's Western Province before
handing over to the site. Click **SKIP** to jump straight in.

## Structure

- `lib/content.ts` — **all site copy and data lives here**: the director's
  name, roles, manifesto, film list, festival selections, featured projects,
  awards timeline, bio, email, and social links. Edit this one file to put in
  the real person's content.
- `components/GlobeIntro.tsx` — the opening journey, in three.js: a daylit
  Google-Earth-style globe the camera flies into. A custom shader keeps the
  whole sphere lit (the sun only shapes it, never darkens it) plus a fresnel
  atmospheric limb; clouds sit on a second sphere and thin out on descent.
  Silent by design. Respects `prefers-reduced-motion`, and opens the site
  directly if WebGL is unavailable.
  - Clarity comes from three levels of detail cross-faded on descent, the
    same idea Google Earth uses: the global 8K map (23 px/degree) → a NASA
    tile for Sri Lanka (240 px/degree) → Esri imagery for the Western
    Province (~3150 px/degree, roughly 130× the global map).
  - The province tile is a different source to the base map, so it is **not**
    simply blended over it — a flat correction always leaves a visible
    rectangle. The patch shader does a multiplicative detail transfer: it
    samples the base map at the same lat/lon and keeps its colour, borrowing
    only the tile's *relative* structure (`hi / lo`). Edges are feathered.
  - The flight is **one continuous zoom**, not a series of legs: the planet
    turns once to `WESTERN_PROVINCE` and the camera runs a single geometric
    interpolation from `Z_START` to `Z_END`. The easing
    (`e * (0.35 + 0.65 * e)`) only ever accelerates — deliberately *not* an
    ease-in-out. Anything that decelerates to a stop and starts again, such
    as an arrival hold or a separate final push, reads as a second zoom.
  - The lock uses a full orientation basis rather than a shortest-arc
    rotation, which is what keeps north pointing up — without it the island
    arrives on its side.
  - A radial zoom-blur pass rides the end of that same curve and the site
    fades in at its peak. The scene renders to a `WebGLRenderTarget` and a
    fullscreen quad does the blur.
  - Imagery keeps its natural colour — no saturation or contrast grading,
    only a flat exposure lift on the province tile.
  - **Warm-up matters here.** Uploading the textures and linking the shaders
    costs close to two seconds. Left lazy it lands on the frame the viewer
    clicks; done all at once it freezes that frame instead. So it runs one
    step per frame during the idle orbit (`warmQueue`), the prompt only
    appears once it finishes (`ready`), and earlier clicks are ignored. The
    province tile also skips mipmaps — it is only ever seen magnified.

- `components/GrainOverlay.tsx` — the site's filmic surface: a vignette with
  a soft top light, fine scan-lines, and animated 35mm-style grain. The grain
  is `mix-blend-mode: screen`, not `overlay` — overlay leaves near-black
  untouched, so on this palette it would be invisible. Tune the strength via
  `.grain-layer` / `.vignette-layer` / `.scanline-layer` in `app/globals.css`.
- `components/Hero.tsx`, `Filmography.tsx`, `FeaturedWork.tsx`, `Editing.tsx`,
  `About.tsx`, `BehindTheLens.tsx`, `SpectrumVerse.tsx`, `Contact.tsx` — the
  page sections, in the order they're rendered from `app/page.tsx`. The
  section numbers (`01`–`07`) are written into each component, so reordering
  the page means renumbering them by hand.
- `SpectrumVerse.tsx` holds all three ventures together. Spectrum Connect is
  a platform rather than a production house; the `role` / `status` line under
  each name is what keeps that distinction readable, which is the job the
  old separate "Platform" section used to do.
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
   `--line`) live in `app/globals.css`. Typography follows Apple's approach:
   the `-apple-system`/`BlinkMacSystemFont` stack renders actual San
   Francisco on Apple devices, falling back to Inter (loaded in
   `app/layout.tsx`) everywhere else — with bold, tight-tracked headlines
   over lighter body copy.

## Notes

- The palette is intentionally fixed to black/white regardless of system
  light/dark mode — that's the design, not a bug.
- The custom cursor and mouse-parallax light in the hero only activate on
  fine-pointer (mouse) devices; touch devices get the default cursor and no
  parallax.
