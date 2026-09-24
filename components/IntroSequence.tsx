"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { usePrefersReducedMotion } from "@/lib/useReducedMotion";

type Phase = "pending" | "dormant" | "igniting" | "bursting" | "fading" | "removed";

const SESSION_KEY = "em-intro-seen";

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
};

export default function IntroSequence({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<Phase>("pending");
  const [showPrompt, setShowPrompt] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const rafRef = useRef<number | null>(null);
  const reducedMotion = usePrefersReducedMotion();
  const finished = useRef(false);

  const finish = useCallback(() => {
    if (finished.current) return;
    finished.current = true;
    try {
      sessionStorage.setItem(SESSION_KEY, "1");
    } catch {}
    onComplete();
  }, [onComplete]);

  useEffect(() => {
    let alreadySeen = false;
    try {
      alreadySeen = Boolean(sessionStorage.getItem(SESSION_KEY));
    } catch {}

    if (alreadySeen || reducedMotion) {
      setPhase("removed");
      finish();
      return;
    }
    const t = setTimeout(() => setPhase("dormant"), 500);
    return () => clearTimeout(t);
  }, [reducedMotion, finish]);

  useEffect(() => {
    if (phase !== "dormant") return;
    const t = setTimeout(() => setShowPrompt(true), 1700);
    return () => clearTimeout(t);
  }, [phase]);

  const playSound = useCallback(() => {
    if (!soundOn) return;
    try {
      const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new Ctx();
      audioCtxRef.current = ctx;
      const now = ctx.currentTime;

      // Rising drone as the light grows
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(70, now);
      osc.frequency.exponentialRampToValueAtTime(210, now + 0.75);
      oscGain.gain.setValueAtTime(0.0001, now);
      oscGain.gain.exponentialRampToValueAtTime(0.045, now + 0.65);
      oscGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.4);
      osc.connect(oscGain).connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 1.5);

      // Soft noise burst at the moment of expansion
      const bufferSize = ctx.sampleRate * 1.2;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const bandpass = ctx.createBiquadFilter();
      bandpass.type = "bandpass";
      bandpass.frequency.value = 1200;
      bandpass.Q.value = 0.6;
      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.0001, now + 0.7);
      noiseGain.gain.exponentialRampToValueAtTime(0.05, now + 0.85);
      noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.9);
      noise.connect(bandpass).connect(noiseGain).connect(ctx.destination);
      noise.start(now + 0.7);
      noise.stop(now + 2);
    } catch {
      // Web Audio unsupported or blocked — silently continue without sound.
    }
  }, [soundOn]);

  const begin = () => {
    if (phase !== "dormant") return;
    playSound();
    setPhase("igniting");
    setTimeout(() => setPhase("bursting"), 700);
  };

  // Particle burst on canvas
  useEffect(() => {
    if (phase !== "bursting") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    const count = 140;
    const particles: Particle[] = Array.from({ length: count }, () => {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 7;
      const maxLife = 50 + Math.random() * 40;
      return {
        x: cx,
        y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: maxLife,
        maxLife,
        size: 0.6 + Math.random() * 1.8,
      };
    });

    let running = true;
    const tick = () => {
      if (!running) return;
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.972;
        p.vy *= 0.972;
        p.life -= 1;
        const t = Math.max(p.life / p.maxLife, 0);
        if (t <= 0) continue;
        ctx.beginPath();
        ctx.fillStyle = `rgba(244, 243, 239, ${t * 0.9})`;
        ctx.shadowColor = "rgba(244, 243, 239, 0.8)";
        ctx.shadowBlur = 4;
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    const stop = setTimeout(() => setPhase("fading"), 950);
    return () => {
      running = false;
      clearTimeout(stop);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [phase]);

  useEffect(() => {
    if (phase !== "fading") return;
    finish();
    const t = setTimeout(() => setPhase("removed"), 900);
    return () => clearTimeout(t);
  }, [phase, finish]);

  const skip = () => {
    setPhase("fading");
  };

  if (phase === "removed" || phase === "pending") return null;

  return (
    <motion.div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-bg"
      style={{ pointerEvents: phase === "fading" ? "none" : "auto" }}
      animate={{ opacity: phase === "fading" ? 0 : 1 }}
      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      onClick={begin}
      role="button"
      aria-label="Enter the site"
    >
      <canvas ref={canvasRef} className="absolute inset-0" aria-hidden="true" />

      {/* Bloom flash at ignition peak */}
      <motion.div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at center, rgba(244,243,239,0.9) 0%, rgba(244,243,239,0) 60%)",
        }}
        initial={{ opacity: 0 }}
        animate={{
          opacity: phase === "igniting" ? [0, 0, 0.55] : phase === "bursting" ? 0 : 0,
        }}
        transition={{ duration: 0.7, times: [0, 0.7, 1] }}
      />

      {/* The single point of light */}
      {(phase === "dormant" || phase === "igniting") && (
        <motion.div
          className="absolute rounded-full bg-fg"
          initial={{ width: 5, height: 5, opacity: 0 }}
          animate={
            phase === "dormant"
              ? {
                  width: [5, 6, 5],
                  height: [5, 6, 5],
                  opacity: [0.55, 1, 0.55],
                }
              : { width: 420, height: 420, opacity: [1, 1, 0] }
          }
          transition={
            phase === "dormant"
              ? { duration: 2.4, repeat: Infinity, ease: "easeInOut" }
              : { duration: 0.7, ease: [0.6, 0, 0.9, 0.4] }
          }
          style={{
            boxShadow:
              phase === "igniting"
                ? "0 0 120px 40px rgba(244,243,239,0.5)"
                : "0 0 18px 2px rgba(244,243,239,0.35)",
          }}
        />
      )}

      {/* Enter prompt */}
      {phase === "dormant" && (
        <motion.div
          className="absolute bottom-[22%] flex flex-col items-center gap-4"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: showPrompt ? 1 : 0, y: showPrompt ? 0 : 8 }}
          transition={{ duration: 1.1, ease: "easeOut" }}
        >
          <span className="tracked text-[11px] text-fg-dim font-body">ENTER</span>
          <span className="h-8 w-px bg-line-strong" />
        </motion.div>
      )}

      {/* Sound toggle */}
      {phase === "dormant" && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setSoundOn((s) => !s);
          }}
          className="tracked absolute bottom-8 left-8 text-[10px] text-fg-faint font-body transition-colors hover:text-fg-dim"
        >
          SOUND {soundOn ? "ON" : "OFF"}
        </button>
      )}

      {/* Skip */}
      {(phase === "dormant" || phase === "igniting") && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            skip();
          }}
          className="tracked absolute bottom-8 right-8 text-[10px] text-fg-faint font-body transition-colors hover:text-fg-dim"
        >
          SKIP
        </button>
      )}
    </motion.div>
  );
}
