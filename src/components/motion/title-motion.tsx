import type { ReactNode } from "react";
import { gsap } from "gsap";
import { cn } from "../../lib/utils";

export function Word({ children, accent, className }: { children: ReactNode; accent?: boolean; className?: string }) {
  return (
    <span className="-mx-[0.05em] -mb-[0.12em] inline-block overflow-hidden px-[0.05em] pb-[0.12em] align-bottom">
      <span data-word data-word-accent={accent ? "" : undefined} className={cn("inline-block will-change-transform", className)}>{children}</span>
    </span>
  );
}

export const wordsHidden = { yPercent: 115, rotate: 5, transformOrigin: "0% 100%" };

export function revealWords(words: gsap.TweenTarget, delay = 0) {
  return gsap.fromTo(words, wordsHidden, { yPercent: 0, rotate: 0, duration: 0.95, stagger: 0.08, ease: "power4.out", delay });
}

export function flashAccent(targets: gsap.TweenTarget) {
  return gsap.fromTo(
    targets,
    { filter: "drop-shadow(0 0 0px rgba(3,234,0,0))" },
    { filter: "drop-shadow(0 0 18px rgba(3,234,0,0.85))", duration: 0.35, yoyo: true, repeat: 1, ease: "power2.out", clearProps: "filter" },
  );
}

const glyphs = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/";

export function scrambleText(element: HTMLElement, duration = 0.9) {
  const finalText = element.dataset.scramble ?? element.textContent ?? "";
  const state = { progress: 0 };
  return gsap.to(state, {
    progress: 1,
    duration,
    ease: "none",
    onUpdate: () => {
      const shown = Math.floor(state.progress * finalText.length);
      element.textContent = Array.from(finalText, (character, index) => (index < shown || character === " " ? character : glyphs[Math.floor(Math.random() * glyphs.length)])).join("");
    },
    onComplete: () => { element.textContent = finalText; },
    onInterrupt: () => { element.textContent = finalText; },
  });
}
