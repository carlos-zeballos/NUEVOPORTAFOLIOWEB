import { useLayoutEffect, useRef, useState, type FormEvent } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowUpRight, Mail, Send } from "lucide-react";
import { WhatsAppIcon } from "../ui/whatsapp-icon";
import { contact } from "../../content/site";
import { formatPrice, services } from "../../content/services";
import { HONEYPOT_FIELD, sendLead } from "../../lib/lead";
import { HoneypotField } from "../HoneypotField";

gsap.registerPlugin(ScrollTrigger);

const webFrom = services.find((service) => service.slug === "paginas-web")?.priceFrom ?? Math.min(...services.map((service) => service.priceFrom));

const fieldLabel = "mb-3 block text-[10px] font-semibold uppercase tracking-[.22em] text-white/55 transition-colors group-focus-within:text-primary";
const fieldInput = "w-full border-0 bg-transparent p-0 text-base text-white outline-none placeholder:text-white/40 sm:text-lg";

function ContactForm() {
  const [sent, setSent] = useState(false);
  const startedAt = useRef(0);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const value = (key: string) => String(data.get(key) ?? "").trim();
    const fields = { name: value("name"), contact: value("contact"), service: value("service"), message: value("message") };
    const message = [
      "Hola Zebware, quiero cotizar un proyecto.",
      `Nombre: ${fields.name}`,
      `Contacto: ${fields.contact}`,
      `Servicio: ${fields.service}`,
      `Proyecto: ${fields.message}`,
    ].join("\n");
    window.open(`https://wa.me/51946691999?text=${encodeURIComponent(message)}`, "_blank", "noopener");
    void sendLead(fields, startedAt.current, value(HONEYPOT_FIELD));
    setSent(true);
  };

  return (
    <form data-contact-reveal onSubmit={submit} onFocus={() => { if (!startedAt.current) startedAt.current = performance.now(); }} className="relative overflow-hidden border border-white/15 bg-[linear-gradient(145deg,rgba(255,255,255,.06),rgba(255,255,255,.012))] p-6 shadow-[0_40px_100px_rgba(0,0,0,.45)] backdrop-blur-xl sm:p-9">
      <span className="absolute left-0 top-0 h-px w-24 bg-primary" aria-hidden="true" /><span className="absolute left-0 top-0 h-24 w-px bg-primary" aria-hidden="true" />
      <div className="mb-8 flex items-end justify-between gap-4">
        <div><span className="text-[10px] font-semibold uppercase tracking-[.24em] text-primary">Brief inicial</span><h3 className="mt-2 text-2xl font-semibold tracking-[-.04em]">Cuéntanos sobre tu proyecto</h3></div>
        <span className="whitespace-nowrap font-mono text-xs text-white/25">01—04</span>
      </div>
      <div className="grid gap-x-8 sm:grid-cols-2">
        <label className="group block border-t border-white/15 py-5"><span className={fieldLabel}>01 / Nombre</span><input className={fieldInput} name="name" autoComplete="name" placeholder="¿Cómo te llamas?" required /></label>
        <label className="group block border-t border-white/15 py-5"><span className={fieldLabel}>02 / Correo o WhatsApp</span><input className={fieldInput} name="contact" autoComplete="email" placeholder="tu@empresa.com" required /></label>
      </div>
      <label className="group block border-t border-white/15 py-5"><span className={fieldLabel}>03 / Servicio</span>
        <select className={`${fieldInput} bg-[#070907]`} name="service" defaultValue="Página web">
          {["Página web", "E-commerce", "App móvil", "IA y automatizaciones", "Software a medida", "Invitación digital", "Otro"].map((option) => <option key={option}>{option}</option>)}
        </select>
      </label>
      <label className="group block border-y border-white/15 py-5"><span className={fieldLabel}>04 / Tu proyecto</span><textarea className={`${fieldInput} min-h-20 resize-none leading-relaxed`} name="message" placeholder="Háblanos de tu idea, objetivos y tiempos..." required /></label>
      <HoneypotField />
      <button type="submit" className="group mt-7 flex w-full items-center justify-between bg-primary px-6 py-5 text-left text-base font-black uppercase tracking-[-.02em] text-black transition-[transform,filter] duration-300 hover:-translate-y-1 hover:brightness-110">
        <span>{sent ? "¡Listo! Envíalo en WhatsApp" : "Enviar proyecto"}</span>
        <Send className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1.5" strokeWidth={2} aria-hidden="true" />
      </button>
      <p className="mt-4 text-center text-[10px] uppercase tracking-[.15em] text-white/55">Lo recibimos por correo y se abrirá WhatsApp con tu mensaje listo · Información confidencial</p>
    </form>
  );
}

export function ContactSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (section.getBoundingClientRect().top < window.innerHeight * 0.9) return;
    const context = gsap.context(() => {
      gsap.set("[data-contact-line]", { scaleX: 0 });
      gsap.set("[data-contact-reveal]", { autoAlpha: 0, y: 28 });
      gsap.timeline({ scrollTrigger: { trigger: section, start: "top 85%", once: true } })
        .to("[data-contact-line]", { scaleX: 1, duration: 0.9, ease: "power3.inOut" }, 0)
        .to("[data-contact-reveal]", { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.07, ease: "power3.out" }, 0.15);
    }, section);
    return () => context.revert();
  }, []);

  return (
    <section ref={sectionRef} id="contacto" className="relative z-10 overflow-hidden bg-[#020302] text-white">
      <div className="pointer-events-none absolute -right-32 top-[38%] h-[34rem] w-[34rem] rounded-full bg-primary/[.08] blur-[140px]" aria-hidden="true" />
      <div className="pointer-events-none absolute inset-0 opacity-[.06] [background-image:linear-gradient(rgba(255,255,255,.18)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.18)_1px,transparent_1px)] [background-size:72px_72px] [mask-image:linear-gradient(180deg,#000,transparent_75%)]" aria-hidden="true" />
      <div className="relative mx-auto max-w-[116rem] px-5 sm:px-10 lg:px-8">
        <span data-contact-line className="block h-px origin-left bg-gradient-to-r from-primary via-primary/40 to-white/10" aria-hidden="true" />

        <div className="grid gap-12 py-16 lg:grid-cols-[.95fr_1.05fr] lg:gap-[clamp(3rem,6vw,8rem)] lg:py-24">
          <div className="flex flex-col justify-between gap-10">
            <div data-contact-reveal>
              <p className="mb-5 flex items-center gap-3 text-xs font-semibold uppercase tracking-[.22em] text-primary"><span className="line-pulse h-px w-10 origin-left bg-primary" />03 — Contacto</p>
              <h2 className="text-[clamp(2.6rem,5.4vw,6rem)] font-black uppercase leading-[.86] tracking-[-.065em]">Hablemos de <span className="text-shine">tu idea.</span></h2>
              <p className="mt-7 max-w-md text-[clamp(1rem,1.1vw,1.15rem)] font-light leading-relaxed text-white/55">Cuéntanos qué quieres construir y te respondemos con una propuesta clara en menos de 24 horas.</p>
            </div>
            <div data-contact-reveal className="flex flex-col gap-3 sm:flex-row">
              <a href={contact.whatsapp} target="_blank" rel="noreferrer" className="group flex flex-1 items-center justify-between gap-6 border border-primary/50 px-6 py-5 text-sm font-semibold uppercase tracking-[.02em] text-primary transition-[background-color,color,transform] duration-300 hover:-translate-y-1 hover:bg-primary hover:text-black">
                <span className="flex items-center gap-3"><WhatsAppIcon className="h-5 w-5" aria-hidden="true" />WhatsApp</span>
                <ArrowUpRight className="h-5 w-5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
              </a>
              <a href={`mailto:${contact.email}`} className="group flex flex-1 items-center justify-between gap-6 border border-white/20 px-6 py-5 text-sm font-semibold uppercase tracking-[.02em] text-white transition-[border-color,color,transform] duration-300 hover:-translate-y-1 hover:border-primary/60 hover:text-primary">
                <span className="flex items-center gap-3"><Mail className="h-5 w-5" strokeWidth={1.7} aria-hidden="true" />Correo</span>
                <ArrowUpRight className="h-5 w-5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
              </a>
            </div>
            <div data-contact-reveal className="grid grid-cols-3 gap-5 border-t border-white/10 pt-7">
              <div><span className="block text-[10px] uppercase tracking-[.2em] text-white/55">Base</span><strong className="mt-1.5 block text-sm font-medium text-white/85">Arequipa · Todo el Perú</strong></div>
              <div><span className="block text-[10px] uppercase tracking-[.2em] text-white/55">Respuesta</span><strong className="mt-1.5 block text-sm font-medium text-white/85">&lt; 24 horas</strong></div>
              <div><span className="block text-[10px] uppercase tracking-[.2em] text-white/55">Webs desde</span><strong className="mt-1.5 block whitespace-nowrap text-sm font-medium text-primary">{formatPrice(webFrom)}</strong></div>
            </div>
          </div>
          <ContactForm />
        </div>
      </div>
    </section>
  );
}
