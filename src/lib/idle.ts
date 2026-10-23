type Cleanup = () => void;

/** Runs after the page has loaded, `delay` ms have passed and the main thread is idle. */
export function whenIdle(callback: () => void, delay = 0): Cleanup {
  let timer = 0;
  let idle = 0;
  let done = false;
  const run = () => {
    if (done) return;
    done = true;
    callback();
  };
  const schedule = () => {
    timer = window.setTimeout(() => {
      if ("requestIdleCallback" in window) idle = window.requestIdleCallback(run, { timeout: 2000 });
      else run();
    }, delay);
  };
  if (document.readyState === "complete") schedule();
  else window.addEventListener("load", schedule, { once: true });
  return () => {
    done = true;
    window.removeEventListener("load", schedule);
    window.clearTimeout(timer);
    if (idle && "cancelIdleCallback" in window) window.cancelIdleCallback(idle);
  };
}

const interactionEvents = ["pointerdown", "pointermove", "wheel", "touchstart", "keydown", "scroll"] as const;

/** Runs on the visitor's first scroll, touch, pointer or key input. */
export function whenInteracted(callback: () => void): Cleanup {
  let done = false;
  const run = () => {
    if (done) return;
    done = true;
    cleanup();
    callback();
  };
  const cleanup = () => interactionEvents.forEach((type) => window.removeEventListener(type, run));
  interactionEvents.forEach((type) => window.addEventListener(type, run, { passive: true }));
  return () => {
    done = true;
    cleanup();
  };
}

let fastWebGL: boolean | undefined;

/** False when WebGL is missing or software-rendered (no GPU), where 3D scenes stall the main thread. */
export function hasFastWebGL() {
  if (fastWebGL !== undefined) return fastWebGL;
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2", { failIfMajorPerformanceCaveat: true }) ?? canvas.getContext("webgl", { failIfMajorPerformanceCaveat: true });
    if (!gl) return (fastWebGL = false);
    const info = gl.getExtension("WEBGL_debug_renderer_info");
    const renderer = info ? String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL)) : "";
    fastWebGL = !/swiftshader|llvmpipe|softpipe|software|basic render/i.test(renderer);
    gl.getExtension("WEBGL_lose_context")?.loseContext();
  } catch {
    fastWebGL = false;
  }
  return fastWebGL;
}
