import type { Metadata } from "next";
import localFont from "next/font/local";
import { director, films, posters, siteUrl, ventures } from "@/lib/content";
import "./globals.css";

// Self-hosted rather than next/font/google. The Google Fonts fetch happens at
// build time, and when fonts.googleapis.com is unreachable the build fails
// outright — which it did. These files are the same Inter and Noto Sans
// Sinhala, vendored from @fontsource, so a deploy no longer depends on a
// third-party host being up.

// Apple-style system stack: real San Francisco on Apple devices, Inter
// (the closest freely-licensed match to SF Pro's metrics) everywhere else.
const inter = localFont({
  variable: "--font-inter",
  display: "swap",
  src: [
    { path: "./fonts/inter-400.woff2", weight: "400", style: "normal" },
    { path: "./fonts/inter-500.woff2", weight: "500", style: "normal" },
    { path: "./fonts/inter-600.woff2", weight: "600", style: "normal" },
    { path: "./fonts/inter-700.woff2", weight: "700", style: "normal" },
  ],
});

// Sinhala titles (රාලහාමී) have no coverage in SF, Inter, Helvetica or Arial,
// so without this they render as empty boxes on most Windows and Linux
// machines. Font fallback is per-glyph, so Latin type is untouched. These are
// the sinhala subset only — the latin glyphs would just duplicate Inter.
const sinhala = localFont({
  variable: "--font-sinhala",
  display: "swap",
  src: [
    { path: "./fonts/noto-sinhala-400.woff2", weight: "400", style: "normal" },
    { path: "./fonts/noto-sinhala-600.woff2", weight: "600", style: "normal" },
    { path: "./fonts/noto-sinhala-700.woff2", weight: "700", style: "normal" },
  ],
});

const TITLE = "Pulindu Pansilu — Film Director, Editor, Storyteller";
const DESCRIPTION =
  "Pulindu Pansilu is a film director, editor and storyteller from Sri Lanka, crafting cinematic stories through film, emotion and visual storytelling.";

export const metadata: Metadata = {
  // Without metadataBase, Next cannot turn the relative OG image path into
  // the absolute URL that social platforms require.
  metadataBase: new URL(siteUrl),
  title: TITLE,
  description: DESCRIPTION,
  applicationName: "Pulindu Pansilu",
  authors: [{ name: "Pulindu Pansilu", url: siteUrl }],
  creator: "Pulindu Pansilu",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "Pulindu Pansilu",
    title: TITLE,
    description: DESCRIPTION,
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Pulindu Pansilu — film director, editor and storyteller.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
};

// Structured data. The films and the award are the parts a search engine
// cannot infer from the copy, and sameAs is what ties this page to the
// social profiles as one identity.
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      url: siteUrl,
      name: "Pulindu Pansilu",
      inLanguage: "en",
      publisher: { "@id": `${siteUrl}/#pulindu` },
    },
    {
      // ProfilePage rather than WebPage: the subject of this page is a
      // person, and that is what Google is being asked to understand.
      "@type": "ProfilePage",
      "@id": `${siteUrl}/#page`,
      url: siteUrl,
      name: TITLE,
      description: DESCRIPTION,
      isPartOf: { "@id": `${siteUrl}/#website` },
      mainEntity: { "@id": `${siteUrl}/#pulindu` },
      primaryImageOfPage: `${siteUrl}/og-image.jpg`,
    },
    {
      "@type": "Person",
      "@id": `${siteUrl}/#pulindu`,
      name: "Pulindu Pansilu",
      url: siteUrl,
      image: `${siteUrl}/images/portrait.jpg`,
      jobTitle: director.roles.join(", "),
      email: `mailto:${director.email}`,
      nationality: "Sri Lankan",
      address: { "@type": "PostalAddress", addressCountry: "LK" },
      sameAs: director.socials.map((s) => s.href),
      knowsAbout: [
        "Film directing",
        "Film editing",
        "Colour grading",
        "Cinematography",
        "Post production",
      ],
      hasOccupation: {
        "@type": "Occupation",
        name: "Film Director",
        occupationLocation: { "@type": "Country", name: "Sri Lanka" },
      },
      founder: ventures.map((v) => ({ "@id": `${siteUrl}/#${v.id}` })),
      award:
        "Second Place, All-Island Short Video Competition, UN World Tourism Day 2024",
    },
    // The three ventures, so the companies resolve as entities in their own
    // right rather than as loose words in a paragraph.
    ...ventures.map((v) => ({
      "@type": "Organization",
      "@id": `${siteUrl}/#${v.id}`,
      name: v.name,
      description: v.description,
      founder: { "@id": `${siteUrl}/#pulindu` },
      url: siteUrl,
    })),
    ...films.map((film) => ({
      "@type": "Movie",
      "@id": `${siteUrl}/#film-${film.id}`,
      name: film.title,
      director: { "@id": `${siteUrl}/#pulindu` },
      ...(film.role.includes("Editor")
        ? { editor: { "@id": `${siteUrl}/#pulindu` } }
        : {}),
      ...(film.lang ? { inLanguage: film.lang } : { inLanguage: "en" }),
      ...(film.synopsis ? { description: film.synopsis } : {}),
      ...(film.released ? { datePublished: film.released } : {}),
      ...(film.poster ? { image: `${siteUrl}${film.poster}` } : {}),
      ...(film.videoId
        ? {
            // thumbnailUrl and embedUrl are what a video result needs; without
            // them a VideoObject is ignored.
            trailer: {
              "@type": "VideoObject",
              name: film.title,
              description: film.synopsis,
              thumbnailUrl: `https://i.ytimg.com/vi/${film.videoId}/maxresdefault.jpg`,
              embedUrl: `https://www.youtube.com/embed/${film.videoId}`,
              ...(film.released ? { uploadDate: film.released } : {}),
            },
          }
        : {}),
    })),
    ...posters.map((poster) => ({
      "@type": "CreativeWork",
      name: poster.title,
      creator: { "@id": `${siteUrl}/#pulindu` },
      image: `${siteUrl}${poster.src}`,
    })),
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${sinhala.variable}`}>
      <body className="bg-bg text-fg min-h-screen">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}
