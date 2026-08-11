import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function ServiceRow({ number, title, variant }: { number: string; title: string; variant: number }) {
  const rowRef = useRef<HTMLAnchorElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const titleRef = useRef<HTMLSpanElement>(null);
  const wipeRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const row = rowRef.current;
    const label = labelRef.current;
    if (!row || !label) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const context = gsap.context(() => {
      if (reduced) return;
      gsap.set("[data-number], [data-title], [data-arrow]", { autoAlpha: 0 });
      gsap.timeline({ scrollTrigger: { trigger: row, start: "top 88%", once: true } })
        .from("[data-divider]", { scaleX: 0, transformOrigin: "left", duration: 0.45, ease: "power3.out" })
        .to("[data-service-block]", { scaleX: 1, transformOrigin: "left center", duration: 0.52, ease: "expo.inOut" }, 0.08)
        .set("[data-number], [data-title], [data-arrow]", { autoAlpha: 1 }, 0.34)
        .to("[data-service-block]", { scaleX: 0, transformOrigin: "right center", duration: 0.52, ease: "expo.inOut" }, 0.38);
    }, row);

    const xTo = gsap.quickTo(label, "x", { duration: 0.2, ease: "power3.out" });
    const yTo = gsap.quickTo(label, "y", { duration: 0.2, ease: "power3.out" });
    const titleX = gsap.quickTo(titleRef.current, "x", { duration: 0.35, ease: "power3.out" });
    const move = (event: PointerEvent) => {
      xTo(event.clientX - row.getBoundingClientRect().left + 15);
      yTo(event.clientY - row.getBoundingClientRect().top + 15);
      if (variant === 4) titleX(((event.clientX - row.getBoundingClientRect().left) / row.clientWidth - 0.5) * 20);
    };
    const enter = () => {
      gsap.to(label, { autoAlpha: 1, scale: 1, duration: 0.22 });
      gsap.to(titleRef.current, { x: variant === 4 ? 0 : 8, scaleX: variant === 3 ? 1.02 : 1, duration: 0.32 });
      if (variant === 2) gsap.to(wipeRef.current, { scaleX: 1, transformOrigin: "left center", duration: 0.35, ease: "power2.out" });
    };
    const leave = () => {
      gsap.to(label, { autoAlpha: 0, scale: 0.8, duration: 0.2 });
      gsap.to(titleRef.current, { x: 0, scaleX: 1, duration: 0.32 });
      if (variant === 2) gsap.to(wipeRef.current, { scaleX: 0, transformOrigin: "right center", duration: 0.35, ease: "power2.out" });
    };
    row.addEventListener("pointermove", move);
    row.addEventListener("pointerenter", enter);
    row.addEventListener("pointerleave", leave);
    return () => {
      row.removeEventListener("pointermove", move);
      row.removeEventListener("pointerenter", enter);
      row.removeEventListener("pointerleave", leave);
      context.revert();
    };
  }, [variant]);

  return (
    <a ref={rowRef} href="#iniciativa" className={`group relative grid min-h-[145px] grid-cols-[3.5rem_1fr_auto] items-center gap-4 overflow-hidden px-6 transition-colors duration-300 sm:grid-cols-[6rem_1fr_auto] sm:px-10 lg:min-h-[clamp(190px,23.5vh,215px)] lg:grid-cols-[16.5rem_1fr_auto] lg:px-4 ${variant === 2 ? "" : "hover:bg-primary"}`}>
      <span data-divider className="absolute inset-x-0 top-0 z-20 h-px bg-[#242424]" />
      <span ref={wipeRef} className="absolute inset-0 z-0 origin-left scale-x-0 bg-primary" />
      <span data-number className="relative z-10 text-sm font-semibold text-primary opacity-0 group-hover:text-black">({number})</span>
      <span className="relative z-10 overflow-hidden"><span ref={titleRef} data-title className="block text-[clamp(1.7rem,5vw,6rem)] font-medium uppercase leading-none tracking-[-0.065em] text-white opacity-0 group-hover:text-black">{title}</span></span>
      <span data-arrow className="relative z-10 text-3xl text-white transition-transform duration-300 group-hover:-rotate-45 group-hover:text-black sm:text-5xl">→</span>
      <span data-service-block className="pointer-events-none absolute inset-y-[18%] left-0 z-20 w-full origin-left scale-x-0 bg-primary shadow-[0_0_28px_rgba(3,234,0,.22)]" />
      <span ref={labelRef} className="pointer-events-none absolute left-0 top-0 z-30 hidden h-20 w-20 place-items-center bg-black text-center text-[10px] font-bold uppercase leading-tight text-white opacity-0 md:grid">Saber<br />más</span>
    </a>
  );
}
