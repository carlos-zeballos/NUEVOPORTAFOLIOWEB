import { useEffect, useLayoutEffect, useRef, useState, type MouseEventHandler } from "react";
import { createPortal } from "react-dom";
import { gsap } from "gsap";

type ServiceRowProps = {
  number: string;
  title: string;
  description: string;
  price?: string;
  image?: string;
  variant: number;
  href?: string;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
};

export function ServiceRow({ number, title, description, price, image, variant, href = "#contacto", onClick }: ServiceRowProps) {
  const rowRef = useRef<HTMLAnchorElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const titleRef = useRef<HTMLSpanElement>(null);
  const wipeRef = useRef<HTMLSpanElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useLayoutEffect(() => {
    const row = rowRef.current;
    const label = labelRef.current;
    if (!row || !label) return;
    gsap.set(label, { autoAlpha: 0, scale: 0.8 });

    const xTo = gsap.quickTo(label, "x", { duration: 0.2, ease: "power3.out" });
    const yTo = gsap.quickTo(label, "y", { duration: 0.2, ease: "power3.out" });
    const titleX = gsap.quickTo(titleRef.current, "x", { duration: 0.35, ease: "power3.out" });
    const place = (event: PointerEvent) => ({
      x: event.clientX + 15 + label.offsetWidth > window.innerWidth ? event.clientX - 15 - label.offsetWidth : event.clientX + 15,
      y: event.clientY + 15 + label.offsetHeight > window.innerHeight ? event.clientY - 15 - label.offsetHeight : event.clientY + 15,
    });
    const move = (event: PointerEvent) => {
      const at = place(event);
      xTo(at.x);
      yTo(at.y);
      if (variant === 4) titleX(((event.clientX - row.getBoundingClientRect().left) / row.clientWidth - 0.5) * 20);
    };
    const enter = (event: PointerEvent) => {
      gsap.set(label, place(event));
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
      gsap.set(label, { autoAlpha: 0 });
    };
  }, [variant, mounted]);

  return (
    <a ref={rowRef} data-service-row href={href} onClick={onClick} className={`group relative grid min-h-[4rem] flex-1 grid-cols-[2.6rem_1fr_auto] items-center gap-3 overflow-hidden px-5 min-[380px]:grid-cols-[3.25rem_1fr_auto] min-[380px]:gap-4 min-[380px]:px-6 py-[clamp(0.4rem,1.2svh,0.9rem)] transition-colors duration-300 sm:grid-cols-[6rem_1fr_auto] sm:px-10 lg:grid-cols-[16.5rem_1fr_auto] lg:gap-8 lg:px-4 ${variant === 2 ? "" : "hover:bg-primary"}`}>
      <span data-divider className="absolute inset-x-0 top-0 z-20 h-px origin-left bg-white/15" />
      <span ref={wipeRef} className="absolute inset-0 z-0 origin-left scale-x-0 bg-primary" />
      <span data-row-content className="relative z-10 font-mono text-sm font-semibold text-primary group-hover:text-black lg:text-base">({number})</span>
      <span data-row-content className="relative z-10 min-w-0">
        <h3 className="block overflow-hidden"><span ref={titleRef} className="block text-[clamp(1.1rem,5.4vw,1.4rem)] font-semibold leading-[1.12] sm:text-[clamp(1.4rem,min(3.3vw,5svh),3.4rem)] sm:leading-none uppercase tracking-[-0.05em] text-white group-hover:text-black">{title}</span></h3>
        <span className="mt-[clamp(0.2rem,0.8svh,0.5rem)] block max-w-[34rem] text-xs leading-snug text-white/50 group-hover:text-black/70 sm:text-sm">{description}{price && <b className="ml-2 whitespace-nowrap font-semibold text-primary group-hover:text-black">· Desde {price}</b>}</span>
      </span>
      <span data-row-content className="relative z-10 text-3xl text-white transition-transform duration-300 group-hover:-rotate-45 group-hover:text-black sm:text-5xl">→</span>
      <span data-bar className="pointer-events-none absolute inset-0 z-20 origin-left scale-x-0 bg-primary" aria-hidden="true" />
      {mounted && createPortal(image
        ? <span ref={labelRef} className="pointer-events-none fixed left-0 top-0 z-[45] hidden w-56 overflow-hidden bg-black opacity-0 shadow-[0_24px_60px_rgba(0,0,0,0.55)] md:block" aria-hidden="true">
            <img src={image} alt="" loading="lazy" decoding="async" className="block aspect-[4/3] w-full object-cover" />
            <span className="flex items-center justify-between px-3 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-white">Saber más<span className="text-primary">→</span></span>
          </span>
        : <span ref={labelRef} className="pointer-events-none fixed left-0 top-0 z-[45] hidden h-20 w-20 place-items-center bg-black text-center text-[10px] font-bold uppercase leading-tight text-white opacity-0 md:grid" aria-hidden="true">Saber<br />más</span>, document.body)}
    </a>
  );
}
