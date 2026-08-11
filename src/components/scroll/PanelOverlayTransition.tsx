import { useLayoutEffect, useRef, type ReactNode } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { PANEL_WIDTHS } from "../transitions/PageTransitionOverlay";

gsap.registerPlugin(ScrollTrigger);

interface PanelOverlayTransitionProps {
  previous: ReactNode;
  next: ReactNode;
}

export function PanelOverlayTransition({ previous, next }: PanelOverlayTransitionProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const previousRef = useRef<HTMLDivElement>(null);
  const transitionRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const context = gsap.context(() => {
      const whitePanels = gsap.utils.toArray<HTMLElement>('[data-scroll-panel="white"]');
      const blackPanels = gsap.utils.toArray<HTMLElement>('[data-scroll-panel="black"]');
      const servicesReveal = gsap.utils.toArray<HTMLElement>('[data-services-reveal]');

      gsap.set(whitePanels, { yPercent: 101 });
      gsap.set(blackPanels, { yPercent: -101 });
      gsap.set(servicesReveal, { autoAlpha: 0, y: 36 });

      const revealServices = gsap.to(servicesReveal, {
        autoAlpha: 1,
        y: 0,
        duration: 0.72,
        stagger: 0.1,
        ease: "power3.out",
        paused: true,
      });

      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: transitionRef.current,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.24,
          invalidateOnRefresh: true,
          onLeave: () => {
            gsap.set(stageRef.current, { autoAlpha: 0 });
            revealServices.restart();
            requestAnimationFrame(() => ScrollTrigger.refresh());
          },
          onEnterBack: () => {
            revealServices.pause(0);
            gsap.set(servicesReveal, { autoAlpha: 0, y: 36 });
            gsap.set(stageRef.current, { autoAlpha: 1 });
          },
        },
      });

      timeline
        .to(whitePanels, {
          yPercent: 0,
          duration: 1,
          stagger: { each: 0.055, from: "start" },
          ease: "power3.inOut",
        })
        .to(blackPanels, {
          yPercent: 0,
          duration: 1,
          stagger: { each: 0.055, from: "end" },
          ease: "power3.inOut",
        }, ">-0.02");
    }, rootRef);

    return () => context.revert();
  }, []);

  return (
    <div ref={rootRef} className="relative bg-[#030504]">
      <div ref={previousRef} className="sticky top-0 z-0 h-[100svh] overflow-hidden will-change-transform">
        {previous}
      </div>
      <div ref={transitionRef} className="pointer-events-none relative z-30 h-[185svh]">
        <div ref={stageRef} className="sticky top-0 h-[100svh] overflow-hidden" aria-hidden="true">
          <PanelLayer type="white" color="#0B0F0C" />
          <PanelLayer type="black" color="#030504" />
        </div>
      </div>
      <div className="relative z-20 -mt-[100svh] min-h-screen">
        {next}
      </div>
    </div>
  );
}

function PanelLayer({ type, color }: { type: "white" | "black"; color: string }) {
  let offset = 0;

  return (
    <div className="absolute inset-0" style={{ zIndex: type === "black" ? 2 : 1 }}>
      {PANEL_WIDTHS.map((width, index) => {
        const left = offset;
        offset += width;
        return (
          <div
            key={`${type}-${index}`}
            data-scroll-panel={type}
            className="absolute bottom-0 top-0 will-change-transform"
            style={{ left: `${left}%`, width: `calc(${width}% + 2px)`, backgroundColor: color }}
          />
        );
      })}
    </div>
  );
}
