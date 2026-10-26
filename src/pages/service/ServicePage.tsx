import { useEffect, useLayoutEffect, useRef, useState, type FormEvent, type MouseEvent } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowLeft, ArrowUpRight, Check } from "lucide-react";
import { WhatsAppIcon } from "../../components/ui/whatsapp-icon";
import { usePageTransition } from "../../hooks/usePageTransition";
import { HOME_PATH, PROFILE_PATH, servicePath } from "../../lib/router";
import { BrandLogo } from "../../components/ui/brand-logo";
import { CaseDevice } from "../../components/ui/case-device";
import { ContactIcons } from "../../components/ContactIcons";
import { RobotFrameSequence } from "../../components/sections/RobotFrameSequence";
import { HoneypotField } from "../../components/HoneypotField";
import { HONEYPOT_FIELD, sendLead } from "../../lib/lead";
import { scrollToTarget } from "../../components/scroll/scrollToTarget";
import { contact } from "../../content/site";
import { formatPlanPrice, formatPrice, services, type Service } from "../../content/services";
import { jsonLd, serviceSchema, SITE_URL, usePageMeta, type PageMeta } from "../../lib/seo";
import "../../components/sections/cases-section.css";
import "./service.css";

gsap.registerPlugin(ScrollTrigger);

const WHATSAPP_NUMBER = "51946691999";

const listOf = (items: string[]) => items.length > 1 ? `${items.slice(0, -1).join(", ")} y ${items[items.length - 1]}` : items.join("");

export function serviceMeta(service: Service): PageMeta {
  const price = formatPrice(service.priceFrom);
  const detailed = `${service.title} en Perú desde ${price} (sin IGV): ${listOf(service.plans.map((plan) => plan.name.charAt(0).toLowerCase() + plan.name.slice(1)))}. Cotiza gratis por WhatsApp con Zebware.`;
  return {
    title: `${service.title} en Perú desde ${price} | Zebware`,
    description: detailed.length <= 160 ? detailed : `${service.title} en Perú desde ${price} (sin IGV). ${service.summary} Cotiza gratis con Zebware.`,
    path: servicePath(service.slug),
    image: `${SITE_URL}/og/${service.slug}.jpg`,
    imageAlt: `${service.title} ${service.accent} en Perú, desde ${price} — Zebware`,
  };
}

const exampleAlt = (name: string, descriptor: string) => `${name}, ${descriptor}: proyecto de Zebware`;

function ServiceNav() {
  const { navigateTo, isTransitioning } = usePageTransition();
  const [solid, setSolid] = useState(false);

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const go = (event: MouseEvent<HTMLAnchorElement>, path: string, target?: string) => {
    event.preventDefault();
    if (!isTransitioning) navigateTo(path, target ? { target } : undefined);
  };

  return (
    <header className={`sv-nav${solid ? " is-solid" : ""}`}>
      <a href={HOME_PATH} onClick={(event) => go(event, HOME_PATH)} className="sv-nav-logo" aria-label="Zebware, inicio">
        <BrandLogo className="h-[26px] sm:h-[30px]" />
      </a>
      <nav className="sv-nav-links" aria-label="Navegación">
        <a href={HOME_PATH} onClick={(event) => go(event, HOME_PATH, "#servicios")}>Servicios</a>
        <a href={PROFILE_PATH} onClick={(event) => go(event, PROFILE_PATH)}>Perfil</a>
      </nav>
      <a href={HOME_PATH} onClick={(event) => go(event, HOME_PATH, "#servicios")} className="sv-nav-back">
        <ArrowLeft aria-hidden="true" />
        Todos los servicios
      </a>
    </header>
  );
}

const planLabel = (service: Service, name: string) => {
  const plan = service.plans.find((item) => item.name === name);
  return plan ? `${plan.name} (${formatPlanPrice(plan)}${plan.monthly ? ` + ${formatPrice(plan.monthly)} al mes` : ""})` : name;
};

function WhatsAppForm({ service, plan, onPlanChange }: { service: Service; plan: string; onPlanChange: (plan: string) => void }) {
  const [name, setName] = useState("");
  const [business, setBusiness] = useState("");
  const [timing, setTiming] = useState("");
  const [details, setDetails] = useState("");
  const [sent, setSent] = useState(false);
  const startedAt = useRef(0);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const honeypot = String(new FormData(event.currentTarget).get(HONEYPOT_FIELD) ?? "");
    const lines = [
      `Hola Zebware, quiero cotizar *${service.title} ${service.accent}*.`,
      `• Nombre: ${name}`,
      business && `• Negocio o marca: ${business}`,
      plan && `• Plan: ${planLabel(service, plan)}`,
      timing && `• Plazo: ${timing}`,
      details && `• Lo que necesito: ${details}`,
    ].filter(Boolean);
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(lines.join("\n"))}`, "_blank", "noopener");
    void sendLead({
      name: name.trim(),
      business: business.trim(),
      service: `${service.title} ${service.accent}`,
      plan: plan && planLabel(service, plan),
      timing,
      message: details.trim(),
    }, startedAt.current, honeypot);
    setSent(true);
  };

  return (
    <form id="cotizar" className="sv-form" onSubmit={submit} onFocus={() => { if (!startedAt.current) startedAt.current = performance.now(); }}>
      <p className="sv-form-kicker">Cotiza por WhatsApp</p>
      <p className="sv-form-title">{service.title} <em>{service.accent}</em></p>
      <p className="sv-form-price">Desde <strong>{formatPrice(service.priceFrom)}</strong></p>
      <label className="sv-field">
        <span>Nombre</span>
        <input required value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" placeholder="¿Cómo te llamas?" />
      </label>
      <label className="sv-field">
        <span>Negocio o marca</span>
        <input value={business} onChange={(event) => setBusiness(event.target.value)} autoComplete="organization" placeholder="Opcional" />
      </label>
      <label className="sv-field">
        <span>Plan que te interesa</span>
        <select value={plan} onChange={(event) => onPlanChange(event.target.value)}>
          <option value="">Selecciona un plan</option>
          {service.plans.map((item) => <option key={item.name} value={item.name}>{item.name} · {formatPlanPrice(item)}</option>)}
          <option value="Aún no lo sé, necesito asesoría">Aún no lo sé, necesito asesoría</option>
        </select>
      </label>
      <label className="sv-field">
        <span>¿Para cuándo lo necesitas?</span>
        <select value={timing} onChange={(event) => setTiming(event.target.value)}>
          <option value="">Selecciona un plazo</option>
          <option>Lo antes posible</option>
          <option>En las próximas 2 semanas</option>
          <option>Este mes</option>
          <option>Solo estoy cotizando</option>
        </select>
      </label>
      <label className="sv-field">
        <span>Cuéntanos qué necesitas</span>
        <textarea rows={3} value={details} onChange={(event) => setDetails(event.target.value)} placeholder="Ej.: una web para mi clínica con reservas en línea" />
      </label>
      <HoneypotField />
      <button type="submit" className="sv-submit">
        <WhatsAppIcon aria-hidden="true" />
        {sent ? "¡Listo! Envíalo en WhatsApp" : "Enviar por WhatsApp"}
      </button>
      <p className="sv-form-hint">{sent ? "Gracias, te respondemos en menos de 24 horas." : "Te respondemos en menos de 24 horas."} Precios sin IGV.</p>
    </form>
  );
}

export function ServicePage({ service }: { service: Service }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const { navigateTo, isTransitioning } = usePageTransition();
  const meta = serviceMeta(service);
  usePageMeta(meta);

  const [plan, setPlan] = useState("");
  const index = services.indexOf(service);
  const others = services.filter((item) => item !== service);
  const lead = service.examples[0];
  const schema = jsonLd(serviceSchema(service, meta, lead && new URL(lead.image, SITE_URL).href));
  const marquee = `${service.title.toUpperCase()} ${service.accent.toUpperCase()} · DESDE ${formatPrice(service.priceFrom)} · ZEBWARE · `;

  const openService = (event: MouseEvent<HTMLAnchorElement>, slug: string) => {
    event.preventDefault();
    if (!isTransitioning) navigateTo(servicePath(slug));
  };

  const toForm = (event: MouseEvent<HTMLElement>) => {
    event.preventDefault();
    scrollToTarget("#cotizar", { duration: 1.2 });
  };

  const choosePlan = (event: MouseEvent<HTMLButtonElement>, name: string) => {
    setPlan(name);
    toForm(event);
  };

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const context = gsap.context(() => {
      gsap.from("[data-sv-hero]", { y: 40, autoAlpha: 0, duration: 1, stagger: 0.08, ease: "expo.out", delay: 0.2 });
      root.querySelectorAll<HTMLElement>(".zc-case, .sv-hero").forEach((block, i) => {
        const device = block.querySelector("[data-case-device]");
        const side = i % 2 === 0 ? 1 : -1;
        if (device) {
          gsap.fromTo(device, { rotateY: 30 * side, rotateX: 12, rotateZ: -6 * side, yPercent: 10 }, {
            rotateY: 8 * side, rotateX: 3, rotateZ: -2 * side, yPercent: -8, ease: "none",
            scrollTrigger: { trigger: block, start: "top bottom", end: "bottom top", scrub: true },
          });
        }
      });
      gsap.utils.toArray<HTMLElement>(".zc-device-wrap").forEach((wrap) => {
        const hero = !!wrap.closest(".sv-hero");
        gsap.timeline({ delay: hero ? 0.35 : 0, scrollTrigger: { trigger: wrap, start: "top 85%" } })
          .from(wrap, { autoAlpha: 0, y: 90, scale: 0.86, duration: 1.3, ease: "expo.out" })
          .fromTo(wrap.querySelector(".zc-shot"), { clipPath: "inset(0 0 100% 0)" }, { clipPath: "inset(0 0 0% 0)", duration: 1.1, ease: "power3.inOut", clearProps: "clipPath" }, 0.15)
          .from(wrap.querySelector(".zc-shot img"), { scale: 1.3, duration: 1.6, ease: "expo.out", clearProps: "transform" }, 0.15);
      });
      gsap.utils.toArray<HTMLElement>("[data-sv-reveal]").forEach((el) => {
        gsap.from(el, { y: 30, autoAlpha: 0, duration: 0.9, ease: "expo.out", scrollTrigger: { trigger: el, start: "top 85%" } });
      });
    }, root);
    return () => context.revert();
  }, [service]);

  return (
    <div ref={rootRef} className="sv-root">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: schema }} />
      <ServiceNav />
      <main>
        <section className="sv-hero zc-case" aria-labelledby="sv-title">
          <div className="zc-marquee" aria-hidden="true">
            <div className="zc-marquee-track"><span>{marquee.repeat(4)}</span><span>{marquee.repeat(4)}</span></div>
          </div>
          <div className="zc-frame">
            <span className="zc-label">Servicio {String(index + 1).padStart(2, "0")}</span>
            <span className="zc-tick zc-tick--top" aria-hidden="true" />
            <span className="zc-tick zc-tick--left" aria-hidden="true" />
            <span className="zc-tick zc-tick--right" aria-hidden="true" />
            <div className="zc-inner sv-hero-inner">
              <div className="zc-copy sv-hero-copy">
                <p className="zc-brand" data-sv-hero>Servicio · Zebware</p>
                <h1 id="sv-title" className="zc-title" data-sv-hero>
                  {service.title}{" "}
                  <em>{service.accent}</em>
                </h1>
                <p className="sv-about" data-sv-hero>{service.about}</p>
                <div className="sv-price" data-sv-hero>
                  <span>Desde</span>
                  <strong>{formatPrice(service.priceFrom)}</strong>
                  <small>{service.delivery} · sin IGV{service.plans.some((item) => item.monthly) && " · más mensualidad"}</small>
                </div>
                <div className="sv-actions" data-sv-hero>
                  <a className="zc-button sv-button-solid" href="#cotizar" onClick={toForm}>Cotizar por WhatsApp <span aria-hidden="true">→</span></a>
                  <a className="zc-button" href="#ejemplos" onClick={(event) => { event.preventDefault(); scrollToTarget("#ejemplos", { duration: 1.2 }); }}>Ver ejemplos</a>
                </div>
              </div>
              {lead && <div className="zc-device-wrap"><CaseDevice kind={lead.device} image={lead.image} host={lead.host} name={lead.name} alt={exampleAlt(lead.name, lead.descriptor)} eager /></div>}
            </div>
          </div>
        </section>

        <div className="sv-sequence"><RobotFrameSequence /></div>

        <section className="sv-plans" aria-labelledby="sv-plans-title">
          <div className="sv-plans-head" data-sv-reveal>
            <h2 id="sv-plans-title" className="sv-kicker"><span />Planes y precios</h2>
            <p className="sv-plans-lead">Precios referenciales en soles, sin IGV. Te enviamos una cotización exacta según lo que necesites.</p>
          </div>
          <div className="sv-plans-grid">
            {service.plans.map((item) => (
              <article key={item.name} className={`sv-plan${item.featured ? " is-featured" : ""}`} data-sv-reveal>
                {item.featured && <span className="sv-plan-badge">Recomendado</span>}
                <h3 className="sv-plan-name">{item.name}</h3>
                <p className="sv-plan-summary">{item.summary}</p>
                <p className="sv-plan-price">{formatPlanPrice(item)}</p>
                <p className="sv-plan-monthly">{item.monthly ? `+ desde ${formatPrice(item.monthly)} al mes` : "Pago único"}</p>
                <ul className="sv-plan-features">
                  {item.features.map((feature) => <li key={feature}><Check aria-hidden="true" />{feature}</li>)}
                </ul>
                <button type="button" className="sv-plan-cta" onClick={(event) => choosePlan(event, item.name)}>Cotizar este plan <span aria-hidden="true">→</span></button>
              </article>
            ))}
          </div>
          <div className="sv-extras" data-sv-reveal>
            <strong>Costos aparte</strong>
            <ul>{service.extras.map((extra) => <li key={extra}>{extra}</li>)}</ul>
          </div>
        </section>

        <section className="sv-info" aria-label="Detalle del servicio">
          <div className="sv-info-col" data-sv-reveal>
            <h2 className="sv-kicker"><span />Todos los planes incluyen</h2>
            <ul className="sv-includes">
              {service.includes.map((item) => (
                <li key={item}><Check aria-hidden="true" />{item}</li>
              ))}
            </ul>
          </div>
          <div className="sv-info-col" data-sv-reveal>
            <h2 className="sv-kicker"><span />¿De qué depende el precio?</h2>
            <ol className="sv-factors">
              {service.factors.map((factor, i) => (
                <li key={factor.title}>
                  <b>{String(i + 1).padStart(2, "0")}</b>
                  <div><strong>{factor.title}</strong><p>{factor.detail}</p></div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section id="ejemplos" className="sv-body" aria-labelledby="sv-examples-title">
          <div className="sv-examples">
            <h2 id="sv-examples-title" className="sv-kicker"><span />Ejemplos de {service.title.toLowerCase()}</h2>
            {service.examples.map((item, i) => (
              <article key={item.name} className="zc-case sv-case">
                <div className="zc-frame">
                  <span className="zc-label">Ejemplo {String(i + 1).padStart(2, "0")}</span>
                  <span className="zc-tick zc-tick--top" aria-hidden="true" />
                  <span className="zc-tick zc-tick--left" aria-hidden="true" />
                  <span className="zc-tick zc-tick--right" aria-hidden="true" />
                  <div className="zc-inner sv-case-inner">
                    <div className="zc-device-wrap"><CaseDevice kind={item.device} image={item.image} host={item.host} name={item.name} alt={exampleAlt(item.name, item.descriptor)} /></div>
                    <div className="zc-copy">
                      <p className="zc-brand" data-sv-reveal>{item.brand}</p>
                      <h3 className="zc-title sv-case-title" data-sv-reveal>
                        {item.name}
                        <em>{item.descriptor}</em>
                      </h3>
                      <p className="sv-case-text" data-sv-reveal>{item.description}</p>
                      <p className="zc-tags" data-sv-reveal>{item.tags.map((tag) => <span key={tag}>{tag}</span>)}</p>
                      {item.link ? (
                        <a className="zc-button" href={item.link} target="_blank" rel="noreferrer" data-sv-reveal>Ver proyecto <span aria-hidden="true">→</span></a>
                      ) : (
                        <a className="zc-button" href={PROFILE_PATH} onClick={(event) => { event.preventDefault(); if (!isTransitioning) navigateTo(PROFILE_PATH); }} data-sv-reveal>Ver caso <span aria-hidden="true">→</span></a>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
          <aside className="sv-aside">
            <WhatsAppForm service={service} plan={plan} onPlanChange={setPlan} />
          </aside>
        </section>

        <section className="sv-more" aria-labelledby="sv-more-title">
          <h2 id="sv-more-title" className="sv-kicker"><span />Otros servicios</h2>
          <div className="sv-more-grid">
            {others.map((item) => (
              <a key={item.slug} href={servicePath(item.slug)} onClick={(event) => openService(event, item.slug)} className="sv-more-card">
                <span className="sv-more-name">{item.title} <em>{item.accent}</em></span>
                <span className="sv-more-price">Desde {formatPrice(item.priceFrom)}</span>
                <ArrowUpRight aria-hidden="true" />
              </a>
            ))}
          </div>
        </section>
      </main>
      <footer className="sv-footer">
        <BrandLogo className="h-[22px]" />
        <span className="sv-footer-contact">{contact.city}<ContactIcons className="sv-footer-icons" iconClassName="h-4 w-4" /></span>
      </footer>
    </div>
  );
}
