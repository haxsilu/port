import type { Metadata } from "next";
import localFont from "next/font/local";
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

export const metadata: Metadata = {
  title: "Pulindu Pansilu — Film Director, Editor, Storyteller",
  description:
    "Pulindu Pansilu is a film director, editor and storyteller from Sri Lanka, crafting cinematic stories through film, emotion and visual storytelling.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${sinhala.variable}`}>
      <body className="bg-bg text-fg min-h-screen">{children}</body>
    </html>
  );
}
