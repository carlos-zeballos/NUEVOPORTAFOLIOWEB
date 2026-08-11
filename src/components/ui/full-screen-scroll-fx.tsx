import { forwardRef, useEffect, useImperativeHandle, useLayoutEffect, useRef, useState, type CSSProperties, type MutableRefObject, type ReactNode, type Ref } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./full-screen-scroll-fx.css";

gsap.registerPlugin(ScrollTrigger);

export type FullScreenFXSection = {
  id?: string;
  background?: string;
  leftLabel?: ReactNode;
  title: ReactNode;
  rightLabel?: ReactNode;
  renderBackground?: (active: boolean, previous: boolean) => ReactNode;
};

export type FullScreenFXAPI = { next: () => void; prev: () => void; goTo: (index: number) => void; getIndex: () => number; refresh: () => void };

type Props = {
  sections: FullScreenFXSection[];
  className?: string;
  style?: CSSProperties;
  header?: ReactNode;
  footer?: ReactNode;
  showProgress?: boolean;
  initialIndex?: number;
  currentIndex?: number;
  onIndexChange?: (index: number) => void;
  durations?: { change?: number; snap?: number };
  reduceMotion?: boolean;
  colors?: Partial<{ text: string; overlay: string; pageBg: string; stageBg: string }>;
  apiRef?: Ref<FullScreenFXAPI>;
  ariaLabel?: string;
};

const clamp = (value: number, max: number) => Math.max(0, Math.min(max, value));

export const FullScreenScrollFX = forwardRef<HTMLDivElement, Props>(function FullScreenScrollFX({
  sections,
  className,
  style,
  header,
  footer,
  showProgress = true,
  initialIndex = 0,
  currentIndex,
  onIndexChange,
  durations = { change: .75, snap: 800 },
  reduceMotion,
  colors = {},
  apiRef,
  ariaLabel = "Presentación de pantalla completa",
}, forwardedRef) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const titleRefs = useRef<HTMLDivElement[]>([]);
  const bgRefs = useRef<HTMLDivElement[]>([]);
  const leftTrackRef = useRef<HTMLDivElement>(null);
  const rightTrackRef = useRef<HTMLDivElement>(null);
  const internalIndexRef = useRef(clamp(initialIndex, sections.length - 1));
  const [internalIndex, setInternalIndex] = useState(internalIndexRef.current);
  const index = typeof currentIndex === "number" ? clamp(currentIndex, sections.length - 1) : internalIndex;
  const previousRef = useRef(index);
  const sectionActiveRef = useRef(false);
  const snappingRef = useRef(false);
  const snapTimerRef = useRef<number>(0);
  const snapStartedAtRef = useRef(0);
  const scrollTweenRef = useRef<gsap.core.Tween | null>(null);
  const revealedRef = useRef(false);
  const waitingForBarsRef = useRef(false);
  const motionOff = reduceMotion ?? false;

  const setIndex = (next: number) => {
    const safe = clamp(next, sections.length - 1);
    if (safe === internalIndexRef.current) return;
    previousRef.current = internalIndexRef.current;
    internalIndexRef.current = safe;
    if (typeof currentIndex !== "number") setInternalIndex(safe);
    onIndexChange?.(safe);
  };

  const goTo = (next: number) => {
    const safe = clamp(next, sections.length - 1);
    const root = rootRef.current;
    if (!root) return;
    const rootTop = root.getBoundingClientRect().top + window.scrollY;
    const top = rootTop + (root.offsetHeight - window.innerHeight) * (safe / Math.max(1, sections.length - 1));
    snappingRef.current = true;
    snapStartedAtRef.current = performance.now();
    window.clearTimeout(snapTimerRef.current);
    scrollTweenRef.current?.kill();
    if (motionOff) {
      window.scrollTo({ top, behavior: "auto" });
    } else {
      const scrollState = { value: window.scrollY };
      scrollTweenRef.current = gsap.to(scrollState, {
        value: top,
        duration: (durations.snap ?? 800) / 1000,
        ease: "power3.inOut",
        overwrite: true,
        onUpdate: () => window.scrollTo(0, scrollState.value),
        onComplete: () => {
          window.clearTimeout(snapTimerRef.current);
          snapTimerRef.current = window.setTimeout(() => { snappingRef.current = false; }, 160);
        },
      });
    }
    setIndex(safe);
    if (motionOff) snapTimerRef.current = window.setTimeout(() => { snappingRef.current = false; }, 30);
  };

  useImperativeHandle(apiRef, () => ({ next: () => goTo(index + 1), prev: () => goTo(index - 1), goTo, getIndex: () => internalIndexRef.current, refresh: () => ScrollTrigger.refresh() }));

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const trigger = ScrollTrigger.create({
      trigger: root,
      start: "top top",
      end: "bottom bottom",
      onEnter: () => { sectionActiveRef.current = true; setIndex(0); },
      onEnterBack: () => { sectionActiveRef.current = true; setIndex(sections.length - 1); },
      onLeave: () => { sectionActiveRef.current = false; },
      onLeaveBack: () => { sectionActiveRef.current = false; },
    });
    const handleWheel = (event: WheelEvent) => {
      if (!sectionActiveRef.current || Math.abs(event.deltaY) < 8) return;
      if (snappingRef.current) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        window.clearTimeout(snapTimerRef.current);
        const minimumAnimationTime = Math.max(0, (durations.snap ?? 800) - (performance.now() - snapStartedAtRef.current));
        snapTimerRef.current = window.setTimeout(() => { snappingRef.current = false; }, Math.max(220, minimumAnimationTime));
        return;
      }
      const direction = event.deltaY > 0 ? 1 : -1;
      const current = internalIndexRef.current;
      if ((direction > 0 && current === sections.length - 1) || (direction < 0 && current === 0)) {
        sectionActiveRef.current = false;
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      goTo(current + direction);
    };
    window.addEventListener("wheel", handleWheel, { passive: false, capture: true });
    return () => {
      trigger.kill();
      window.removeEventListener("wheel", handleWheel, { capture: true });
      window.clearTimeout(snapTimerRef.current);
      scrollTweenRef.current?.kill();
    };
  }, [sections.length]);

  useLayoutEffect(() => {
    const root = rootRef.current;
    const stage = stageRef.current;
    if (!root || !stage) return;
    const nodes = stage.querySelectorAll(".fx-header,.fx-content,.fx-footer");
    gsap.set(nodes, { autoAlpha: 0, y: 24 });
    const reveal = () => {
      if (revealedRef.current) return;
      revealedRef.current = true;
      gsap.to(nodes, { autoAlpha: 1, y: 0, duration: motionOff ? .01 : .85, stagger: motionOff ? 0 : .1, ease: "expo.out" });
    };
    const prepare = (event: Event) => {
      if ((event as CustomEvent<{ target: string }>).detail?.target !== "#layered-section") return;
      waitingForBarsRef.current = true;
      revealedRef.current = false;
      gsap.set(nodes, { autoAlpha: 0, y: 24 });
    };
    const complete = (event: Event) => {
      if ((event as CustomEvent<{ target: string }>).detail?.target === "#layered-section") {
        waitingForBarsRef.current = false;
        reveal();
      }
    };
    const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting && !waitingForBarsRef.current) reveal(); }, { threshold: .12 });
    observer.observe(root);
    window.addEventListener("page-transition:prepare", prepare);
    window.addEventListener("page-transition:complete", complete);
    return () => {
      observer.disconnect();
      window.removeEventListener("page-transition:prepare", prepare);
      window.removeEventListener("page-transition:complete", complete);
    };
  }, [motionOff]);

  useLayoutEffect(() => {
    const duration = motionOff ? .01 : durations.change ?? .75;
    const previous = previousRef.current;
    const direction = index >= previous ? 1 : -1;
    const incoming = titleRefs.current[index];
    const outgoing = titleRefs.current[previous];
    const incomingBg = bgRefs.current[index];
    const outgoingBg = bgRefs.current[previous];
    if (outgoing && outgoing !== incoming) gsap.to(outgoing, { autoAlpha: 0, yPercent: -18 * direction, filter: "blur(8px)", duration: duration * .55, ease: "power3.in" });
    if (incoming) gsap.fromTo(incoming, { autoAlpha: 0, yPercent: 28 * direction, filter: "blur(9px)" }, { autoAlpha: 1, yPercent: 0, filter: "blur(0px)", duration, ease: "expo.out" });
    if (outgoingBg && outgoingBg !== incomingBg) gsap.to(outgoingBg, { autoAlpha: 0, scale: 1.035, duration, ease: "power2.out" });
    if (incomingBg) gsap.fromTo(incomingBg, { autoAlpha: 0, scale: 1.06 }, { autoAlpha: 1, scale: 1, duration: duration * 1.15, ease: "power2.out" });
    gsap.to([leftTrackRef.current, rightTrackRef.current], { y: `${-index * 3.4}rem`, duration, ease: "power3.out" });
  }, [index, motionOff, durations.change]);

  useEffect(() => { internalIndexRef.current = index; }, [index]);

  const vars = {
    "--fx-text": colors.text ?? "rgba(245,248,246,.94)",
    "--fx-overlay": colors.overlay ?? "rgba(2,4,3,.3)",
    "--fx-page-bg": colors.pageBg ?? "#030504",
    "--fx-stage-bg": colors.stageBg ?? "#030504",
    ...style,
  } as CSSProperties;

  return (
    <div ref={(node) => { rootRef.current = node; if (typeof forwardedRef === "function") forwardedRef(node); else if (forwardedRef) (forwardedRef as MutableRefObject<HTMLDivElement | null>).current = node; }} className={`fx ${className ?? ""}`} style={{ ...vars, height: `${Math.max(2, sections.length) * 100}svh` }} aria-label={ariaLabel}>
      <div ref={stageRef} className="fx-stage">
        <div className="fx-backgrounds" aria-hidden="true">
          {sections.map((section, sectionIndex) => <div ref={(node) => { if (node) bgRefs.current[sectionIndex] = node; }} className={`fx-bg ${sectionIndex === index ? "active" : ""}`} key={section.id ?? sectionIndex}>{section.renderBackground?.(sectionIndex === index, sectionIndex === previousRef.current)}{section.background && <img src={section.background} alt="" />}<div className="fx-bg-overlay" /></div>)}
        </div>
        <div className="fx-gridlines" aria-hidden="true" />
        {header && <header className="fx-header">{header}</header>}
        <div className="fx-content">
          <div className="fx-side fx-left"><div ref={leftTrackRef}>{sections.map((section, i) => <button type="button" onClick={() => goTo(i)} className={i === index ? "active" : ""} key={`left-${section.id ?? i}`}>{section.leftLabel}</button>)}</div></div>
          <div className="fx-center">{sections.map((section, i) => <div ref={(node) => { if (node) titleRefs.current[i] = node; }} className={`fx-title ${i === index ? "active" : ""}`} key={`title-${section.id ?? i}`}>{section.title}</div>)}</div>
          <div className="fx-side fx-right"><div ref={rightTrackRef}>{sections.map((section, i) => <button type="button" onClick={() => goTo(i)} className={i === index ? "active" : ""} key={`right-${section.id ?? i}`}>{section.rightLabel}</button>)}</div></div>
        </div>
        <footer className="fx-footer">{footer}<>{showProgress && <div className="fx-progress"><span>{String(index + 1).padStart(2, "0")}</span><i><b style={{ width: `${((index + 1) / sections.length) * 100}%` }} /></i><span>{String(sections.length).padStart(2, "0")}</span></div>}</></footer>
      </div>
    </div>
  );
});
