import { useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Plus } from "lucide-react";
import { contact, faqs } from "../../content/site";
import { Word, revealWords, scrambleText, wordsHidden } from "../motion/title-motion";

gsap.registerPlugin(ScrollTrigger);

const faqSchema = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map(({ question, answer }) => ({
    "@type": "Question",
    name: question,
    acceptedAnswer: { "@type": "Answer", text: answer },
  })),
});

export function FaqSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [open, setOpen] = useState(0);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (section.getBoundingClientRect().top < window.innerHeight * 0.8) return;
    const context = gsap.context(() => {
      const eyebrow = section.querySelector<HTMLElement>("[data-faq-eyebrow]");
      const words = section.querySelectorAll("h2 [data-word]");
      const items = gsap.utils.toArray<HTMLElement>("[data-faq-item]");
      gsap.set("[data-faq-line]", { scaleX: 0 });
      gsap.set(eyebrow, { autoAlpha: 0 });
      gsap.set(words, wordsHidden);
      gsap.set("[data-faq-reveal]", { autoAlpha: 0, y: 24 });
      gsap.set(items.map((item) => item.querySelector("[data-divider]")), { scaleX: 0 });
      gsap.set(items.map((item) => item.querySelector("[data-faq-row]")), { autoAlpha: 0, y: 18 });
      const intro = gsap.timeline({ scrollTrigger: { trigger: section, start: "top 75%", once: true } })
        .to("[data-faq-line]", { scaleX: 1, duration: 0.6, ease: "power3.inOut" }, 0)
        .set(eyebrow, { autoAlpha: 1 }, 0.1)
        .add(eyebrow ? scrambleText(eyebrow, 0.8) : gsap.timeline(), 0.1)
        .add(revealWords(words), 0.15)
        .to("[data-faq-reveal]", { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.08, ease: "power3.out" }, 0.55);
      items.forEach((item, index) => {
        const at = 0.3 + index * 0.08;
        intro
          .to(item.querySelector("[data-divider]"), { scaleX: 1, duration: 0.6, ease: "power3.inOut" }, at)
          .to(item.querySelector("[data-faq-row]"), { autoAlpha: 1, y: 0, duration: 0.6, ease: "power3.out" }, at + 0.1);
      });
    }, section);
    return () => context.revert();
  }, []);

  return (
    <section ref={sectionRef} id="preguntas" className="relative z-10 overflow-hidden border-t border-white/10 bg-[#030504] px-5 py-24 text-white sm:px-10 lg:px-8 lg:py-32">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: faqSchema }} />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_45%_40%_at_10%_20%,rgba(3,234,0,0.09),transparent_70%)]" aria-hidden="true" />
      <div className="pointer-events-none absolute inset-0 opacity-[.05] [background-image:linear-gradient(90deg,rgba(255,255,255,.5)_1px,transparent_1px)] [background-size:8.333vw_100%]" aria-hidden="true" />
      <div className="relative mx-auto grid max-w-[116rem] gap-14 lg:grid-cols-[.8fr_1.2fr] lg:gap-[clamp(3rem,6vw,8rem)]">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <p className="mb-7 flex items-center gap-3 text-xs font-semibold uppercase tracking-[.22em] text-primary"><span data-faq-line className="line-pulse h-px w-10 origin-left bg-primary" /><span data-faq-eyebrow data-scramble="04 — Dudas">04 — Dudas</span></p>
          <h2 className="text-[clamp(2.6rem,5vw,5.6rem)] font-black uppercase leading-[.86] tracking-[-.065em]">
            <span className="block"><Word>Preguntas</Word></span>{" "}
            <span className="block"><Word accent className="text-shine">frecuentes.</Word></span>
          </h2>
          <p data-faq-reveal className="mt-8 max-w-md text-[clamp(1rem,1.1vw,1.15rem)] font-light leading-relaxed text-white/55">Todo lo que necesitas saber antes de crear tu página web, app o automatización con Zebware.</p>
          <a data-faq-reveal href={contact.whatsapp} target="_blank" rel="noreferrer" className="group mt-9 inline-flex items-center gap-4 border border-primary/50 px-5 py-4 text-sm font-semibold uppercase tracking-[.08em] text-primary transition-[background-color,color] duration-300 hover:bg-primary hover:text-black">
            ¿Otra duda? Escríbenos <span className="text-xl font-light transition-transform duration-300 group-hover:translate-x-1.5" aria-hidden="true">→</span>
          </a>
        </div>

        <div className="border-b border-white/15">
          {faqs.map(({ question, answer }, index) => {
            const isOpen = open === index;
            const id = `faq-${index}`;
            return (
              <div key={question} data-faq-item className="relative">
                <span data-divider className="absolute inset-x-0 top-0 h-px origin-left bg-white/15" aria-hidden="true" />
                <div data-faq-row>
                  <h3>
                    <button type="button" className="group grid w-full grid-cols-[2.75rem_1fr_auto] items-center gap-3 py-6 text-left sm:grid-cols-[4.5rem_1fr_auto] sm:py-7" aria-expanded={isOpen} aria-controls={id} onClick={() => setOpen(isOpen ? -1 : index)}>
                      <span className="font-mono text-xs text-primary">({String(index + 1).padStart(2, "0")})</span>
                      <span className={`text-[clamp(1.1rem,1.7vw,1.6rem)] font-semibold leading-tight tracking-[-.03em] transition-colors duration-300 ${isOpen ? "text-primary" : "text-white group-hover:text-primary"}`}>{question}</span>
                      <span className={`grid h-10 w-10 place-items-center border transition-[background-color,border-color,color] duration-500 ${isOpen ? "border-primary bg-primary text-black" : "border-white/15 text-white/70 group-hover:border-primary/60 group-hover:text-primary"}`} aria-hidden="true"><Plus className={`h-4 w-4 transition-transform duration-500 ${isOpen ? "rotate-45" : ""}`} strokeWidth={1.8} /></span>
                    </button>
                  </h3>
                  <div id={id} role="region" className={`grid transition-[grid-template-rows,opacity] duration-500 ease-[cubic-bezier(.16,1,.3,1)] ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
                    <div className="overflow-hidden">
                      <p className="max-w-3xl pb-7 pl-[calc(2.75rem+0.75rem)] pr-2 sm:pr-14 text-[clamp(.95rem,1.05vw,1.1rem)] font-light leading-relaxed text-white/60 sm:pl-[calc(4.5rem+0.75rem)]">{answer}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
