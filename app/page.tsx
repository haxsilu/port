"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import GlobeIntro from "@/components/GlobeIntro";
import GrainOverlay from "@/components/GrainOverlay";
import Nav from "@/components/Nav";
import ScrollProgress from "@/components/ScrollProgress";
import Hero from "@/components/Hero";
import Filmography from "@/components/Filmography";
import FeaturedWork from "@/components/FeaturedWork";
import About from "@/components/About";
import AwardsTimeline from "@/components/AwardsTimeline";
import Contact from "@/components/Contact";

const CustomCursor = dynamic(() => import("@/components/CustomCursor"), {
  ssr: false,
});

export default function Home() {
  const [introDone, setIntroDone] = useState(false);

  return (
    <>
      <GlobeIntro onComplete={() => setIntroDone(true)} />
      <GrainOverlay />
      {introDone && <CustomCursor />}
      <Nav visible={introDone} />
      <ScrollProgress visible={introDone} />

      <main>
        <Hero start={introDone} />
        <Filmography />
        <FeaturedWork />
        <About />
        <AwardsTimeline />
        <Contact />
      </main>
    </>
  );
}
