"use client";

import { useState } from "react";
import IntroSequence from "@/components/IntroSequence";
import GrainOverlay from "@/components/GrainOverlay";
import CustomCursor from "@/components/CustomCursor";
import Nav from "@/components/Nav";
import ScrollProgress from "@/components/ScrollProgress";
import Hero from "@/components/Hero";
import Filmography from "@/components/Filmography";
import FeaturedWork from "@/components/FeaturedWork";
import About from "@/components/About";
import AwardsTimeline from "@/components/AwardsTimeline";
import Contact from "@/components/Contact";

export default function Home() {
  const [introDone, setIntroDone] = useState(false);

  return (
    <>
      <IntroSequence onComplete={() => setIntroDone(true)} />
      <GrainOverlay />
      <CustomCursor />
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
