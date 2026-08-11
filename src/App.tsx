import { HeroSection } from "./components/HeroSection";
import { LayeredTextSection } from "./components/sections/LayeredTextSection";
import { PageTransitionProvider } from "./components/transitions/PageTransitionProvider";
import { SmoothScroll } from "./components/scroll/SmoothScroll";
import { PanelOverlayTransition } from "./components/scroll/PanelOverlayTransition";
import { ServicesSection } from "./components/sections/ServicesSection";
import { AmbientParallax } from "./components/motion/AmbientParallax";

export default function App() {
  return (
    <PageTransitionProvider>
      <SmoothScroll />
      <div className="relative isolate min-h-screen bg-hero-bg">
        <AmbientParallax />
        <main>
          <HeroSection />
          <LayeredTextSection />
          <PanelOverlayTransition
            previous={<div className="h-full w-full bg-[#030504]" aria-hidden="true" />}
            next={<ServicesSection />}
          />
        </main>
      </div>
    </PageTransitionProvider>
  );
}
