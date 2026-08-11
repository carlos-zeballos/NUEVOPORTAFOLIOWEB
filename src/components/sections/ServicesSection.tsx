import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ServiceRow } from "../ui/service-row";
import { WorkTogetherScroll } from "./WorkTogetherScroll";
import { RobotFrameSequence } from "./RobotFrameSequence";

gsap.registerPlugin(ScrollTrigger);

const services = [["01", "Páginas web"], ["02", "E-commerce"], ["03", "Apps móviles"], ["04", "Invitaciones digitales"]];

export function ServicesSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const context = gsap.context(() => {
      gsap.set(["[data-dream-one]", "[data-dream-two]"], { clipPath: "inset(0 100% 0 0)", xPercent: -5 });
      gsap.set("[data-dream-arrow]", { autoAlpha: 0, scale: 0.65, yPercent: -30 });
      gsap.timeline({ scrollTrigger: { trigger: "[data-services-vision]", start: "top 64%", end: "top 18%", scrub: 0.22, invalidateOnRefresh: true } })
        .to("[data-dream-one]", { clipPath: "inset(0 0% 0 0)", xPercent: 0, ease: "none", duration: 1 })
        .to("[data-dream-two]", { clipPath: "inset(0 0% 0 0)", xPercent: 0, ease: "none", duration: 1 }, 0.2)
        .to("[data-dream-arrow]", { autoAlpha: 1, scale: 1, yPercent: 0, ease: "power2.out", duration: 0.42 }, 0.62);
      gsap.to("[data-dream-one]", { yPercent: -5, ease: "none", scrollTrigger: { trigger: "[data-services-vision]", start: "top top", end: "bottom top", scrub: 0.15 } });
      gsap.to("[data-dream-two]", { yPercent: -8, ease: "none", scrollTrigger: { trigger: "[data-services-vision]", start: "top top", end: "bottom top", scrub: 0.15 } });
      gsap.from("[data-contact-reveal]", { autoAlpha: 0, y: 34, duration: 0.65, stagger: 0.055, ease: "power3.out", scrollTrigger: { trigger: "[data-services-contact]", start: "top 74%", once: true } });
      gsap.fromTo("[data-services-contact]", { yPercent: 4 }, { yPercent: 0, ease: "none", scrollTrigger: { trigger: "[data-services-contact]", start: "top bottom", end: "top 40%", scrub: 0.14 } });
    }, section);
    return () => context.revert();
  }, []);

  return (
    <section ref={sectionRef} id="servicios" className="relative min-h-screen bg-black text-white">
      <div className="grid min-h-[575px] grid-cols-1 content-end px-6 pb-8 pt-48 sm:px-10 lg:min-h-[680px] lg:px-4 lg:pb-10 lg:pt-40">
        <h2 className="max-w-[15ch] text-[clamp(3rem,5vw,6rem)] font-semibold uppercase leading-[0.88] tracking-[-0.065em] text-white">Servicios que ofrecemos<span className="text-primary">.</span></h2>
      </div>
      <div className="border-b border-[#242424]">{services.map(([number, title], index) => <ServiceRow key={number} number={number} title={title} variant={index + 1} />)}</div>

      <div data-services-vision className="relative z-20 h-[90svh]">
        <div className="sticky top-0 flex h-[90svh] items-end overflow-hidden px-6 pb-0 pt-20 sm:px-10 lg:px-4">
          <div className="relative w-full text-[clamp(4rem,8.5vw,10.5rem)] font-semibold uppercase leading-[0.88] tracking-[-0.065em]">
            <div className="overflow-hidden"><div data-dream-one className="w-fit max-w-full pr-[0.1em] will-change-transform">Traemos tu idea</div></div>
            <div className="overflow-hidden"><div data-dream-two className="w-fit max-w-[78%] pr-[0.1em] text-primary will-change-transform">A la realidad</div></div>
            <span data-dream-arrow className="absolute right-[clamp(1rem,8vw,10rem)] top-[30%] text-[clamp(5rem,9vw,10rem)] font-light leading-none text-primary" aria-hidden="true">↓</span>
          </div>
        </div>
      </div>

      <div className="relative z-10"><RobotFrameSequence /></div>
      <WorkTogetherScroll />

      <div id="iniciativa" data-services-contact className="relative z-10 min-h-[100svh] overflow-hidden bg-[#030303] px-5 py-20 sm:px-10 lg:px-8 lg:py-24">
        <div className="pointer-events-none absolute inset-0 opacity-[.07] [background-image:linear-gradient(rgba(255,255,255,.18)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.18)_1px,transparent_1px)] [background-size:72px_72px]" />
        <div className="pointer-events-none absolute -right-44 top-1/2 h-[42rem] w-[42rem] -translate-y-1/2 rounded-full bg-primary/10 blur-[150px]" />
        <div className="relative mx-auto max-w-[116rem] border-t border-white/15">
          <div className="flex items-center justify-between border-b border-white/10 py-5 text-[10px] font-semibold uppercase tracking-[.24em] text-white/40">
            <span>Contacto / Zebware</span><span className="flex items-center gap-2"><i className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" /> Disponible para nuevos proyectos</span>
          </div>
          <div className="grid min-h-[calc(100svh-12rem)] lg:grid-cols-[.92fr_1.08fr]">
            <div className="flex flex-col justify-between border-white/10 py-14 lg:border-r lg:pr-[clamp(3rem,6vw,8rem)]">
              <div>
                <p data-contact-reveal className="mb-7 text-xs font-semibold uppercase tracking-[.22em] text-primary">05 — Iniciemos</p>
                <h2 data-contact-reveal className="max-w-[8ch] text-[clamp(4rem,6.5vw,8.2rem)] font-black uppercase leading-[.82] tracking-[-.075em]">Hagamos algo <span className="text-primary">grande.</span></h2>
                <p data-contact-reveal className="mt-10 max-w-lg text-[clamp(1rem,1.15vw,1.25rem)] font-light leading-relaxed text-white/55">Una conversación puede ser el inicio de algo extraordinario. Cuéntanos qué quieres construir.</p>
              </div>
              <div data-contact-reveal className="mt-14 grid gap-5 border-t border-white/10 pt-7 sm:grid-cols-2 lg:mt-8">
                <div><span className="block text-[9px] uppercase tracking-[.2em] text-white/30">Base</span><strong className="mt-2 block text-sm font-medium">Arequipa, Perú</strong></div>
                <div><span className="block text-[9px] uppercase tracking-[.2em] text-white/30">Respuesta</span><strong className="mt-2 block text-sm font-medium">En menos de 24 horas</strong></div>
              </div>
            </div>

            <form data-contact-reveal className="relative my-10 overflow-hidden border border-white/15 bg-[linear-gradient(145deg,rgba(255,255,255,.065),rgba(255,255,255,.015))] p-6 shadow-[0_40px_100px_rgba(0,0,0,.5)] backdrop-blur-2xl sm:p-10 lg:ml-[clamp(2rem,5vw,7rem)] lg:p-12" onSubmit={(event) => event.preventDefault()}>
              <span className="absolute left-0 top-0 h-px w-24 bg-primary" /><span className="absolute left-0 top-0 h-24 w-px bg-primary" />
              <div className="mb-12 flex items-end justify-between"><div><span className="text-[9px] font-semibold uppercase tracking-[.24em] text-primary">Brief inicial</span><h3 className="mt-2 text-2xl font-semibold tracking-[-.04em]">Cuéntanos sobre tu proyecto</h3></div><span className="font-mono text-xs text-white/25">01—04</span></div>
              <div className="grid gap-x-8 sm:grid-cols-2">
                <label className="group relative grid border-t border-white/15 py-6"><span className="mb-4 text-[9px] font-semibold uppercase tracking-[.22em] text-white/35 transition-colors group-focus-within:text-primary">01 / Nombre</span><input className="border-0 bg-transparent p-0 text-lg text-white outline-none placeholder:text-white/20" name="name" placeholder="¿Cómo te llamas?" required /></label>
                <label className="group relative grid border-t border-white/15 py-6"><span className="mb-4 text-[9px] font-semibold uppercase tracking-[.22em] text-white/35 transition-colors group-focus-within:text-primary">02 / Correo</span><input className="border-0 bg-transparent p-0 text-lg text-white outline-none placeholder:text-white/20" name="email" type="email" placeholder="tu@empresa.com" required /></label>
              </div>
              <label className="group grid border-t border-white/15 py-6"><span className="mb-4 text-[9px] font-semibold uppercase tracking-[.22em] text-white/35 transition-colors group-focus-within:text-primary">03 / Servicio</span><select className="border-0 bg-[#080808] p-0 text-lg text-white outline-none" name="service"><option>Página web</option><option>E-commerce</option><option>App móvil</option><option>Invitación digital</option></select></label>
              <label className="group grid border-y border-white/15 py-6"><span className="mb-4 text-[9px] font-semibold uppercase tracking-[.22em] text-white/35 transition-colors group-focus-within:text-primary">04 / El desafío</span><textarea className="min-h-24 resize-none border-0 bg-transparent p-0 text-lg leading-relaxed text-white outline-none placeholder:text-white/20" name="message" placeholder="Háblanos de tu idea, objetivos y tiempos..." required /></label>
              <button className="group mt-8 flex w-full items-center justify-between bg-primary px-6 py-5 text-left text-base font-black uppercase tracking-[-.025em] text-black transition-[transform,filter] duration-300 hover:-translate-y-1 hover:brightness-110" type="submit"><span>Enviar proyecto</span><span className="text-3xl font-light transition-transform duration-300 group-hover:translate-x-2">→</span></button>
              <p className="mt-5 text-center text-[9px] uppercase tracking-[.15em] text-white/25">Tu información será tratada de forma confidencial</p>
            </form>
          </div>
          <div data-contact-reveal className="flex flex-wrap justify-between gap-5 border-t border-white/10 py-6 text-[10px] font-semibold uppercase tracking-[.15em] text-white/35"><span>© Zebware</span><div className="flex gap-6"><a className="hover:text-primary" href="#inicio">Instagram</a><a className="hover:text-primary" href="#inicio">LinkedIn</a><a className="hover:text-primary" href="#inicio">WhatsApp</a></div></div>
        </div>
      </div>
    </section>
  );
}
