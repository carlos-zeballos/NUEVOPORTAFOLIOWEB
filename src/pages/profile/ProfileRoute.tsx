import { useLayoutEffect, useRef, type CSSProperties } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { methods, route, techMarquee } from "../../content/profile";

gsap.registerPlugin(ScrollTrigger);

export function ProfileRoute() {
  const rootRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const context = gsap.context(() => {
      gsap.from("[data-route-line]", { yPercent: 110, duration: 1.1, stagger: 0.1, ease: "power4.out", scrollTrigger: { trigger: root, start: "top 70%", once: true } });
      gsap.from("[data-route-chip]", { y: 14, autoAlpha: 0, duration: 0.5, stagger: 0.025, ease: "power2.out", scrollTrigger: { trigger: "[data-route-chips]", start: "top 85%", once: true } });
      gsap.utils.toArray<HTMLElement>("[data-route-item]").forEach((item) => {
        gsap.from(item.querySelectorAll("[data-route-fade]"), { y: 30, autoAlpha: 0, duration: 0.8, stagger: 0.07, ease: "power3.out", scrollTrigger: { trigger: item, start: "top 82%", once: true } });
        gsap.fromTo(item.querySelector("[data-route-progress]"), { scaleX: 0 }, { scaleX: 1, ease: "none", scrollTrigger: { trigger: item, start: "top 78%", end: "top 38%", scrub: 0.5 } });
      });
    }, root);
    return () => context.revert();
  }, []);

  return (
    <section ref={rootRef} id="pf-ruta" aria-labelledby="pf-route-heading" className="border-t border-white/[0.08] py-[clamp(5rem,15vh,9.5rem)] text-[#f5f7f5]">
      <div className="pf-shell grid gap-14 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <h2 id="pf-route-heading" className="pf-display text-[clamp(3rem,6.2vw,6rem)]">
            <span className="pf-mask"><span data-route-line className="block">Mi ruta</span></span>
            <span className="pf-mask"><span data-route-line className="block text-[#03ea00]">profesional.</span></span>
          </h2>
          <div data-route-chips className="mt-10 max-w-[30rem]">
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.24em] text-white/45">Stack</p>
            <ul className="flex flex-wrap gap-2">
              {techMarquee.map((icon) => (
                <li key={icon.slug} data-route-chip className="pf-tech-chip" style={{ "--brand": `#${icon.hex}` } as CSSProperties} title={icon.title}>
                  <svg viewBox="0 0 24 24" role="img" aria-label={icon.title}><path d={icon.path} /></svg>
                </li>
              ))}
            </ul>
            <p className="mb-3 mt-8 text-[10px] font-semibold uppercase tracking-[0.24em] text-white/45">Metodologías</p>
            <ul className="flex flex-wrap gap-2">{methods.map((item) => <li key={item} data-route-chip className="pf-chip">{item}</li>)}</ul>
          </div>
        </div>

        <ol>
          {route.map(({ title, org, period, description }, index) => (
            <li key={title} data-route-item className="relative grid grid-cols-[2.75rem_1fr] gap-x-4 border-t border-white/10 py-[clamp(2rem,5vh,3rem)] sm:grid-cols-[3.5rem_1fr]">
              <span data-route-progress className="absolute -top-px left-0 h-[2px] w-full origin-left bg-[#03ea00]" aria-hidden="true" />
              <span data-route-fade className="pt-2 text-[11px] font-semibold tabular-nums text-[#03ea00]">{String(index + 1).padStart(2, "0")}</span>
              <div>
                <p data-route-fade className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/45">{org} <span className="mx-2 text-[#03ea00]">/</span> {period}</p>
                <h3 data-route-fade className="mt-3 text-[clamp(1.55rem,2.6vw,2.35rem)] font-bold leading-[1.08] tracking-[-0.04em]">{title}</h3>
                <p data-route-fade className="mt-4 max-w-[36rem] text-[0.95rem] leading-relaxed text-white/60">{description}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
