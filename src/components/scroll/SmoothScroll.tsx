import { useEffect } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "lenis/dist/lenis.css";

gsap.registerPlugin(ScrollTrigger);

export function SmoothScroll() {
  useEffect(() => {
    const lenis = new Lenis({
      lerp: 0.085,
      smoothWheel: true,
      wheelMultiplier: 0.9,
      touchMultiplier: 1,
    });
    const update = (time: number) => lenis.raf(time * 1000);
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);
    const lock = () => lenis.stop();
    const unlock = () => lenis.start();
    window.addEventListener("hero-scroll:lock", lock);
    window.addEventListener("hero-scroll:unlock", unlock);
    if (document.documentElement.dataset.heroLocked === "true") lock();

    return () => {
      window.removeEventListener("hero-scroll:lock", lock);
      window.removeEventListener("hero-scroll:unlock", unlock);
      gsap.ticker.remove(update);
      lenis.destroy();
    };
  }, []);

  return null;
}
