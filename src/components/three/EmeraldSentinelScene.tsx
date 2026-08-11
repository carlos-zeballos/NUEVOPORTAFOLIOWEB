import { Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, useAnimations, useGLTF } from "@react-three/drei";
import { AnimationAction, AnimationMixer, Euler, LoopOnce, MathUtils, Quaternion, Vector2, type Bone, type Group, type Mesh } from "three";
import { clone } from "three/examples/jsm/utils/SkeletonUtils.js";

const stageWalkUrl = new URL(
  "../../public/Assets/Meshy_AI_Emerald_Sentinel_biped/Meshy_AI_Emerald_Sentinel_biped_Animation_Stage_Walk_withSkin.glb",
  import.meta.url,
).href;

function EmeraldSentinel() {
  const groupRef = useRef<Group>(null);
  const headRef = useRef<Bone | null>(null);
  const trackingRef = useRef(false);
  const pointerRef = useRef(new Vector2());
  const baseHeadQuaternionRef = useRef(new Quaternion());
  const targetQuaternionRef = useRef(new Quaternion());
  const offsetQuaternionRef = useRef(new Quaternion());
  const offsetEulerRef = useRef(new Euler(0, 0, 0, "YXZ"));
  const stageWalkFile = useGLTF(stageWalkUrl);
  const model = useMemo(() => clone(stageWalkFile.scene), [stageWalkFile.scene]);
  const clip = useMemo(() => {
    const stageWalk = stageWalkFile.animations[0].clone();
    stageWalk.name = "StageWalk";
    return stageWalk;
  }, [stageWalkFile.animations]);
  const { actions, mixer } = useAnimations([clip], groupRef);

  useEffect(() => {
    model.traverse((child) => {
      if (child.name === "Head") headRef.current = child as Bone;
      const mesh = child as Mesh;
      if (!mesh.isMesh) return;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
    });
  }, [model]);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) return;
    const trackPointer = (event: PointerEvent) => {
      pointerRef.current.set(
        (event.clientX / window.innerWidth) * 2 - 1,
        -((event.clientY / window.innerHeight) * 2 - 1),
      );
    };
    window.addEventListener("pointermove", trackPointer, { passive: true });
    return () => window.removeEventListener("pointermove", trackPointer);
  }, []);

  useEffect(() => {
    const walk = actions.StageWalk as AnimationAction | undefined;
    if (!walk) return;

    const finished = (event: { action: AnimationAction }) => {
      if (event.action !== walk) return;
      if (headRef.current && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        baseHeadQuaternionRef.current.copy(headRef.current.quaternion);
        trackingRef.current = true;
      }
      window.dispatchEvent(new CustomEvent("sentinel:stage-walk-complete"));
    };

    mixer.addEventListener("finished", finished as Parameters<AnimationMixer["addEventListener"]>[1]);
    walk.reset().setLoop(LoopOnce, 1);
    walk.clampWhenFinished = true;
    walk.timeScale = 1;
    walk.play();

    return () => {
      mixer.removeEventListener("finished", finished as Parameters<AnimationMixer["removeEventListener"]>[1]);
      trackingRef.current = false;
      walk.stop();
    };
  }, [actions, mixer]);

  useFrame((_, delta) => {
    const head = headRef.current;
    if (!head || !trackingRef.current) return;
    const yaw = MathUtils.clamp(pointerRef.current.x * .46, -.46, .46);
    const pitch = MathUtils.clamp(-pointerRef.current.y * .24, -.24, .24);
    offsetEulerRef.current.set(pitch, yaw, 0);
    offsetQuaternionRef.current.setFromEuler(offsetEulerRef.current);
    targetQuaternionRef.current.copy(baseHeadQuaternionRef.current).multiply(offsetQuaternionRef.current);
    head.quaternion.slerp(targetQuaternionRef.current, 1 - Math.exp(-Math.min(delta, 1 / 30) * 6));
  });

  return (
    <group ref={groupRef} position={[1.9, -1.8, -5.95]} rotation={[0, -.14, 0]} scale={1.75}>
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
