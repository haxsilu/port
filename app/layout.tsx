import type { Metadata } from "next";
import { Inter, Noto_Sans_Sinhala } from "next/font/google";
import "./globals.css";

// Apple-style system stack: real San Francisco on Apple devices, Inter
// (the closest freely-licensed match to SF Pro's metrics) everywhere else.
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

// Sinhala titles (රාලහාමී) have no coverage in SF, Inter, Helvetica or Arial,
// so without this they render as empty boxes on most Windows and Linux
// machines. Font fallback is per-glyph, so Latin type is untouched.
const sinhala = Noto_Sans_Sinhala({
  variable: "--font-sinhala",
  subsets: ["sinhala"],
  weight: ["400", "600", "700"],
  display: "swap",
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
