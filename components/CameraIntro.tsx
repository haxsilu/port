"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import * as THREE from "three";
import { usePrefersReducedMotion } from "@/lib/useReducedMotion";

type Phase = "idle" | "running" | "fading" | "removed";

// Beats, in seconds from the moment the viewer commits. One continuous move:
// emerge → orbit → macro on the lens → through the glass → black → reveal.
const T_EMERGE = 3.2;
const T_ORBIT = 7.6;
const T_MACRO = 9.5;
const T_TUNNEL = 12.0;
const T_BLACK = 12.22;
const T_REVEAL = 13.7;
const T_PUSH = 15.0;

const clamp01 = (v: number) => Math.min(Math.max(v, 0), 1);
const smooth = (t: number) => t * t * (3 - 2 * t);
const easeIn = (t: number) => t * t * t;
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
const span = (t: number, a: number, b: number) => clamp01((t - a) / (b - a));

// A dark studio wrapped around the scene: metal needs something to reflect or
// it renders as flat black. Two soft bars read as overheads, which is what
// gives the body its controlled highlights.
function studioEnvironment() {
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 256;
  const x = c.getContext("2d")!;
  x.fillStyle = "#050506";
  x.fillRect(0, 0, 512, 256);
  const bar = (cx: number, cy: number, w: number, h: number, a: number) => {
    const g = x.createRadialGradient(cx, cy, 0, cx, cy, Math.max(w, h));
    g.addColorStop(0, `rgba(255,255,255,${a})`);
    g.addColorStop(1, "rgba(255,255,255,0)");
    x.fillStyle = g;
    x.fillRect(cx - w, cy - h, w * 2, h * 2);
  };
  bar(140, 70, 150, 60, 0.95);
  bar(380, 96, 120, 40, 0.5);
  bar(280, 210, 200, 50, 0.16);
  const tex = new THREE.CanvasTexture(c);
  tex.mapping = THREE.EquirectangularReflectionMapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function softSprite(inner: string, outer: string) {
  const s = 128;
  const c = document.createElement("canvas");
  c.width = s;
  c.height = s;
  const x = c.getContext("2d")!;
  const g = x.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
  g.addColorStop(0, inner);
  g.addColorStop(1, outer);
  x.fillStyle = g;
  x.fillRect(0, 0, s, s);
  return new THREE.CanvasTexture(c);
}

export default function CameraIntro({ onComplete }: { onComplete: () => void }) {
  const reducedMotion = usePrefersReducedMotion();
  const [phase, setPhase] = useState<Phase>(() => (reducedMotion ? "removed" : "idle"));
  const [showPrompt, setShowPrompt] = useState(false);
  const [ready, setReady] = useState(false);

  const mountRef = useRef<HTMLDivElement>(null);
  const startRef = useRef<(() => void) | null>(null);
  const finished = useRef(false);

  const finish = useCallback(() => {
    if (finished.current) return;
    finished.current = true;
    onComplete();
  }, [onComplete]);

  useEffect(() => {
    if (phase === "removed") finish();
  }, [phase, finish]);

  useEffect(() => {
    if (phase === "removed" || phase === "fading") return;
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    window.scrollTo(0, 0);
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [phase]);

  useEffect(() => {
    if (phase !== "idle") return;
    const t = setTimeout(() => setShowPrompt(true), 1800);
    return () => clearTimeout(t);
  }, [phase]);

  useEffect(() => {
    if (phase === "removed") return;
    const mount = mountRef.current;
    if (!mount) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true });
    } catch {
      setTimeout(() => setPhase("fading"), 0);
      return;
    }
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    renderer.setPixelRatio(dpr);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 1);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.55;
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const env = studioEnvironment();
    scene.environment = env;

    const cam = new THREE.PerspectiveCamera(38, window.innerWidth / window.innerHeight, 0.01, 400);

    // ---- lighting: one narrow key, one cold rim, almost no fill ----
    const key = new THREE.SpotLight(0xffffff, 900, 40, 0.5, 0.9, 1.3);
    key.position.set(-3.4, 4.6, 3.2);
    scene.add(key, key.target);
    const rim = new THREE.DirectionalLight(0xbfd2ff, 4.5);
    rim.position.set(3.6, 1.2, -4.2);
    scene.add(rim);
    scene.add(new THREE.AmbientLight(0x38414f, 1.4));

    // ---- the camera body (FX3-style: a plain cine box + cage + cine lens) ----
    const rig = new THREE.Group();
    scene.add(rig);

    const metal = new THREE.MeshStandardMaterial({
      color: 0x15161a,
      roughness: 0.38,
      metalness: 0.92,
    });
    const rubber = new THREE.MeshStandardMaterial({
      color: 0x0c0d10,
      roughness: 0.94,
      metalness: 0.12,
    });
    const glassMat = new THREE.MeshStandardMaterial({
      color: 0x05070c,
      roughness: 0.05,
      metalness: 1.0,
    });

    const body = new THREE.Mesh(new THREE.BoxGeometry(1.32, 1.06, 0.92), metal);
    rig.add(body);

    // Cage rails top and bottom
    for (const y of [0.6, -0.6]) {
      const rail = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.1, 1.0), rubber);
      rail.position.y = y;
      rig.add(rail);
    }
    // Top handle
    const handle = new THREE.Group();
    for (const x of [-0.42, 0.42]) {
      const post = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.3, 0.12), metal);
      post.position.set(x, 0.79, -0.05);
      handle.add(post);
    }
    const bar = new THREE.Mesh(new THREE.BoxGeometry(1.06, 0.12, 0.16), metal);
    bar.position.set(0, 0.95, -0.05);
    handle.add(bar);
    rig.add(handle);

    // Side screen + vents, so the silhouette is not a bare box
    const screen = new THREE.Mesh(
      new THREE.BoxGeometry(0.02, 0.62, 0.78),
      new THREE.MeshStandardMaterial({ color: 0x05060a, roughness: 0.18, metalness: 0.6 })
    );
    screen.position.set(-0.68, 0.02, 0.02);
    rig.add(screen);
    for (let i = 0; i < 6; i++) {
      const vent = new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.34, 0.05), rubber);
      vent.position.set(0.67, 0.0, -0.28 + i * 0.1);
      rig.add(vent);
    }

    // ---- the lens: mount, barrel, ridged rings, hood, glass ----
    const lens = new THREE.Group();
    lens.position.z = 0.46;
    rig.add(lens);

    const lensMount = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.1, 48), metal);
    lensMount.rotation.x = Math.PI / 2;
    lensMount.position.z = 0.05;
    lens.add(lensMount);

    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.32, 0.62, 48), metal);
    barrel.rotation.x = Math.PI / 2;
    barrel.position.z = 0.4;
    lens.add(barrel);

    const ridged = (z: number, r: number, w: number) => {
      const g = new THREE.Group();
      const ring = new THREE.Mesh(new THREE.CylinderGeometry(r, r, w, 48), rubber);
      ring.rotation.x = Math.PI / 2;
      g.add(ring);
      for (let i = 0; i < 56; i++) {
        const a = (i / 56) * Math.PI * 2;
        const t = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.02, w * 0.86), rubber);
        t.position.set(Math.cos(a) * r, Math.sin(a) * r, 0);
        t.rotation.z = a;
        g.add(t);
      }
      g.position.z = z;
      return g;
    };
    const focusRing = ridged(0.3, 0.325, 0.16); // turns during the focus pull
    lens.add(focusRing);
    lens.add(ridged(0.56, 0.315, 0.1));

    const hood = new THREE.Mesh(
      new THREE.CylinderGeometry(0.36, 0.33, 0.2, 48, 1, true),
      new THREE.MeshStandardMaterial({
        color: 0x0a0b0e,
        roughness: 0.6,
        metalness: 0.5,
        side: THREE.DoubleSide,
      })
    );
    hood.rotation.x = Math.PI / 2;
    hood.position.z = 0.78;
    lens.add(hood);

    // Front element, sunk inside the hood so the rim catches the key light
    const glass = new THREE.Mesh(new THREE.CircleGeometry(0.29, 64), glassMat);
    glass.position.z = 0.7;
    lens.add(glass);

    // Coating bloom on the glass
    const coat = new THREE.Mesh(
      new THREE.CircleGeometry(0.29, 48),
      new THREE.MeshBasicMaterial({
        map: softSprite("rgba(150,180,255,0.5)", "rgba(40,60,140,0)"),
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
    );
    coat.position.z = 0.73;
    lens.add(coat);

    // ---- iris: nine blades that actually open ----
    const irisGroup = new THREE.Group();
    irisGroup.position.z = 0.66;
    lens.add(irisGroup);
    const bladeShape = new THREE.Shape();
    bladeShape.moveTo(0, 0);
    bladeShape.lineTo(0.3, -0.07);
    bladeShape.lineTo(0.33, 0.06);
    bladeShape.lineTo(0.06, 0.17);
    bladeShape.lineTo(0, 0);
    const bladeGeo = new THREE.ShapeGeometry(bladeShape);
    const bladeMat = new THREE.MeshStandardMaterial({
      color: 0x0b0c10,
      roughness: 0.3,
      metalness: 0.9,
      side: THREE.DoubleSide,
    });
    const blades: THREE.Group[] = [];
    for (let i = 0; i < 9; i++) {
      const pivot = new THREE.Group();
      pivot.rotation.z = (i / 9) * Math.PI * 2;
      const b = new THREE.Mesh(bladeGeo, bladeMat);
      b.position.set(0.1, 0, i * 0.0009);
      pivot.add(b);
      irisGroup.add(pivot);
      blades.push(pivot);
    }

    // ---- atmosphere: haze + slow dust ----
    const dustCount = 700;
    const dustPos = new Float32Array(dustCount * 3);
    for (let i = 0; i < dustCount; i++) {
      dustPos[i * 3] = (Math.random() - 0.5) * 12;
      dustPos[i * 3 + 1] = (Math.random() - 0.5) * 8;
      dustPos[i * 3 + 2] = (Math.random() - 0.5) * 12;
    }
    const dustGeo = new THREE.BufferGeometry();
    dustGeo.setAttribute("position", new THREE.BufferAttribute(dustPos, 3));
    const dustMat = new THREE.PointsMaterial({
      size: 0.022,
      color: 0xffffff,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      map: softSprite("rgba(255,255,255,0.9)", "rgba(255,255,255,0)"),
    });
    const dust = new THREE.Points(dustGeo, dustMat);
    scene.add(dust);

    // Light shaft, as a soft cone from the key
    const shaftMat = new THREE.MeshBasicMaterial({
      color: 0x9fb4d8,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
    });
    const shaft = new THREE.Mesh(new THREE.ConeGeometry(2.6, 8, 32, 1, true), shaftMat);
    shaft.position.copy(key.position).multiplyScalar(0.5);
    shaft.lookAt(0, 0, 0);
    shaft.rotateX(Math.PI / 2);
    scene.add(shaft);

    // ---- the optical tunnel, sitting behind the front element ----
    const tunnel = new THREE.Group();
    tunnel.visible = false;
    scene.add(tunnel);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x8aa2cc,
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    for (let i = 0; i < 26; i++) {
      const r = 0.55 + Math.sin(i * 0.7) * 0.16;
      const ring = new THREE.Mesh(new THREE.TorusGeometry(r, 0.012, 8, 64), ringMat);
      ring.position.z = -i * 1.15;
      ring.rotation.z = i * 0.35;
      tunnel.add(ring);
      if (i % 3 === 0) {
        const disc = new THREE.Mesh(
          new THREE.RingGeometry(r * 0.72, r * 0.98, 48),
          new THREE.MeshBasicMaterial({
            color: 0x4a6ba8,
            transparent: true,
            opacity: 0.14,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            side: THREE.DoubleSide,
          })
        );
        disc.position.z = -i * 1.15 - 0.4;
        tunnel.add(disc);
      }
    }

    // ---- the viewfinder image, revealed after the black frame ----
    const loadManager = new THREE.LoadingManager();
    const texLoader = new THREE.TextureLoader(loadManager);
    const viewTex = texLoader.load("/textures/western_province.jpg");
    viewTex.colorSpace = THREE.SRGBColorSpace;
    viewTex.generateMipmaps = false;
    viewTex.minFilter = THREE.LinearFilter;
    const viewMat = new THREE.MeshBasicMaterial({ map: viewTex, transparent: true, opacity: 0 });
    const view = new THREE.Mesh(new THREE.PlaneGeometry(16, 10), viewMat);
    view.position.set(0, 0, -34);
    view.visible = false;
    scene.add(view);

    // ---- post: defocus, zoom blur, chroma, anamorphic streak, grain, iris ----
    const rt = new THREE.WebGLRenderTarget(window.innerWidth * dpr, window.innerHeight * dpr, {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
    });
    const post = {
      tDiffuse: { value: rt.texture },
      uDefocus: { value: 0 },
      uRadial: { value: 0 },
      uChroma: { value: 0 },
      uStreak: { value: 0 },
      uVignette: { value: 0.9 },
      uGrain: { value: 0.055 },
      uFade: { value: 0 },
      uIris: { value: -1 },
      uTime: { value: 0 },
      uAspect: { value: window.innerWidth / window.innerHeight },
    };
    const postScene = new THREE.Scene();
    const postCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const postMat = new THREE.ShaderMaterial({
      uniforms: post,
      vertexShader: `
        varying vec2 vUv;
        void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`,
      fragmentShader: `
        uniform sampler2D tDiffuse;
        uniform float uDefocus, uRadial, uChroma, uStreak, uVignette, uGrain, uFade, uIris, uTime, uAspect;
        varying vec2 vUv;

        float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

        vec3 sampleScene(vec2 uv) {
          vec2 dir = uv - 0.5;
          vec3 acc = vec3(0.0);
          float wsum = 0.0;
          // Zoom blur doubles as the motion blur of the push.
          for (int i = 0; i < 10; i++) {
            float t = float(i) / 9.0;
            vec2 p = uv - dir * t * uRadial;
            // Defocus: a cheap disc blur, enough to sell a focus pull.
            p += vec2(cos(t * 21.0), sin(t * 21.0)) * uDefocus;
            acc += texture2D(tDiffuse, p).rgb;
            wsum += 1.0;
          }
          return acc / wsum;
        }

        void main() {
          vec2 uv = vUv;
          vec2 dir = uv - 0.5;

          // Chromatic aberration, strongest at frame edge like real glass.
          float ca = uChroma * (0.35 + length(dir));
          vec3 col;
          col.r = sampleScene(uv - dir * ca).r;
          col.g = sampleScene(uv).g;
          col.b = sampleScene(uv + dir * ca).b;

          // Anamorphic streak: smear highlights horizontally only.
          if (uStreak > 0.001) {
            vec3 s = vec3(0.0);
            for (int i = 1; i < 9; i++) {
              float o = float(i) * uStreak * 0.02;
              s += max(texture2D(tDiffuse, uv + vec2(o, 0.0)).rgb - 0.55, 0.0);
              s += max(texture2D(tDiffuse, uv - vec2(o, 0.0)).rgb - 0.55, 0.0);
            }
            col += s * vec3(0.35, 0.5, 1.0) * 0.16 * uStreak;
          }

          // Iris mask: a nine-sided aperture opening on the frame.
          if (uIris >= 0.0) {
            vec2 p = dir * vec2(uAspect, 1.0);
            float a = atan(p.y, p.x);
            float r = length(p);
            float poly = cos(3.14159 / 9.0) / cos(mod(a, 6.28318 / 9.0) - 3.14159 / 9.0);
            float edge = uIris * poly;
            col *= smoothstep(edge, edge - 0.035, r);
          }

          col *= mix(1.0, smoothstep(1.05, 0.25, length(dir)), uVignette);
          col *= (1.0 - uFade);
          col += (hash(uv * 1024.0 + uTime) - 0.5) * uGrain;
          gl_FragColor = vec4(col, 1.0);
        }`,
    });
    const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), postMat);
    postScene.add(quad);

    const onResize = () => {
      cam.aspect = window.innerWidth / window.innerHeight;
      cam.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      rt.setSize(window.innerWidth * dpr, window.innerHeight * dpr);
      post.uAspect.value = window.innerWidth / window.innerHeight;
    };
    window.addEventListener("resize", onResize);

    // The orbit: behind the body, around it, underneath, then up to the lens.
    const orbit = new THREE.CatmullRomCurve3([
      new THREE.Vector3(2.5, 0.95, 4.7),
      new THREE.Vector3(-2.2, 1.15, 4.1),
      new THREE.Vector3(-4.3, 0.45, 0.7),
      new THREE.Vector3(-2.7, -0.5, -3.3),
      new THREE.Vector3(1.4, -1.35, -4.2),
      new THREE.Vector3(4.0, -1.15, -1.1),
      new THREE.Vector3(3.1, -0.8, 2.7),
      new THREE.Vector3(1.2, -0.3, 4.1),
    ]);

    const warm: (() => void)[] = [];
    loadManager.onLoad = () => {
      warm.push(
        () => renderer.initTexture(viewTex),
        () => renderer.compile(scene, cam),
        () => renderer.compile(postScene, postCam),
        () => {
          renderer.setRenderTarget(rt);
          renderer.render(scene, cam);
          renderer.setRenderTarget(null);
          renderer.render(postScene, postCam);
        }
      );
    };
    loadManager.onError = () => setReady(true);
    const readyFallback = setTimeout(() => setReady(true), 15000);

    const clock = new THREE.Clock();
    let started: number | null = null;
    let raf = 0;
    let disposed = false;
    let ended = false;

    startRef.current = () => {
      if (started === null) started = clock.getElapsedTime();
    };

    const tmp = new THREE.Vector3();
    const look = new THREE.Vector3();

    const frame = () => {
      if (disposed) return;
      const now = clock.getElapsedTime();
      post.uTime.value = now;

      if (warm.length) {
        warm.shift()!();
        if (!warm.length) setReady(true);
      }

      if (started === null) {
        // Idle: hold the opening frame, barely breathing.
        cam.position.set(2.5, 0.95, 4.7);
        cam.lookAt(-0.1, -0.05, 0.75);
        rig.rotation.y = -0.5 + Math.sin(now * 0.16) * 0.045;
        dustMat.opacity = 0.32;
        shaftMat.opacity = 0.05;
        post.uDefocus.value = 0.0;
        post.uFade.value = 0.0;
      } else {
        const t = now - started;
        post.uFade.value = 0;

        // Turns slowly throughout, then eases square to the lens axis so the
        // macro lands on the glass rather than on a rotated barrel.
        const settle = smooth(span(t, T_ORBIT - 0.6, T_MACRO));
        rig.rotation.y = (-0.5 + t * 0.08) * (1 - settle);

        dustMat.opacity = 0.32 + Math.min(t / T_EMERGE, 1) * 0.25;
        shaftMat.opacity = 0.05 + smooth(span(t, 0, T_EMERGE)) * 0.05;

        if (t < T_ORBIT) {
          // Emerge, then the elegant orbit. Both share one curve so the move
          // never restarts; the emerge beat is simply its slowest stretch.
          const u = smooth(span(t, 0, T_ORBIT)) * 0.82;
          orbit.getPoint(u, tmp);
          cam.position.copy(tmp);
          look.set(0, 0, 0);
          post.uDefocus.value = 0.02 * (1 - easeOut(span(t, 0.3, T_EMERGE)));
        } else if (t < T_TUNNEL) {
          // Rise to the lens axis and accelerate into the glass.
          const u = easeIn(span(t, T_ORBIT, T_TUNNEL));
          orbit.getPoint(0.84, tmp);
          const zEnd = 0.52; // just off the front element
          cam.position.lerpVectors(tmp, new THREE.Vector3(0, 0, zEnd + 1.6), Math.min(u * 2.2, 1));
          if (u > 0.45) {
            const v = span(u, 0.45, 1);
            cam.position.z = THREE.MathUtils.lerp(zEnd + 1.6, -1.2, easeIn(v));
            cam.position.x *= 1 - v;
            cam.position.y *= 1 - v;
          }
          look.set(0, 0, 3);
          // Focus pull onto the glass, then the iris opens.
          post.uDefocus.value = 0.012 * (1 - smooth(span(t, T_ORBIT, T_MACRO)));
          const iris = smooth(span(t, T_MACRO - 0.9, T_MACRO + 0.5));
          for (let i = 0; i < blades.length; i++) {
            blades[i].rotation.z = (i / 9) * Math.PI * 2 + iris * 0.62;
            blades[i].children[0].position.x = 0.1 + iris * 0.26;
          }
          focusRing.rotation.z = -smooth(span(t, T_ORBIT, T_MACRO)) * 0.8;
          // Into the tunnel.
          const into = span(t, T_MACRO + 0.2, T_TUNNEL);
          tunnel.visible = into > 0;
          tunnel.position.z = 0.4;
          post.uRadial.value = easeIn(into) * 0.5;
          post.uChroma.value = easeIn(into) * 0.03;
          post.uStreak.value = easeIn(into) * 1.6;
          ringMat.opacity = 0.5 * into;
        } else if (t < T_BLACK) {
          // Cut to black — one held breath.
          post.uFade.value = 1;
          post.uRadial.value = 0;
          post.uStreak.value = 0;
          post.uChroma.value = 0;
          tunnel.visible = false;
          cam.position.set(0, 0, -20);
          look.set(0, 0, -34);
        } else {
          // The aperture opens on Sri Lanka, then pushes through it.
          tunnel.visible = false;
          view.visible = true;
          viewMat.opacity = 1;
          post.uFade.value = 0;
          const open = smooth(span(t, T_BLACK, T_REVEAL));
          post.uIris.value = open * 0.95;
          const push = easeIn(span(t, T_REVEAL - 0.15, T_PUSH));
          cam.position.set(0, 0, THREE.MathUtils.lerp(-24.5, -34.6, push));
          look.set(0, 0, -34);
          post.uRadial.value = push * 0.34;
          post.uChroma.value = push * 0.012;
          if (push >= 1 && !ended) {
            ended = true;
            setPhase("fading");
          }
        }

        cam.lookAt(look);
      }

      dust.rotation.y = now * 0.012;

      renderer.setRenderTarget(rt);
      renderer.render(scene, cam);
      renderer.setRenderTarget(null);
      renderer.render(postScene, postCam);
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      clearTimeout(readyFallback);
      window.removeEventListener("resize", onResize);
      startRef.current = null;
      scene.traverse((o) => {
        const m = o as THREE.Mesh;
        if (m.geometry) m.geometry.dispose();
        const mat = m.material as THREE.Material | THREE.Material[] | undefined;
        if (Array.isArray(mat)) mat.forEach((x) => x.dispose());
        else mat?.dispose();
      });
      bladeGeo.dispose();
      env.dispose();
      viewTex.dispose();
      rt.dispose();
      postMat.dispose();
      quad.geometry.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (phase !== "fading") return;
    finish();
    const t = setTimeout(() => setPhase("removed"), 850);
    return () => clearTimeout(t);
  }, [phase, finish]);

  const begin = () => {
    if (phase !== "idle" || !ready) return;
    setPhase("running");
    startRef.current?.();
  };

  if (phase === "removed") return null;

  return (
    <motion.div
      className="fixed inset-0 z-[80] bg-black"
      style={{ pointerEvents: phase === "fading" ? "none" : "auto" }}
      animate={{ opacity: phase === "fading" ? 0 : 1 }}
      transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
      onClick={begin}
      role="button"
      aria-label="Begin"
    >
      <div ref={mountRef} className="absolute inset-0" aria-hidden="true" />

      {phase === "idle" && (
        <motion.div
          className="pointer-events-none absolute bottom-[16%] left-0 right-0 flex flex-col items-center gap-4"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: showPrompt && ready ? 1 : 0, y: showPrompt && ready ? 0 : 8 }}
          transition={{ duration: 1.4, ease: "easeOut" }}
        >
          <span className="tracked font-body text-[11px] text-fg-dim">ROLL CAMERA</span>
          <span className="h-8 w-px bg-line-strong" />
        </motion.div>
      )}

      {(phase === "idle" || phase === "running") && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setPhase("fading");
          }}
          className="tracked absolute bottom-8 right-8 font-body text-[10px] text-fg-faint transition-colors hover:text-fg-dim"
        >
          SKIP
        </button>
      )}
    </motion.div>
  );
}
