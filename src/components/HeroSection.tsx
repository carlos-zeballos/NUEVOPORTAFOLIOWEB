import { useEffect, useLayoutEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion } from "motion/react";
import { Github, Instagram, Linkedin, Menu, MessageCircle } from "lucide-react";
import { gsap } from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { usePageTransition } from "../hooks/usePageTransition";
import { scrollToTarget } from "./scroll/scrollToTarget";
import { EmeraldSentinelScene } from "./three/EmeraldSentinelScene";
import { HeroBackground } from "./HeroBackground";
import { CursorTag } from "./ui/cursor-tag";
import "./HeroSection.css";

gsap.registerPlugin(CustomEase);
CustomEase.create("heroInertialDrift", "M0,0 C0.03,0.62 0.07,0.94 0.16,0.992 C0.38,0.994 0.72,0.997 1,1");

const ease = [0.16, 1, 0.3, 1] as const;
const logoUrl = new URL("../public/Assets/ChatGPT Image Aug 11, 2026, 05_13_49 AM.png", import.meta.url).href;

function AnimatedLine({ children }: { children: string }) {
  return <span className="nk-question-line" data-question-line>{children}</span>;
}

export function HeroSection() {
  const { transitionTo, isTransitioning } = usePageTransition();
  const heroRef = useRef<HTMLElement>(null);
  const cursorGlowRef = useRef<HTMLDivElement>(null);
  const exploreRef = useRef<HTMLButtonElement>(null);
  const profileRef = useRef<HTMLAnchorElement>(null);

  const enterExperience = () => transitionTo("#servicios");

  const onMenu = () => {
    const heroBottom = heroRef.current?.getBoundingClientRect().bottom ?? 0;
    if (heroBottom > window.innerHeight * 0.35) enterExperience();
    else scrollToTarget("#servicios");
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
        .fromTo("[data-question-line]", {
          x: (index) => reducedMotion ? 0 : (index === 0 ? -window.innerWidth * .82 : window.innerWidth * .82),
        }, {
          x: (index) => index === 0 ? 9 : -9,
          duration: reducedMotion ? .01 : 3.4,
          ease: reducedMotion ? "none" : "heroInertialDrift",
        })
        .to("[data-question-line]", {
          y: (index) => index === 0 ? 3 : -3,
          duration: reducedMotion ? .01 : 2.7,
          ease: "sine.inOut",
        }, reducedMotion ? 0 : .6)
        .to(".nk-walk-question", {
          autoAlpha: 0, scale: .975,
          filter: reducedMotion ? "none" : "blur(7px)",
          duration: reducedMotion ? .01 : .5,
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
      const fallback = window.setTimeout(startReveal, 5600);
      if (reducedMotion) reveal.progress(1);
      return () => {
        question.kill();
        window.clearTimeout(fallback);
        scrambleFrames.forEach((frame) => cancelAnimationFrame(frame));
        window.removeEventListener("sentinel:stage-walk-complete", startReveal);
      };
    }, hero);

    return () => {
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

      <div className="nk-walk-question" aria-label="¿Buscas una web innovadora?">
        <AnimatedLine>¿Buscas</AnimatedLine>
        <AnimatedLine>una web innovadora?</AnimatedLine>
      </div>

      {typeof document !== "undefined" && createPortal(
        <motion.header className="nk-nav" initial={{ y: -16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.8, ease }}>
          <div className="nk-nav-left">
            <a className="nk-brand" href="#inicio" aria-label="Zebware, inicio">
              <img src={logoUrl} alt="Zebware" />
            </a>
            <button className="nk-menu" type="button" onClick={onMenu} disabled={isTransitioning}><span><Menu size={15} strokeWidth={1.8} /></span><span className="nk-menu-label">Menú</span></button>
            <div className="nk-tags"><span>Desarrollo digital</span><span>Innovación creativa</span></div>
          </div>
        </motion.header>,
        document.body,
      )}

      <div className="nk-hero-content">
        <div className="nk-copy">
          <h1 aria-label="Desarrollo web en Perú: nosotros la diseñamos" data-hero-reveal>
            <span className="nk-title-kicker"><span data-scramble="DESARROLLO WEB EN PERÚ">DESARROLLO WEB EN PERÚ</span></span>{" "}
            <span className="nk-title-eleva" data-scramble="NOSOTROS">NOSOTROS</span>{" "}
            <span className="nk-title-brand"><em data-scramble="LA">LA</em> <span className="nk-title-last"><em data-scramble="DISEÑAMOS">DISEÑAMOS</em><span className="nk-title-dot">.</span></span></span>
          </h1>
          <p className="nk-subtitle" data-hero-reveal>Zebware, compañía de software de Arequipa para todo el Perú, donde nos enfocamos en la experiencia y los resultados.</p>
          <div className="nk-ctas" data-hero-reveal>
            <button ref={exploreRef} className="nk-cta" type="button" onClick={enterExperience} disabled={isTransitioning}>
              <span>Explorar web</span><span className="nk-cta-arrow" aria-hidden="true">→</span>
            </button>
            <a ref={profileRef} className="nk-cta nk-cta--quiet" href="https://www.linkedin.com/in/carlos-zeballos-28500a202/" target="_blank" rel="noreferrer">
              <span>Perfil profesional</span><span className="nk-cta-arrow" aria-hidden="true">↗</span>
            </a>
          </div>
          <CursorTag targetRef={exploreRef} className="bg-[#03EA00] text-black">Ir a<br />servicios</CursorTag>
          <CursorTag targetRef={profileRef} className="bg-[#03EA00] text-black">Conoce a<br />Carlos</CursorTag>
          <nav className="nk-socials" aria-label="Redes sociales de Zebware" data-hero-reveal>
            <a href="https://wa.me/51946691999" target="_blank" rel="noreferrer" aria-label="WhatsApp"><MessageCircle aria-hidden="true" /></a>
            <a href="https://instagram.com/zebware.pe" target="_blank" rel="noreferrer" aria-label="Instagram"><Instagram aria-hidden="true" /></a>
            <a href="https://www.linkedin.com/in/carlos-zeballos-28500a202/" target="_blank" rel="noreferrer" aria-label="LinkedIn"><Linkedin aria-hidden="true" /></a>
            <a href="https://github.com/carlos-zeballos" target="_blank" rel="noreferrer" aria-label="GitHub"><Github aria-hidden="true" /></a>
          </nav>
        </div>
      </div>

      <div className="nk-status"><i aria-hidden="true" />System online</div>
    </section>
  );
}
