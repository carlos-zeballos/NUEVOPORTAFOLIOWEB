import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Word, flashAccent, revealWords, scrambleText, wordsHidden } from "../motion/title-motion";
import { ServiceRow } from "../ui/service-row";
import { services } from "../../content/services";
import { servicePath } from "../../lib/router";
import { usePageTransition } from "../../hooks/usePageTransition";
import { catalogSchema, jsonLd } from "../../lib/seo";

const catalog = jsonLd(catalogSchema(services));

gsap.registerPlugin(ScrollTrigger);

export function ServicesSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const { navigateTo, isTransitioning } = usePageTransition();

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let waitingForTransition = false;
    let entered = false;
    let intro: gsap.core.Timeline | null = null;
    const isServicesTarget = (event: Event) => (event as CustomEvent<{ target: string }>).detail?.target === "#servicios";
    const prepare = (event: Event) => { if (isServicesTarget(event)) waitingForTransition = true; };
    const complete = (event: Event) => {
      if (!isServicesTarget(event)) return;
      waitingForTransition = false;
      if (entered) intro?.play();
    };
    window.addEventListener("page-transition:prepare", prepare);
    window.addEventListener("page-transition:complete", complete);
    const context = gsap.context(() => {
      const list = section.querySelector<HTMLElement>("[data-services-list]");
      if (list && list.getBoundingClientRect().top > window.innerHeight * 0.75) {
        const rows = gsap.utils.toArray<HTMLElement>("[data-service-row]", list);
        const eyebrow = section.querySelector<HTMLElement>("[data-services-eyebrow]");
        gsap.set("[data-services-line]", { scaleX: 0 });
        gsap.set(eyebrow, { autoAlpha: 0 });
        gsap.set(list.parentElement!.querySelectorAll("h2 [data-word]"), wordsHidden);
        gsap.set(rows.map((row) => row.querySelectorAll("[data-row-content]")), { autoAlpha: 0 });
        gsap.set(rows.map((row) => row.querySelector("[data-divider]")), { scaleX: 0 });
        intro = gsap.timeline({ paused: true });
        ScrollTrigger.create({ trigger: list, start: "top 75%", once: true, onEnter: () => { entered = true; if (!waitingForTransition) intro?.play(); } });
        intro
          .to("[data-services-line]", { scaleX: 1, duration: 0.6, ease: "power3.inOut" }, 0)
          .set(eyebrow, { autoAlpha: 1 }, 0.1)
          .add(eyebrow ? scrambleText(eyebrow, 0.8) : gsap.timeline(), 0.1)
          .add(revealWords(list.parentElement!.querySelectorAll("h2 [data-word]")), 0.05)
          .add(flashAccent(list.parentElement!.querySelectorAll("h2 [data-word-accent]")), 0.9);
        rows.forEach((row, index) => {
          const bar = row.querySelector("[data-bar]");
          const at = 0.15 + index * 0.12;
          intro!
            .to(row.querySelector("[data-divider]"), { scaleX: 1, duration: 0.6, ease: "power3.inOut" }, at)
            .fromTo(bar, { scaleX: 0, transformOrigin: "left center" }, { scaleX: 1, duration: 0.38, ease: "power3.in" }, at)
            .set(row.querySelectorAll("[data-row-content]"), { autoAlpha: 1 }, at + 0.38)
            .to(bar, { scaleX: 0, transformOrigin: "right center", duration: 0.45, ease: "power3.out" }, at + 0.38);
        });
      }
    }, section);
    return () => {
      window.removeEventListener("page-transition:prepare", prepare);
      window.removeEventListener("page-transition:complete", complete);
      context.revert();
    };
  }, []);

  return (
    <section ref={sectionRef} id="servicios" className="relative z-10 bg-[#030504] text-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: catalog }} />
      <div className="relative flex min-h-[100svh] flex-col overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_55%_45%_at_88%_32%,rgba(3,234,0,0.13),transparent_70%),radial-gradient(ellipse_40%_35%_at_8%_95%,rgba(3,234,0,0.07),transparent_70%)]" aria-hidden="true" />
        <div className="pointer-events-none absolute inset-0 opacity-[.05] [background-image:linear-gradient(90deg,rgba(255,255,255,.5)_1px,transparent_1px)] [background-size:8.333vw_100%]" aria-hidden="true" />
        <div className="relative z-10 flex flex-col gap-5 px-6 pb-[clamp(1rem,3svh,2rem)] pt-[clamp(5.5rem,15svh,7.5rem)] sm:px-10 md:flex-row md:items-end md:justify-between md:gap-10 lg:px-4">
          <div>
            <p className="mb-[clamp(0.6rem,2svh,1rem)] flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-primary"><span data-services-line className="line-pulse h-px w-10 origin-left bg-primary" /><span data-services-eyebrow data-scramble="02 — Servicios">02 — Servicios</span></p>
            <h2 className="text-[clamp(2rem,max(min(5.6vw,9.5svh),min(10.6vw,2.4rem)),5.8rem)] font-black uppercase leading-[0.86] tracking-[-0.06em] text-white">
              <span className="block"><Word>Servicios</Word></span>{" "}
              <span className="block whitespace-nowrap"><Word>que</Word>{" "}<Word accent className="text-shine">ofrecemos.</Word></span>
            </h2>
          </div>
        </div>
        <div data-services-list className="relative z-0 flex flex-1 flex-col border-b border-white/15">
          {services.map((service, index) => (
            <ServiceRow
              key={service.slug}
              number={String(index + 1).padStart(2, "0")}
              title={service.title}
              description={service.summary}
              image={service.cover}
              variant={index + 1}
              href={servicePath(service.slug)}
              onClick={(event) => {
                event.preventDefault();
                if (!isTransitioning) navigateTo(servicePath(service.slug));
              }}
            />
          ))}
        </div>
      </div>

    </section>
  );
}
