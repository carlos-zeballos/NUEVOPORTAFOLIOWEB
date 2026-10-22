type Listener = () => void;

export const heroSignals = {
  pointer: { x: 0, y: 0 },
  scroll: 0,
  introAt: 0,
  robotReadyAt: 0,
  reveal: 0,
  /** Raw progress (0..1) of the pinned intro scroll. */
  progress: 0,
  featured: 0,
  featuredAt: 0,
  running: true,
};

const runningListeners = new Set<Listener>();

export function setHeroRunning(running: boolean) {
  if (heroSignals.running === running) return;
  heroSignals.running = running;
  runningListeners.forEach((listener) => listener());
}

const revealListeners = new Set<Listener>();

export function setHeroReveal(reveal: number) {
  if (heroSignals.reveal === reveal) return;
  heroSignals.reveal = reveal;
  revealListeners.forEach((listener) => listener());
}

export function onHeroRevealChange(listener: Listener) {
  revealListeners.add(listener);
  return () => {
    revealListeners.delete(listener);
  };
}

export function onHeroRunningChange(listener: Listener) {
  runningListeners.add(listener);
  return () => {
    runningListeners.delete(listener);
  };
}
