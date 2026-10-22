import { useEffect, useState, type MouseEvent } from "react";
import { ArrowLeft } from "lucide-react";
import { usePageTransition } from "../../hooks/usePageTransition";
import { scrollToTarget } from "../../components/scroll/scrollToTarget";
import { profileNav } from "../../content/profile";
import { HOME_PATH } from "../../lib/router";
import { BrandLogo } from "../../components/ui/brand-logo";

export function ProfileNav() {
  const { navigateTo, isTransitioning } = usePageTransition();
  const [solid, setSolid] = useState(false);

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const goTo = (event: MouseEvent<HTMLAnchorElement>, href: string) => {
    event.preventDefault();
    scrollToTarget(href, { duration: 1.4 });
  };

  const goHome = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    if (!isTransitioning) navigateTo(HOME_PATH);
  };

  return (
    <header className={`fixed inset-x-0 top-0 z-50 transition-[background-color,backdrop-filter,border-color] duration-500 ${solid ? "border-b border-white/[0.07] bg-[#0b0d0c]/70 backdrop-blur-xl" : "border-b border-transparent"}`}>
      <div className="pf-shell flex h-[72px] items-center justify-between gap-6">
        <a href="#pf-inicio" onClick={(event) => goTo(event, "#pf-inicio")} className="flex items-center text-white" aria-label="Zebware, inicio del perfil">
          <BrandLogo className="h-[26px] sm:h-[30px]" />
        </a>
        <nav aria-label="Secciones del perfil" className="hidden items-center gap-7 lg:flex">
          {profileNav.map(({ label, href }, index) => (
            <a key={href} href={href} onClick={(event) => goTo(event, href)} className="group flex items-start gap-1.5 text-[13px] text-white/80 transition-colors hover:text-white">
              <sup className="pt-1 text-[8px] text-white/35 transition-colors group-hover:text-[#03ea00]">{String(index + 1).padStart(2, "0")}</sup>
              {label}
            </a>
          ))}
        </nav>
        <a href={HOME_PATH} onClick={goHome} className="group inline-flex h-9 items-center gap-2 border border-[#03ea00]/35 px-3.5 text-[9px] font-semibold uppercase tracking-[0.18em] text-white/80 transition-colors hover:border-[#03ea00] hover:bg-[#03ea00]/10 hover:text-white">
          <ArrowLeft className="h-3.5 w-3.5 text-[#03ea00] transition-transform group-hover:-translate-x-0.5" strokeWidth={1.8} aria-hidden="true" />
          Zebware
        </a>
      </div>
    </header>
  );
}
