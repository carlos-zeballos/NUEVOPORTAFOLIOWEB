import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function countUpOnView(elements: HTMLElement[]) {
  elements.forEach((element) => {
    const value = Number(element.dataset.count);
    const decimals = Number(element.dataset.decimals ?? 0);
    const suffix = element.dataset.suffix ?? "";
    const state = { value: 0 };
    element.textContent = `0${suffix}`;
    gsap.to(state, {
      value,
      duration: 1.6,
      ease: "power3.out",
      scrollTrigger: { trigger: element, start: "top 88%", once: true },
      onUpdate: () => { element.textContent = `${state.value.toFixed(decimals)}${suffix}`; },
    });
  });
}
