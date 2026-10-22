import { useLayoutEffect, useRef, useState, type MouseEvent, type PointerEvent } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { projects } from "../../content/profile";
import { scrollToTarget } from "../../components/scroll/scrollToTarget";

gsap.registerPlugin(ScrollTrigger);

export function ProfileProjects() {
  const rootRef = useRef<HTMLElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const moveRef = useRef<{ x: gsap.QuickToFunc; y: gsap.QuickToFunc } | null>(null);
  const [active, setActive] = useState<number | null>(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    const preview = previewRef.current;
    if (!root || !preview) return;
    const context = gsap.context(() => {
      gsap.set(preview, { autoAlpha: 0, scale: 0.6, xPercent: -50, yPercent: -50, rotate: -5 });
      moveRef.current = {
        x: gsap.quickTo(preview, "x", { duration: 0.55, ease: "power3.out" }),
        y: gsap.quickTo(preview, "y", { duration: 0.55, ease: "power3.out" }),
      };
      gsap.from("[data-project-row]", { y: 60, autoAlpha: 0, duration: 0.9, stagger: 0.07, ease: "power3.out", scrollTrigger: { trigger: "[data-project-list]", start: "top 80%", once: true } });
      gsap.from("[data-projects-title]", { yPercent: 110, duration: 1, ease: "power4.out", scrollTrigger: { trigger: root, start: "top 78%", once: true } });
    }, root);
    return () => context.revert();
  }, []);

  const bandFor = (row: HTMLElement) => row.querySelector<HTMLElement>("[data-band]");

  const enterRow = (event: PointerEvent<HTMLElement>, index: number) => {
    const row = event.currentTarget;
    const fromTop = event.clientY - row.getBoundingClientRect().top < row.offsetHeight / 2;
    gsap.fromTo(bandFor(row), { scaleY: 0, transformOrigin: fromTop ? "50% 0%" : "50% 100%" }, { scaleY: 1, duration: 0.42, ease: "power3.out", overwrite: true });
    setActive(index);
    if (event.pointerType !== "mouse" || !previewRef.current) return;
    if (active === null) gsap.set(previewRef.current, { x: event.clientX, y: event.clientY });
    gsap.to(previewRef.current, { autoAlpha: 1, scale: 1, rotate: -4, duration: 0.45, ease: "power3.out", overwrite: "auto" });
  };

  const leaveRow = (event: PointerEvent<HTMLElement>) => {
    const row = event.currentTarget;
    const toTop = event.clientY - row.getBoundingClientRect().top < row.offsetHeight / 2;
    gsap.to(bandFor(row), { scaleY: 0, transformOrigin: toTop ? "50% 0%" : "50% 100%", duration: 0.36, ease: "power3.inOut", overwrite: true });
  };

  const leaveList = () => {
    setActive(null);
    if (previewRef.current) gsap.to(previewRef.current, { autoAlpha: 0, scale: 0.6, rotate: -8, duration: 0.35, ease: "power3.in", overwrite: "auto" });
  };

  const movePreview = (event: PointerEvent<HTMLElement>) => {
    moveRef.current?.x(event.clientX);
    moveRef.current?.y(event.clientY);
  };

  const goToContact = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    scrollToTarget("#pf-contacto", { duration: 1.6 });
  };

  return (
    <section ref={rootRef} id="pf-proyectos" aria-labelledby="pf-projects-heading" className="relative overflow-x-clip py-[clamp(5rem,14vh,9rem)]">
      <div className="pf-shell mb-[clamp(2.5rem,6vh,4rem)] flex items-end justify-between gap-6">
        <h2 id="pf-projects-heading" className="pf-mask pf-display text-[clamp(2.5rem,5.4vw,5rem)] text-[#f5f7f5]">
          <span data-projects-title className="block">Proyectos realizados<span className="text-[#03ea00]">.</span></span>
        </h2>
        <a href="#pf-contacto" onClick={goToContact} className="group mb-3 hidden shrink-0 items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-white/70 transition-colors hover:text-white sm:inline-flex">
          Hablemos <span className="text-[#03ea00] transition-transform group-hover:translate-x-1" aria-hidden="true">→</span>
        </a>
      </div>

      <ul data-project-list className="pf-shell" onPointerLeave={leaveList} onPointerMove={movePreview}>
        {projects.map(({ title, tags, link, image }, index) => {
          const content = (
            <>
              <span data-band className="pointer-events-none absolute inset-y-0 -left-[var(--pf-pad)] -right-[var(--pf-pad)] origin-top scale-y-0 bg-[#03ea00]" aria-hidden="true" />
              <span className="relative block aspect-[4/3] w-full overflow-hidden bg-white/5 md:hidden" aria-hidden="true">
                <img src={image} alt="" loading="lazy" className="h-full w-full object-cover opacity-80" />
              </span>
              <span className="relative hidden text-[11px] tabular-nums text-white/35 transition-colors duration-300 group-hover:text-black/60 md:block">{String(index + 1).padStart(2, "0")}</span>
              <span className="relative min-w-0">
                <span className="pf-display block break-words text-[clamp(2rem,5.5vw,5.6rem)] uppercase text-white/70 md:truncate md:text-white/[0.22] transition-[color,transform] duration-500 ease-[cubic-bezier(.16,1,.3,1)] group-hover:translate-x-[clamp(0.5rem,2vw,2rem)] group-hover:text-[#050505]">{title}</span>
                <span className="mt-1 block text-[10px] font-semibold uppercase tracking-[0.2em] text-white/45 group-hover:text-black/65 md:hidden">{tags}</span>
              </span>
              <span className="relative hidden text-right text-[10px] font-semibold uppercase tracking-[0.2em] text-white/45 transition-colors group-hover:text-black/70 md:block">{tags}</span>
              <span className="relative text-xl text-white/70 transition-[transform,color] duration-300 group-hover:rotate-45 group-hover:text-black" aria-hidden="true">↗</span>
            </>
          );
          const rowClass = "group relative grid grid-cols-[4.5rem_1fr_auto] items-center gap-4 border-b border-white/[0.08] py-[clamp(0.75rem,1.5vw,1.25rem)] md:grid-cols-[3.5rem_1fr_auto_auto] md:gap-8";
          return (
            <li key={title} data-project-row>
              {link ? (
                <a href={link} target="_blank" rel="noreferrer" className={rowClass} onPointerEnter={(event) => enterRow(event, index)} onPointerLeave={leaveRow} aria-label={`${title}: ${tags}. Abrir proyecto`}>{content}</a>
              ) : (
                <div className={rowClass} onPointerEnter={(event) => enterRow(event, index)} onPointerLeave={leaveRow}>{content}</div>
              )}
            </li>
          );
        })}
      </ul>

      <div ref={previewRef} className="pointer-events-none fixed left-0 top-0 z-40 hidden aspect-[16/10] w-[clamp(16rem,24vw,24rem)] overflow-hidden bg-[#111] shadow-[0_30px_80px_rgba(0,0,0,0.55)] md:block" aria-hidden="true">
        {projects.map(({ title, image }, index) => (
          <img key={title} src={image} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover transition-[opacity,transform] duration-500" style={{ opacity: active === index ? 1 : 0, transform: active === index ? "scale(1)" : "scale(1.12)" }} />
        ))}
        <span className="absolute left-1/2 top-1/2 grid h-[5.25rem] w-[5.25rem] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-[#03ea00] text-[10px] font-bold uppercase tracking-[0.18em] text-black">
          {active !== null && !projects[active].link ? "Pronto" : "Abrir"}
        </span>
      </div>
    </section>
  );
}
