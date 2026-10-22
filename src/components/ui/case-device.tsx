import { useEffect, useRef, type ReactNode } from "react";
import { gsap } from "gsap";

export type DeviceKind = "laptop" | "phone";

type CaseDeviceProps = { kind: DeviceKind; image: string; host: string; name: string; alt?: string; eager?: boolean };

function Tilt({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !window.matchMedia("(hover: hover) and (pointer: fine)").matches || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const rotateX = gsap.quickTo(el, "rotationX", { duration: 0.6, ease: "power3.out" });
    const rotateY = gsap.quickTo(el, "rotationY", { duration: 0.6, ease: "power3.out" });
    const move = (event: PointerEvent) => {
      const box = el.getBoundingClientRect();
      const x = (event.clientX - box.left) / box.width;
      const y = (event.clientY - box.top) / box.height;
      rotateY((x - 0.5) * 16);
      rotateX((0.5 - y) * 12);
      el.style.setProperty("--gx", `${x * 100}%`);
      el.style.setProperty("--gy", `${y * 100}%`);
    };
    const enter = () => {
      el.classList.add("is-tilting");
      gsap.to(el, { scale: 1.03, z: 40, duration: 0.6, ease: "power3.out" });
    };
    const leave = () => {
      el.classList.remove("is-tilting");
      rotateX(0);
      rotateY(0);
      gsap.to(el, { scale: 1, z: 0, duration: 0.8, ease: "power3.out" });
    };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerenter", enter);
    el.addEventListener("pointerleave", leave);
    return () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerenter", enter);
      el.removeEventListener("pointerleave", leave);
      gsap.killTweensOf(el);
    };
  }, []);

  return <div ref={ref} className="zc-tilt">{children}</div>;
}

export function CaseDevice({ kind, image, host, name, alt = `Captura de ${name}`, eager = false }: CaseDeviceProps) {
  const loading = eager ? "eager" : "lazy";
  const priority = eager ? { fetchpriority: "high" } : {};
  if (kind === "phone") {
    return (
      <Tilt>
        <div className="zc-phone" data-case-device>
          <span className="zc-phone-island" aria-hidden="true" />
          <span className="zc-shot"><img src={image} alt={alt} loading={loading} decoding="async" {...priority} /></span>
          <span className="zc-glare" aria-hidden="true" />
        </div>
      </Tilt>
    );
  }
  return (
    <Tilt>
      <div className="zc-laptop" data-case-device>
        <div className="zc-laptop-screen">
          <div className="zc-laptop-bar" aria-hidden="true"><i /><i /><i /><span>{host}</span></div>
          <span className="zc-shot"><img src={image} alt={alt} loading={loading} decoding="async" {...priority} /></span>
          <span className="zc-glare" aria-hidden="true" />
        </div>
        <span className="zc-laptop-base" aria-hidden="true" />
      </div>
    </Tilt>
  );
}
