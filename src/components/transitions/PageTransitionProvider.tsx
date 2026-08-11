import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { gsap } from "gsap";
import { PageTransitionContext } from "../../hooks/usePageTransition";
import { PageTransitionOverlay } from "./PageTransitionOverlay";

const WHITE_ORDER = [3, 0, 6, 2, 8, 4, 1, 7, 5];
const BLACK_ORDER = [1, 5, 8, 3, 0, 6, 2, 7, 4];

function jumpToTarget(target: string) {
  const targetElement = document.querySelector<HTMLElement>(target);
  if (!targetElement) return false;

  const root = document.documentElement;
  const previousScrollBehavior = root.style.scrollBehavior;
  root.style.scrollBehavior = "auto";
  const top = targetElement.getBoundingClientRect().top + window.scrollY;
  window.scrollTo({ top, left: 0, behavior: "auto" });
  root.style.scrollBehavior = previousScrollBehavior;
  return true;
}

function announceCompletion(target: string) {
  window.dispatchEvent(new CustomEvent("page-transition:complete", { detail: { target } }));
}

function prepareTarget(target: string) {
  window.dispatchEvent(new CustomEvent("page-transition:prepare", { detail: { target } }));
}

export function PageTransitionProvider({ children }: { children: ReactNode }) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const transitioningRef = useRef(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const finish = useCallback((target: string, previousOverflow: string) => {
    const overlay = overlayRef.current;
    const whitePanels = overlay?.querySelectorAll<HTMLElement>('[data-transition-panel="white"]');
    const blackPanels = overlay?.querySelectorAll<HTMLElement>('[data-transition-panel="black"]');
    if (overlay) {
      gsap.set(overlay, { autoAlpha: 0 });
      overlay.style.pointerEvents = "none";
      console.log("OVERLAY HIDDEN");
    }
    if (whitePanels) gsap.set(whitePanels, { yPercent: 100 });
    if (blackPanels) gsap.set(blackPanels, { yPercent: -100 });
    document.body.style.overflow = previousOverflow;
    transitioningRef.current = false;
    setIsTransitioning(false);
    timelineRef.current = null;
    announceCompletion(target);
    console.log("CONTENT REVEAL");
    console.log("TRANSITION COMPLETE");
  }, []);

  const transitionTo = useCallback((target: string) => {
    if (transitioningRef.current) return;

    const targetElement = document.querySelector(target);
    if (!targetElement) {
      console.warn(`[PageTransition] No existe el destino: ${target}`);
      return;
    }

    const overlay = overlayRef.current;
    const whiteNodes = overlay?.querySelectorAll<HTMLElement>('[data-transition-panel="white"]');
    const blackNodes = overlay?.querySelectorAll<HTMLElement>('[data-transition-panel="black"]');
    if (!overlay || whiteNodes?.length !== WHITE_ORDER.length || blackNodes?.length !== BLACK_ORDER.length) {
      console.error("[PageTransition] El overlay no contiene los 9 paneles blancos y negros requeridos.");
      return;
    }

    const whitePanels = Array.from(whiteNodes);
    const blackPanels = Array.from(blackNodes);
    const previousOverflow = document.body.style.overflow;
    prepareTarget(target);
    transitioningRef.current = true;
    setIsTransitioning(true);
    document.body.style.overflow = "hidden";
    overlay.style.pointerEvents = "auto";
    gsap.set(overlay, { autoAlpha: 1 });
    gsap.set(whitePanels, { yPercent: 100, force3D: true });
    gsap.set(blackPanels, { yPercent: -100, force3D: true });

    const overlayStyles = getComputedStyle(overlay);
    const overlayBounds = overlay.getBoundingClientRect();
    console.log("TRANSITION START", {
      panels: { white: whitePanels.length, black: blackPanels.length },
      overlay: {
        opacity: overlayStyles.opacity,
        visibility: overlayStyles.visibility,
        display: overlayStyles.display,
        zIndex: overlayStyles.zIndex,
        pointerEvents: overlayStyles.pointerEvents,
        width: overlayBounds.width,
        height: overlayBounds.height,
      },
      initialY: {
        white: gsap.getProperty(whitePanels[0], "yPercent"),
        black: gsap.getProperty(blackPanels[0], "yPercent"),
      },
    });

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const panelDuration = reducedMotion ? 0.42 : 0.82;
    const panelOffset = reducedMotion ? 0.018 : 0.04;

    const timeline = gsap.timeline({
      onComplete: () => finish(target, previousOverflow),
    });
    timelineRef.current = timeline;
    console.log("WHITE START");

    WHITE_ORDER.forEach((panelIndex, orderIndex) => {
      timeline.to(
        whitePanels[panelIndex],
        { yPercent: 0, duration: panelDuration, ease: "power4.inOut" },
        orderIndex * panelOffset,
      );
    });

    timeline.addLabel("whiteComplete", timeline.duration());
    timeline.call(() => console.log("WHITE COMPLETE"), [], "whiteComplete");
    timeline.call(() => {
      jumpToTarget(target);
      console.log("JUMP");
    }, [], "whiteComplete");
    timeline.to({}, { duration: 0.08 }, "whiteComplete");

    const blackStart = timeline.duration();
    timeline.addLabel("blackStart", blackStart);
    timeline.call(() => console.log("BLACK START"), [], "blackStart");
    BLACK_ORDER.forEach((panelIndex, orderIndex) => {
      timeline.to(
        blackPanels[panelIndex],
        { yPercent: 0, duration: panelDuration, ease: "power4.inOut" },
        blackStart + orderIndex * panelOffset,
      );
    });
    timeline.addLabel("blackComplete", timeline.duration());
    timeline.call(() => console.log("BLACK COMPLETE"), [], "blackComplete");
  }, [finish]);

  useEffect(() => () => {
    timelineRef.current?.kill();
    document.body.style.overflow = "";
  }, []);

  const value = useMemo(() => ({ transitionTo, isTransitioning }), [transitionTo, isTransitioning]);

  return (
    <PageTransitionContext.Provider value={value}>
      {children}
      <PageTransitionOverlay ref={overlayRef} />
    </PageTransitionContext.Provider>
  );
}
