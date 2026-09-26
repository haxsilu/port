import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// Apple-style system stack: real San Francisco on Apple devices, Inter
// (the closest freely-licensed match to SF Pro's metrics) everywhere else.
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Elias Marr — Director, Editor",
  description:
    "Elias Marr is a film director and editor working in quiet, restrained stories. Selected films, festival history, and contact.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="bg-bg text-fg min-h-screen">{children}</body>
    </html>
  );
}
