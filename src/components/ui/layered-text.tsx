import { useEffect, useRef, type CSSProperties } from "react";
import { gsap } from "gsap";

interface LayeredTextProps {
  lines?: Array<{ top: string; bottom: string }>;
  className?: string;
}

const defaultLines = [
  { top: "\u00A0", bottom: "PLANEAMIENTO" },
  { top: "PLANEAMIENTO", bottom: "SOLUCIONES" },
  { top: "SOLUCIONES", bottom: "VANGUARDIA" },
  { top: "VANGUARDIA", bottom: "CRECIMIENTO" },
  { top: "CRECIMIENTO", bottom: "INFLUENCIA" },
  { top: "INFLUENCIA", bottom: "RESULTADOS" },
  { top: "RESULTADOS", bottom: "\u00A0" },
];

export function LayeredText({ lines = defaultLines, className = "" }: LayeredTextProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const loopTimelineRef = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const paragraphs = container.querySelectorAll<HTMLElement>("p");
    const context = gsap.context(() => {
      loopTimelineRef.current = gsap.timeline({ repeat: -1, yoyo: true, repeatDelay: 0.45 }).to(paragraphs, {
        y: (_, element) => -(element.parentElement?.clientHeight ?? 0),
        duration: 0.9,
        ease: "power2.inOut",
        stagger: 0.055,
      });
    }, container);

    const refresh = () => loopTimelineRef.current?.invalidate();
    window.addEventListener("resize", refresh);

    return () => {
      window.removeEventListener("resize", refresh);
      context.revert();
    };
  }, [lines]);

  return (
    <div
      ref={containerRef}
      className={`mx-auto cursor-pointer py-16 font-sora text-[clamp(1.85rem,6vw,4.5rem)] font-black uppercase tracking-[-0.055em] text-white antialiased md:py-24 ${className}`}
    >
      <ul className="m-0 flex list-none flex-col items-center p-0">
        {lines.map((line, index) => {
          const centerIndex = Math.floor(lines.length / 2);
          const style = {
            "--layer-offset": index - centerIndex,
            transform: `translateX(calc(${index - centerIndex} * clamp(12px, 2.5vw, 35px))) skew(${index % 2 === 0 ? "60deg, -30deg" : "0deg, -30deg"}) scaleY(${index % 2 === 0 ? "0.66667" : "1.33333"})`,
          } as CSSProperties;

          return (
            <li key={index} className="relative h-[clamp(2rem,5vw,3.75rem)] max-w-full overflow-visible" style={style}>
              <div data-layered-line className="h-full overflow-hidden [transform-style:preserve-3d] will-change-transform">
                <p className="m-0 h-full whitespace-nowrap px-[clamp(6px,1.3vw,15px)] leading-[clamp(1.8rem,4.6vw,3.45rem)]">{line.top}</p>
                <p className="m-0 h-full whitespace-nowrap px-[clamp(6px,1.3vw,15px)] leading-[clamp(1.8rem,4.6vw,3.45rem)]">{line.bottom}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
