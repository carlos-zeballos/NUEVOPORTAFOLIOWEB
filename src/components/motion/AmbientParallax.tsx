import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function AmbientParallax() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const context = gsap.context(() => {
      const farX = gsap.quickTo("[data-depth='far']", "x", { duration: 1.8, ease: "power3.out" });
      const farY = gsap.quickTo("[data-depth='far']", "y", { duration: 1.8, ease: "power3.out" });
      const nearX = gsap.quickTo("[data-depth='near']", "x", { duration: 1.1, ease: "power3.out" });
      const nearY = gsap.quickTo("[data-depth='near']", "y", { duration: 1.1, ease: "power3.out" });

      const move = (event: PointerEvent) => {
        const x = event.clientX / window.innerWidth - 0.5;
        const y = event.clientY / window.innerHeight - 0.5;
        farX(x * -18);
        farY(y * -14);
        nearX(x * 42);
        nearY(y * 30);
      };

      window.addEventListener("pointermove", move, { passive: true });

      gsap.to("[data-depth='far']", {
        yPercent: -18,
        rotate: 2,
        ease: "none",
        scrollTrigger: { trigger: document.documentElement, start: "top top", end: "bottom bottom", scrub: 1.2 },
      });
      gsap.to("[data-depth='near']", {
        yPercent: -42,
        rotate: -3,
        ease: "none",
        scrollTrigger: { trigger: document.documentElement, start: "top top", end: "bottom bottom", scrub: 0.8 },
      });

      return () => window.removeEventListener("pointermove", move);
    }, root);

    return () => context.revert();
  }, []);

  return (
    <div ref={rootRef} className="ambient-parallax" aria-hidden="true">
      <div data-depth="far" className="ambient-grid" />
      <div data-depth="far" className="ambient-orb ambient-orb-a" />
      <div data-depth="near" className="ambient-orb ambient-orb-b" />
      <div data-depth="near" className="ambient-line ambient-line-a" />
      <div data-depth="far" className="ambient-line ambient-line-b" />
      <div className="ambient-grain" />
    </div>
  );
}
