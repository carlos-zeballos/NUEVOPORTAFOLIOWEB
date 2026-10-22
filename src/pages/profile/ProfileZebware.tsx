import { useLayoutEffect, useRef, type MouseEvent } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowUpRight } from "lucide-react";
import { profileImages, studioStats } from "../../content/profile";
import { contact } from "../../content/site";
import { WhatsAppIcon } from "../../components/ui/whatsapp-icon";
import { usePageTransition } from "../../hooks/usePageTransition";
import { HOME_PATH } from "../../lib/router";
import { countUpOnView } from "./countUp";

gsap.registerPlugin(ScrollTrigger);

export function ProfileZebware() {
  const rootRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { navigateTo, isTransitioning } = usePageTransition();

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const context = gsap.context(() => {
      gsap.from("[data-studio-line]", { yPercent: 110, duration: 1.1, stagger: 0.1, ease: "power4.out", scrollTrigger: { trigger: root, start: "top 72%", once: true } });
      gsap.from("[data-studio-fade]", { y: 24, autoAlpha: 0, duration: 0.9, stagger: 0.08, ease: "power3.out", scrollTrigger: { trigger: root, start: "top 65%", once: true } });
      gsap.from("[data-studio-frame]", { clipPath: "inset(12% 12% 12% 12%)", scale: 1.06, duration: 1.4, ease: "power4.inOut", scrollTrigger: { trigger: "[data-studio-frame]", start: "top 82%", once: true } });
      ScrollTrigger.create({
        trigger: "[data-studio-frame]",
        start: "top bottom",
        end: "bottom top",
        onToggle: ({ isActive }) => { if (isActive) void videoRef.current?.play().catch(() => undefined); else videoRef.current?.pause(); },
      });
      countUpOnView(gsap.utils.toArray<HTMLElement>("[data-count]"));
    }, root);
    return () => context.revert();
  }, []);

  const goHome = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    if (!isTransitioning) navigateTo(HOME_PATH);
  };

  return (
    <section ref={rootRef} id="pf-zebware" aria-labelledby="pf-studio-heading" className="relative overflow-hidden border-t border-white/[0.08] py-[clamp(5rem,15vh,9.5rem)]">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_55%_45%_at_78%_30%,rgba(3,234,0,0.08),transparent_70%)]" aria-hidden="true" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:72px_72px] [mask-image:linear-gradient(180deg,transparent,#000_30%,#000_70%,transparent)]" aria-hidden="true" />

      <div className="pf-shell relative grid items-center gap-14 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
        <div>
          <h2 id="pf-studio-heading" className="pf-display text-[clamp(3rem,6.6vw,6.4rem)] text-[#f5f7f5]">
            <span className="pf-mask"><span data-studio-line className="block">Fundé</span></span>
            <span className="pf-mask"><span data-studio-line className="block text-[#03ea00]">Zebware<span className="text-[#f5f7f5]">.</span></span></span>
          </h2>
          <p data-studio-fade className="mt-8 text-[clamp(1.1rem,1.6vw,1.45rem)] font-medium tracking-[-0.02em] text-white/90">Estudio de desarrollo web, apps e IA desde Arequipa.</p>
          <p data-studio-fade className="mt-4 max-w-[30rem] text-[0.95rem] leading-relaxed text-white/50">
            Es la marca con la que llevo proyectos de punta a punta: requisitos, arquitectura, frontend, API, base de datos, despliegue y soporte, para empresas como Grupo Michell, Conceptual Estudio Creativo y Global Vertical Construction.
          </p>
          <div data-studio-fade className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
            <a href={HOME_PATH} onClick={goHome} className="group inline-flex h-12 items-center gap-2 border border-white/15 px-5 text-[10px] font-semibold uppercase tracking-[0.22em] text-white transition-colors hover:border-[#03ea00] hover:bg-[#03ea00]/10">
              Conocer Zebware <ArrowUpRight className="h-3.5 w-3.5 text-[#03ea00] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" strokeWidth={1.8} aria-hidden="true" />
            </a>
            <a href={contact.whatsapp} target="_blank" rel="noreferrer" className="group inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/75 transition-colors hover:text-white">
              <WhatsAppIcon className="h-4 w-4 text-[#03ea00]" aria-hidden="true" />
              Escríbeme <ArrowUpRight className="h-3.5 w-3.5 text-[#03ea00] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" strokeWidth={1.8} aria-hidden="true" />
            </a>
          </div>
        </div>

        <div data-studio-frame className="relative aspect-[16/10] overflow-hidden border border-white/10 bg-black">
          <video ref={videoRef} src={profileImages.studioVideo} muted loop playsInline preload="metadata" className="absolute inset-0 h-full w-full object-cover opacity-90" aria-hidden="true" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_55%,rgba(0,0,0,0.7))]" aria-hidden="true" />
          <span className="absolute left-5 top-5 inline-flex items-center gap-2 bg-black/55 px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.22em] text-white/80 backdrop-blur-md">
            <i className="h-1.5 w-1.5 rounded-full bg-[#03ea00]" aria-hidden="true" /> zebware.org
          </span>
        </div>
      </div>

      <div className="pf-shell relative mt-[clamp(4rem,10vh,6.5rem)] grid gap-12 border-t border-white/[0.08] pt-10 lg:grid-cols-[1.1fr_0.9fr]">
        <dl className="grid grid-cols-3 gap-6">
          {studioStats.map(({ value, suffix, label }) => (
            <div key={label}>
              <dt className="sr-only">{label}</dt>
              <dd>
                <span data-count={value} data-suffix={suffix} className="pf-display block text-[clamp(2.3rem,4.2vw,3.8rem)] tabular-nums text-[#f5f7f5]">{value}{suffix}</span>
                <span className="mt-3 block text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40" aria-hidden="true">{label}</span>
              </dd>
            </div>
          ))}
        </dl>
        <blockquote data-studio-fade className="self-center">
          <p className="text-[clamp(1rem,1.35vw,1.2rem)] leading-relaxed text-white/80">“Mi trabajo no termina en el despliegue: termina cuando la tecnología le resuelve el día a tu negocio.”</p>
          <footer className="mt-4 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/40">Carlos Zeballos // Fundador @ Zebware</footer>
        </blockquote>
      </div>
    </section>
  );
}
