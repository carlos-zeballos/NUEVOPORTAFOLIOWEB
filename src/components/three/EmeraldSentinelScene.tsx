import { Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, useAnimations, useGLTF } from "@react-three/drei";
import { AnimationAction, AnimationMixer, Euler, LoopOnce, MathUtils, Quaternion, Vector2, type Bone, type Group, type Mesh } from "three";
import { clone } from "three/examples/jsm/utils/SkeletonUtils.js";

const stageWalkUrl = new URL(
  "../../public/Assets/Meshy_AI_Emerald_Sentinel_biped/Meshy_AI_Emerald_Sentinel_biped_Animation_Stage_Walk_withSkin.glb",
  import.meta.url,
).href;

const walkSpeed = 1.3;
const revealAt = 0.72;
const maxYaw = 0.68;
const maxPitch = 0.3;
const neckShare = 0.4;
const stiffness = 26;
const pointerIdleMs = 2600;
const glances = [
  { yaw: -0.62, pitch: 0.04 },
  { yaw: 0.55, pitch: -0.06 },
  { yaw: -0.3, pitch: -0.14 },
  { yaw: 0.34, pitch: 0.1 },
  { yaw: 0, pitch: 0 },
];

type Axis = { value: number; velocity: number };

const springTo = (axis: Axis, target: number, dt: number) => {
  const acceleration = stiffness * (target - axis.value) - 2 * Math.sqrt(stiffness) * axis.velocity;
  axis.velocity += acceleration * dt;
  axis.value += axis.velocity * dt;
};

function EmeraldSentinel() {
  const groupRef = useRef<Group>(null);
  const headRef = useRef<Bone | null>(null);
  const neckRef = useRef<Bone | null>(null);
  const trackingRef = useRef(false);
  const pointerRef = useRef(new Vector2());
  const pointerAtRef = useRef(-Infinity);
  const baseHeadRef = useRef(new Quaternion());
  const baseNeckRef = useRef(new Quaternion());
  const offsetRef = useRef(new Quaternion());
  const eulerRef = useRef(new Euler(0, 0, 0, "YXZ"));
  const yawRef = useRef<Axis>({ value: 0, velocity: 0 });
  const pitchRef = useRef<Axis>({ value: 0, velocity: 0 });
  const glanceRef = useRef({ index: -1, until: 0 });
  const stageWalkFile = useGLTF(stageWalkUrl);
  const model = useMemo(() => clone(stageWalkFile.scene), [stageWalkFile.scene]);
  const clip = useMemo(() => {
    const stageWalk = stageWalkFile.animations[0].clone();
    stageWalk.name = "StageWalk";
    return stageWalk;
  }, [stageWalkFile.animations]);
  const { actions, mixer } = useAnimations([clip], groupRef);
  const aspect = useThree((state) => state.viewport.aspect);

  useEffect(() => {
    model.traverse((child) => {
      if (child.name === "Head") headRef.current = child as Bone;
      if (child.name === "neck") neckRef.current = child as Bone;
      const mesh = child as Mesh;
      if (!mesh.isMesh) return;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
    });
  }, [model]);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion || window.matchMedia("(pointer: coarse)").matches) return;
    const trackPointer = (event: PointerEvent) => {
      pointerRef.current.set(
        (event.clientX / window.innerWidth) * 2 - 1,
        -((event.clientY / window.innerHeight) * 2 - 1),
      );
      pointerAtRef.current = performance.now();
    };
    window.addEventListener("pointermove", trackPointer, { passive: true });
    return () => window.removeEventListener("pointermove", trackPointer);
  }, []);

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
      if (headRef.current && neckRef.current && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        baseHeadRef.current.copy(headRef.current.quaternion);
        baseNeckRef.current.copy(neckRef.current.quaternion);
        glanceRef.current.until = performance.now() + 900;
        trackingRef.current = true;
      }
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
    const watch = window.setInterval(nearEnd, 100);

    return () => {
      window.clearInterval(watch);
      mixer.removeEventListener("finished", finished as Parameters<AnimationMixer["removeEventListener"]>[1]);
      trackingRef.current = false;
      walk.stop();
    };
  }, [actions, mixer, clip]);

  useFrame(({ clock }, delta) => {
    const head = headRef.current;
    const neck = neckRef.current;
    if (!head || !neck || !trackingRef.current) return;
    const now = performance.now();
    const dt = Math.min(delta, 1 / 30);
    let targetYaw: number;
    let targetPitch: number;

    if (now - pointerAtRef.current < pointerIdleMs) {
      targetYaw = MathUtils.clamp(pointerRef.current.x * maxYaw, -maxYaw, maxYaw);
      targetPitch = MathUtils.clamp(-pointerRef.current.y * maxPitch, -maxPitch, maxPitch);
      glanceRef.current.until = now + 1200;
    } else {
      const glance = glanceRef.current;
      if (now >= glance.until) {
        let next = Math.floor(Math.random() * glances.length);
        if (next === glance.index) next = (next + 1) % glances.length;
        glance.index = next;
        glance.until = now + 1700 + Math.random() * 1800;
      }
      const target = glances[glance.index] ?? glances[glances.length - 1];
      targetYaw = target.yaw;
      targetPitch = target.pitch;
    }

    const time = clock.elapsedTime;
    springTo(yawRef.current, targetYaw + Math.sin(time * 0.9) * 0.015, dt);
    springTo(pitchRef.current, targetPitch + Math.sin(time * 1.3 + 1) * 0.01, dt);
    const yaw = yawRef.current.value;
    const pitch = pitchRef.current.value;

    eulerRef.current.set(pitch * neckShare, yaw * neckShare, 0);
    neck.quaternion.copy(baseNeckRef.current).multiply(offsetRef.current.setFromEuler(eulerRef.current));
    eulerRef.current.set(pitch * (1 - neckShare), yaw * (1 - neckShare), 0);
    head.quaternion.copy(baseHeadRef.current).multiply(offsetRef.current.setFromEuler(eulerRef.current));
  });

  return (
    <group ref={groupRef} position={[aspect < 1 ? 1.15 : 1.9, -1.8, -5.95]} rotation={[0, -.14, 0]} scale={1.75}>
      <primitive object={model} />
    </group>
  );
}

export function EmeraldSentinelScene() {
  return (
    <Canvas
      dpr={[1, 1.5]}
      shadows
      camera={{ position: [0, 1.1, 6.6], fov: 34 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
    >
      <ambientLight intensity={1.05} />
      <directionalLight position={[2.5, 6, 5]} intensity={3.8} castShadow shadow-mapSize={[1024, 1024]} />
      <pointLight position={[.6, 2, 2.5]} color="#03ea00" intensity={9} distance={8} />
      <pointLight position={[3.5, 3, 3]} color="#ffffff" intensity={12} distance={9} />
      <pointLight position={[2.2, -.3, 2]} color="#b8c6bd" intensity={4} distance={6} />
      <Suspense fallback={null}><EmeraldSentinel /></Suspense>
      <ContactShadows position={[2.32, -1.8, 3.5]} opacity={.4} scale={6.8} blur={2.8} far={4} color="#000000" />
    </Canvas>
  );
}

useGLTF.preload(stageWalkUrl);
