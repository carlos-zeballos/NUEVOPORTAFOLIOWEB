import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { PageTransitionContext } from "../../hooks/usePageTransition";
import { commitRoute, hasPendingRoute } from "../../lib/router";
import { PageTransitionOverlay } from "./PageTransitionOverlay";
import { scrollController, scrollToTarget } from "../scroll/scrollToTarget";

const WHITE_ORDER = [3, 0, 6, 2, 8, 4, 1, 7, 5];
const BLACK_ORDER = [1, 5, 8, 3, 0, 6, 2, 7, 4];

function jumpToTarget(target: string) {
  const targetElement = document.querySelector<HTMLElement>(target);
  if (!targetElement) return false;
  scrollToTarget(targetElement, { immediate: true });
  return true;
}

type NavigateOptions = { target?: string; fromHistory?: boolean; restoreY?: number };

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
  const navigateRef = useRef<(path: string, options?: NavigateOptions) => void>(() => undefined);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const finish = useCallback((target: string, previousOverflow: string) => {
    const overlay = overlayRef.current;
    const whitePanels = overlay?.querySelectorAll<HTMLElement>('[data-transition-panel="white"]');
    const blackPanels = overlay?.querySelectorAll<HTMLElement>('[data-transition-panel="black"]');
    if (overlay) {
      gsap.set(overlay, { autoAlpha: 0 });
      overlay.style.pointerEvents = "none";
    }
    if (whitePanels) gsap.set(whitePanels, { yPercent: 100 });
    if (blackPanels) gsap.set(blackPanels, { yPercent: -100 });
    document.body.style.overflow = previousOverflow;
    scrollController.lenis?.start();
    transitioningRef.current = false;
    setIsTransitioning(false);
    timelineRef.current = null;
    announceCompletion(target);
    if (hasPendingRoute()) requestAnimationFrame(() => navigateRef.current(window.location.pathname, { fromHistory: true, restoreY: history.state?.y }));
  }, []);

  const runCurtain = useCallback((target: string, onCovered: () => void, settle = 0.08) => {
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
    scrollController.lenis?.stop();
    overlay.style.pointerEvents = "auto";
    gsap.set(overlay, { autoAlpha: 1 });
    gsap.set(whitePanels, { yPercent: 100, force3D: true });
    gsap.set(blackPanels, { yPercent: -100, force3D: true });

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const panelDuration = reducedMotion ? 0.42 : 0.82;
    const panelOffset = reducedMotion ? 0.018 : 0.04;

    const timeline = gsap.timeline({
      onComplete: () => finish(target, previousOverflow),
    });
    timelineRef.current = timeline;

    WHITE_ORDER.forEach((panelIndex, orderIndex) => {
      timeline.to(
        whitePanels[panelIndex],
        { yPercent: 0, duration: panelDuration, ease: "power4.inOut" },
        orderIndex * panelOffset,
      );
    });

    timeline.addLabel("whiteComplete", timeline.duration());
    timeline.call(onCovered, [], "whiteComplete");
    timeline.to({}, { duration: settle }, "whiteComplete");

    const blackStart = timeline.duration();
    timeline.addLabel("blackStart", blackStart);
    BLACK_ORDER.forEach((panelIndex, orderIndex) => {
      timeline.to(
        blackPanels[panelIndex],
        { yPercent: 0, duration: panelDuration, ease: "power4.inOut" },
        blackStart + orderIndex * panelOffset,
      );
    });
  }, [finish]);

  const transitionTo = useCallback((target: string) => {
    if (transitioningRef.current) return;
    if (!document.querySelector(target)) {
      console.warn(`[PageTransition] No existe el destino: ${target}`);
      return;
    }
    runCurtain(target, () => {
      jumpToTarget(target);
    });
  }, [runCurtain]);

  const navigateTo = useCallback((path: string, options?: NavigateOptions) => {
    if (transitioningRef.current) return;
    const target = options?.target;
    const restoreY = options?.restoreY;
    if (!options?.fromHistory) history.replaceState({ ...history.state, y: Math.round(window.scrollY) }, "");
    runCurtain(path, () => {
      commitRoute(options?.fromHistory ? undefined : path);
      window.scrollTo(0, 0);
      scrollController.lenis?.scrollTo(0, { immediate: true, force: true });
      requestAnimationFrame(() => requestAnimationFrame(() => {
        ScrollTrigger.refresh();
        if (target) jumpToTarget(target);
        else if (typeof restoreY === "number" && restoreY > 0) scrollToTarget(restoreY, { immediate: true });
      }));
    }, 0.32);
  }, [runCurtain]);
  navigateRef.current = navigateTo;

  useEffect(() => {
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    const onPopState = (event: PopStateEvent) => navigateTo(window.location.pathname, { fromHistory: true, restoreY: event.state?.y });
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [navigateTo]);

  useEffect(() => () => {
    timelineRef.current?.kill();
    document.body.style.overflow = "";
    scrollController.lenis?.start();
  }, []);

  const value = useMemo(() => ({ transitionTo, navigateTo, isTransitioning }), [transitionTo, navigateTo, isTransitioning]);

  return (
    <PageTransitionContext.Provider value={value}>
      {children}
      <PageTransitionOverlay ref={overlayRef} />
    </PageTransitionContext.Provider>
  );
}
