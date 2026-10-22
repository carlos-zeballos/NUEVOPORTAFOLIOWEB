import { useLayoutEffect, useRef, type MouseEvent } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowUp, MapPin } from "lucide-react";
import { contact, socials } from "../content/site";
import { BrandLogo } from "./ui/brand-logo";
import { ContactIcons } from "./ContactIcons";
import { scrollToTarget } from "./scroll/scrollToTarget";
import { services } from "../content/services";
import { servicePath } from "../lib/router";
import { usePageTransition } from "../hooks/usePageTransition";

gsap.registerPlugin(ScrollTrigger);

const navigation = [
  { label: "Inicio", href: "#inicio" },
  { label: "Servicios", href: "#servicios" },
  { label: "Contacto", href: "#contacto" },
  { label: "¿Por qué Zebware?", href: "#layered-section" },
  { label: "Preguntas frecuentes", href: "#preguntas" },
];
const ticker = ["Páginas web", "E-commerce", "Apps móviles", "Inteligencia artificial", "Automatizaciones", "Software a medida", "Invitaciones digitales"];

const goTo = (event: MouseEvent<HTMLAnchorElement>, href: string) => {
  event.preventDefault();
  scrollToTarget(href, { duration: 1.4 });
};

const columnTitle = "mb-6 flex items-center gap-2.5 text-[10px] font-semibold uppercase tracking-[.24em] text-white/55";
const linkClass = "group inline-flex items-center text-[15px] text-white/70 transition-colors duration-300 hover:text-primary";

export function SiteFooter() {
  const footerRef = useRef<HTMLElement>(null);
  const { navigateTo, isTransitioning } = usePageTransition();

  useLayoutEffect(() => {
    const footer = footerRef.current;
    if (!footer || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (footer.getBoundingClientRect().top < window.innerHeight * 0.9) return;
    const context = gsap.context(() => {
      gsap.set("[data-footer-line]", { scaleX: 0 });
      gsap.set("[data-footer-reveal]", { autoAlpha: 0, y: 28 });
      gsap.timeline({ scrollTrigger: { trigger: footer, start: "top 85%", once: true } })
        .to("[data-footer-line]", { scaleX: 1, duration: 0.9, ease: "power3.inOut", stagger: 0.1 }, 0)
        .to("[data-footer-reveal]", { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.07, ease: "power3.out" }, 0.15);
    }, footer);
    return () => context.revert();
  }, []);

  return (
    <footer ref={footerRef} className="relative z-10 overflow-hidden bg-[#020302] text-white">
      <div className="pointer-events-none absolute -left-40 top-0 h-[34rem] w-[34rem] rounded-full bg-primary/[.08] blur-[140px]" aria-hidden="true" />
      <div className="pointer-events-none absolute -right-52 bottom-0 h-[30rem] w-[30rem] rounded-full bg-primary/[.06] blur-[140px]" aria-hidden="true" />
      <div className="pointer-events-none absolute inset-0 opacity-[.06] [background-image:linear-gradient(rgba(255,255,255,.18)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.18)_1px,transparent_1px)] [background-size:72px_72px] [mask-image:linear-gradient(180deg,#000,transparent_75%)]" aria-hidden="true" />

      <div className="relative flex overflow-hidden border-y border-white/10 bg-white/[.02] py-5" aria-hidden="true">
        {[0, 1].map((copy) => (
          <div key={copy} className="footer-marquee flex shrink-0 items-center">
            {ticker.map((item) => (
              <span key={item} className="flex items-center whitespace-nowrap text-[clamp(1rem,1.6vw,1.5rem)] font-semibold uppercase tracking-[-.02em] text-white/45">
                {item}<span className="mx-8 h-1.5 w-1.5 rotate-45 bg-primary" />
              </span>
            ))}
          </div>
        ))}
      </div>

      <div className="relative mx-auto max-w-[116rem] px-5 sm:px-10 lg:px-8">
        <div className="grid grid-cols-2 gap-x-6 gap-y-12 py-16 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr] lg:gap-10">
          <div data-footer-reveal className="col-span-2 lg:col-span-1">
            <BrandLogo className="h-9" />
            <p className="mt-6 max-w-sm text-[15px] font-light leading-relaxed text-white/55">Estudio de desarrollo de software con base en Arequipa y clientes en todo el Perú. Creamos páginas web, apps e inteligencia artificial para empresas que quieren crecer.</p>
            <p className="mt-6 inline-flex items-center gap-2.5 border border-primary/25 bg-primary/[.06] px-3.5 py-2 text-[10px] font-semibold uppercase tracking-[.18em] text-primary"><i className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />Disponible para nuevos proyectos</p>
            <nav className="mt-7 flex gap-2" aria-label="Redes sociales de Zebware">
              {socials.map(({ href, label, Icon }) => (
                <a key={label} className="grid h-10 w-10 place-items-center border border-white/15 text-white/60 transition-[color,border-color,transform] duration-300 hover:-translate-y-0.5 hover:border-primary/60 hover:text-primary" href={href} target="_blank" rel="noreferrer" aria-label={label}><Icon className="h-4 w-4" strokeWidth={1.7} aria-hidden="true" /></a>
              ))}
            </nav>
          </div>

          <nav data-footer-reveal aria-label="Navegación del sitio">
            <p className={columnTitle}><span className="h-px w-5 bg-primary" />Navegación</p>
            <ul className="grid gap-3.5">
              {navigation.map(({ label, href }) => (
                <li key={href}><a className={linkClass} href={href} onClick={(event) => goTo(event, href)}><span className="h-px w-0 bg-primary transition-[width,margin] duration-300 group-hover:mr-2 group-hover:w-3" />{label}</a></li>
              ))}
            </ul>
          </nav>

          <div data-footer-reveal>
            <p className={columnTitle}><span className="h-px w-5 bg-primary" />Servicios</p>
            <ul className="grid gap-3.5">
              {services.map((service) => (
                <li key={service.slug}><a className={linkClass} href={servicePath(service.slug)} onClick={(event) => { event.preventDefault(); if (!isTransitioning) navigateTo(servicePath(service.slug)); }}><span className="h-px w-0 bg-primary transition-[width,margin] duration-300 group-hover:mr-2 group-hover:w-3" />{service.title}</a></li>
              ))}
            </ul>
          </div>

          <div data-footer-reveal className="col-span-2 lg:col-span-1">
            <p className={columnTitle}><span className="h-px w-5 bg-primary" />Contacto</p>
            <ul className="grid gap-5 text-[15px]">
              <li><span className="block text-[10px] uppercase tracking-[.2em] text-white/55">Escríbenos</span><ContactIcons className="mt-2.5 flex gap-2.5" linkClassName="grid h-11 w-11 place-items-center border border-white/15 text-white/75 transition-[border-color,color,transform] duration-300 hover:-translate-y-0.5 hover:border-primary hover:text-primary" iconClassName="h-[18px] w-[18px]" /></li>
              <li><span className="block text-[10px] uppercase tracking-[.2em] text-white/55">Ubicación</span><span className="mt-1.5 flex items-center gap-2 text-white/80"><MapPin className="h-4 w-4 text-primary" strokeWidth={1.7} aria-hidden="true" />{contact.city} · Atendemos todo el Perú</span></li>
            </ul>
          </div>
        </div>

        <span data-footer-line className="block h-px origin-left bg-white/10" aria-hidden="true" />
        <div className="flex flex-col gap-5 py-7 text-[11px] font-medium uppercase tracking-[.14em] text-white/55 sm:flex-row sm:items-center sm:justify-between">
          <span className="flex items-center gap-2.5">© {new Date().getFullYear()} <BrandLogo className="h-4 opacity-70" /> · Arequipa, Perú</span>
          <span className="hidden md:block">Ingenio humano <span className="text-primary">+</span> inteligencia artificial</span>
          <a href="#inicio" onClick={(event) => goTo(event, "#inicio")} className="group inline-flex items-center gap-3 self-start text-white/55 transition-colors hover:text-primary sm:self-auto">
            Volver arriba
            <span className="grid h-9 w-9 place-items-center border border-white/15 transition-[border-color,transform] duration-300 group-hover:-translate-y-1 group-hover:border-primary/60"><ArrowUp className="h-4 w-4" strokeWidth={1.7} aria-hidden="true" /></span>
          </a>
        </div>
      </div>
    </footer>
  );
}
