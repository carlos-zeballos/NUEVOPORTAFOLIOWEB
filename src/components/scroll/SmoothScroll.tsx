import { useEffect } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "lenis/dist/lenis.css";
import { scrollController } from "./scrollToTarget";

gsap.registerPlugin(ScrollTrigger);

export function SmoothScroll() {
  useEffect(() => {
    const lenis = new Lenis({
      lerp: 0.12,
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.05,
      syncTouch: true,
      anchors: true,
      stopInertiaOnNavigate: true,
    });
    scrollController.lenis = lenis;
    const update = (time: number) => lenis.raf(time * 1000);
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);
    const onRefresh = () => lenis.resize();
    const refresh = () => {
      lenis.resize();
      ScrollTrigger.refresh();
    };
    ScrollTrigger.addEventListener("refresh", onRefresh);
    const onLoad = () => refresh();
    window.addEventListener("load", onLoad);
    document.fonts?.ready.then(refresh);
    const initialRefresh = window.setTimeout(refresh, 180);

    return () => {
      window.clearTimeout(initialRefresh);
      window.removeEventListener("load", onLoad);
      ScrollTrigger.removeEventListener("refresh", onRefresh);
      gsap.ticker.remove(update);
      scrollController.lenis = null;
      lenis.destroy();
    };
  }, []);

  return null;
}
