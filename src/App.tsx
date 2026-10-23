import { Suspense, lazy, useEffect } from "react";
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
import { findService } from "./content/services";
import { HOME_PATH, PROFILE_PATH, serviceSlugOf, usePath } from "./lib/router";
import { homePageSchema, jsonLd } from "./lib/seo";
import { whenIdle } from "./lib/idle";

const loadProfilePage = () => import("./pages/profile/ProfilePage");
const loadServicePage = () => import("./pages/service/ServicePage");
const ProfilePage = lazy(() => loadProfilePage().then((module) => ({ default: module.ProfilePage })));
const ServicePage = lazy(() => loadServicePage().then((module) => ({ default: module.ServicePage })));

const homeSchema = jsonLd(homePageSchema);

function Landing({ unknown = false }: { unknown?: boolean }) {
  useEffect(() => {
    if (!unknown) return;
    const robots = document.querySelector('meta[name="robots"]');
    const previous = robots?.getAttribute("content");
    robots?.setAttribute("content", "noindex, follow");
    return () => { if (previous) robots?.setAttribute("content", previous); };
  }, [unknown]);

  return (
    <div className="relative isolate min-h-screen bg-hero-bg">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: homeSchema }} />
      <AmbientParallax />
      <main>
        <HeroSection />
        <ServicesSection />
        <ClosingSection />
        <ContactSection />
        <LayeredTextSection />
        <FaqSection />
      </main>
      <SiteFooter />
    </div>
  );
}

function Page({ path }: { path: string }) {
  if (path === PROFILE_PATH) return <ProfilePage />;
  const slug = serviceSlugOf(path);
  const service = slug ? findService(slug) : undefined;
  if (service) return <ServicePage key={service.slug} service={service} />;
  return <Landing unknown={path !== HOME_PATH} />;
}

export default function App() {
  const path = usePath();

  useEffect(() => whenIdle(() => {
    void loadProfilePage();
    void loadServicePage();
  }, 6000), []);

  return (
    <PageTransitionProvider>
      <SmoothScroll />
      <Suspense fallback={<div className="min-h-screen bg-hero-bg" />}>
        <Page path={path} />
      </Suspense>
    </PageTransitionProvider>
  );
}
