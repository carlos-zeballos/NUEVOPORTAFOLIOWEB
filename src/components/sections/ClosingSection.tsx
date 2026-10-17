import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { WorkTogetherScroll } from "./WorkTogetherScroll";
import { RobotFrameSequence } from "./RobotFrameSequence";

gsap.registerPlugin(ScrollTrigger);

export function ClosingSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const context = gsap.context(() => {
      const vision = section.querySelector<HTMLElement>("[data-services-vision]");
      const visionBelow = (vision?.getBoundingClientRect().top ?? 0) > window.innerHeight * 0.85;
      if (visionBelow) {
        gsap.set(["[data-dream-one]", "[data-dream-two]"], { clipPath: "inset(0 100% 0 0)" });
        gsap.set("[data-dream-arrow]", { autoAlpha: 0 });
        gsap.timeline({ scrollTrigger: { trigger: vision, start: "top 80%", once: true } })
          .to("[data-dream-one]", { clipPath: "inset(0 0% 0 0)", duration: 0.7, ease: "power3.out" })
          .to("[data-dream-two]", { clipPath: "inset(0 0% 0 0)", duration: 0.7, ease: "power3.out" }, 0.12)
          .to("[data-dream-arrow]", { autoAlpha: 1, duration: 0.4, ease: "power2.out" }, 0.28);
      }
    }, section);
    return () => context.revert();
  }, []);

  return (
    <section ref={sectionRef} aria-label="Trabajemos juntos" className="relative z-10 bg-[#030504] text-white">
      <div data-services-vision className="relative z-20 flex overflow-hidden px-6 pb-16 pt-12 sm:px-10 sm:pt-14 lg:px-4 lg:pb-20 lg:pt-16">
        <div className="relative w-full text-[clamp(1.8rem,7.6vw,8.25rem)] font-semibold uppercase leading-[0.9] tracking-[-0.065em]">
          <div className="overflow-hidden"><div data-dream-one className="w-fit max-w-full pr-[0.08em] will-change-transform">Traemos tu idea</div></div>
          <div className="mt-[0.06em] flex items-end justify-between gap-[0.35em]">
            <div className="min-w-0 overflow-hidden"><div data-dream-two className="w-fit max-w-full pr-[0.08em] text-primary will-change-transform">A la realidad</div></div>
            <span data-dream-arrow className="mb-[0.06em] shrink-0 text-[0.72em] font-light leading-none text-primary" aria-hidden="true">↓</span>
          </div>
        </div>
      </div>

      <div className="relative z-10"><RobotFrameSequence /></div>
      <WorkTogetherScroll />
    </section>
  );
}
