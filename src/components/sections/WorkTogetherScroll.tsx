import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const triangles = [
  "0,0 0.25,0 0.13,0.5", "0,0 0.13,0.5 0,1", "0.25,0 0.5,0 0.37,0.5", "0.25,0 0.37,0.5 0.13,0.5",
  "0.13,0.5 0.37,0.5 0.25,1", "0,1 0.13,0.5 0.25,1", "0.5,0 0.75,0 0.63,0.5", "0.5,0 0.63,0.5 0.37,0.5",
  "0.37,0.5 0.63,0.5 0.5,1", "0.25,1 0.37,0.5 0.5,1", "0.75,0 1,0 0.87,0.5", "0.75,0 0.87,0.5 0.63,0.5",
  "0.63,0.5 0.87,0.5 0.75,1", "0.5,1 0.63,0.5 0.75,1", "0.87,0.5 1,0 1,1", "0.75,1 0.87,0.5 1,1",
];

const fall: Array<[number, number, number]> = [
  [-170,360,-18],[-120,440,13],[-145,520,-14],[-80,600,17],[-105,690,-16],[-35,760,12],[-70,830,-21],[15,900,16],
  [-30,960,-14],[65,1020,19],[-10,470,-12],[55,560,15],[15,650,-17],[85,740,13],[45,860,-15],[110,980,18],
  [170,360,18],[120,440,-13],[145,520,14],[80,600,-17],[105,690,16],[35,760,-12],[70,830,21],[-15,900,-16],
  [30,960,14],[-65,1020,-19],[10,470,12],[-55,560,-15],[-15,650,17],[-85,740,-13],[-45,860,15],[-110,980,-18],
];

const clamp = (v: number) => Math.max(0, Math.min(1, v));
const map = (v: number, start: number, end: number) => clamp((v - start) / (end - start));
const easeOut = (v: number) => 1 - Math.pow(1 - v, 3);
const lerp = (start: number, end: number, v: number) => start + (end - start) * v;

export function WorkTogetherScroll() {
  const rootRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const phrase = root.querySelector<SVGGElement>("[data-intact]");
    const leftText = root.querySelector<SVGTextElement>("[data-left-text]");
    const rightText = root.querySelector<SVGTextElement>("[data-right-text]");
    const broken = root.querySelector<SVGGElement>("[data-broken]");
    const fragments = Array.from(root.querySelectorAll<SVGGElement>("[data-fragment]"));
    if (!phrase || !leftText || !rightText || !broken) return;

    const centerPhrase = () => {
      const leftEnd = 960 - (56 + rightText.getComputedTextLength() - leftText.getComputedTextLength()) / 2;
      const rightStart = leftEnd + 56;
      leftText.setAttribute("x", String(leftEnd));
      rightText.setAttribute("x", String(rightStart));
      root.querySelectorAll<SVGTextElement>('[data-side="left"]').forEach((el) => el.setAttribute("x", String(leftEnd)));
      root.querySelectorAll<SVGTextElement>('[data-side="right"]').forEach((el) => el.setAttribute("x", String(rightStart)));
    };

    const render = (progress: number) => {
      const p = clamp(progress);
      const approach = easeOut(map(p, 0.01, 0.27));
      const breakOpen = map(p, 0.39, 0.49);
      const drop = Math.pow(map(p, 0.45, 0.98), 2);
      leftText.style.transform = `translate(${lerp(-1500, 0, approach)}px,0)`;
      rightText.style.transform = `translate(${lerp(1500, 0, approach)}px,0)`;
      phrase.style.opacity = String(1 - map(p, 0.39, 0.405));
      broken.style.opacity = String(map(p, 0.388, 0.398) * (1 - map(p, 0.97, 1)));
      fragments.forEach((fragment, index) => {
        const [x, y, rotation] = fall[index];
        const split = breakOpen * (4 + (index % 5) * 2.2);
        const jitterX = (index < 16 ? -1 : 1) * split * (0.65 + (index % 3) * 0.18);
        const jitterY = (index % 2 ? 1 : -1) * split * 0.58;
        fragment.style.transformOrigin = "960px 540px";
        fragment.style.transform = `translate(${jitterX + x * drop}px,${jitterY + y * drop}px) rotate(${rotation * drop}deg)`;
      });
    };

    centerPhrase();
    render(0);
    gsap.set(root, { autoAlpha: 0 });
    document.fonts.ready.then(() => {
      centerPhrase();
      ScrollTrigger.refresh();
    });
    const context = gsap.context(() => {
      ScrollTrigger.create({
        trigger: root, start: "top top", end: "+=1500", pin: true, scrub: 0.12,
        anticipatePin: 0,
        invalidateOnRefresh: true,
        onEnter: () => gsap.set(root, { autoAlpha: 1 }),
        onEnterBack: () => gsap.set(root, { autoAlpha: 1 }),
        onLeaveBack: () => gsap.set(root, { autoAlpha: 0 }),
        onUpdate: (self) => render(self.isActive ? Math.max(self.progress, 0.055) : self.progress),
      });
    }, root);
    const onResize = () => centerPhrase();
    window.addEventListener("resize", onResize);
    return () => { window.removeEventListener("resize", onResize); context.revert(); };
  }, []);

  return (
    <div ref={rootRef} id="scroll-preview" className="relative z-40 -mt-px h-[100svh] w-full overflow-hidden bg-black" aria-label="Animación Trabajemos Juntos">
      <svg className="block h-full w-full bg-black" viewBox="0 0 1920 1080" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Trabajemos juntos se encuentra, se rompe y cae">
        <defs>{triangles.map((points, i) => <clipPath key={points} id={`work-triangle-${i}`} clipPathUnits="objectBoundingBox"><polygon points={points} /></clipPath>)}</defs>
        <rect width="1920" height="1080" fill="#000" />
        <g data-intact>
          <text data-left-text x="955" y="540" textAnchor="end" className="fill-[#F5F5F5] font-sora text-[165px] font-black tracking-[-6px] [dominant-baseline:middle]">TRABAJEMOS</text>
          <text data-right-text x="995" y="540" textAnchor="start" className="fill-[#03EA00] font-sora text-[165px] font-black tracking-[-6px] [dominant-baseline:middle]">JUNTOS</text>
        </g>
        <g data-broken opacity="0">
          {["left", "right"].flatMap((side) => triangles.map((_, i) => (
            <g key={`${side}-${i}`} data-fragment clipPath={`url(#work-triangle-${i})`}>
              <text data-side={side} x={side === "left" ? 955 : 995} y="540" textAnchor={side === "left" ? "end" : "start"} className={`${side === "left" ? "fill-[#F5F5F5]" : "fill-[#03EA00]"} font-sora text-[165px] font-black tracking-[-6px] [dominant-baseline:middle]`}>{side === "left" ? "TRABAJEMOS" : "JUNTOS"}</text>
            </g>
          )))}
        </g>
      </svg>
      <div className="pointer-events-none absolute bottom-7 right-7 flex flex-col items-center gap-2 text-[9px] font-semibold uppercase tracking-[0.22em] text-white/55 sm:bottom-10 sm:right-10">
        <svg className="h-10 w-7 text-primary" viewBox="0 0 28 42" fill="none" aria-hidden="true">
          <rect x="2" y="1" width="24" height="34" rx="12" stroke="currentColor" strokeWidth="1.5" />
          <circle className="mouse-wheel-dot" cx="14" cy="10" r="2" fill="currentColor" />
          <path d="M9 36l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span>Sigue</span>
      </div>
    </div>
  );
}
