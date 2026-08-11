import { useEffect, useLayoutEffect, useRef } from "react";
import { motion } from "motion/react";
import { Facebook, Github, Instagram, Linkedin, Menu, MessageCircle } from "lucide-react";
import { gsap } from "gsap";
import { usePageTransition } from "../hooks/usePageTransition";
import { EmeraldSentinelScene } from "./three/EmeraldSentinelScene";
import { HeroBackground } from "./HeroBackground";
import "./HeroSection.css";

const ease = [0.16, 1, 0.3, 1] as const;
const logoUrl = new URL("../public/Assets/ChatGPT Image Aug 11, 2026, 05_13_49 AM.png", import.meta.url).href;

function RevealLetters({ text }: { text: string }) {
  return (
    <span className="nk-question-line" data-question-line>
      {Array.from(text).map((character, index) => (
        <span className="nk-question-letter" data-question-letter key={`${character}-${index}`}>
          {character === " " ? "\u00A0" : character}
        </span>
      ))}
    </span>
  );
}

export function HeroSection() {
  const { transitionTo, isTransitioning } = usePageTransition();
  const heroRef = useRef<HTMLElement>(null);
  const cursorGlowRef = useRef<HTMLDivElement>(null);
  const entryLockedRef = useRef(true);

  const enterExperience = () => {
    entryLockedRef.current = false;
    delete document.documentElement.dataset.heroLocked;
    document.body.style.overflow = "";
    document.documentElement.style.overflow = "";
    document.documentElement.style.overscrollBehavior = "";
    window.dispatchEvent(new CustomEvent("hero-scroll:unlock"));
    transitionTo("#layered-section");
  };

  useEffect(() => {
    const glow = cursorGlowRef.current;
    if (!glow || window.matchMedia("(prefers-reduced-motion: reduce), (pointer: coarse)").matches) return;
    const moveX = gsap.quickTo(glow, "x", { duration: .75, ease: "power3.out" });
    const moveY = gsap.quickTo(glow, "y", { duration: .75, ease: "power3.out" });
    const show = () => gsap.to(glow, { opacity: 1, duration: .5 });
    const hide = () => gsap.to(glow, { opacity: 0, duration: .7 });
    const move = (event: PointerEvent) => { moveX(event.clientX); moveY(event.clientY); };
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerenter", show);
    document.documentElement.addEventListener("mouseleave", hide);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerenter", show);
      document.documentElement.removeEventListener("mouseleave", hide);
    };
  }, []);

  useLayoutEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const scrambleFrames = new Set<number>();
    const scrambleText = () => {
      const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/<>[]{}";
      hero.querySelectorAll<HTMLElement>("[data-scramble]").forEach((element, elementIndex) => {
        const finalText = element.dataset.scramble ?? "";
        if (reducedMotion) {
          element.textContent = finalText;
          return;
        }
        const startedAt = performance.now() + elementIndex * 90;
        const duration = 1050 + finalText.length * 17;
        const render = (now: number) => {
          const progress = Math.max(0, Math.min(1, (now - startedAt) / duration));
          const locked = Math.floor(progress * finalText.length);
          element.textContent = Array.from(finalText).map((character, index) => {
            if (character === " " || index < locked) return character;
            return alphabet[Math.floor(Math.random() * alphabet.length)];
          }).join("");
          if (progress < 1) {
            const frame = requestAnimationFrame(render);
            scrambleFrames.add(frame);
          } else {
            element.textContent = finalText;
          }
        };
        const frame = requestAnimationFrame(render);
        scrambleFrames.add(frame);
      });
    };
    const context = gsap.context(() => {
      const question = gsap.timeline()
        .set(".nk-walk-question", { autoAlpha: 1 })
        .fromTo("[data-question-letter]", {
          autoAlpha: 0,
          yPercent: 125,
          rotateX: -70,
          filter: reducedMotion ? "none" : "blur(6px)",
        }, {
          autoAlpha: 1,
          yPercent: 0,
          rotateX: 0,
          filter: "blur(0px)",
          duration: reducedMotion ? .01 : .56,
          stagger: reducedMotion ? 0 : .025,
          ease: "expo.out",
        })
        .to("[data-question-line]", {
          x: (index) => index === 0 ? 9 : -9,
          y: (index) => index === 0 ? 3 : -3,
          duration: reducedMotion ? .01 : 4.25,
          ease: "sine.inOut",
        })
        .to(".nk-walk-question", {
          autoAlpha: 0, scale: .975,
          filter: reducedMotion ? "none" : "blur(7px)",
          duration: reducedMotion ? .01 : .65,
          ease: "power2.in",
        }, "-=.15");
      const reveal = gsap.timeline({ paused: true })
        .set("[data-hero-reveal]", { autoAlpha: 1 })
        .from("[data-hero-reveal]", {
          y: reducedMotion ? 0 : 24,
          duration: reducedMotion ? 0.01 : 0.85,
          stagger: reducedMotion ? 0 : 0.08,
          ease: "expo.out",
        });
      let started = false;
      const startReveal = () => {
        if (started) return;
        started = true;
        reveal.restart();
        scrambleText();
      };
      window.addEventListener("sentinel:stage-walk-complete", startReveal, { once: true });
      const fallback = window.setTimeout(startReveal, 7600);
      if (reducedMotion) reveal.progress(1);
      return () => {
        question.kill();
        window.clearTimeout(fallback);
        scrambleFrames.forEach((frame) => cancelAnimationFrame(frame));
        window.removeEventListener("sentinel:stage-walk-complete", startReveal);
      };
    }, hero);

    entryLockedRef.current = true;
    document.documentElement.dataset.heroLocked = "true";
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    document.documentElement.style.overscrollBehavior = "none";
    window.dispatchEvent(new CustomEvent("hero-scroll:lock"));

    const blockScroll = (event: Event) => { if (entryLockedRef.current) event.preventDefault(); };
    const blockScrollKeys = (event: KeyboardEvent) => {
      if (entryLockedRef.current && ["ArrowDown", "ArrowUp", "PageDown", "PageUp", "Home", "End", " "].includes(event.key)) event.preventDefault();
    };
    window.addEventListener("wheel", blockScroll, { passive: false, capture: true });
    window.addEventListener("touchmove", blockScroll, { passive: false, capture: true });
    window.addEventListener("keydown", blockScrollKeys, { capture: true });

    return () => {
      window.removeEventListener("wheel", blockScroll, { capture: true });
      window.removeEventListener("touchmove", blockScroll, { capture: true });
      window.removeEventListener("keydown", blockScrollKeys, { capture: true });
      if (entryLockedRef.current) {
        delete document.documentElement.dataset.heroLocked;
        document.body.style.overflow = "";
        document.documentElement.style.overflow = "";
        document.documentElement.style.overscrollBehavior = "";
        window.dispatchEvent(new CustomEvent("hero-scroll:unlock"));
      }
      context.revert();
    };
  }, []);

  return (
    <section ref={heroRef} id="inicio" className="nk-hero">
      <HeroBackground />
      <div ref={cursorGlowRef} className="nk-cursor-glow" aria-hidden="true" />
      <motion.div className="nk-video" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.1, ease }}>
        <EmeraldSentinelScene />
      </motion.div>
      <div className="nk-video-shade" aria-hidden="true" />

      <div className="nk-walk-question" aria-label="¿Buscas webs innovadoras?">
        <RevealLetters text="¿Buscas" />
        <RevealLetters text="webs innovadoras?" />
      </div>

      <motion.header className="nk-nav" initial={{ y: -16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.8, ease }}>
        <div className="nk-nav-left">
          <a className="nk-brand" href="#inicio" aria-label="Zebware, inicio">
            <img src={logoUrl} alt="Zebware" />
          </a>
          <button className="nk-menu" type="button" onClick={enterExperience} disabled={isTransitioning}><span><Menu size={15} strokeWidth={1.8} /></span><span className="nk-menu-label">Menú</span></button>
          <div className="nk-tags"><span>Desarrollo digital</span><span>Innovación creativa</span></div>
        </div>
      </motion.header>

      <div className="nk-hero-content">
        <div className="nk-copy">
          <p className="nk-eyebrow" data-hero-reveal><b>01</b><span>/</span> <span data-scramble="INICIO">INICIO</span></p>
          <h1 aria-label="Nosotros la programamos" data-hero-reveal>
            <span className="nk-title-eleva" data-scramble="NOSOTROS">NOSOTROS</span>
            <span className="nk-title-brand"><em data-scramble="LA PROGRAMAMOS">LA PROGRAMAMOS</em><span className="nk-title-dot">.</span></span>
          </h1>
          <p className="nk-subtitle" data-hero-reveal>Zebware, compañía de software en Arequipa, Perú, donde nos enfocamos en la experiencia y los resultados.</p>
          <button className="nk-cta" type="button" onClick={enterExperience} disabled={isTransitioning} data-hero-reveal>
            <span>Explorar web</span><span className="nk-cta-arrow" aria-hidden="true">→</span>
          </button>
          <nav className="nk-socials" aria-label="Redes sociales de Zebware" data-hero-reveal>
            <a href="https://wa.me/" target="_blank" rel="noreferrer" aria-label="WhatsApp"><MessageCircle aria-hidden="true" /></a>
            <a href="https://www.instagram.com/" target="_blank" rel="noreferrer" aria-label="Instagram"><Instagram aria-hidden="true" /></a>
            <a href="https://www.linkedin.com/" target="_blank" rel="noreferrer" aria-label="LinkedIn"><Linkedin aria-hidden="true" /></a>
            <a href="https://github.com/" target="_blank" rel="noreferrer" aria-label="GitHub"><Github aria-hidden="true" /></a>
            <a href="https://www.facebook.com/" target="_blank" rel="noreferrer" aria-label="Facebook"><Facebook aria-hidden="true" /></a>
          </nav>
        </div>
      </div>

      <div className="nk-status"><i aria-hidden="true" />System online</div>
    </section>
  );
}
