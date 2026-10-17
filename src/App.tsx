import { HeroSection } from "./components/HeroSection";
import { LayeredTextSection } from "./components/sections/LayeredTextSection";
import { PageTransitionProvider } from "./components/transitions/PageTransitionProvider";
import { SmoothScroll } from "./components/scroll/SmoothScroll";
import { ServicesSection } from "./components/sections/ServicesSection";
import { ClosingSection } from "./components/sections/ClosingSection";
import { FaqSection } from "./components/sections/FaqSection";
import { ContactSection } from "./components/sections/ContactSection";
import { SiteFooter } from "./components/SiteFooter";
import { AmbientParallax } from "./components/motion/AmbientParallax";

export default function App() {
  return (
    <PageTransitionProvider>
      <SmoothScroll />
      <div className="relative isolate min-h-screen bg-hero-bg">
        <AmbientParallax />
        <main>
          <HeroSection />
          <ServicesSection />
          <ClosingSection />
          <LayeredTextSection />
          <ContactSection />
          <FaqSection />
        </main>
        <SiteFooter />
      </div>
    </PageTransitionProvider>
  );
}
