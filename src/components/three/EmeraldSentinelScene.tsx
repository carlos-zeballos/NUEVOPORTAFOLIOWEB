import { Suspense, useEffect, useMemo, useRef, useState, type RefObject } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, useAnimations, useFBO, useGLTF } from "@react-three/drei";
import { AnimationAction, AnimationMixer, Euler, HalfFloatType, LoopOnce, MathUtils, Mesh as ThreeMesh, OrthographicCamera, PlaneGeometry, Quaternion, Scene, ShaderMaterial, Vector2, Vector3, type AmbientLight, type Bone, type DirectionalLight, type Group, type Mesh, type PointLight } from "three";
import { clone } from "three/examples/jsm/utils/SkeletonUtils.js";
import { heroSignals, onHeroRevealChange, onHeroRunningChange } from "../hero/heroSignals";
import { introPhases } from "../tunnel/tunnelConfig";

const stageWalkUrl = new URL(
  "../../public/Assets/Meshy_AI_Emerald_Sentinel_biped/Meshy_AI_Emerald_Sentinel_biped_Animation_Stage_Walk_withSkin.glb",
  import.meta.url,
).href;

const walkSpeed = 1.05;
/** After the walk the robot holds its side pose and, every few seconds, calmly shifts its weight and looks at the viewer. */
const poseEveryS = 12;
const poseTurnS = 2.6;
const poseHoldS = 4;
const walkStartAt = 0.84;
const riseMs = 1600;
/** The robot keeps rendering this long after mount so its entrance walk finishes while hidden. */
const settleMs = 4000;
const revealAt = 0.72;
const maxYaw = 0.45;
const maxPitch = 0.2;
const neckShare = 0.4;
const stiffness = 10;
const talkMs = 1600;
const pointerIdleMs = 2600;
/** Half width of the hover area around the robot, in world units. */
const hoverHalfWidth = 0.55;
const lookAtViewer = { yaw: 0.36, pitch: -0.02 };
const lookAtCopy = { yaw: -0.32, pitch: 0.1 };
const lookAtIntro = { yaw: 0, pitch: 0.03 };
const revealOf = () => MathUtils.smootherstep(heroSignals.reveal, introPhases.portalEnd, 1);
const assembleOf = () => MathUtils.smoothstep(heroSignals.reveal, introPhases.portalEnd - 0.02, introPhases.portalEnd + 0.15);

type Axis = { value: number; velocity: number };

const poseAt = (seconds: number) => {
  const phase = seconds % poseEveryS;
  const start = poseEveryS - poseHoldS - poseTurnS * 2;
  const into = MathUtils.smootherstep(phase - start, 0, poseTurnS);
  const back = MathUtils.smootherstep(phase - start - poseTurnS - poseHoldS, 0, poseTurnS);
  return into - back;
};

const springTo = (axis: Axis, target: number, dt: number) => {
  const acceleration = stiffness * (target - axis.value) - 2 * Math.sqrt(stiffness) * axis.velocity;
  axis.velocity += acceleration * dt;
  axis.value += axis.velocity * dt;
};

const chestWorld = new Vector3();
const groupZ = -5.95;
const robotZ = 1.1;
const robotDepth = 6.6 - robotZ;
const stage = { robotX: 1.2 };
/** Pointer in canvas NDC plus the robot's hover state, shared by the robot, the lights and the dot pass. */
const hover = { x: 0, y: 0, movedAt: -Infinity, inside: false, amount: 0, enteredAt: -Infinity };
const headNdc = new Vector3();
const edgeNdc = new Vector3();
const centerNdc = new Vector3();
const sinceReady = () => (heroSignals.robotReadyAt ? performance.now() - heroSignals.robotReadyAt : 0);
const lightRamp = () => MathUtils.smootherstep(sinceReady() / 700, 0, 1);
const hipsWorld = new Vector3();
const hipsLocal = new Vector3();

function EmeraldSentinel({ chestLightRef, shadowRef }: { chestLightRef: RefObject<PointLight>; shadowRef: RefObject<Group> }) {
  const groupRef = useRef<Group>(null);
  const hipsRef = useRef<Bone | null>(null);
  const chestRef = useRef<Bone | null>(null);
  const shoulderRefs = useRef<Bone[]>([]);
  const breathRef = useRef(new Quaternion());
  const reducedRef = useRef(false);
  const headRef = useRef<Bone | null>(null);
  const neckRef = useRef<Bone | null>(null);
  const trackingRef = useRef(false);
  const settlePendingRef = useRef(false);
  /** The clamped walk pose never changes, so the mixer stops rewriting these bones; offsets are applied on top of a saved copy. */
  const basePoseRef = useRef(new Map<Bone, Quaternion>());
  const offsetRef = useRef(new Quaternion());
  const eulerRef = useRef(new Euler(0, 0, 0, "YXZ"));
  const yawRef = useRef<Axis>({ value: 0, velocity: 0 });
  const pitchRef = useRef<Axis>({ value: 0, velocity: 0 });
  const stageWalkFile = useGLTF(stageWalkUrl);
  const model = useMemo(() => clone(stageWalkFile.scene), [stageWalkFile.scene]);
  const clip = useMemo(() => {
    const stageWalk = stageWalkFile.animations[0].clone();
    stageWalk.name = "StageWalk";
    return stageWalk;
  }, [stageWalkFile.animations]);
  const settledAtRef = useRef(0);
  const { actions, mixer } = useAnimations([clip], groupRef);
  const aspect = useThree((state) => state.viewport.aspect);
  const gl = useThree((state) => state.gl);
  const camera = useThree((state) => state.camera);
  const portrait = aspect < 0.8;
  const halfWidth = Math.tan(MathUtils.degToRad(34 / 2)) * robotDepth * aspect;
  const robotX = halfWidth * (portrait ? 0.2 : 0.45);
  const baseY = portrait ? -3.25 : -4.3;
  const baseScale = portrait ? 2.6 : 3.3;
  const facing = portrait ? -0.3 : -0.5;
  const riseOffset = 1.4;
  stage.robotX = robotX;


  useEffect(() => {
    reducedRef.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    heroSignals.robotReadyAt = performance.now();
    shoulderRefs.current = [];
    model.traverse((child) => {
      if (child.name === "Head") headRef.current = child as Bone;
      if (child.name === "Hips") hipsRef.current = child as Bone;
      if (child.name === "neck") neckRef.current = child as Bone;
      if (child.name === "Spine02") chestRef.current = child as Bone;
      if (child.name === "LeftShoulder" || child.name === "RightShoulder") shoulderRefs.current.push(child as Bone);
      const mesh = child as Mesh;
      if (!mesh.isMesh) return;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
    });
  }, [model]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || window.matchMedia("(pointer: coarse)").matches) return;
    const canvas = gl.domElement;
    const track = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      hover.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      hover.y = -(((event.clientY - rect.top) / rect.height) * 2 - 1);
      hover.movedAt = performance.now();
    };
    window.addEventListener("pointermove", track, { passive: true });
    return () => window.removeEventListener("pointermove", track);
  }, [gl]);

  useEffect(() => {
    const walk = actions.StageWalk as AnimationAction | undefined;
    if (!walk) return;
    let revealed = false;
    const reveal = () => {
      if (revealed) return;
      revealed = true;
      window.dispatchEvent(new CustomEvent("sentinel:stage-walk-complete"));
    };

    const finished = (event: { action: AnimationAction }) => {
      if (event.action !== walk) return;
      if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) settlePendingRef.current = true;
      reveal();
    };
    const nearEnd = () => {
      if (walk.time >= clip.duration * revealAt) reveal();
    };

    mixer.addEventListener("finished", finished as Parameters<AnimationMixer["addEventListener"]>[1]);
    walk.reset().setLoop(LoopOnce, 1);
    walk.clampWhenFinished = true;
    walk.timeScale = walkSpeed;
    walk.play();
    walk.time = clip.duration * walkStartAt;
    const watch = window.setInterval(nearEnd, 100);

    return () => {
      window.clearInterval(watch);
      mixer.removeEventListener("finished", finished as Parameters<AnimationMixer["removeEventListener"]>[1]);
      trackingRef.current = false;
      settlePendingRef.current = false;
      basePoseRef.current.clear();
      walk.stop();
    };
  }, [actions, mixer, clip]);

  useFrame(({ clock }, delta) => {
    const group = groupRef.current;
    const time = clock.elapsedTime;
    const motion = reducedRef.current ? 0 : 1;
    if (settlePendingRef.current) {
      settlePendingRef.current = false;
      const bones = [chestRef.current, neckRef.current, headRef.current, ...shoulderRefs.current];
      bones.forEach((bone) => bone && basePoseRef.current.set(bone, bone.quaternion.clone()));
      settledAtRef.current = performance.now();
      trackingRef.current = true;
    }
    const pose = trackingRef.current ? poseAt((performance.now() - settledAtRef.current) / 1000) : 0;
    if (group) {
      const rise = motion ? 1 - (1 - MathUtils.clamp(sinceReady() / riseMs, 0, 1)) ** 3 : 1;
      const scale = baseScale;
      const x = robotX;
      const yaw = facing - (1 - rise) * 0.25;
      group.position.y = baseY - (1 - rise) * riseOffset + Math.sin(time * 0.6) * 0.008 * motion;
      group.rotation.y = yaw;
      group.scale.setScalar(scale);
      const hips = hipsRef.current;
      if (hips) {
        hips.getWorldPosition(hipsWorld);
        group.worldToLocal(hipsLocal.copy(hipsWorld));
        const ox = hipsLocal.x * scale;
        const oz = hipsLocal.z * scale;
        const cos = Math.cos(yaw);
        const sin = Math.sin(yaw);
        group.position.x = x - (ox * cos + oz * sin);
        group.position.z = robotZ - (-ox * sin + oz * cos);
        shadowRef.current?.position.set(hipsWorld.x, group.position.y + 0.005, hipsWorld.z);
      } else {
        group.position.x = x;
      }
    }

    const head = headRef.current;
    const pointerFresh = performance.now() - hover.movedAt < pointerIdleMs;
    let inside = false;
    if (head) head.getWorldPosition(headNdc).project(camera);
    if (head && trackingRef.current && pointerFresh && revealOf() > 0.5) {
      const centerX = centerNdc.copy(hipsWorld).project(camera).x;
      const halfWidth = Math.abs(edgeNdc.copy(hipsWorld).setX(hipsWorld.x + hoverHalfWidth).project(camera).x - centerX);
      inside = Math.abs(hover.x - centerX) < halfWidth && hover.y < headNdc.y + 0.08;
    }
    if (inside && !hover.inside) hover.enteredAt = performance.now();
    hover.inside = inside;
    hover.amount += ((inside ? 1 : 0) - hover.amount) * (1 - Math.exp(-delta * 6));

    const chest = chestRef.current;
    const light = chestLightRef.current;
    if (chest && light) {
      chest.getWorldPosition(chestWorld);
      light.position.set(chestWorld.x, chestWorld.y + 0.08, chestWorld.z + 0.6);
      const pulse = Math.pow(Math.sin(time * (2.1 + hover.amount * 2)) * 0.5 + 0.5, 3);
      light.intensity = (2.5 + pulse * 6 * motion + hover.amount * 7) * lightRamp();
    }

    if (!trackingRef.current || !motion) return;
    const base = basePoseRef.current;
    const breath = Math.sin(time * 1.1);
    const chestBase = chest && base.get(chest);
    if (chest && chestBase) {
      eulerRef.current.set(breath * 0.015, pose * 0.04, -pose * 0.025);
      chest.quaternion.copy(chestBase).multiply(breathRef.current.setFromEuler(eulerRef.current));
    }
    shoulderRefs.current.forEach((bone, index) => {
      const shoulderBase = base.get(bone);
      if (!shoulderBase) return;
      eulerRef.current.set(0, 0, (index === 0 ? 1 : -1) * breath * 0.01);
      bone.quaternion.copy(shoulderBase).multiply(breathRef.current.setFromEuler(eulerRef.current));
    });
  });

  useFrame((_, delta) => {
    const head = headRef.current;
    const neck = neckRef.current;
    const headBase = head && basePoseRef.current.get(head);
    const neckBase = neck && basePoseRef.current.get(neck);
    if (!head || !neck || !headBase || !neckBase || !trackingRef.current) return;
    const now = performance.now();
    const dt = Math.min(delta, 1 / 30);
    const reveal = revealOf();
    const talking = heroSignals.featuredAt > 0 && now - heroSignals.featuredAt < talkMs;
    const focus = reveal < 0.5 ? lookAtIntro : talking ? lookAtViewer : lookAtCopy;
    const glance = reveal < 0.5 || talking ? 0 : poseAt((now - settledAtRef.current) / 1000);
    let yawGoal = MathUtils.lerp(focus.yaw, lookAtViewer.yaw, glance * 0.5);
    let pitchGoal = MathUtils.lerp(focus.pitch, lookAtViewer.pitch, glance * 0.5);
    if (reveal > 0.5 && now - hover.movedAt < pointerIdleMs) {
      // headNdc holds the head's screen position, projected in the frame callback above.
      yawGoal = lookAtViewer.yaw + (hover.x - headNdc.x) * 0.5;
      pitchGoal = -(hover.y - headNdc.y) * 0.3;
    }
    const targetYaw = MathUtils.clamp(yawGoal, -maxYaw, maxYaw);
    const targetPitch = MathUtils.clamp(pitchGoal, -maxPitch, maxPitch);

    springTo(yawRef.current, targetYaw, dt);
    springTo(pitchRef.current, targetPitch, dt);
    const yaw = yawRef.current.value;
    const pitch = pitchRef.current.value;

    eulerRef.current.set(pitch * neckShare, yaw * neckShare, 0);
    neck.quaternion.copy(neckBase).multiply(offsetRef.current.setFromEuler(eulerRef.current));
    eulerRef.current.set(pitch * (1 - neckShare), yaw * (1 - neckShare), 0);
    head.quaternion.copy(headBase).multiply(offsetRef.current.setFromEuler(eulerRef.current));  });

  return (
    <group ref={groupRef} position={[robotX, baseY - riseOffset, groupZ]} rotation={[0, facing, 0]} scale={baseScale}>
      <primitive object={model} />
    </group>
  );
}

function StageLights() {
  const ambientRef = useRef<AmbientLight>(null);
  const keyRef = useRef<DirectionalLight>(null);
  const greenRef = useRef<PointLight>(null);
  const whiteRef = useRef<PointLight>(null);
  const rimRef = useRef<PointLight>(null);

  useFrame(({ clock }, delta) => {
    const ramp = lightRamp();
    const t = clock.elapsedTime;
    const follow = 1 - Math.exp(-delta * 2.4);
    if (ambientRef.current) ambientRef.current.intensity = 0.35 + 0.75 * ramp;
    if (keyRef.current) keyRef.current.intensity = 3.8 * ramp;
    if (whiteRef.current) whiteRef.current.intensity = 12 * ramp;
    if (rimRef.current) rimRef.current.intensity = 4 * ramp;
    const green = greenRef.current;
    if (green) {
      const target = 8 * ramp + Math.sin(t * 0.7) * 0.6 * ramp;
      green.intensity += (target - green.intensity) * follow;
      green.position.x = stage.robotX - 0.5 + heroSignals.pointer.x * 0.3;
    }
  });

  return (
    <>
      <ambientLight ref={ambientRef} intensity={0.35} />
      <directionalLight ref={keyRef} position={[2.5, 6, 5]} intensity={0} castShadow shadow-mapSize={[1024, 1024]} />
      <pointLight ref={greenRef} position={[.6, 2, 2.5]} color="#03ea00" intensity={0} distance={8} />
      <pointLight ref={whiteRef} position={[3.5, 3, 3]} color="#ffffff" intensity={0} distance={9} />
      <pointLight ref={rimRef} position={[2.2, -.3, 2]} color="#b8c6bd" intensity={0} distance={6} />
    </>
  );
}

const DOT_VS = `
varying vec2 vUv;
void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }
`;

const DOT_FS = `
uniform sampler2D tScene;
uniform vec2 uRes;
uniform float uAssemble;
uniform float uTime;
uniform float uCell;
uniform float uDpr;
uniform vec2 uMouse;
uniform float uHover;
uniform float uRipple;
varying vec2 vUv;
float hash(vec2 p){ p = fract(p*vec2(123.34,456.21)); p += dot(p,p+45.32); return fract(p.x*p.y); }
void main(){
  vec2 px = vUv*uRes;
  float cs = uCell*uDpr;
  vec2 cell = floor(px/cs);
  float h1 = hash(cell);
  float h2 = hash(cell + 17.3);
  float h3 = hash(cell + 41.7);
  vec2 drift = vec2(sin(uTime*0.8 + h1*6.28), cos(uTime*0.7 + h2*6.28))*0.16;
  vec2 center = (cell + 0.5 + (vec2(h1, h2) - 0.5)*0.7 + drift)*cs;
  vec2 toMouse = center - uMouse;
  float md = length(toMouse);
  float reach = 150.0*uDpr;
  float near = uHover*exp(-md*md/(reach*reach));
  float wave = (md - uRipple*520.0*uDpr)/(26.0*uDpr);
  float ring = uHover*exp(-wave*wave)*exp(-uRipple*1.4);
  float energy = clamp(near + ring, 0.0, 1.0);
  vec2 push = md > 0.0 ? toMouse/md*near*12.0*uDpr : vec2(0.0);
  vec4 s = texture2D(tScene, (center - push)/uRes);
  float lum = dot(s.rgb, vec3(0.2126, 0.7152, 0.0722));
  float present = step(h3, smoothstep(0.003, 0.09, lum)*0.95) * step(0.05, s.a);
  float r = (0.5 + 1.0*smoothstep(0.0, 0.3, lum))*uDpr*(1.0 + energy*0.7);
  float d = length(px - center);
  float a = present*(1.0 - smoothstep(r - 0.6*uDpr, r + 0.6*uDpr, d));
  a *= 0.72 + 0.28*sin(uTime*2.4 + h3*40.0);
  vec3 hue = s.rgb/max(max(s.r, max(s.g, s.b)), 0.001);
  vec3 col = mix(vec3(1.0), hue, 0.3);
  col = mix(col, vec3(0.22, 1.0, 0.3), 0.45 + 0.5*step(0.35, h1))*1.35;
  col = mix(col, vec3(0.45, 1.0, 0.5)*1.6, energy*0.85);
  a = min(1.0, a*(1.0 + energy*0.6));
  a *= step(hash(cell + 7.9), uAssemble*1.02);
  gl_FragColor = vec4(col*a, a);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`;

function DotPass() {
  const gl = useThree((state) => state.gl);
  const scene = useThree((state) => state.scene);
  const camera = useThree((state) => state.camera);
  const fbo = useFBO({ samples: 4, type: HalfFloatType });
  const pass = useMemo(() => {
    const material = new ShaderMaterial({
      uniforms: {
        tScene: { value: null },
        uRes: { value: new Vector2(1, 1) },
        uAssemble: { value: 0 },
        uTime: { value: 0 },
        uCell: { value: 5 },
        uDpr: { value: 1 },
        uMouse: { value: new Vector2(-1e4, -1e4) },
        uHover: { value: 0 },
        uRipple: { value: 10 },
      },
      vertexShader: DOT_VS,
      fragmentShader: DOT_FS,
      transparent: true,
      premultipliedAlpha: true,
      depthTest: false,
      depthWrite: false,
    });
    const quad = new ThreeMesh(new PlaneGeometry(2, 2), material);
    quad.frustumCulled = false;
    const quadScene = new Scene();
    quadScene.add(quad);
    return { material, quadScene, quadCamera: new OrthographicCamera(-1, 1, 1, -1, 0, 1) };
  }, []);

  useEffect(() => () => {
    pass.material.dispose();
    (pass.quadScene.children[0] as ThreeMesh).geometry.dispose();
  }, [pass]);

  useFrame(({ clock }) => {
    const assemble = assembleOf();
    gl.setRenderTarget(null);
    if (assemble <= 0.001 && sinceReady() > settleMs) {
      gl.clear();
      return;
    }
    gl.setRenderTarget(fbo);
    gl.render(scene, camera);
    gl.setRenderTarget(null);
    const u = pass.material.uniforms;
    u.tScene.value = fbo.texture;
    u.uRes.value.set(fbo.width, fbo.height);
    u.uAssemble.value = assemble;
    u.uTime.value = clock.elapsedTime;
    u.uDpr.value = gl.getPixelRatio();
    u.uMouse.value.set((hover.x * 0.5 + 0.5) * fbo.width, (hover.y * 0.5 + 0.5) * fbo.height);
    u.uHover.value = hover.amount;
    u.uRipple.value = (performance.now() - hover.enteredAt) / 1000;
    gl.render(pass.quadScene, pass.quadCamera);
  }, 1);

  return null;
}

export function EmeraldSentinelScene() {
  const chestLightRef = useRef<PointLight>(null);
  const shadowRef = useRef<Group>(null);
  const [active, setActive] = useState(true);

  useEffect(() => {
    const mountedAt = performance.now();
    const sync = () => {
      const settling = performance.now() - mountedAt < settleMs;
      const visible = heroSignals.reveal >= introPhases.portalStart;
      setActive(heroSignals.running && (visible || settling));
    };
    sync();
    const settle = window.setTimeout(sync, settleMs);
    const offReveal = onHeroRevealChange(sync);
    const offRunning = onHeroRunningChange(sync);
    return () => {
      window.clearTimeout(settle);
      offReveal();
      offRunning();
    };
  }, []);

  return (
    <Canvas
      frameloop={active ? "always" : "never"}
      dpr={[1, 1.5]}
      shadows
      camera={{ position: [0, 1.1, 6.6], fov: 34 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
    >
      <StageLights />
      <pointLight ref={chestLightRef} color="#03ea00" intensity={0} distance={1.8} decay={2} />
      <Suspense fallback={null}><EmeraldSentinel chestLightRef={chestLightRef} shadowRef={shadowRef} /></Suspense>
      <DotPass />
      <ContactShadows ref={shadowRef} position={[0, -1.78, 1]} opacity={.6} scale={3.2} blur={2.6} far={2.5} color="#000000" />
    </Canvas>
  );
}

useGLTF.preload(stageWalkUrl);
