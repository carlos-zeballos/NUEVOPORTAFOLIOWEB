import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { usePageTransition } from "../../hooks/usePageTransition";
import { scrollController } from "../../components/scroll/scrollToTarget";
import { BrandLogo } from "../../components/ui/brand-logo";

const READY_EVENT = "profile:ready";
let ready = false;

export function onProfileReady(callback: () => void) {
  if (ready) {
    callback();
    return () => undefined;
  }
  window.addEventListener(READY_EVENT, callback, { once: true });
  return () => window.removeEventListener(READY_EVENT, callback);
}

export function ProfileLoader() {
  const rootRef = useRef<HTMLDivElement>(null);
  const countRef = useRef<HTMLSpanElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);
  const { isTransitioning } = usePageTransition();
  const waitForCurtain = useRef(isTransitioning);

  useLayoutEffect(() => {
    const root = rootRef.current;
    const count = countRef.current;
    const bar = barRef.current;
    if (!root || !count || !bar) return;
    ready = false;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const counter = { value: 0 };
    let timeline: gsap.core.Timeline | null = null;

    const start = () => {
      scrollController.lenis?.stop();
      timeline = gsap.timeline({
        onComplete: () => {
          root.style.display = "none";
          scrollController.lenis?.start();
        },
      });
      timeline
        .to(counter, {
          value: 100,
          duration: reduced ? 0.3 : 1.7,
          ease: "power2.inOut",
          onUpdate: () => {
            count.textContent = String(Math.round(counter.value));
            bar.style.transform = `scaleX(${counter.value / 100})`;
          },
        })
        .call(() => {
          ready = true;
          window.dispatchEvent(new Event(READY_EVENT));
        }, [], "+=0.12")
        .to(root, { yPercent: -100, duration: reduced ? 0.3 : 1, ease: "power4.inOut" }, "<");
    };

    const onCurtainDone = () => start();
    if (waitForCurtain.current) window.addEventListener("page-transition:complete", onCurtainDone, { once: true });
    else start();

    return () => {
      window.removeEventListener("page-transition:complete", onCurtainDone);
      timeline?.kill();
      scrollController.lenis?.start();
    };
  }, []);

  return (
    <div ref={rootRef} className="fixed inset-0 z-[80] flex flex-col justify-between bg-[#0b0d0c] px-[var(--pf-pad)] py-8 text-white" aria-hidden="true">
      <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.24em] text-white/45">
        <BrandLogo className="h-6" />
        <span>Perfil profesional — 2026</span>
      </div>
      <div>
        <span ref={countRef} className="pf-display block text-[clamp(5rem,15vw,13rem)] tabular-nums">0</span>
        <span className="mt-6 block h-px w-full bg-white/10">
          <span ref={barRef} className="block h-full w-full origin-left scale-x-0 bg-[#03ea00] shadow-[0_0_14px_rgba(3,234,0,0.55)]" />
        </span>
      </div>
    </div>
  );
}
