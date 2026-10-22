import { useEffect, useLayoutEffect, useRef, useState, type MouseEvent } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { heroWords, profileImages } from "../../content/profile";
import { scrollToTarget } from "../../components/scroll/scrollToTarget";
import { onProfileReady } from "./ProfileLoader";

gsap.registerPlugin(ScrollTrigger);

const typedLabel = "PERFIL PROFESIONAL — AREQUIPA";
const CV_URL = "/cv/CV-Carlos-Zeballos-Full-Stack.pdf";

export function ProfileHero() {
  const rootRef = useRef<HTMLElement>(null);
  const typedRef = useRef<HTMLSpanElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [active, setActive] = useState(0);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    const root = rootRef.current;
    if (!video || !root) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      video.pause();
      return;
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) void video.play().catch(() => undefined);
      else video.pause();
    });
    observer.observe(root);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return;
    const id = window.setInterval(() => setActive((index) => (index + 1) % heroWords.length), 2600);
    return () => window.clearInterval(id);
  }, [started]);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const context = gsap.context(() => {
      gsap.set("[data-hero-line]", { yPercent: 110 });
      gsap.set("[data-hero-fade]", { autoAlpha: 0, y: 18 });

      gsap.timeline({ scrollTrigger: { trigger: root, start: "top top", end: "bottom top", scrub: true } })
        .to("[data-hero-content]", { yPercent: -18, autoAlpha: 0.25, ease: "none" }, 0)
        .to("[data-hero-bg]", { scale: 1.08, yPercent: 6, ease: "none" }, 0);
    }, root);

    const stopWaiting = onProfileReady(() => {
      setStarted(true);
      context.add(() => {
        gsap.timeline({ delay: 0.15 })
          .to("[data-hero-line]", { yPercent: 0, duration: 1.1, stagger: 0.12, ease: "power4.out" })
          .to("[data-hero-fade]", { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.08, ease: "power3.out" }, 0.55)
          .call(() => {
            const typed = typedRef.current;
            if (!typed) return;
            const state = { chars: 0 };
            gsap.to(state, { chars: typedLabel.length, duration: 1.1, ease: "none", onUpdate: () => { typed.textContent = typedLabel.slice(0, Math.round(state.chars)); } });
          }, [], 0.6);
      });
    });

    return () => {
      stopWaiting();
      context.revert();
    };
  }, []);

  const goToProjects = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    scrollToTarget("#pf-proyectos", { duration: 1.6 });
  };

  return (
    <section ref={rootRef} id="pf-inicio" className="relative flex h-[100svh] min-h-[640px] flex-col justify-start overflow-hidden pt-[clamp(6.5rem,14vh,8rem)] md:justify-center md:pt-[72px]">
      <div data-hero-bg className="absolute inset-0 max-md:top-[25%]" aria-hidden="true">
        <video ref={videoRef} className="h-full w-full object-cover object-[73%_50%] md:object-[70%_50%]" poster={profileImages.heroPoster} autoPlay muted loop playsInline preload="auto">
          <source src={profileImages.heroVideoWebm} type="video/webm" />
          <source src={profileImages.heroVideoMp4} type="video/mp4" />
        </video>
      </div>
      <div className="absolute inset-0 bg-[linear-gradient(180deg,#0b0d0c_0%,#0b0d0c_24%,rgba(11,13,12,0.72)_36%,rgba(11,13,12,0.55)_54%,rgba(11,13,12,0)_66%,rgba(11,13,12,0)_88%,#0b0d0c_100%)] md:bg-[linear-gradient(180deg,rgba(11,13,12,0.5)_0%,rgba(11,13,12,0)_22%,rgba(11,13,12,0)_80%,#0b0d0c_100%)]" aria-hidden="true" />
      <div className="absolute inset-0 hidden bg-[linear-gradient(90deg,rgba(11,13,12,0.92)_0%,rgba(11,13,12,0.72)_30%,rgba(11,13,12,0.25)_50%,rgba(11,13,12,0)_62%)] md:block" aria-hidden="true" />
      <div className="absolute -left-[14%] top-1/2 hidden h-[80%] w-[60%] -translate-y-1/2 rounded-full bg-[#0b0d0c]/55 blur-[100px] md:block" aria-hidden="true" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:72px_72px] [mask-image:radial-gradient(ellipse_45%_60%_at_18%_50%,#000,transparent)]" aria-hidden="true" />

      <div data-hero-content className="pf-shell relative z-10 w-full">
        <div className="max-w-[min(40rem,46vw)] max-md:max-w-none">
          <span data-hero-fade className="pf-typed mb-[clamp(1rem,2.4vh,1.6rem)] block h-[1.4em] font-mono text-[clamp(0.72rem,1vw,0.95rem)] font-medium tracking-[0.2em] text-white/55" ref={typedRef} aria-hidden="true" />
          <h1 className="pf-display text-[clamp(2.6rem,5vw,5.4rem)] text-[#f5f7f5]">
            <span className="sr-only">Carlos Zeballos, desarrollador full stack en Arequipa, Perú, y fundador de Zebware</span>{" "}
            <span className="pf-mask" aria-hidden="true">
              <span data-hero-line className="block text-white/55">Hola, soy</span>
            </span>{" "}
            <span className="pf-mask" aria-hidden="true">
              <span data-hero-line className="block">Carlos</span>
            </span>{" "}
            <span className="pf-mask" aria-hidden="true">
              <span data-hero-line className="block">Zeballos<span className="text-[#03ea00]">.</span></span>
            </span>
          </h1>

          <p data-hero-fade className="pf-display mt-[clamp(1rem,2.6vh,1.6rem)] text-[clamp(1.15rem,1.8vw,1.7rem)] leading-[1.25] text-white/90">
            Desarrollador full stack que construye{" "}
            <span className="inline-block overflow-hidden align-bottom">
              <span key={heroWords[active].word} className="pf-word">{heroWords[active].word}</span>
            </span>
          </p>
          <p data-hero-fade className="mt-[clamp(0.9rem,2.4vh,1.5rem)] max-w-[27rem] text-[clamp(0.84rem,1vw,1rem)] leading-relaxed text-white/60 max-md:max-w-[20rem]">
            Fundador de <strong className="font-semibold text-white/90">Zebware</strong> en Arequipa, Perú. Llevo ideas de negocio a aplicaciones web completas: frontend, API, base de datos y despliegue.
          </p>
          <div data-hero-fade className="mt-[clamp(1.25rem,3.5vh,2.25rem)] flex flex-wrap items-center gap-3">
            <a href={CV_URL} download="CV-Carlos-Zeballos-Full-Stack.pdf" className="group inline-flex items-center gap-3 border border-[#03ea00] bg-[#03ea00] px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.24em] text-[#0b0d0c] transition-colors hover:bg-transparent hover:text-white">
              Descargar CV profesional
              <span className="transition-transform duration-300 group-hover:translate-y-0.5 group-hover:text-[#03ea00]" aria-hidden="true">↓</span>
            </a>
            <a href="#pf-proyectos" onClick={goToProjects} className="group inline-flex items-center gap-3 border border-[#03ea00]/40 bg-[#0b0d0c]/40 px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.24em] text-white/85 backdrop-blur-md transition-colors hover:border-[#03ea00] hover:text-white">
              Ver proyectos
              <span className="text-[#03ea00] transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true">▷</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
