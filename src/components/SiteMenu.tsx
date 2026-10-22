import { useEffect, useLayoutEffect, useRef, type MouseEvent } from "react";
import { gsap } from "gsap";
import { ArrowUpRight } from "lucide-react";
import { usePageTransition } from "../hooks/usePageTransition";
import { scrollController } from "./scroll/scrollToTarget";
import { socials } from "../content/site";
import { ContactIcons } from "./ContactIcons";
import { PROFILE_PATH } from "../lib/router";

const sections = [
  { label: "Inicio", href: "#inicio" },
  { label: "Servicios", href: "#servicios" },
  { label: "¿Por qué Zebware?", href: "#layered-section" },
  { label: "Trabajemos juntos", href: "#trabajemos" },
  { label: "Contacto", href: "#contacto" },
  { label: "Preguntas frecuentes", href: "#preguntas" },
];

export function SiteMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const wasOpenRef = useRef(false);
  const { transitionTo, navigateTo } = usePageTransition();

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (!open && !wasOpenRef.current) return;
    wasOpenRef.current = open;
    const panel = root.querySelector("[data-menu-panel]");
    const items = root.querySelectorAll("[data-menu-item]");
    const context = gsap.context(() => {
      if (open) {
        gsap.set(root, { autoAlpha: 1 });
        gsap.fromTo(panel, { clipPath: "inset(0 0 100% 0)" }, { clipPath: "inset(0 0 0% 0)", duration: 0.65, ease: "power4.inOut" });
        gsap.fromTo(items, { yPercent: 100, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: 0.6, stagger: 0.045, ease: "power3.out", delay: 0.22 });
      } else {
        gsap.to(panel, { clipPath: "inset(0 0 100% 0)", duration: 0.45, ease: "power3.inOut" });
        gsap.to(root, { autoAlpha: 0, duration: 0.2, delay: 0.3 });
      }
    }, root);
    if (open) scrollController.lenis?.stop();
    else scrollController.lenis?.start();
    return () => context.kill();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const goToSection = (event: MouseEvent<HTMLAnchorElement>, href: string) => {
    event.preventDefault();
    onClose();
    window.setTimeout(() => transitionTo(href), 260);
  };

  const goToProfile = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    onClose();
    window.setTimeout(() => navigateTo(PROFILE_PATH), 260);
  };

  return (
    <div ref={rootRef} id="site-menu" className="invisible fixed inset-0 z-[49] opacity-0" aria-hidden={!open}>
      <button type="button" className="absolute inset-0 h-full w-full cursor-default bg-black/55 backdrop-blur-[3px]" onClick={onClose} aria-label="Cerrar menú" tabIndex={open ? 0 : -1} />
      <nav data-menu-panel aria-label="Secciones de Zebware" className="relative border-b border-white/10 bg-[#030504]/95 px-[clamp(20px,4vw,64px)] pb-10 pt-[108px] backdrop-blur-xl">
        <div className="grid gap-10 lg:grid-cols-[1.5fr_0.5fr]">
          <ol className="grid gap-x-10 sm:grid-cols-2">
            {sections.map(({ label, href }, index) => (
              <li key={href} className="overflow-hidden border-b border-white/[0.07]">
                <a data-menu-item href={href} onClick={(event) => goToSection(event, href)} tabIndex={open ? 0 : -1} className="group flex items-baseline gap-4 py-4 text-[clamp(1.35rem,2.4vw,2.1rem)] font-semibold uppercase tracking-[-0.04em] text-white/85 transition-colors hover:text-primary">
                  <span className="font-mono text-[11px] tracking-normal text-primary/70">{String(index + 1).padStart(2, "0")}</span>
                  <span className="transition-transform duration-300 group-hover:translate-x-2">{label}</span>
                </a>
              </li>
            ))}
            <li className="overflow-hidden border-b border-white/[0.07] sm:col-span-2">
              <a data-menu-item href={PROFILE_PATH} onClick={goToProfile} tabIndex={open ? 0 : -1} className="group flex items-baseline gap-4 py-4 text-[clamp(1.35rem,2.4vw,2.1rem)] font-semibold uppercase tracking-[-0.04em] text-primary">
                <span className="font-mono text-[11px] tracking-normal text-primary/70">07</span>
                <span className="transition-transform duration-300 group-hover:translate-x-2">Perfil profesional</span>
                <ArrowUpRight className="h-5 w-5 self-center transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" strokeWidth={1.8} aria-hidden="true" />
              </a>
            </li>
          </ol>
          <div data-menu-item className="flex flex-col gap-6 text-sm text-white/55 lg:border-l lg:border-white/[0.07] lg:pl-10">
            <div>
              <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.24em] text-white/35">Escríbenos</p>
              <ContactIcons tabIndex={open ? 0 : -1} linkClassName="grid h-9 w-9 place-items-center border border-white/15 text-white/60 transition-colors hover:border-primary hover:text-primary" />
            </div>
            <div>
              <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.24em] text-white/35">Síguenos</p>
              <div className="flex gap-2">
                {socials.map(({ href, label, Icon }) => (
                  <a key={label} href={href} target="_blank" rel="noreferrer" aria-label={label} tabIndex={open ? 0 : -1} className="grid h-9 w-9 place-items-center border border-white/15 text-white/60 transition-colors hover:border-primary hover:text-primary"><Icon className="h-4 w-4" strokeWidth={1.7} aria-hidden="true" /></a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
}
