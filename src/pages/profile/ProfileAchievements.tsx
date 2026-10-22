import { useLayoutEffect, useRef, type CSSProperties } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { achievements, techMarquee } from "../../content/profile";

gsap.registerPlugin(ScrollTrigger);

function SkillsRow({ hidden = false }: { hidden?: boolean }) {
  return (
    <ul className="flex shrink-0 items-center" aria-hidden={hidden || undefined}>
      {techMarquee.map((icon) => (
        <li key={icon.slug} className="pf-tech px-[clamp(1.6rem,3.2vw,3rem)]" style={{ "--brand": `#${icon.hex}` } as CSSProperties} title={icon.title}>
          <svg viewBox="0 0 24 24" role="img" aria-label={icon.title}><path d={icon.path} /></svg>
        </li>
      ))}
    </ul>
  );
}

export function ProfileAchievements() {
  const rootRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const context = gsap.context(() => {
      gsap.from("[data-ach-title]", { yPercent: 110, duration: 1, ease: "power4.out", scrollTrigger: { trigger: "[data-ach-head]", start: "top 80%", once: true } });
      gsap.from("[data-ach-row]", { y: 26, autoAlpha: 0, duration: 0.7, stagger: 0.06, ease: "power3.out", scrollTrigger: { trigger: "[data-ach-table]", start: "top 82%", once: true } });
    }, root);
    return () => context.revert();
  }, []);

  return (
    <section ref={rootRef} id="pf-logros" aria-labelledby="pf-ach-heading" className="overflow-hidden pb-[clamp(5rem,14vh,9rem)] text-[#f5f7f5]">
      <div className="pf-marquee-wrap pf-fade-x overflow-hidden border-y border-white/[0.08] py-7" role="region" aria-label="Tecnologías que uso">
        <div className="pf-marquee pf-marquee-fast text-[clamp(2rem,3.6vw,3.1rem)] text-white/55">
          <SkillsRow />
          <SkillsRow hidden />
        </div>
      </div>

      <div className="pf-shell">
        <div data-ach-head className="mt-[clamp(4rem,11vh,7rem)] flex flex-wrap items-end justify-between gap-6">
          <h2 id="pf-ach-heading" className="pf-mask pf-display text-[clamp(2rem,max(5.4vw,min(10.9vw,2.5rem)),5rem)]">
            <span data-ach-title className="block">Logros y certificaciones<sup className="ml-2 align-super text-[0.28em] font-semibold tracking-normal text-[#03ea00]">({String(achievements.length).padStart(2, "0")})</sup></span>
          </h2>
          <p className="pf-eyebrow mb-3">Académicos y técnicos</p>
        </div>

        <div data-ach-table role="table" aria-label="Logros y certificaciones" className="mt-12">
          <div role="row" className="hidden grid-cols-[1.6fr_1.3fr_0.45fr_0.8fr] gap-6 border-b border-white/10 pb-4 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/40 md:grid">
            <span role="columnheader">Logro</span><span role="columnheader">Detalle</span><span role="columnheader">Año</span><span role="columnheader">Institución</span>
          </div>
          {achievements.map(({ award, detail, year, org }) => (
            <div key={award} role="row" data-ach-row className="group grid grid-cols-1 gap-x-6 gap-y-1 border-b border-white/10 px-0 py-5 text-[0.95rem] transition-[background-color,padding] duration-300 hover:bg-white/[0.04] hover:px-4 md:grid-cols-[1.6fr_1.3fr_0.45fr_0.8fr] md:items-center md:gap-6">
              <span role="cell" className="font-semibold">{award}</span>
              <span role="cell" className="text-white/55 transition-colors group-hover:text-white/75">{detail}</span>
              <span role="cell" className="text-xs font-semibold tabular-nums text-white/50 transition-colors group-hover:text-[#03ea00]">{year}</span>
              <span role="cell" className="text-white/80">{org}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
