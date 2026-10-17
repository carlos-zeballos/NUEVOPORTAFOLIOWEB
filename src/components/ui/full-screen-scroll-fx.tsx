import { forwardRef, useEffect, useImperativeHandle, useLayoutEffect, useRef, useState, type CSSProperties, type MutableRefObject, type ReactNode, type Ref } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./full-screen-scroll-fx.css";
import { scrollToTarget } from "../scroll/scrollToTarget";
import { flashAccent, revealWords, wordsHidden } from "../motion/title-motion";

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
  const titleRefs = useRef<HTMLHeadingElement[]>([]);
  const bgRefs = useRef<HTMLHeadingElement[]>([]);
  const leftTrackRef = useRef<HTMLDivElement>(null);
  const rightTrackRef = useRef<HTMLDivElement>(null);
  const internalIndexRef = useRef(clamp(initialIndex, sections.length - 1));
  const [internalIndex, setInternalIndex] = useState(internalIndexRef.current);
  const index = typeof currentIndex === "number" ? clamp(currentIndex, sections.length - 1) : internalIndex;
  const previousRef = useRef(index);
  const revealedRef = useRef(false);
  const waitingForBarsRef = useRef(false);
  const motionOff = reduceMotion ?? false;

  const goTo = (next: number) => {
    const safe = clamp(next, sections.length - 1);
    const root = rootRef.current;
    if (!root || safe === internalIndexRef.current) return;
    const rootTop = root.getBoundingClientRect().top + window.scrollY;
    const scrollable = Math.max(0, root.offsetHeight - window.innerHeight);
    const top = rootTop + scrollable * (safe / Math.max(1, sections.length - 1));
    scrollToTarget(top, {
      immediate: motionOff,
      duration: (durations.snap ?? 700) / 1000,
      lock: !motionOff,
    });
  };

  useImperativeHandle(apiRef, () => ({ next: () => goTo(index + 1), prev: () => goTo(index - 1), goTo, getIndex: () => internalIndexRef.current, refresh: () => ScrollTrigger.refresh() }));

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const last = Math.max(1, sections.length - 1);
    const proxy = { raw: typeof currentIndex === "number" ? clamp(currentIndex, last) : internalIndexRef.current };

    const apply = () => {
      const raw = proxy.raw;
      titleRefs.current.forEach((title, i) => {
        const distance = raw - i;
        const fade = clamp((Math.abs(distance) - 0.22) / 0.24, 1);
        const opacity = 1 - fade;
        title.style.opacity = String(opacity);
        title.style.visibility = opacity > 0.001 ? "visible" : "hidden";
        title.style.transform = `translate3d(0, ${-distance * 38}%, 0)`;
      });
      bgRefs.current.forEach((bg, i) => {
        const opacity = 1 - clamp((Math.abs(raw - i) - 0.2) / 0.6, 1);
        bg.style.opacity = String(opacity);
        bg.style.visibility = opacity > 0.001 ? "visible" : "hidden";
        bg.style.transform = `scale(${1 + Math.min(1, Math.abs(raw - i)) * 0.05})`;
      });
      [leftTrackRef.current, rightTrackRef.current].forEach((track) => {
        if (track) track.style.transform = `translate3d(0, ${-raw * 3.4}rem, 0)`;
      });
    };

    let settledFrom: number | null = null;
    const follow = (raw: number) => {
      if (settledFrom !== null && Math.abs(raw - settledFrom) < 0.04) return;
      settledFrom = null;
      gsap.to(proxy, { raw, duration: motionOff ? 0 : 0.45, ease: "power3.out", overwrite: true, onUpdate: apply });
      const next = clamp(Math.round(raw), last);
      if (next !== internalIndexRef.current) {
        previousRef.current = internalIndexRef.current;
        internalIndexRef.current = next;
        setInternalIndex(next);
        onIndexChange?.(next);
      }
    };

    apply();
    if (typeof currentIndex === "number") {
      follow(clamp(currentIndex, last));
      return;
    }

    let settleTimer = 0;
    const settle = (self: ScrollTrigger) => {
      settledFrom = self.progress * last;
      const target = Math.round(settledFrom);
      gsap.to(proxy, { raw: target, duration: motionOff ? 0 : 0.5, ease: "power2.out", overwrite: true, onUpdate: apply });
    };

    const trigger = ScrollTrigger.create({
      trigger: root,
      start: "top top",
      end: "bottom bottom",
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        follow(self.progress * last);
        window.clearTimeout(settleTimer);
        settleTimer = window.setTimeout(() => settle(self), 180);
      },
      onRefresh: (self) => { proxy.raw = self.progress * last; apply(); },
    });
    return () => {
      window.clearTimeout(settleTimer);
      trigger.kill();
      gsap.killTweensOf(proxy);
    };
  }, [currentIndex, onIndexChange, sections.length, motionOff]);

  useLayoutEffect(() => {
    const root = rootRef.current;
    const stage = stageRef.current;
    if (!root || !stage) return;
    const nodes = stage.querySelectorAll(".fx-header,.fx-content,.fx-footer");
    const header = stage.querySelector<HTMLElement>(".fx-header");
    const headerWords = stage.querySelectorAll(".fx-header [data-word]");
    const hide = () => {
      gsap.set(nodes, { autoAlpha: 0, y: 24 });
      if (motionOff) return;
      gsap.set(headerWords, wordsHidden);
      if (header) gsap.set(header, { "--fx-line": 0 });
    };
    hide();
    const reveal = () => {
      if (revealedRef.current) return;
      revealedRef.current = true;
      gsap.to(nodes, { autoAlpha: 1, y: 0, duration: motionOff ? .01 : .85, stagger: motionOff ? 0 : .1, ease: "expo.out" });
      if (motionOff) return;
      if (header) gsap.to(header, { "--fx-line": 1, duration: .7, ease: "power3.inOut" });
      revealWords(headerWords, .2).eventCallback("onComplete", () => { flashAccent(stage.querySelectorAll(".fx-header [data-word-accent]")); });
    };
    const prepare = (event: Event) => {
      if ((event as CustomEvent<{ target: string }>).detail?.target !== "#layered-section") return;
      waitingForBarsRef.current = true;
      revealedRef.current = false;
      hide();
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

  useEffect(() => { internalIndexRef.current = index; }, [index]);

  useEffect(() => {
    bgRefs.current.forEach((bg) => bg.querySelector("img")?.decode().catch(() => undefined));
  }, [sections]);

  const vars = {
    "--fx-text": colors.text ?? "rgba(245,248,246,.94)",
    "--fx-overlay": colors.overlay ?? "rgba(2,4,3,.3)",
    "--fx-page-bg": colors.pageBg ?? "#030504",
    "--fx-stage-bg": colors.stageBg ?? "#030504",
    ...style,
  } as CSSProperties;

  return (
    <div ref={(node) => { rootRef.current = node; if (typeof forwardedRef === "function") forwardedRef(node); else if (forwardedRef) (forwardedRef as MutableRefObject<HTMLDivElement | null>).current = node; }} className={`fx ${className ?? ""}`} style={{ ...vars, height: `calc(100svh + ${Math.max(1, sections.length - 1)} * 85svh)` }} aria-label={ariaLabel}>
      <div ref={stageRef} className="fx-stage">
        <div className="fx-backgrounds" aria-hidden="true">
          {sections.map((section, sectionIndex) => <div ref={(node) => { if (node) bgRefs.current[sectionIndex] = node; }} className={`fx-bg ${sectionIndex === index ? "active" : ""}`} key={section.id ?? sectionIndex}>{section.renderBackground?.(sectionIndex === index, sectionIndex === previousRef.current)}{section.background && <img src={section.background} alt="" decoding="async" />}<div className="fx-bg-overlay" /></div>)}
        </div>
        <div className="fx-gridlines" aria-hidden="true" />
        {header && <h2 className="fx-header">{header}</h2>}
        <div className="fx-content">
          <div className="fx-side fx-left"><div ref={leftTrackRef}>{sections.map((section, i) => <button type="button" onClick={() => goTo(i)} className={i === index ? "active" : ""} key={`left-${section.id ?? i}`}>{section.leftLabel}</button>)}</div></div>
          <div className="fx-center">{sections.map((section, i) => <h3 ref={(node) => { if (node) titleRefs.current[i] = node; }} className={`fx-title ${i === index ? "active" : ""}`} key={`title-${section.id ?? i}`}>{section.title}</h3>)}</div>
          <div className="fx-side fx-right"><div ref={rightTrackRef}>{sections.map((section, i) => <button type="button" onClick={() => goTo(i)} className={i === index ? "active" : ""} key={`right-${section.id ?? i}`}>{section.rightLabel}</button>)}</div></div>
        </div>
        <footer className="fx-footer">{footer}<>{showProgress && <div className="fx-progress"><span>{String(index + 1).padStart(2, "0")}</span><i><b style={{ width: `${((index + 1) / sections.length) * 100}%` }} /></i><span>{String(sections.length).padStart(2, "0")}</span></div>}</></footer>
      </div>
    </div>
  );
});
