import { useEffect, useLayoutEffect, useRef, useState, type ReactNode, type RefObject } from "react";
import { createPortal } from "react-dom";
import { gsap } from "gsap";

type CursorTagProps = { targetRef: RefObject<HTMLElement | null>; children: ReactNode; className?: string };

export function CursorTag({ targetRef, children, className = "bg-black text-white" }: CursorTagProps) {
  const labelRef = useRef<HTMLSpanElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useLayoutEffect(() => {
    const target = targetRef.current;
    const label = labelRef.current;
    if (!target || !label) return;
    gsap.set(label, { autoAlpha: 0, scale: 0.8 });

    const xTo = gsap.quickTo(label, "x", { duration: 0.2, ease: "power3.out" });
    const yTo = gsap.quickTo(label, "y", { duration: 0.2, ease: "power3.out" });
    const move = (event: PointerEvent) => {
      xTo(event.clientX + 15);
      yTo(event.clientY + 15);
    };
    const enter = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      gsap.set(label, { x: event.clientX + 15, y: event.clientY + 15 });
      gsap.to(label, { autoAlpha: 1, scale: 1, duration: 0.22 });
    };
    const leave = () => gsap.to(label, { autoAlpha: 0, scale: 0.8, duration: 0.2 });
    target.addEventListener("pointermove", move);
    target.addEventListener("pointerenter", enter);
    target.addEventListener("pointerleave", leave);
    target.addEventListener("click", leave);
    return () => {
      target.removeEventListener("pointermove", move);
      target.removeEventListener("pointerenter", enter);
      target.removeEventListener("pointerleave", leave);
      target.removeEventListener("click", leave);
      gsap.set(label, { autoAlpha: 0 });
    };
  }, [targetRef, mounted]);

  if (!mounted) return null;
  return createPortal(
    <span ref={labelRef} className={`pointer-events-none fixed left-0 top-0 z-[45] hidden h-20 w-20 place-items-center text-center text-[10px] font-bold uppercase leading-tight opacity-0 md:grid ${className}`} aria-hidden="true">{children}</span>,
    document.body,
  );
}
