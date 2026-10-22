import { useLayoutEffect, useRef, type MouseEvent } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight, Mail } from "lucide-react";
import { contact, socials } from "../../content/site";
import { WhatsAppIcon } from "../../components/ui/whatsapp-icon";
import { usePageTransition } from "../../hooks/usePageTransition";
import { HOME_PATH } from "../../lib/router";

gsap.registerPlugin(ScrollTrigger);

const profileWhatsapp = "https://wa.me/51946691999?text=Hola%20Carlos%2C%20vi%20tu%20perfil%20profesional%20y%20quiero%20conversar";

export function ProfileFooter() {
  const rootRef = useRef<HTMLElement>(null);
  const { navigateTo, isTransitioning } = usePageTransition();

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const context = gsap.context(() => {
      gsap.from("[data-cta-line]", { yPercent: 110, duration: 1.1, stagger: 0.1, ease: "power4.out", scrollTrigger: { trigger: root, start: "top 75%", once: true } });
      gsap.from("[data-cta-fade]", { y: 22, autoAlpha: 0, duration: 0.8, stagger: 0.08, ease: "power3.out", scrollTrigger: { trigger: root, start: "top 65%", once: true } });
    }, root);
    return () => context.revert();
  }, []);

  const goHome = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    if (!isTransitioning) navigateTo(HOME_PATH);
  };

  const profileSocials = socials.filter(({ label }) => label === "LinkedIn" || label === "GitHub");

  return (
    <footer ref={rootRef} id="pf-contacto" className="relative overflow-hidden pt-[clamp(5rem,15vh,9rem)]">
      <div className="absolute bottom-0 left-1/2 h-[60%] w-[80%] -translate-x-1/2 rounded-full bg-[#03ea00]/[0.06] blur-[120px]" aria-hidden="true" />
      <div className="pf-shell relative">
        <p data-cta-fade className="inline-flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.24em] text-white/55">
          <i className="pf-pulse h-1.5 w-1.5 rounded-full bg-[#03ea00]" aria-hidden="true" /> Disponible para nuevos proyectos
        </p>
        <h2 className="pf-display mt-8 text-[clamp(2.4rem,max(8.4vw,min(calc((100vw-2.5rem)*0.14),3rem)),8rem)] text-[#f5f7f5]">
          <span className="pf-mask"><span data-cta-line className="block">Construyamos algo</span></span>
          <span className="pf-mask"><span data-cta-line className="block text-[#03ea00]">grande<span className="text-[#f5f7f5]">.</span></span></span>
        </h2>

        <div className="mt-[clamp(2.5rem,7vh,4rem)] flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
          <p data-cta-fade className="max-w-[26rem] text-[0.95rem] leading-relaxed text-white/50">Una web, un sistema o una idea que aún no tiene nombre. Si crees que podemos construirlo juntos, hablemos.</p>
          <div data-cta-fade className="flex items-center gap-3">
            <a href={`mailto:${contact.email}`} aria-label="Enviar un correo" title="Correo" className="grid h-12 w-12 place-items-center border border-white/15 text-white/80 transition-colors hover:border-[#03ea00] hover:text-[#03ea00]">
              <Mail className="h-5 w-5" strokeWidth={1.7} aria-hidden="true" />
            </a>
            <a href={profileWhatsapp} target="_blank" rel="noreferrer" className="group inline-flex h-12 items-center justify-center gap-3 border border-white/15 px-5 text-[10px] font-semibold uppercase tracking-[0.22em] text-white transition-colors hover:border-[#03ea00] hover:bg-[#03ea00] hover:text-black">
              <WhatsAppIcon className="h-4 w-4 text-[#03ea00] transition-colors group-hover:text-black" aria-hidden="true" />
              Iniciar conversación <ArrowRight className="h-4 w-4 text-[#03ea00] transition-[transform,color] group-hover:translate-x-1 group-hover:text-black" strokeWidth={1.8} aria-hidden="true" />
            </a>
          </div>
        </div>

        <div className="mt-[clamp(4rem,12vh,7rem)] flex flex-col gap-4 border-t border-white/[0.08] py-7 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40 sm:flex-row sm:items-center sm:justify-between">
          <span>Diseñado y desarrollado por Carlos Zeballos © {new Date().getFullYear()}</span>
          <nav aria-label="Enlaces del perfil" className="flex items-center gap-6">
            <span className="flex gap-2">
              {profileSocials.map(({ href, label, Icon }) => (
                <a key={label} href={href} target="_blank" rel="noreferrer" aria-label={label} title={label} className="grid h-9 w-9 place-items-center border border-white/15 text-white/60 transition-colors hover:border-[#03ea00] hover:text-[#03ea00]">
                  <Icon className="h-4 w-4" strokeWidth={1.7} aria-hidden="true" />
                </a>
              ))}
            </span>
            <a href={HOME_PATH} onClick={goHome} className="text-[#03ea00] transition-colors hover:text-white">Zebware</a>
          </nav>
        </div>
      </div>
    </footer>
  );
}
