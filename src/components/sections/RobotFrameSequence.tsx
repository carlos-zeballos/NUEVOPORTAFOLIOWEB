import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { whenInteracted } from "../../lib/idle";

gsap.registerPlugin(ScrollTrigger);

/** First seconds of firefly-scroll-desktop, keyframe every 6 frames so scroll seeking stays smooth. */
const videoSource = new URL("../../public/Assets/robot-scroll.webm", import.meta.url).href;
/** Same cut in H.264 for iOS Safari, which plays WebM unreliably. */
const videoSourceMp4 = new URL("../../public/Assets/robot-scroll.mp4", import.meta.url).href;
/** 854×480 with every frame a keyframe: phones seek it without decoding neighbours. */
const videoSourceMobile = new URL("../../public/Assets/robot-scroll-mobile.mp4", import.meta.url).href;
/** First frame (8 KB) shown while the video downloads, so slow phones never see an empty black stage. */
const videoPoster = new URL("../../public/Assets/robot-scroll-poster.webp", import.meta.url).href;
const mobileQuery = "(max-width: 767px)";
const sequenceLimit = 6;
const message = "Usamos el ingenio humano y la inteligencia artificial para darte el mejor resultado.";
const greenWords = new Set(["ingenio", "inteligencia", "resultado."]);

export function RobotFrameSequence() {
  const rootRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const messageRef = useRef<HTMLParagraphElement>(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    const video = videoRef.current;
    const exitVeil = root?.querySelector<HTMLElement>("[data-video-exit-veil]");
    if (!root || !video || !exitVeil) return;

    const motionOff = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const mobile = window.matchMedia(mobileQuery).matches;
    const followRate = motionOff ? 60 : 3.2;
    const maxSpeed = motionOff ? 100 : 0.38;
    let targetProgress = 0;
    let targetTime = 0;
    let rafId = 0;
    let messageTimeline: gsap.core.Timeline | null = null;
    let initiativeTimeline: gsap.core.Timeline | null = null;
    const playhead = { progress: 0 };

    const updateVideo = () => {
      rafId = 0;
      if (video.seeking) {
        rafId = requestAnimationFrame(updateVideo);
        return;
      }
      if (video.readyState >= 2 && Math.abs(video.currentTime - targetTime) > 0.008) {
        video.currentTime = targetTime;
      }
    };

    const render = () => {
      const roundTrip = playhead.progress <= 0.5
        ? playhead.progress * 2
        : (1 - playhead.progress) * 2;
      targetTime = roundTrip * Math.min(sequenceLimit, Number.isFinite(video.duration) ? video.duration : sequenceLimit);
      const reveal = Math.max(0.82, gsap.utils.clamp(0, 1, playhead.progress / 0.08));
      const exit = gsap.utils.clamp(0, 1, (playhead.progress - 0.86) / 0.14);
      video.style.opacity = String(reveal * (1 - exit * 0.6));
      if (!mobile) video.style.filter = `blur(${exit * 8}px)`;
      video.style.transform = `scale(${1 + exit * 0.05})`;
      const veil = gsap.utils.clamp(0, 1, (Math.max(playhead.progress, targetProgress) - 0.86) / 0.14);
      exitVeil.style.opacity = String(Math.pow(veil, 1.3));
      messageTimeline?.progress(gsap.utils.clamp(0, 1, (playhead.progress - 0.01) / 0.18));
      initiativeTimeline?.progress(gsap.utils.clamp(0, 1, (playhead.progress - 0.08) / 0.16));
      if (!rafId) rafId = requestAnimationFrame(updateVideo);
    };

    const prepareVideo = () => {
      video.pause();
      video.currentTime = 0;
      render();
      ScrollTrigger.refresh();
    };

    video.addEventListener("loadedmetadata", prepareVideo);
    if (video.readyState >= 1) prepareVideo();

    const nearby = new IntersectionObserver(([entry]) => {
      if (!entry?.isIntersecting) return;
      nearby.disconnect();
      video.poster = videoPoster;
      video.preload = "auto";
      video.load();
    }, { rootMargin: "400% 0px" });
    const stopWaiting = whenInteracted(() => nearby.observe(root));

    const context = gsap.context(() => {
      messageTimeline = gsap.timeline({ paused: true }).fromTo(
        "[data-message-letter]",
        { autoAlpha: 0, yPercent: 110, rotateX: -35 },
        { autoAlpha: 1, yPercent: 0, rotateX: 0, duration: 0.8, stagger: 0.018, ease: "power3.out" },
      );
      initiativeTimeline = gsap.timeline({ paused: true })
        .fromTo("[data-video-initiative]", { autoAlpha: 0, x: -35 }, { autoAlpha: 1, x: 0, duration: 0.7, ease: "power3.out" })
        .fromTo("[data-video-initiative-arrow]", { autoAlpha: 0, y: -18 }, { autoAlpha: 1, y: 0, duration: 0.55, ease: "power2.out" }, 0.22);
      ScrollTrigger.create({
        trigger: root,
        start: "top top",
        end: "+=210%",
        pin: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => { targetProgress = self.progress; },
        onRefresh: (self) => {
          targetProgress = self.progress;
          playhead.progress = self.progress;
          render();
        },
      });
    }, root);

    const follow = (_time: number, deltaTime: number) => {
      const gap = targetProgress - playhead.progress;
      if (Math.abs(gap) < 0.0004) {
        if (gap !== 0) {
          playhead.progress = targetProgress;
          render();
        }
        return;
      }
      const dt = Math.min(deltaTime, 50) / 1000;
      const eased = gap * (1 - Math.exp(-dt * followRate));
      const limit = maxSpeed * dt;
      playhead.progress += gsap.utils.clamp(-limit, limit, eased);
      render();
    };
    gsap.ticker.add(follow);

    return () => {
      gsap.ticker.remove(follow);
      stopWaiting();
      nearby.disconnect();
      video.removeEventListener("loadedmetadata", prepareVideo);
      if (rafId) cancelAnimationFrame(rafId);
      context.revert();
    };
  }, []);

  return (
    <div ref={rootRef} className="relative h-[100svh] w-full overflow-hidden bg-black" role="region" aria-label="Secuencia animada de tecnología Zebware">
      <video
        ref={videoRef}
        className="block h-full w-full object-cover object-center will-change-[filter,opacity,transform] max-md:object-contain max-md:will-change-[opacity,transform]"
        muted
        playsInline
        preload="none"
        aria-hidden="true"
      >
        <source src={videoSourceMobile} type="video/mp4" media={mobileQuery} />
        <source src={videoSourceMp4} type="video/mp4" />
        <source src={videoSource} type="video/webm" />
      </video>
      <div className="pointer-events-none absolute inset-x-0 top-0 z-[5] h-[18svh] bg-gradient-to-b from-[#030504] to-transparent" aria-hidden="true" />
      <div data-video-exit-veil className="pointer-events-none absolute inset-0 z-30 bg-black opacity-0 will-change-[opacity]" aria-hidden="true" />
      <p
        ref={messageRef}
        className="pointer-events-none absolute right-6 top-[clamp(6rem,16vh,10rem)] z-10 w-[min(84vw,16.5em)] text-justify [text-align-last:right] text-[clamp(1.3rem,2.15vw,2.65rem)] font-medium leading-[1.08] tracking-[-0.04em] text-white sm:right-10 lg:right-14"
      >
        <span className="sr-only">{message}</span>
        {message.split(" ").flatMap((word, wordIndex) => [
          wordIndex > 0 ? " " : null,
          <span key={`${word}-${wordIndex}`} aria-hidden="true" className={`inline-block whitespace-nowrap ${greenWords.has(word) ? "text-primary" : "text-white"}`}>
            {Array.from(word).map((character, characterIndex) => (
              <span key={`${character}-${characterIndex}`} data-message-letter className="inline-block will-change-transform">
                {character}
              </span>
            ))}
          </span>,
        ])}
      </p>
      <div
        data-video-initiative
        className="pointer-events-none absolute bottom-[clamp(5rem,10vh,8rem)] left-6 z-10 flex flex-col items-start text-left text-[clamp(1rem,1.4vw,1.45rem)] font-semibold uppercase tracking-[-0.035em] text-white sm:left-10 lg:left-14"
      >
        <span className="border-b border-white/60 pb-1">Toma la iniciativa</span>
        <span data-video-initiative-arrow className="mt-3 block text-[clamp(2.5rem,4vw,4.5rem)] font-light leading-none text-primary" aria-hidden="true">↓</span>
      </div>
      <div className="pointer-events-none absolute bottom-7 right-7 flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/55 sm:bottom-10 sm:right-10">
        <span className="h-1.5 w-1.5 rounded-full bg-primary" /> Scroll para explorar
      </div>
    </div>
  );
}
