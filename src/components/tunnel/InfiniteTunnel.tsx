import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  Color,
  InstancedBufferAttribute,
  InstancedBufferGeometry,
  MathUtils,
  PerspectiveCamera,
  PlaneGeometry,
  ShaderMaterial,
} from "three";
import { heroSignals, onHeroRevealChange, onHeroRunningChange } from "../hero/heroSignals";
import { ATLAS_GRID, ATLAS_TILES, createTunnelAtlas } from "./tunnelArt";
import { AUTO_FLY_MODE, introPhases, QUESTION_DELAY, TUNNEL_HIDDEN_AT, tunnelConfig, tunnelImages, tunnelImagesHD, tunnelPalette } from "./tunnelConfig";
import { readTunnelScroll, useTunnelScroll } from "./useTunnelScroll";

const FLOOR = 0;
const CEILING = 1;
const LEFT = 2;
const RIGHT = 3;

/** Camera distance travelled at a given timeline progress: steady, then accelerating into the portal. */
function travelAt(p: number) {
  const rush = MathUtils.smoothstep(p, introPhases.accelStart, introPhases.portalEnd);
  return p * tunnelConfig.scrollDistance + rush ** tunnelConfig.rushCurve * tunnelConfig.rushDistance;
}

type Layout = {
  width: number;
  height: number;
  depth: number;
  cols: number;
  rows: number;
  slices: number;
  back: number;
  mobile: boolean;
};

function useTunnelLayout(): Layout {
  const { width, height } = useThree((state) => state.size);
  return useMemo(() => {
    const aspect = width / Math.max(1, height);
    const mobile = aspect < 0.9 || width < 768;
    const { cell } = tunnelConfig;
    const h = aspect < 0.9 ? tunnelConfig.portraitHeight : tunnelConfig.height;
    const w = MathUtils.clamp(h * aspect * 0.92, tunnelConfig.minWidth, tunnelConfig.maxWidth);
    const slices = Math.round((mobile ? tunnelConfig.depth.mobile : tunnelConfig.depth.desktop) / cell);
    return {
      width: w,
      height: h,
      depth: slices * cell,
      cols: Math.max(2, Math.round(w / cell)),
      rows: Math.max(2, Math.round(h / cell)),
      slices,
      back: cell,
      mobile,
    };
  }, [width, height]);
}

const wrapZ = /* glsl */ `
  float wrapZ(float z) {
    float zz = z + uTravel;
    return zz - floor(zz / uDepth) * uDepth - uDepth + uBack;
  }
`;

const panelVertex = /* glsl */ `
  attribute vec3 aCenter;
  attribute vec2 aCell;
  attribute float aWall;
  attribute float aSeed;
  uniform float uTravel, uDepth, uBack, uWidth, uHeight, uDensity, uPhotoShare, uTiles, uFirstPhoto;
  varying vec2 vUv;
  varying vec2 vSize;
  varying float vTile;
  varying float vDepth;
  ${wrapZ}
  float hash(float n) { return fract(sin(n) * 43758.5453123); }
  void main() {
    float zz = aCenter.z + uTravel;
    float cycle = floor(zz / uDepth);
    float z = wrapZ(aCenter.z);
    float s = aSeed + cycle * 31.17;
    float on = step(hash(s), uDensity);
    float photo = step(hash(s + 5.1), uPhotoShare);
    vTile = photo > 0.5
      ? uFirstPhoto + floor(hash(s + 7.3) * (uTiles - uFirstPhoto))
      : floor(hash(s + 9.7) * uFirstPhoto);
    vec2 size = aCell * vec2(0.78 + 0.16 * hash(s + 2.2), 0.78 + 0.16 * hash(s + 3.3));
    float lift = 0.02 + 0.34 * pow(hash(s + 4.4), 2.0);
    vec2 p = position.xy * size * on;
    vec3 w;
    if (aWall < 0.5) w = vec3(aCenter.x + p.x, -uHeight * 0.5 + lift * 0.25, z - p.y);
    else if (aWall < 1.5) w = vec3(aCenter.x + p.x, uHeight * 0.5 - lift * 0.25, z + p.y);
    else if (aWall < 2.5) w = vec3(-uWidth * 0.5 + lift, aCenter.y + p.y, z - p.x);
    else w = vec3(uWidth * 0.5 - lift, aCenter.y + p.y, z + p.x);
    vUv = uv;
    vSize = size;
    vec4 mv = modelViewMatrix * vec4(w, 1.0);
    vDepth = -mv.z;
    gl_Position = projectionMatrix * mv;
  }
`;

const panelFragment = /* glsl */ `
  uniform sampler2D uAtlas;
  uniform vec3 uVoid, uTone;
  uniform float uGrid, uFar, uFade, uFogScale, uFocus, uMono;
  varying vec2 vUv;
  varying vec2 vSize;
  varying float vTile;
  varying float vDepth;
  float roundedBox(vec2 p, vec2 b, float r) {
    vec2 q = abs(p) - b + r;
    return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
  }
  void main() {
    vec2 p = (vUv - 0.5) * vSize;
    float d = roundedBox(p, vSize * 0.5, min(vSize.x, vSize.y) * 0.055);
    if (d > 0.0) discard;
    vec2 uv = vUv;
    float ratio = vSize.x / vSize.y;
    uv = ratio > 1.0 ? vec2(uv.x, (uv.y - 0.5) / ratio + 0.5) : vec2((uv.x - 0.5) * ratio + 0.5, uv.y);
    vec2 tile = vec2(mod(vTile, uGrid), uGrid - 1.0 - floor(vTile / uGrid));
    float inset = clamp(max(fwidth(uv.x), fwidth(uv.y)) * 1.5, 0.004, 0.1);
    vec3 col = texture2D(uAtlas, (tile + clamp(uv, inset, 1.0 - inset)) / uGrid).rgb;
    float aa = fwidth(d);
    col *= 1.0 - smoothstep(-aa * 2.5, 0.0, d) * 0.55;
    float luma = dot(col, vec3(0.299, 0.587, 0.114));
    col = mix(col, uTone * luma, max(uMono, uFocus * 0.88));
    col *= 1.0 - uFocus * 0.55;
    float far = uFar * uFogScale;
    float fog = 1.0 - smoothstep(far * 0.38, far * 0.94 + 0.001, vDepth);
    gl_FragColor = vec4(mix(uVoid, col, fog * uFade), 1.0);
    #include <colorspace_fragment>
  }
`;

function buildPanels(layout: Layout) {
  const { width, height, cols, rows, slices } = layout;
  const { cell } = tunnelConfig;
  const cw = width / cols;
  const rh = height / rows;
  const centers: number[] = [];
  const cells: number[] = [];
  const walls: number[] = [];
  const seeds: number[] = [];
  const push = (x: number, y: number, z: number, wall: number, a: number, b: number) => {
    centers.push(x, y, z);
    cells.push(a, b);
    walls.push(wall);
    seeds.push(seeds.length * 1.618 + 0.37);
  };
  for (let k = 0; k < slices; k += 1) {
    const z = -(k + 0.5) * cell;
    for (let i = 0; i < cols; i += 1) {
      const x = -width / 2 + (i + 0.5) * cw;
      push(x, 0, z, FLOOR, cw, cell);
      push(x, 0, z, CEILING, cw, cell);
    }
    for (let j = 0; j < rows; j += 1) {
      const y = -height / 2 + (j + 0.5) * rh;
      push(0, y, z, LEFT, cell, rh);
      push(0, y, z, RIGHT, cell, rh);
    }
  }
  const plane = new PlaneGeometry(1, 1);
  const geometry = new InstancedBufferGeometry();
  geometry.index = plane.index;
  geometry.setAttribute("position", plane.getAttribute("position"));
  geometry.setAttribute("uv", plane.getAttribute("uv"));
  geometry.setAttribute("aCenter", new InstancedBufferAttribute(new Float32Array(centers), 3));
  geometry.setAttribute("aCell", new InstancedBufferAttribute(new Float32Array(cells), 2));
  geometry.setAttribute("aWall", new InstancedBufferAttribute(new Float32Array(walls), 1));
  geometry.setAttribute("aSeed", new InstancedBufferAttribute(new Float32Array(seeds), 1));
  geometry.instanceCount = walls.length;
  plane.dispose();
  return geometry;
}

function TunnelScene() {
  const layout = useTunnelLayout();
  const camera = useThree((state) => state.camera) as PerspectiveCamera;
  const scroll = useTunnelScroll();
  const motion = useRef({ travel: 0, speed: 0, follow: 0, born: -1 });
  const baseFov = layout.mobile ? tunnelConfig.fov.mobile : tunnelConfig.fov.desktop;

  const maxAnisotropy = useThree((state) => state.gl.capabilities.getMaxAnisotropy());
  const maxTextureSize = useThree((state) => state.gl.capabilities.maxTextureSize);
  const devicePixels = useThree((state) => Math.max(state.size.width, state.size.height) * state.viewport.dpr);
  /** Near panels span ~1000 device px on large or retina screens; a 448px tile from 640px sources turns blocky there. */
  const hd = !layout.mobile && devicePixels >= tunnelConfig.hdFromPixels && maxTextureSize >= tunnelConfig.hdTile * ATLAS_GRID;
  const tile = layout.mobile ? 224 : hd ? tunnelConfig.hdTile : 448;
  const atlas = useMemo(() => createTunnelAtlas(hd ? tunnelImagesHD : tunnelImages, tile), [hd, tile]);
  useEffect(() => atlas.dispose, [atlas]);
  useEffect(() => {
    atlas.texture.anisotropy = Math.min(16, maxAnisotropy);
    atlas.texture.needsUpdate = true;
  }, [atlas, maxAnisotropy]);

  const uniforms = useMemo(
    () => ({
      uTravel: { value: 0 },
      uDepth: { value: 1 },
      uBack: { value: 1 },
      uWidth: { value: 1 },
      uHeight: { value: 1 },
      uFar: { value: 1 },
      uFade: { value: 0 },
      uDensity: { value: tunnelConfig.density },
      uPhotoShare: { value: tunnelConfig.photoShare },
      uTiles: { value: ATLAS_TILES },
      uFirstPhoto: { value: atlas.firstPhoto },
      uGrid: { value: ATLAS_GRID },
      uAtlas: { value: atlas.texture },
      uVoid: { value: new Color(tunnelPalette.void) },
      uFogScale: { value: 1 },
      uFocus: { value: 0 },
      uTone: { value: new Color(tunnelPalette.tone) },
      uMono: { value: tunnelConfig.monochrome },
    }),
    [atlas],
  );

  const panelGeometry = useMemo(() => buildPanels(layout), [layout]);
  const panelMaterial = useMemo(
    () => new ShaderMaterial({ uniforms, vertexShader: panelVertex, fragmentShader: panelFragment }),
    [uniforms],
  );
  useEffect(() => () => panelGeometry.dispose(), [panelGeometry]);
  useEffect(() => () => panelMaterial.dispose(), [panelMaterial]);

  useEffect(() => {
    uniforms.uDepth.value = layout.depth;
    uniforms.uBack.value = layout.back;
    uniforms.uWidth.value = layout.width;
    uniforms.uHeight.value = layout.height;
    uniforms.uFar.value = layout.depth - layout.back;
    camera.fov = baseFov;
    camera.near = 0.05;
    camera.far = layout.depth + 4;
    camera.position.set(0, 0, 0);
    camera.lookAt(0, 0, -1);
    camera.updateProjectionMatrix();
  }, [layout, uniforms, camera, baseFov]);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 1 / 20);
    const state = motion.current;
    const now = performance.now() / 1000;
    if (state.born < 0) state.born = now;
    const age = now - state.born;
    const ramp = MathUtils.smootherstep(age, 0.15, tunnelConfig.introRamp);
    const velocity = readTunnelScroll(scroll, dt);
    let followDelta = 0;
    if (tunnelConfig.mode === AUTO_FLY_MODE) {
      const warp = MathUtils.smoothstep(heroSignals.reveal, 0.02, TUNNEL_HIDDEN_AT) ** 1.6 * tunnelConfig.revealWarp;
      const target = tunnelConfig.speed * ramp + velocity * tunnelConfig.scrollBoost + warp;
      state.speed = MathUtils.damp(
        state.speed,
        MathUtils.clamp(target, tunnelConfig.minSpeed, tunnelConfig.maxSpeed),
        1 / tunnelConfig.damping,
        dt,
      );
    } else {
      state.speed = MathUtils.damp(state.speed, tunnelConfig.drift * ramp, 1 / tunnelConfig.damping, dt);
      const goal = travelAt(heroSignals.progress);
      const limit = tunnelConfig.followMaxSpeed * dt;
      followDelta = MathUtils.clamp(MathUtils.damp(state.follow, goal, tunnelConfig.follow, dt) - state.follow, -limit, limit);
      state.follow += followDelta;
    }
    state.travel = (state.travel + state.speed * dt + followDelta) % (layout.depth * 64);
    uniforms.uTravel.value = state.travel;
    uniforms.uFade.value = MathUtils.smoothstep(age, 0.05, tunnelConfig.introFade);

    const p = heroSignals.progress;
    const rush = MathUtils.smoothstep(p, introPhases.accelStart, introPhases.portalEnd);
    const portal = MathUtils.smoothstep(p, introPhases.portalStart, introPhases.portalEnd);
    uniforms.uFogScale.value = (1 - portal) ** 1.15;
    uniforms.uFocus.value =
      MathUtils.smoothstep(age, QUESTION_DELAY, QUESTION_DELAY + 0.7) *
      (1 - MathUtils.smoothstep(p, introPhases.questionOut, introPhases.questionOut + 0.1));

    const t = age;
    const { sway } = tunnelConfig;
    const calm = 1 - rush * 0.7;
    camera.position.set(Math.sin(t * 0.31) * sway.x * calm, Math.cos(t * 0.23) * sway.y * calm, 0);
    camera.rotation.set(0, 0, Math.sin(t * 0.17) * sway.roll);
    const fov = baseFov + MathUtils.smootherstep(rush, 0, 1) * tunnelConfig.rushFov;
    if (Math.abs(camera.fov - fov) > 0.01) {
      camera.fov = fov;
      camera.updateProjectionMatrix();
    }
  });

  return (
    <>
      <mesh geometry={panelGeometry} material={panelMaterial} frustumCulled={false} />
    </>
  );
}

function FrameGate() {
  const setFrameloop = useThree((state) => state.setFrameloop);
  useEffect(() => {
    let current: "always" | "never" | null = null;
    // setFrameloop resets R3F's clock on every call, so only call it when the mode changes.
    const sync = () => {
      const next = heroSignals.running && heroSignals.reveal < TUNNEL_HIDDEN_AT ? "always" : "never";
      if (next === current) return;
      current = next;
      setFrameloop(next);
    };
    sync();
    const offReveal = onHeroRevealChange(sync);
    const offRunning = onHeroRunningChange(sync);
    return () => {
      offReveal();
      offRunning();
    };
  }, [setFrameloop]);
  return null;
}

export function InfiniteTunnel({ className }: { className?: string }) {
  const [enabled, setEnabled] = useState(false);
  const [mobile, setMobile] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setMobile(window.matchMedia("(max-width: 767px), (pointer: coarse)").matches);
    setEnabled(true);
  }, []);

  if (!enabled) return <div className={className} aria-hidden="true" />;

  return (
    <div className={className} aria-hidden="true">
      <Canvas
        flat
        dpr={[1, mobile ? tunnelConfig.maxDpr.mobile : tunnelConfig.maxDpr.desktop]}
        gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
        camera={{ fov: tunnelConfig.fov.desktop, near: 0.05, far: 60, position: [0, 0, 0] }}
        onCreated={({ gl }) => gl.setClearColor(tunnelPalette.void)}
      >
        <FrameGate />
        <TunnelScene />
      </Canvas>
    </div>
  );
}
