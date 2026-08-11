import { useLayoutEffect, useRef } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const frameModules = import.meta.glob("../../public/Assets/fotogramas/*.png", { eager: true, query: "?url", import: "default" }) as Record<string, string>;
const frameUrls = Object.entries(frameModules).sort(([a], [b]) => a.localeCompare(b)).map(([, url]) => url);

export function TypographyFrameSequence() {
  const rootRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!root || !stage || !canvas || !context || frameUrls.length === 0) return;

    const frames = frameUrls.map((url) => {
      const image = new Image();
      image.decoding = "async";
      image.src = url;
      return image;
    });
    let currentFrame = 0;
    let active = true;

    const render = (index: number) => {
      const image = frames[index];
      if (!image?.complete || !image.naturalWidth) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = stage.clientWidth;
      const height = stage.clientHeight;
      if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) {
        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(height * dpr);
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
      }
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      context.fillStyle = "#000000";
      context.fillRect(0, 0, width, height);
      // Contain preserves the complete 16:9 composition on every monitor.
      const scale = Math.min(width / 1920, height / 1080);
      const drawWidth = 1920 * scale;
      const drawHeight = 1080 * scale;
      context.drawImage(image, (width - drawWidth) / 2, (height - drawHeight) / 2, drawWidth, drawHeight);
    };

    let sequenceReady = false;
    Promise.all(frames.map((image) => image.decode().catch(() => undefined))).then(() => {
      if (!active) return;
      sequenceReady = true;
      render(currentFrame);
      ScrollTrigger.refresh();
    });

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const trigger = reduced ? null : ScrollTrigger.create({
      trigger: root,
      start: "top top",
      end: "bottom bottom",
      scrub: true,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        const frameProgress = Math.max(0, Math.min(1, (self.progress - 0.08) / 0.92));
        const nextFrame = Math.round(frameProgress * (frames.length - 1));
        if (nextFrame !== currentFrame) {
          currentFrame = nextFrame;
          if (sequenceReady) render(currentFrame);
        }
      },
    });
    const resize = () => render(currentFrame);
    window.addEventListener("resize", resize);

    return () => {
      active = false;
      window.removeEventListener("resize", resize);
      trigger?.kill();
    };
  }, []);

  return (
    <div ref={rootRef} className="relative h-[600svh] bg-black">
      <div ref={stageRef} className="sticky top-0 h-[100svh] overflow-hidden bg-black">
        <canvas ref={canvasRef} className="block h-full w-full" aria-label="Secuencia tipográfica controlada mediante scroll" />
        <div className="pointer-events-none absolute bottom-7 right-7 flex flex-col items-center gap-2 text-white sm:bottom-10 sm:right-10">
          <svg width="28" height="44" viewBox="0 0 28 44" fill="none" aria-hidden="true">
            <rect x="1" y="1" width="26" height="42" rx="13" stroke="currentColor" strokeWidth="2" />
            <circle className="mouse-wheel-dot" cx="14" cy="11" r="2.5" fill="hsl(var(--primary))" />
          </svg>
          <span className="text-[9px] font-semibold uppercase tracking-[0.24em]">Scroll</span>
        </div>
      </div>
    </div>
  );
}
