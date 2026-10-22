import { Suspense, lazy, useCallback, useEffect, useLayoutEffect, useRef, useState, type MouseEvent } from "react";
import { createPortal } from "react-dom";
import { motion } from "motion/react";
import { ArrowDown, ArrowRight, ArrowUpRight, Instagram, Linkedin, MapPin, Menu, X } from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { usePageTransition } from "../hooks/usePageTransition";
import { HeroCylinderTitle } from "./hero/HeroCylinderTitle";
import { heroSignals, setHeroReveal } from "./hero/heroSignals";
import { InfiniteTunnel } from "./tunnel/InfiniteTunnel";
import { INTRO_SCROLL_VH, introPhases, QUESTION_DELAY } from "./tunnel/tunnelConfig";
import { SiteMenu } from "./SiteMenu";
import { ContactIcons } from "./ContactIcons";
import { CursorTag } from "./ui/cursor-tag";
import { PROFILE_PATH } from "../lib/router";
import "./HeroSection.css";

const EmeraldSentinelScene = lazy(() => import("./three/EmeraldSentinelScene").then((module) => ({ default: module.EmeraldSentinelScene })));

gsap.registerPlugin(ScrollTrigger);

const ease = [0.16, 1, 0.3, 1] as const;
const logoUrl = new URL("../public/Assets/ChatGPT Image Aug 11, 2026, 05_13_49 AM.png", import.meta.url).href;
export function HeroSection() {
  const { transitionTo, navigateTo, isTransitioning } = usePageTransition();
  const heroRef = useRef<HTMLElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = useCallback(() => setMenuOpen(false), []);
  /** On phones the robot sits behind the copy and buttons, so it is not mounted (nor its model downloaded). */
  const [showRobot, setShowRobot] = useState(false);

  useEffect(() => {
    const phone = window.matchMedia("(max-width: 767px)");
    const sync = () => setShowRobot(!phone.matches);
    sync();
    phone.addEventListener("change", sync);
    return () => phone.removeEventListener("change", sync);
  }, []);

  const exploreRef = useRef<HTMLButtonElement>(null);
  const profileRef = useRef<HTMLAnchorElement>(null);
  const explore = () => transitionTo("#servicios");

  const openProfile = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    if (!isTransitioning) navigateTo(PROFILE_PATH);
  };

  useLayoutEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    heroSignals.introAt = performance.now();

    const context = gsap.context(() => {
      if (reducedMotion) {
        heroSignals.progress = 1;
        setHeroReveal(1);
        hero.classList.add("is-revealed");
        return;
      }
      setHeroReveal(0);
      gsap.set("[data-copy]", { autoAlpha: 0, y: 28 });
      gsap.set([".zh-shade", ".zh-robot", ".zh-glow", ".zh-fade"], { autoAlpha: 0 });

      const { questionOut, portalEnd } = introPhases;

      gsap.set(".zh-intro", { autoAlpha: 1 });
      gsap.timeline({ delay: QUESTION_DELAY })
        .fromTo(".zh-veil", { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.7, ease: "sine.out" }, 0)
        .fromTo(
          ".zi-title",
          { autoAlpha: 0, scale: 0.92, filter: "blur(12px)" },
          { autoAlpha: 1, scale: 1, filter: "blur(0px)", duration: 0.9, ease: "power2.out" },
          0,
        )
        .fromTo(".zi-line>span", { yPercent: 105 }, { yPercent: 0, duration: 0.9, stagger: 0.14, ease: "power3.out" }, 0.05);

      const master = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: hero,
          start: "top top",
          end: `+=${INTRO_SCROLL_VH}%`,
          pin: true,
          scrub: 0.9,
          anticipatePin: 1,
        },
        onUpdate: () => {
          heroSignals.progress = master.progress();
          setHeroReveal(master.progress());
        },
      });

      master
        .addLabel("journey", 0)
        .fromTo(".zi-say-start", { autoAlpha: 1 }, { autoAlpha: 0, duration: 0.04 }, "journey+=0.04")
        .fromTo(".zi-say-more", { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.04 }, "journey+=0.06")
        .addLabel("rush", questionOut)
        .to(".zh-intro", { scale: 1.07, autoAlpha: 0, filter: "blur(8px)", duration: 0.1, ease: "sine.inOut" }, "rush")
        .to(".zi-cue", { autoAlpha: 0, duration: 0.05 }, portalEnd - 0.06)
        .addLabel("reveal", portalEnd)
        .to(".zh-tunnel", { autoAlpha: 0, duration: 0.06, ease: "sine.inOut" }, "reveal-=0.02")
        .to(".zh-glow", { autoAlpha: 1, duration: 0.1, ease: "sine.out" }, "reveal-=0.04")
        .to(".zh-robot", { autoAlpha: 1, duration: 0.06, ease: "sine.out" }, "reveal-=0.02")
        .to([".zh-shade", ".zh-fade"], { autoAlpha: 1, duration: 0.08, ease: "sine.inOut" }, "reveal+=0.03")
        .to("[data-copy]", { autoAlpha: 1, y: 0, duration: 0.06, stagger: 0.012, ease: "power2.out" }, "reveal+=0.06")
        .to({}, { duration: 0.01 }, 0.99);
    }, hero);

    return () => {
      context.revert();
      heroSignals.progress = 0;
      setHeroReveal(0);
    };
  }, []);

  return (
    <section ref={heroRef} id="inicio" className="nk-hero zh">
      <h1 className="sr-only">Zebware: desarrollo web, sistemas y apps para negocios en Arequipa, Perú</h1>
      <div className="zh-inner">
        <InfiniteTunnel className="zh-tunnel" />
        <div className="zh-glow" aria-hidden="true" />
        <div className="zh-shade" aria-hidden="true" />
        <motion.div className="nk-video" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, ease }}>
          <div className="zh-robot">
            {showRobot && <Suspense fallback={null}><EmeraldSentinelScene /></Suspense>}
          </div>
        </motion.div>
        <div className="zh-fade" aria-hidden="true" />

        <div className="zh-intro">
          <div className="zh-veil" aria-hidden="true" />
          <p className="zi-title">
            <span className="zi-line"><span>¿Buscas una web</span></span>
            <span className="zi-line"><span className="is-accent">innovadora?</span></span>
          </p>
        </div>
        <div className="zi-cue" aria-hidden="true">
          <span className="zi-mouse"><i /></span>
          <span className="zi-pill">
            <span className="zi-say zi-say-start">
              <b className="is-desk">Haz scroll para descubrir</b>
              <b className="is-touch">Desliza hacia arriba</b>
            </span>
            <span className="zi-say zi-say-more">
              <b className="is-desk">Sigue bajando</b>
              <b className="is-touch">Sigue deslizando</b>
            </span>
          </span>
        </div>

        <div className="zh-copy">
          <p className="zh-eyebrow" data-copy>Zebware · Software a medida</p>
          <div className="zh-title" data-copy><HeroCylinderTitle /></div>
          <p className="zh-lead" data-copy>Diseñamos y desarrollamos software a medida para negocios en todo el Perú.</p>
          <div className="zh-actions" data-copy>
            <button ref={exploreRef} className="zh-btn" type="button" onClick={explore} disabled={isTransitioning}>
              <span>Explorar web</span>
              <ArrowRight aria-hidden="true" />
            </button>
            <a ref={profileRef} className="zh-btn" href={PROFILE_PATH} onClick={openProfile}>
              <span>Perfil profesional</span>
              <ArrowUpRight aria-hidden="true" />
            </a>
          </div>
          <CursorTag targetRef={exploreRef} className="bg-[#03ea00] text-[#050505]">Ir a<br />servicios</CursorTag>
          <CursorTag targetRef={profileRef} className="bg-[#03ea00] text-[#050505]">Conoce a<br />Carlos</CursorTag>
        </div>
      </div>
      <button className="zh-explore" type="button" onClick={explore} disabled={isTransitioning} data-copy>
        <span>Explorar</span>
        <ArrowDown aria-hidden="true" />
      </button>

      {typeof document !== "undefined" && createPortal(<SiteMenu open={menuOpen} onClose={closeMenu} />, document.body)}
      {typeof document !== "undefined" && createPortal(
        <motion.header className="nk-nav zn" initial={{ y: -16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.8, ease }}>
          <div className="zn-left">
            <a className="nk-brand" href="#inicio" aria-label="Zebware, inicio">
              <img src={logoUrl} alt="Zebware" />
            </a>
            <span className="zn-location"><MapPin aria-hidden="true" />Arequipa, Perú</span>
          </div>
          <nav className="zn-tabs" aria-label="Secciones">
            <a className="is-on" href="#inicio" aria-current="page">Desarrollo</a>
            <a href={PROFILE_PATH} onClick={openProfile}>Perfil</a>
          </nav>
          <div className="zn-right">
            <ContactIcons className="contents" linkClassName="zn-icon" iconClassName="" />
            <a className="zn-icon" href="https://instagram.com/zebware.pe" target="_blank" rel="noreferrer" aria-label="Instagram"><Instagram aria-hidden="true" /></a>
            <a className="zn-icon" href="https://www.linkedin.com/in/carlos-zeballos-28500a202/" target="_blank" rel="noreferrer" aria-label="LinkedIn"><Linkedin aria-hidden="true" /></a>
            <button className="zn-menu" type="button" onClick={() => setMenuOpen((value) => !value)} disabled={isTransitioning} aria-expanded={menuOpen} aria-controls="site-menu" aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}>
              {menuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
            </button>
          </div>
        </motion.header>,
        document.body,
      )}
    </section>
  );
}
