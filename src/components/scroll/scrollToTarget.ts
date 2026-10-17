import type Lenis from "lenis";

type ScrollTarget = string | number | HTMLElement;

export const scrollController: { lenis: Lenis | null } = { lenis: null };

export function scrollToTarget(
  target: ScrollTarget,
  options?: { immediate?: boolean; duration?: number; lock?: boolean; onComplete?: () => void },
) {
  const lenis = scrollController.lenis;
  const immediate = options?.immediate ?? false;
  if (lenis) {
    lenis.scrollTo(target, {
      immediate,
      duration: options?.duration ?? 0.85,
      force: true,
      lock: options?.lock ?? false,
      onComplete: options?.onComplete,
    });
    return;
  }

  const finish = () => options?.onComplete?.();
  if (typeof target === "number") {
    window.scrollTo({ top: target, behavior: immediate ? "auto" : "smooth" });
    finish();
    return;
  }
  const element = typeof target === "string" ? document.querySelector<HTMLElement>(target) : target;
  if (!element) return;
  const top = element.getBoundingClientRect().top + window.scrollY;
  window.scrollTo({ top, behavior: immediate ? "auto" : "smooth" });
  finish();
}
