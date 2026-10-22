import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { introStats, introText, profileImages } from "../../content/profile";
import { countUpOnView } from "./countUp";

gsap.registerPlugin(ScrollTrigger);

const words: { text: string; highlight: boolean }[] = [];
let inHighlight = false;
for (const raw of introText.split(" ")) {
  if (raw.startsWith("*")) inHighlight = true;
  words.push({ text: raw.replace(/\*/g, ""), highlight: inHighlight });
  if (raw.endsWith("*")) inHighlight = false;
}

export function ProfileIntro() {
  const rootRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const context = gsap.context(() => {
      const paint = gsap.utils.toArray<HTMLElement>("[data-paint]");
      gsap.timeline({ scrollTrigger: { trigger: "[data-paint-block]", start: "top 78%", end: "bottom 42%", scrub: 0.6 } })
        .to(paint, { color: "rgba(245,247,245,0.42)", stagger: 0.5, duration: 1, ease: "none" }, 0)
        .to(paint, { color: (_, element: HTMLElement) => (element.dataset.highlight === "true" ? "#03ea00" : "#f5f7f5"), stagger: 0.5, duration: 1, ease: "none" }, 3.5);

      gsap.from("[data-photo]", { clipPath: "inset(100% 0 0 0)", duration: 1.3, ease: "power4.inOut", scrollTrigger: { trigger: "[data-photo]", start: "top 80%", once: true } });
      gsap.to("[data-photo-img]", { yPercent: -8, ease: "none", scrollTrigger: { trigger: "[data-photo]", start: "top bottom", end: "bottom top", scrub: true } });
      countUpOnView(gsap.utils.toArray<HTMLElement>("[data-count]"));
    }, root);
    return () => context.revert();
  }, []);

  return (
    <section ref={rootRef} id="pf-sobre-mi" aria-label="Sobre mí" className="pf-shell py-[clamp(6rem,18vh,11rem)]">
      <div className="grid items-center gap-14 lg:grid-cols-[1.45fr_0.75fr] lg:gap-20">
        <div>
          <p className="pf-eyebrow mb-8">Sobre mí</p>
          <p data-paint-block className="text-[clamp(1.55rem,3.05vw,3rem)] font-semibold leading-[1.16] tracking-[-0.035em]">
            {words.map(({ text, highlight }, index) => (
              <span key={`${text}-${index}`} data-paint data-highlight={highlight ? "true" : undefined} className="text-white/[0.14]">
                {text}{index < words.length - 1 ? " " : ""}
              </span>
            ))}
          </p>
        </div>

        <figure className="mx-auto w-full max-w-[24rem] lg:max-w-none">
          <div data-photo className="group relative aspect-[4/5] overflow-hidden bg-[#111311]">
            <img data-photo-img src={profileImages.carlos} alt="Carlos Zeballos, desarrollador full stack" className="pf-photo absolute inset-0 h-[112%] w-full object-cover object-top" loading="lazy" />
            <span className="absolute left-3 top-3 h-4 w-4 border-l border-t border-[#03ea00]/60" aria-hidden="true" />
            <span className="absolute bottom-3 right-3 h-4 w-4 border-b border-r border-[#03ea00]/60" aria-hidden="true" />
          </div>
          <figcaption className="mt-4 flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.22em] text-white/45">
            <span className="text-white/80">Carlos Zeballos</span>
            <span>Full Stack · Arequipa</span>
          </figcaption>
        </figure>
      </div>

      <dl className="mt-[clamp(4rem,11vh,7rem)] grid grid-cols-2 gap-x-6 gap-y-10 border-t border-white/[0.08] pt-10 md:grid-cols-4">
        {introStats.map(({ value, suffix, decimals, label }) => (
          <div key={label}>
            <dt className="sr-only">{label}</dt>
            <dd>
              <span data-count={value} data-decimals={decimals} data-suffix={suffix} className="pf-display block text-[clamp(2.4rem,4.4vw,4rem)] tabular-nums text-[#f5f7f5]">{value.toFixed(decimals)}{suffix}</span>
              <span className="mt-3 block text-[10px] font-semibold uppercase tracking-[0.22em] text-white/45" aria-hidden="true">{label}</span>
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
