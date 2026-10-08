"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import * as THREE from "three";
import { usePrefersReducedMotion } from "@/lib/useReducedMotion";

type Phase = "idle" | "journey" | "fading" | "removed";

// The journey's destination.
const WESTERN_PROVINCE = { lat: 6.88, lon: 80.02 };

// Geographic bounds of each high-resolution overlay, in degrees.
const REGION_SL = { lon0: 74, lon1: 88, lat0: 2, lat1: 16 };
const REGION_WP = { lon0: 79.45, lon1: 80.65, lat0: 6.2, lat1: 7.5 };

// Journey beats, in seconds from the moment the viewer commits.
const T_LOCK_END = 1.7; // Earth has turned to present Sri Lanka
const T_ZOOM_END = 4.4; // one accelerating zoom, orbit → Western Province
const Z_START = 9.5; // nominal altitude the idle drift settles at
const Z_END = 1.035; // ~220km over the province, where the zoom ends

const EASE_IN_OUT = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const EASE_OUT = (t: number) => 1 - Math.pow(1 - t, 3);
const EASE_IN = (t: number) => t * t * t;
const clamp01 = (v: number) => Math.min(Math.max(v, 0), 1);

function latLonToVec3(lat: number, lon: number, radius: number) {
  const phi = THREE.MathUtils.degToRad(90 - lat);
  const theta = THREE.MathUtils.degToRad(lon + 180);
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
}

export default function GlobeIntro({ onComplete }: { onComplete: () => void }) {
  const reducedMotion = usePrefersReducedMotion();
  const [phase, setPhase] = useState<Phase>(() => (reducedMotion ? "removed" : "idle"));
  const [showPrompt, setShowPrompt] = useState(false);
  const [showLabel, setShowLabel] = useState(false);
  const [ready, setReady] = useState(false);

  const mountRef = useRef<HTMLDivElement>(null);
  const startJourneyRef = useRef<(() => void) | null>(null);
  const finished = useRef(false);

  const finish = useCallback(() => {
    if (finished.current) return;
    finished.current = true;
    onComplete();
  }, [onComplete]);

  useEffect(() => {
    if (phase === "removed") finish();
  }, [phase, finish]);

  // The reveal has to land on the hero, so defeat scroll restoration and
  // hold the page still until the curtain lifts.
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
    const t = setTimeout(() => setShowPrompt(true), 1500);
    return () => clearTimeout(t);
  }, [phase]);

  // ---- three.js scene ----
  useEffect(() => {
    if (phase === "removed") return;
    const mount = mountRef.current;
    if (!mount) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch {
      // No WebGL — open the site directly rather than stranding the visitor.
      setTimeout(() => setPhase("fading"), 0);
      return;
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.01, 4000);
    camera.position.set(0, 0, 16);

    // --- starfield ---
    const starCount = 2600;
    const starPos = new Float32Array(starCount * 3);
    const starAlpha = new Float32Array(starCount);
    for (let i = 0; i < starCount; i++) {
      const r = 420 + Math.random() * 900;
      const theta = Math.random() * Math.PI * 2;
      const u = Math.random() * 2 - 1;
      const s = Math.sqrt(1 - u * u);
      starPos[i * 3] = r * s * Math.cos(theta);
      starPos[i * 3 + 1] = r * u;
      starPos[i * 3 + 2] = r * s * Math.sin(theta);
      starAlpha[i] = 0.25 + Math.random() * 0.75;
    }
    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute("position", new THREE.BufferAttribute(starPos, 3));
    starGeo.setAttribute("aAlpha", new THREE.BufferAttribute(starAlpha, 1));
    const starMat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      uniforms: { uOpacity: { value: 0 } },
      vertexShader: `
        attribute float aAlpha;
        varying float vAlpha;
        void main() {
          vAlpha = aAlpha;
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = 1.6 * (300.0 / -mv.z);
          gl_Position = projectionMatrix * mv;
        }`,
      fragmentShader: `
        varying float vAlpha;
        uniform float uOpacity;
        void main() {
          vec2 c = gl_PointCoord - vec2(0.5);
          float d = smoothstep(0.5, 0.0, length(c));
          gl_FragColor = vec4(vec3(1.0), d * vAlpha * uOpacity);
        }`,
    });
    const stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);

    // --- earth ---
    const manager = new THREE.LoadingManager();
    const loader = new THREE.TextureLoader(manager);
    const dayMap = loader.load("/textures/8k_day.webp");
    const cloudMap = loader.load("/textures/earth_clouds_1024.webp");
    dayMap.colorSpace = THREE.SRGBColorSpace;
    dayMap.anisotropy = renderer.capabilities.getMaxAnisotropy();

    const earthUniforms = {
      uDay: { value: dayMap },
      uSun: { value: new THREE.Vector3(0.35, 0.25, 1).normalize() },
      uDayStrength: { value: 1.05 },
      uRimStrength: { value: 0.85 },
      uOpacity: { value: 0 },
    };

    const earthMat = new THREE.ShaderMaterial({
      transparent: true,
      uniforms: earthUniforms,
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vNormalW;
        varying vec3 vViewDir;
        void main() {
          vUv = uv;
          vNormalW = normalize(mat3(modelMatrix) * normal);
          vec4 world = modelMatrix * vec4(position, 1.0);
          vViewDir = normalize(cameraPosition - world.xyz);
          gl_Position = projectionMatrix * viewMatrix * world;
        }`,
      fragmentShader: `
        uniform sampler2D uDay;
        uniform vec3 uSun;
        uniform float uDayStrength;
        uniform float uRimStrength;
        uniform float uOpacity;
        varying vec2 vUv;
        varying vec3 vNormalW;
        varying vec3 vViewDir;
        void main() {
          vec3 n = normalize(vNormalW);
          vec3 day = texture2D(uDay, vUv).rgb;
          // Daylit the whole way round, like Google Earth: the sun only
          // shapes the sphere, it never drops any of it into darkness.
          float sunDot = dot(n, normalize(uSun));
          float lit = mix(0.74, 1.0, smoothstep(-0.55, 0.75, sunDot));
          vec3 col = day * uDayStrength * lit;
          // Blue atmospheric limb around the edge.
          float fres = pow(1.0 - max(dot(n, normalize(vViewDir)), 0.0), 3.0);
          col += vec3(0.32, 0.54, 0.92) * fres * uRimStrength;
          gl_FragColor = vec4(col, uOpacity);
        }`,
    });

    const earth = new THREE.Mesh(new THREE.SphereGeometry(1, 96, 96), earthMat);
    scene.add(earth);

    const cloudMat = new THREE.MeshBasicMaterial({
      map: cloudMap,
      transparent: true,
      opacity: 0,
      depthWrite: false,
    });
    const clouds = new THREE.Mesh(new THREE.SphereGeometry(1.012, 64, 64), cloudMat);
    earth.add(clouds);

    // Outer atmospheric shell.
    const atmoMat = new THREE.ShaderMaterial({
      transparent: true,
      side: THREE.BackSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: { uOpacity: { value: 0 } },
      vertexShader: `
        varying vec3 vNormalW;
        varying vec3 vViewDir;
        void main() {
          vNormalW = normalize(mat3(modelMatrix) * normal);
          vec4 world = modelMatrix * vec4(position, 1.0);
          vViewDir = normalize(cameraPosition - world.xyz);
          gl_Position = projectionMatrix * viewMatrix * world;
        }`,
      fragmentShader: `
        uniform float uOpacity;
        varying vec3 vNormalW;
        varying vec3 vViewDir;
        void main() {
          // Tight, soft falloff — a limb of air, not a visible shell.
          float fres = pow(1.0 - abs(dot(normalize(vNormalW), normalize(vViewDir))), 4.5);
          gl_FragColor = vec4(vec3(0.34, 0.56, 0.98), fres * uOpacity);
        }`,
    });
    const atmosphere = new THREE.Mesh(new THREE.SphereGeometry(1.035, 64, 64), atmoMat);
    scene.add(atmosphere);

    // High-resolution patch over the destination. The global map only gives
    // Sri Lanka ~50px of real detail; this NASA crop gives it ~530px, so the
    // island stays sharp once the camera is close. Same trick as Google
    // Earth's level-of-detail tiles.
    const regionMap = loader.load("/textures/sri_lanka_region.webp");
    regionMap.colorSpace = THREE.SRGBColorSpace;
    regionMap.anisotropy = renderer.capabilities.getMaxAnisotropy();
    const REGION = REGION_SL;
    const regionLowMap = loader.load("/textures/sri_lanka_region_low.webp");
    regionLowMap.colorSpace = THREE.SRGBColorSpace;
    const regionUniforms = {
      uMap: { value: regionMap },
      uMapLow: { value: regionLowMap },
      uBase: { value: dayMap },
      uOpacity: { value: 0 },
    };
    const regionMat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      uniforms: regionUniforms,
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vPos;
        void main() {
          vUv = uv;
          vPos = normalize(position);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }`,
      fragmentShader: `
        uniform sampler2D uMap;
        uniform sampler2D uMapLow;
        uniform sampler2D uBase;
        uniform float uOpacity;
        varying vec2 vUv;
        varying vec3 vPos;
        void main() {
          // Detail transfer: keep the base map's own colour and lighting and
          // borrow only the high-res tile's *relative* structure. A straight
          // cross-fade can't work here — the two are different sources with
          // different tone curves, so any flat correction leaves a seam.
          vec3 n = normalize(vPos);
          float theta = atan(n.z, -n.x);
          if (theta < 0.0) theta += 6.283185307;
          vec2 baseUv = vec2(theta / 6.283185307, (degrees(asin(clamp(n.y, -1.0, 1.0))) + 90.0) / 180.0);
          vec3 base = texture2D(uBase, baseUv).rgb;
          vec3 hi = texture2D(uMap, vUv).rgb;
          vec3 lo = texture2D(uMapLow, vUv).rgb;
          vec3 ratio = clamp(hi / max(lo, vec3(0.02)), vec3(0.7), vec3(1.45));
          vec3 col = base * mix(vec3(1.0), ratio, 0.8);
          // Feather the tile's edges away so the swap to higher detail is
          // invisible — a hard rectangle would read as a seam on the globe.
          float edge = max(abs(vUv.x - 0.5), abs(vUv.y - 0.5)) * 2.0;
          float feather = 1.0 - smoothstep(0.45, 0.95, edge);
          gl_FragColor = vec4(col, uOpacity * feather);
        }`,
    });
    const regionPatch = new THREE.Mesh(
      new THREE.SphereGeometry(
        1.0012,
        160,
        160,
        THREE.MathUtils.degToRad(REGION.lon0 + 180),
        THREE.MathUtils.degToRad(REGION.lon1 - REGION.lon0),
        THREE.MathUtils.degToRad(90 - REGION.lat1),
        THREE.MathUtils.degToRad(REGION.lat1 - REGION.lat0)
      ),
      regionMat
    );
    earth.add(regionPatch);

    // Deepest level of detail: the Western Province at ~3150 px/degree, about
    // thirteen times the NASA tile. At this altitude the global map has
    // nothing left to contribute, so this one is drawn on its own rather
    // than detail-transferred onto the base.
    const wpMap = loader.load("/textures/western_province.webp");
    wpMap.colorSpace = THREE.SRGBColorSpace;
    wpMap.anisotropy = renderer.capabilities.getMaxAnisotropy();
    // This tile is only ever seen magnified, so the mip chain buys nothing
    // and building one for a 3781x4096 image is the costliest upload here.
    wpMap.generateMipmaps = false;
    wpMap.minFilter = THREE.LinearFilter;
    const wpUniforms = { uMap: { value: wpMap }, uOpacity: { value: 0 } };
    const wpMat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      uniforms: wpUniforms,
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }`,
      fragmentShader: `
        uniform sampler2D uMap;
        uniform float uOpacity;
        varying vec2 vUv;
        void main() {
          // Straight satellite colour, only a small exposure lift to sit
          // level with the rest of the globe.
          vec3 col = texture2D(uMap, vUv).rgb * 1.5;
          float edge = max(abs(vUv.x - 0.5), abs(vUv.y - 0.5)) * 2.0;
          float feather = 1.0 - smoothstep(0.6, 0.99, edge);
          gl_FragColor = vec4(col, uOpacity * feather);
        }`,
    });
    const wpPatch = new THREE.Mesh(
      new THREE.SphereGeometry(
        1.0024,
        180,
        180,
        THREE.MathUtils.degToRad(REGION_WP.lon0 + 180),
        THREE.MathUtils.degToRad(REGION_WP.lon1 - REGION_WP.lon0),
        THREE.MathUtils.degToRad(90 - REGION_WP.lat1),
        THREE.MathUtils.degToRad(REGION_WP.lat1 - REGION_WP.lat0)
      ),
      wpMat
    );
    earth.add(wpPatch);

    // Orientation that brings a lat/lon around to face the camera (+Z) *and*
    // keeps north pointing up — setFromUnitVectors alone leaves the roll
    // arbitrary, which lands the target on its side.
    const facingQuat = (lat: number, lon: number) => {
      const dir = latLonToVec3(lat, lon, 1).normalize();
      const e = new THREE.Vector3().crossVectors(new THREE.Vector3(0, 1, 0), dir).normalize();
      const n = new THREE.Vector3().crossVectors(dir, e).normalize();
      return new THREE.Quaternion().setFromRotationMatrix(
        new THREE.Matrix4().makeBasis(e, n, dir).invert()
      );
    };
    const targetQuat = facingQuat(WESTERN_PROVINCE.lat, WESTERN_PROVINCE.lon);

    // --- zoom-blur pass ---
    // The scene renders into a target, then a fullscreen quad smears it
    // radially outward from centre for the final push into the site.
    const dpr = renderer.getPixelRatio();
    const rt = new THREE.WebGLRenderTarget(
      window.innerWidth * dpr,
      window.innerHeight * dpr,
      { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter }
    );
    const blurUniforms = {
      tDiffuse: { value: rt.texture },
      uStrength: { value: 0 },
    };
    const blurScene = new THREE.Scene();
    const blurCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const blurMat = new THREE.ShaderMaterial({
      uniforms: blurUniforms,
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = vec4(position.xy, 0.0, 1.0);
        }`,
      fragmentShader: `
        uniform sampler2D tDiffuse;
        uniform float uStrength;
        varying vec2 vUv;
        void main() {
          vec2 dir = vUv - vec2(0.5);
          vec4 sum = vec4(0.0);
          for (int i = 0; i < 16; i++) {
            float t = float(i) / 15.0;
            sum += texture2D(tDiffuse, vUv - dir * t * uStrength);
          }
          gl_FragColor = sum / 16.0;
        }`,
    });
    const blurQuad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), blurMat);
    blurScene.add(blurQuad);

    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      rt.setSize(window.innerWidth * dpr, window.innerHeight * dpr);
    };
    window.addEventListener("resize", onResize);

    // Pay for the expensive work up front, while the viewer is still looking
    // at the idle globe. Otherwise the first frame after the click is the one
    // that uploads ~200MB of texture and compiles the blur shader, and that
    // lands as a visible stutter exactly when the motion starts.
    // Uploading ~200MB of texture and linking the shaders costs the best part
    // of two seconds. Done in one go it freezes a frame; done lazily it
    // freezes the frame the viewer clicks on. So it runs one step per frame
    // during the idle orbit, and the prompt only appears once it is finished.
    const warmQueue: (() => void)[] = [];
    manager.onLoad = () => {
      warmQueue.push(
        () => renderer.initTexture(cloudMap),
        () => renderer.initTexture(regionLowMap),
        () => renderer.initTexture(dayMap),
        () => renderer.initTexture(regionMap),
        () => renderer.initTexture(wpMap),
        () => renderer.compile(scene, camera),
        () => renderer.compile(blurScene, blurCam),
        () => {
          // One frame through the blur path so its program links here too.
          renderer.setRenderTarget(rt);
          renderer.render(scene, camera);
          renderer.setRenderTarget(null);
          renderer.render(blurScene, blurCam);
        }
      );
    };
    // Don't strand the viewer if an image fails or is slow to arrive.
    manager.onError = () => setReady(true);
    const readyFallback = setTimeout(() => setReady(true), 15000);

    let raf = 0;
    let disposed = false;
    let journeyStart: number | null = null;
    let spin = 0;
    let labelShown = false;
    let fadeStarted = false;
    let lockFromQuat: THREE.Quaternion | null = null;
    let zoomFrom = Z_START;
    const clock = new THREE.Clock();

    startJourneyRef.current = () => {
      if (journeyStart !== null) return;
      journeyStart = clock.getElapsedTime();
      lockFromQuat = earth.quaternion.clone();
      zoomFrom = camera.position.z;
    };


    const render = () => {
      if (disposed) return;
      const t = clock.getElapsedTime();

      // One unit of warm-up work per frame, before anything can be clicked.
      if (warmQueue.length) {
        warmQueue.shift()!();
        if (!warmQueue.length) setReady(true);
      }

      // Emergence from the void, before any input.
      const intro = clamp01(t / 2.8);
      const introEased = EASE_OUT(intro);
      starMat.uniforms.uOpacity.value = introEased * 0.9;
      earthUniforms.uOpacity.value = introEased;
      atmoMat.uniforms.uOpacity.value = introEased * 0.55;
      cloudMat.opacity = introEased * 0.1;

      if (journeyStart === null) {
        // Slow drift inward + silent rotation.
        camera.position.z = 16 - introEased * 6.5;
        spin = t * 0.055;
        earth.rotation.y = spin;
      } else {
        const j = t - journeyStart;

        // One turn, straight to the destination — no second re-aim later.
        if (lockFromQuat) {
          const lockT = EASE_IN_OUT(clamp01(j / T_LOCK_END));
          earth.quaternion.copy(lockFromQuat).slerp(targetQuat, lockT);
        }

        // One continuous zoom, orbit to province. Interpolating the altitude
        // geometrically keeps the *rate* of zoom constant to the eye, which
        // is what makes it read as a single uninterrupted move rather than
        // separate legs.
        // A single move that only ever accelerates. Anything that eases to a
        // stop and then starts again — an arrival hold, a separate final
        // push — reads as a second zoom, so there is exactly one curve here
        // and the blur rides the end of it while the camera is still going.
        const e = clamp01(j / T_ZOOM_END);
        const zoomT = e * (0.35 + 0.65 * e);
        const z = zoomFrom * Math.pow(Z_END / zoomFrom, zoomT);
        camera.position.z = z;
        camera.fov = 35 - 10 * zoomT;
        camera.updateProjectionMatrix();

        blurUniforms.uStrength.value = EASE_IN(clamp01((e - 0.8) / 0.2)) * 0.22;

        if (zoomT > 0.45 && !labelShown) {
          labelShown = true;
          setShowLabel(true);
        }

        // Levels of detail are keyed to altitude, so each one arrives exactly
        // when the map beneath it runs out of resolution.
        regionUniforms.uOpacity.value = clamp01((4.2 - z) / 1.4);
        wpUniforms.uOpacity.value = clamp01((1.75 - z) / 0.42);
        // Clouds are a 1024px map on a sphere above the surface, so up close
        // they magnify into a white smear over the island. They are gone by
        // the time the detailed tile arrives, and only dress the far view.
        cloudMat.opacity = 0.42 * clamp01((z - 4.2) / 3.0);
        // The camera ends below the atmosphere shell, so retire it on the way
        // down rather than flying inside a blue sphere.
        atmoMat.uniforms.uOpacity.value = 0.55 * clamp01((z - 1.05) / 0.5);

        if (j >= T_ZOOM_END && !fadeStarted) {
          fadeStarted = true;
          setPhase("fading");
        }
      }

      if (blurUniforms.uStrength.value > 0.001) {
        renderer.setRenderTarget(rt);
        renderer.render(scene, camera);
        renderer.setRenderTarget(null);
        renderer.render(blurScene, blurCam);
      } else {
        renderer.render(scene, camera);
      }
      raf = requestAnimationFrame(render);
    };
    raf = requestAnimationFrame(render);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      clearTimeout(readyFallback);
      window.removeEventListener("resize", onResize);
      startJourneyRef.current = null;
      renderer.dispose();
      starGeo.dispose();
      starMat.dispose();
      earth.geometry.dispose();
      earthMat.dispose();
      clouds.geometry.dispose();
      cloudMat.dispose();
      atmosphere.geometry.dispose();
      atmoMat.dispose();
      regionPatch.geometry.dispose();
      regionMat.dispose();
      regionMap.dispose();
      regionLowMap.dispose();
      wpPatch.geometry.dispose();
      wpMat.dispose();
      wpMap.dispose();
      rt.dispose();
      blurMat.dispose();
      blurQuad.geometry.dispose();
      dayMap.dispose();
      cloudMap.dispose();
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
    };
    // The scene is built once and driven by its own clock; React state only
    // gates the overlay chrome around it.
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (phase !== "fading") return;
    finish();
    const t = setTimeout(() => setPhase("removed"), 900);
    return () => clearTimeout(t);
  }, [phase, finish]);

  const begin = () => {
    // Ignore clicks until the imagery is uploaded and the shaders are built,
    // otherwise the flight starts on a stutter.
    if (phase !== "idle" || !ready) return;
    setPhase("journey");
    startJourneyRef.current?.();
  };

  if (phase === "removed") return null;

  return (
    <motion.div
      className="fixed inset-0 z-[80] bg-black"
      style={{ pointerEvents: phase === "fading" ? "none" : "auto" }}
      animate={{ opacity: phase === "fading" ? 0 : 1 }}
      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      onClick={begin}
      role="button"
      aria-label="Begin the journey"
    >
      <div ref={mountRef} className="absolute inset-0" aria-hidden="true" />

      {/* Quiet title card as the island resolves */}
      <motion.div
        className="pointer-events-none absolute left-0 right-0 top-[14%] flex justify-center"
        animate={{ opacity: showLabel ? 1 : 0 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
      >
        <span className="tracked font-body text-[11px] text-fg-dim">SRI LANKA</span>
      </motion.div>

      {/* Begin prompt */}
      {phase === "idle" && (
        <motion.div
          className="pointer-events-none absolute bottom-[18%] left-0 right-0 flex flex-col items-center gap-4"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: showPrompt && ready ? 1 : 0, y: showPrompt && ready ? 0 : 8 }}
          transition={{ duration: 1.4, ease: "easeOut" }}
        >
          <span className="tracked font-body text-[11px] text-fg-dim">BEGIN THE JOURNEY</span>
          <span className="h-8 w-px bg-line-strong" />
        </motion.div>
      )}

      {(phase === "idle" || phase === "journey") && (
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
