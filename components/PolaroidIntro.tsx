"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import * as THREE from "three";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";
import { usePrefersReducedMotion } from "@/lib/useReducedMotion";

type Phase = "idle" | "shoot" | "fading" | "removed";

// Beats in seconds from the click. The brief's 1.0-5.0s window, rebased to 0.
const T_FLASH = 0.5; // mechanical move, shutter, flash, shake
const T_EJECT = 1.5; // print slides out and settles centre frame
const T_DEVELOP = 3.0; // white -> faint shapes -> full image
const T_EXPAND = 4.0; // hold on the print, then dissolve into the site

const clamp01 = (v: number) => Math.min(Math.max(v, 0), 1);
const smooth = (t: number) => t * t * (3 - 2 * t);
const span = (t: number, a: number, b: number) => clamp01((t - a) / (b - a));

// Soft boxes for the metal and plastic to reflect. Without an environment a
// PBR body renders as a flat silhouette.
function studioEnv() {
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 256;
  const x = c.getContext("2d")!;
  x.fillStyle = "#050505";
  x.fillRect(0, 0, 512, 256);
  const soft = (cx: number, cy: number, r: number, a: number) => {
    const g = x.createRadialGradient(cx, cy, 0, cx, cy, r);
    g.addColorStop(0, "rgba(255,255,255," + a + ")");
    g.addColorStop(1, "rgba(255,255,255,0)");
    x.fillStyle = g;
    x.fillRect(cx - r, cy - r, r * 2, r * 2);
  };
  soft(150, 60, 150, 0.85);
  soft(370, 90, 110, 0.4);
  soft(256, 220, 190, 0.12);
  const t = new THREE.CanvasTexture(c);
  t.mapping = THREE.EquirectangularReflectionMapping;
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

// Mottled studio surface. Generated rather than downloaded so the intro adds
// no payload, and mottled rather than flat so the key light has something to
// break across — a clean gradient reads as empty CG space.
function surfaceTexture(seed: number) {
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 512;
  const x = c.getContext("2d")!;
  x.fillStyle = "#121215";
  x.fillRect(0, 0, 512, 512);
  let r = seed;
  const rnd = () => ((r = (r * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);
  for (let i = 0; i < 2600; i++) {
    const rad = 6 + rnd() * 54;
    const a = 0.012 + rnd() * 0.05;
    const g = x.createRadialGradient(0, 0, 0, 0, 0, rad);
    g.addColorStop(0, "rgba(255,255,255," + a + ")");
    g.addColorStop(1, "rgba(255,255,255,0)");
    x.save();
    x.translate(rnd() * 512, rnd() * 512);
    x.fillStyle = g;
    x.fillRect(-rad, -rad, rad * 2, rad * 2);
    x.restore();
  }
  const img = x.getImageData(0, 0, 512, 512);
  for (let i = 0; i < img.data.length; i += 4) {
    const n = (rnd() - 0.5) * 22;
    img.data[i] += n;
    img.data[i + 1] += n;
    img.data[i + 2] += n;
  }
  x.putImageData(img, 0, 0);
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
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

export default function PolaroidIntro({ onComplete }: { onComplete: () => void }) {
  const reducedMotion = usePrefersReducedMotion();
  const [phase, setPhase] = useState<Phase>(() => (reducedMotion ? "removed" : "idle"));
  const [ready, setReady] = useState(false);
  const [hover, setHover] = useState(false);

  const mountRef = useRef<HTMLDivElement>(null);
  const startRef = useRef<(() => void) | null>(null);
  const hitRef = useRef<((x: number, y: number) => boolean) | null>(null);
  const done = useRef(false);

  const finish = useCallback(() => {
    if (done.current) return;
    done.current = true;
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
    if (phase !== "fading") return;
    finish();
    const t = setTimeout(() => setPhase("removed"), 1000);
    return () => clearTimeout(t);
  }, [phase, finish]);

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
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.78;
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const env = studioEnv();
    scene.environment = env;

    const view = new THREE.PerspectiveCamera(34, window.innerWidth / window.innerHeight, 0.05, 200);
    view.position.set(0, 1.05, 5.85);

    // Studio: one soft key, a cool rim, minimal fill. Flash rides on the key.
    const key = new THREE.SpotLight(0xffffff, 150, 26, 0.55, 0.96, 1.5);
    key.position.set(-2.9, 3.1, 3.9);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.bias = -0.0012;
    key.shadow.radius = 4;
    scene.add(key, key.target);
    const rim = new THREE.DirectionalLight(0xbcd0f0, 0.85);
    rim.position.set(3.2, 0.8, -3.0);
    scene.add(rim);
    const fill = new THREE.AmbientLight(0x1b2029, 0.65);
    scene.add(fill);
    const pool = new THREE.SpotLight(0xa8bcd8, 34, 22, 0.85, 1.0, 1.25);
    pool.position.set(1.4, 2.2, -2.6);
    pool.target.position.set(0, 0.2, -6.0);
    scene.add(pool, pool.target);

    const tableLight = new THREE.SpotLight(0x9fb2cc, 46, 18, 0.7, 1.0, 1.4);
    tableLight.position.set(-1.2, 4.0, 2.6);
    tableLight.target.position.set(-0.2, -1.14, 1.2);
    scene.add(tableLight, tableLight.target);

    const bounce = new THREE.PointLight(0x8fa4c4, 11, 12, 1.6);
    bounce.position.set(0.4, -0.7, 2.4);
    scene.add(bounce);

    const flashLight = new THREE.PointLight(0xffffff, 0, 40, 2);
    flashLight.position.set(0, 0.4, 3.2);
    scene.add(flashLight);

    // ---- the set ----
    const surfTex = surfaceTexture(20240224);
    surfTex.repeat.set(3, 3);
    const backTex = surfaceTexture(99173);
    backTex.repeat.set(2, 2);

    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(46, 46),
      new THREE.MeshStandardMaterial({ map: surfTex, roughness: 0.88, metalness: 0.0, color: 0xa8a8b4 })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -1.14;
    floor.receiveShadow = true;
    scene.add(floor);

    const backdrop = new THREE.Mesh(
      new THREE.PlaneGeometry(40, 24),
      new THREE.MeshStandardMaterial({ map: backTex, roughness: 1.0, metalness: 0.0, color: 0x9a9aa6 })
    );
    backdrop.position.set(0, 4.2, -6.2);
    scene.add(backdrop);

    // Dust drifting through the key, which is what sells depth in the void.
    const motes = 460;
    const mp = new Float32Array(motes * 3);
    for (let i = 0; i < motes; i++) {
      mp[i * 3] = (Math.random() - 0.5) * 11;
      mp[i * 3 + 1] = Math.random() * 5.2 - 1.1;
      mp[i * 3 + 2] = (Math.random() - 0.5) * 7;
    }
    const dustGeo = new THREE.BufferGeometry();
    dustGeo.setAttribute("position", new THREE.BufferAttribute(mp, 3));
    const dustMat = new THREE.PointsMaterial({
      size: 0.032,
      color: 0xdfe6f5,
      transparent: true,
      opacity: 0.62,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      map: softSprite("rgba(255,255,255,0.95)", "rgba(255,255,255,0)"),
    });
    const dust = new THREE.Points(dustGeo, dustMat);
    scene.add(dust);

    const manager = new THREE.LoadingManager();
    const texLoader = new THREE.TextureLoader(manager);
    const tex = (p: string, srgb: boolean) => {
      const t = texLoader.load(p);
      if (srgb) t.colorSpace = THREE.SRGBColorSpace;
      t.flipY = true; // FBX UVs are y-up already; flipping mirrors the labels
      t.anisotropy = renderer.capabilities.getMaxAnisotropy();
      return t;
    };
    const diffuse = tex("/models/polaroid_diffuse.jpg", true);
    const normals = tex("/models/polaroid_normals.jpg", false);
    const rough = tex("/models/polaroid_rough.jpg", false);
    const occl = tex("/models/polaroid_oclusion.jpg", false);

    const bodyMat = new THREE.MeshStandardMaterial({
      map: diffuse,
      normalMap: normals,
      roughnessMap: rough,
      aoMap: occl,
      aoMapIntensity: 1.0,
      metalness: 0.04,
      roughness: 1.0,
      envMapIntensity: 0.9,
      normalScale: new THREE.Vector2(0.85, 0.85),
    });

    const rig = new THREE.Group(); // holds the camera body; shake lives here
    scene.add(rig);
    const bodyGroup = new THREE.Group();
    rig.add(bodyGroup);

    let slotY = -0.55;
    let slotZ = 0.5;
    let modelBox: THREE.Box3 | null = null;

    const fbx = new FBXLoader(manager);
    fbx.load("/models/polaroid.fbx", (obj) => {
      obj.traverse((child) => {
        const m = child as THREE.Mesh;
        if (!m.isMesh) return;
        m.material = bodyMat;
        m.castShadow = true;
        m.receiveShadow = true;
        const g = m.geometry as THREE.BufferGeometry;
        // aoMap samples uv1 in modern three; the FBX only ships uv.
        if (g.attributes.uv && !g.attributes.uv1) g.setAttribute("uv1", g.attributes.uv);
      });
      // Normalise whatever units and origin the FBX was authored in.
      const box = new THREE.Box3().setFromObject(obj);
      const size = box.getSize(new THREE.Vector3());
      const centre = box.getCenter(new THREE.Vector3());
      const s = 2.3 / Math.max(size.x, size.y, size.z);
      obj.scale.setScalar(s);
      obj.position.copy(centre).multiplyScalar(-s);
      bodyGroup.add(obj);

      modelBox = new THREE.Box3().setFromObject(bodyGroup);
      // The print leaves from the front-bottom edge, like the real thing.
      slotY = modelBox.min.y + 0.16;
      slotZ = modelBox.max.z - 0.12;
      print.position.set(0, slotY, slotZ);
    });

    // ---- the print ----
    const photoTex = texLoader.load("/textures/western_province.jpg");
    photoTex.colorSpace = THREE.SRGBColorSpace;
    photoTex.generateMipmaps = false;
    photoTex.minFilter = THREE.LinearFilter;

    const printUniforms = {
      uImage: { value: photoTex },
      uDevelop: { value: 0 },
      uTime: { value: 0 },
      uBorder: { value: 1 },
    };
    const printMat = new THREE.ShaderMaterial({
      uniforms: printUniforms,
      transparent: true,
      side: THREE.DoubleSide,
      vertexShader: [
        "varying vec2 vUv;",
        "void main() {",
        "  vUv = uv;",
        "  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);",
        "}",
      ].join("\n"),
      fragmentShader: [
        "uniform sampler2D uImage;",
        "uniform float uDevelop, uTime, uBorder;",
        "varying vec2 vUv;",
        "float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); }",
        "void main() {",
        // Polaroid geometry: even margins, deep chin at the bottom.
        "  float ml = 0.075, mr = 0.075, mt = 0.075, mb = 0.235;",
        "  vec2 lo = vec2(ml, mb), hi = vec2(1.0 - mr, 1.0 - mt);",
        "  bool inImage = vUv.x > lo.x && vUv.x < hi.x && vUv.y > lo.y && vUv.y < hi.y;",
        "  vec3 paper = vec3(0.93, 0.925, 0.905);",
        // Paper fibre, so the border is not a flat white rectangle.
        "  float fib = hash(floor(vUv * 620.0)) * 0.05 + hash(floor(vUv.yx * 180.0)) * 0.03;",
        "  paper *= 0.965 + fib;",
        "  if (!inImage) {",
        "    float edge = smoothstep(0.0, 0.012, min(min(vUv.x, 1.0-vUv.x), min(vUv.y, 1.0-vUv.y)));",
        "    gl_FragColor = vec4(paper * mix(0.72, 1.0, edge), uBorder);",
        "    return;",
        "  }",
        "  vec2 iuv = (vUv - lo) / (hi - lo);",
        "  vec3 img = texture2D(uImage, vec2(iuv.x, 1.0 - iuv.y)).rgb;",
        "  img = pow(max(img, 0.0), vec3(0.72)) * 1.42;",
        "  img = mix(vec3(dot(img, vec3(0.3,0.59,0.11))), img, 0.82);",
        "  img = clamp((img - 0.5) * 1.12 + 0.5, 0.0, 1.0);",
        // Emulsion works out from the centre; edges finish last.
        "  float d = length((iuv - 0.5) * vec2(1.06, 1.0)) * 1.42;",
        "  float front = uDevelop * 1.55 - 0.42;",
        "  float rev = clamp((front - d) / 0.5, 0.0, 1.0);",
        "  rev = smoothstep(0.0, 1.0, rev);",
        // Chemistry: dark, cold and low contrast first, then it settles.
        "  vec3 wet = mix(vec3(dot(img, vec3(0.3,0.59,0.11))), img, 0.35);",
        "  wet = mix(wet * 0.55 + vec3(0.03,0.05,0.06), img, smoothstep(0.35, 1.0, uDevelop));",
        "  vec3 col = mix(vec3(0.9, 0.9, 0.885), wet, rev);",
        // Grain, and a faint sheen across the emulsion.
        "  col += (hash(iuv * 900.0 + uTime * 0.2) - 0.5) * 0.045;",
        "  col *= 1.0 - 0.18 * length(iuv - 0.5);",
        "  gl_FragColor = vec4(col, 1.0);",
        "}",
      ].join("\n"),
    });
    // 3:3.7 body, image area squared off — classic Polaroid proportions.
    const print = new THREE.Mesh(new THREE.PlaneGeometry(1.52, 1.84), printMat);
    print.position.set(0, slotY, slotZ);
    print.visible = false;
    const printScene = new THREE.Scene();
    printScene.add(print);

    // ---- post: defocus, flash bloom, vignette, grain ----
    const rt = new THREE.WebGLRenderTarget(window.innerWidth * dpr, window.innerHeight * dpr, {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
    });
    const post = {
      tDiffuse: { value: rt.texture },
      uDefocus: { value: 0.0016 },
      uFlash: { value: 0 },
      uVignette: { value: 0.85 },
      uGrain: { value: 0.045 },
      uTime: { value: 0 },
    };
    const postScene = new THREE.Scene();
    const postCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const postMat = new THREE.ShaderMaterial({
      depthTest: false,
      depthWrite: false,
      uniforms: post,
      vertexShader: [
        "varying vec2 vUv;",
        "void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }",
      ].join("\n"),
      fragmentShader: [
        "uniform sampler2D tDiffuse;",
        "uniform float uDefocus, uFlash, uVignette, uGrain, uTime;",
        "varying vec2 vUv;",
        "float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); }",
        "void main(){",
        "  vec3 col = vec3(0.0);",
        "  if (uDefocus > 0.0002) {",
        // Disc sampling reads as a lens defocus rather than a box smear.
        "    float w = 0.0;",
        "    for (int i = 0; i < 12; i++) {",
        "      float a = float(i) * 2.39996;",
        "      float r = sqrt((float(i) + 0.5) / 12.0) * uDefocus;",
        "      col += texture2D(tDiffuse, vUv + vec2(cos(a), sin(a)) * r).rgb;",
        "      w += 1.0;",
        "    }",
        "    col /= w;",
        "  } else {",
        "    col = texture2D(tDiffuse, vUv).rgb;",
        "  }",
        "  col *= mix(1.0, smoothstep(1.15, 0.3, length(vUv - 0.5)), uVignette);",
        "  col = mix(col, vec3(1.0), uFlash);",
        "  col += (hash(vUv * 1024.0 + uTime) - 0.5) * uGrain;",
        "  gl_FragColor = vec4(col, 1.0);",
        "}",
      ].join("\n"),
    });
    const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), postMat);
    postScene.add(quad);

    const onResize = () => {
      view.aspect = window.innerWidth / window.innerHeight;
      view.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      rt.setSize(window.innerWidth * dpr, window.innerHeight * dpr);
    };
    window.addEventListener("resize", onResize);

    // Click must land on the camera itself, so the object feels physical.
    const ray = new THREE.Raycaster();
    hitRef.current = (px, py) => {
      if (!modelBox) return true;
      const ndc = new THREE.Vector2(
        (px / window.innerWidth) * 2 - 1,
        -(py / window.innerHeight) * 2 + 1
      );
      ray.setFromCamera(ndc, view);
      const grown = modelBox.clone().expandByScalar(0.22);
      return ray.ray.intersectsBox(grown);
    };

    const warm: (() => void)[] = [];
    manager.onLoad = () => {
      warm.push(
        () => renderer.initTexture(diffuse),
        () => renderer.initTexture(normals),
        () => renderer.initTexture(rough),
        () => renderer.initTexture(occl),
        () => renderer.initTexture(photoTex),
        () => renderer.compile(scene, view),
        () => renderer.compile(postScene, postCam),
        () => {
          renderer.setRenderTarget(rt);
          renderer.render(scene, view);
          renderer.setRenderTarget(null);
          renderer.render(postScene, postCam);
        }
      );
    };
    manager.onError = () => setReady(true);
    const readyFallback = setTimeout(() => setReady(true), 15000);

    const clock = new THREE.Clock();
    let t0: number | null = null;
    let raf = 0;
    let dead = false;
    let ending = false;

    startRef.current = () => {
      if (t0 === null) t0 = clock.getElapsedTime();
    };

    const frame = () => {
      if (dead) return;
      const now = clock.getElapsedTime();
      post.uTime.value = now;
      printUniforms.uTime.value = now;

      dust.rotation.y = now * 0.018;
      dust.position.y = Math.sin(now * 0.12) * 0.12;

      if (warm.length) {
        warm.shift()!();
        if (!warm.length) setReady(true);
      }

      view.lookAt(0, -0.12, 0.1);

      if (t0 === null) {
        // Idle: the body breathes, held just off the focal plane.
        bodyGroup.position.y = Math.sin(now * 0.7) * 0.035;
        bodyGroup.rotation.y = -0.38 + Math.sin(now * 0.45) * 0.045;
        bodyGroup.rotation.x = 0.04 + Math.cos(now * 0.55) * 0.018;
        rig.position.set(0, 0, 0);
        post.uDefocus.value = 0.0016;
        post.uFlash.value = 0;
        flashLight.intensity = 0;
      } else {
        const t = now - t0;

        bodyGroup.position.y = Math.sin(now * 0.7) * 0.035;
        bodyGroup.rotation.y = -0.38 + Math.sin(now * 0.45) * 0.045;

        // 1. Mechanical dip, shutter, flash, shake.
        const fire = span(t, 0.0, 0.16);
        bodyGroup.position.y -= Math.sin(fire * Math.PI) * 0.055;
        bodyGroup.rotation.x = 0.04 + Math.sin(fire * Math.PI) * 0.05;

        const flash = span(t, 0.1, 0.42);
        const flashCurve = flash < 0.22 ? flash / 0.22 : Math.pow(1 - (flash - 0.22) / 0.78, 2.2);
        post.uFlash.value = flash > 0 && flash < 1 ? flashCurve * 0.92 : 0;
        flashLight.intensity = flash > 0 && flash < 1 ? flashCurve * 900 : 0;

        const shake = Math.max(0, 1 - span(t, 0.1, 0.62));
        rig.position.set(
          Math.sin(t * 62.0) * 0.02 * shake,
          Math.cos(t * 71.0) * 0.016 * shake,
          0
        );

        // 2. The print slides out of the slot and settles centre frame.
        const out = span(t, T_FLASH - 0.06, T_EJECT);
        print.visible = out > 0;
        if (out > 0) {
          const e = smooth(out);
          print.position.set(
            0,
            THREE.MathUtils.lerp(slotY, -0.40, e),
            THREE.MathUtils.lerp(slotZ, 1.15, e)
          );
          // A little sway, as a print does leaving the rollers.
          print.rotation.z = Math.sin(e * Math.PI) * 0.07 * (1 - e) + 0.012;
          print.rotation.x = (1 - e) * -0.5;
          printUniforms.uBorder.value = 1;
        }

        // Camera body falls out of focus as the print takes over.
        post.uDefocus.value = 0.0016 + smooth(span(t, T_FLASH, T_EJECT + 0.3)) * 0.0085;

        // 3. Develop.
        printUniforms.uDevelop.value = smooth(span(t, T_EJECT + 0.05, T_DEVELOP));

        // 4. Hold on the finished print, then dissolve into the site. The
        // print deliberately never fills the frame: the handover is a
        // cross-fade, not a zoom into the photograph.
        if (t > T_DEVELOP - 0.1) {
          const g = smooth(span(t, T_DEVELOP - 0.1, T_EXPAND));
          print.position.z = THREE.MathUtils.lerp(1.15, 2.0, g);
          print.position.y = THREE.MathUtils.lerp(-0.4, -0.3, g);
          print.rotation.z = THREE.MathUtils.lerp(0.012, 0.004, g);
          const grow = 1 + g * 0.16;
          print.scale.set(grow, grow, 1);
          post.uDefocus.value = 0.0016 + 0.0085 * (1 - g * 0.35);
          post.uVignette.value = 0.85 + g * 0.3;
          if (g >= 1 && !ending) {
            ending = true;
            setPhase("fading");
          }
        }
      }

      renderer.setRenderTarget(rt);
      renderer.render(scene, view);
      renderer.setRenderTarget(null);
      renderer.render(postScene, postCam);
      if (print.visible) {
        // Composited after the blur so the print holds focus while the body
        // behind it goes soft — a rack focus, not a blur over everything.
        renderer.autoClear = false;
        renderer.clearDepth(); // the fullscreen post quad owns the near plane
        renderer.render(printScene, view);
        renderer.autoClear = true;
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      dead = true;
      cancelAnimationFrame(raf);
      clearTimeout(readyFallback);
      window.removeEventListener("resize", onResize);
      startRef.current = null;
      hitRef.current = null;
      printScene.traverse((o) => {
        const m = o as THREE.Mesh;
        if (m.geometry) m.geometry.dispose();
      });
      scene.traverse((o) => {
        const m = o as THREE.Mesh;
        if (m.geometry) m.geometry.dispose();
      });
      bodyMat.dispose();
      printMat.dispose();
      postMat.dispose();
      quad.geometry.dispose();
      [diffuse, normals, rough, occl, photoTex, env, surfTex, backTex].forEach((x) => x.dispose());
      rt.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const tryStart = (e: React.MouseEvent) => {
    if (phase !== "idle" || !ready) return;
    if (hitRef.current && !hitRef.current(e.clientX, e.clientY)) return;
    setPhase("shoot");
    startRef.current?.();
  };

  if (phase === "removed") return null;

  return (
    <motion.div
      className="fixed inset-0 z-[80] bg-black"
      style={{
        pointerEvents: phase === "fading" ? "none" : "auto",
        cursor: phase === "idle" && hover && ready ? "pointer" : "default",
      }}
      animate={{ opacity: phase === "fading" ? 0 : 1 }}
      transition={{ duration: 0.95, ease: [0.4, 0, 0.2, 1] }}
      onClick={tryStart}
      onMouseMove={(e) => {
        if (phase !== "idle") return;
        setHover(hitRef.current ? hitRef.current(e.clientX, e.clientY) : false);
      }}
    >
      <div ref={mountRef} className="absolute inset-0" aria-hidden="true" />
    </motion.div>
  );
}
