import { useEffect, useRef } from "react";

/** Scroll velocity in viewport heights per second, decaying to 0 when the user stops. */
export function useTunnelScroll() {
  const state = useRef({ velocity: 0, lastY: 0, lastAt: 0 });

  useEffect(() => {
    const current = state.current;
    current.lastY = window.scrollY;
    current.lastAt = performance.now();
    const onScroll = () => {
      const now = performance.now();
      const dt = Math.max(16, now - current.lastAt) / 1000;
      const dy = (window.scrollY - current.lastY) / window.innerHeight;
      current.velocity = current.velocity * 0.5 + (dy / dt) * 0.5;
      current.lastY = window.scrollY;
      current.lastAt = now;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return state;
}

/** Call once per frame: returns the velocity and lets it fade out once scrolling stops. */
export function readTunnelScroll(state: ReturnType<typeof useTunnelScroll>, delta: number) {
  const current = state.current;
  if (performance.now() - current.lastAt > 90) current.velocity *= Math.exp(-delta * 6);
  return current.velocity;
}
