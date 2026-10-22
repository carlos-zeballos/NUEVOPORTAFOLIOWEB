export const AUTO_FLY_MODE = "auto-fly";
export const SCROLL_DRIVEN_MODE = "scroll-driven";
export type TunnelMode = typeof AUTO_FLY_MODE | typeof SCROLL_DRIVEN_MODE;

export const tunnelPalette = {
  void: "#030504",
  panel: "#0b0f0c",
  line: "#2a2c2e",
  /** Neutral tone the panels are graded to, so the green copy stands out. */
  tone: "#e9edf0",
  art: ["#03ea00", "#00c26a", "#0d7d3f", "#063d22", "#7dff9a", "#c6ff3d", "#00d9a3", "#e8fff0"],
  deep: ["#021a0c", "#04260f", "#082f1b", "#0a1a12"],
};

/** A static glob, so the build only emits these folders instead of every file under Assets. */
const tunnelAssets = import.meta.glob(["../../public/Assets/escenas/*.webp", "../../public/Assets/perfil/*.webp", "../../public/Assets/screens/*.webp"], { eager: true, query: "?url", import: "default" }) as Record<string, string>;

const asset = (path: string) => tunnelAssets[`../../public/Assets/${path}`];

const generated = (name: string) => asset(`escenas/${name}.webp`);

/** Up to 25 images (atlas size); they repeat across the tunnel. Real projects are interleaved with generated scenes. */
export const tunnelImages = [
  asset("perfil/mirasol.webp"),
  generated("equipo-desarrollo"),
  generated("navegador-vidrio"),
  asset("perfil/boda-stephany-julio.webp"),
  generated("emprendedora-web"),
  generated("cubo-modular"),
  asset("screens/kuronakama.webp"),
  generated("app-en-mano"),
  generated("data-center"),
  asset("perfil/ayd-grupo.webp"),
  generated("disenadora-tablet"),
  generated("globo-conexiones"),
  asset("perfil/kuro-sushi.webp"),
  generated("pago-celular"),
  generated("arcos-arequipa"),
  asset("perfil/global-vertical.webp"),
  generated("novia-invitacion"),
  generated("consola-control"),
  asset("screens/alpaca.webp"),
  generated("dashboard-analitica"),
  generated("brazo-robotico"),
  asset("perfil/mfh.webp"),
  generated("tecnologo-sistema"),
  generated("teclado-codigo"),
  generated("vidrio-tactil"),
];

/** Length of the pinned intro, in viewport heights of scroll. */
export const INTRO_SCROLL_VH = 160;

/** Seconds after load before the question appears over the tunnel (it no longer waits for scroll). */
export const QUESTION_DELAY = 0.35;

/** Phases of the pinned intro, as fractions of the master timeline progress. */
export const introPhases = {
  questionOut: 0.2,
  accelStart: 0.22,
  portalStart: 0.46,
  portalEnd: 0.66,
  /** From here the hero is fully on screen and its title starts cycling. */
  heroReady: 0.92,
};

export const tunnelConfig = {
  mode: SCROLL_DRIVEN_MODE as TunnelMode,
  /** Units per second while idle. */
  speed: 2.4,
  /** Idle drift in scroll-driven mode, units per second. */
  drift: 2.2,
  /** How tightly the camera follows the timeline; lower adds inertia to wheel flicks. */
  follow: 3.5,
  /** Fastest the camera may travel in scroll-driven mode, units per second. */
  followMaxSpeed: 20,
  /** Steady advance across the whole intro scroll. */
  scrollDistance: 28,
  /** Extra distance gained by the acceleration toward the end of the tunnel. */
  rushDistance: 26,
  /** Exponent of the rush curve; closer to 1 spreads the acceleration evenly. */
  rushCurve: 1.2,
  /** Field of view added at full speed, so the walls stream past faster. */
  rushFov: 7,
  /** Ambient camera sway (units / radians); independent from the scroll. */
  sway: { x: 0.07, y: 0.05, roll: 0.012 },
  /** 0 keeps the original colours of the panels, 1 grades them fully to `tunnelPalette.tone`. */
  monochrome: 1,
  /** Extra speed per viewport-height of scroll per second. */
  scrollBoost: 9,
  /** Speed multiplier reached when the hero reveal completes. */
  revealWarp: 16,
  minSpeed: -1.2,
  maxSpeed: 26,
  /** Seconds for the speed to settle toward its target. */
  damping: 0.45,
  introFade: 0.9,
  introRamp: 1.8,
  cell: 1.6,
  height: 5,
  maxWidth: 9.6,
  minWidth: 3.6,
  portraitHeight: 6.2,
  depth: { desktop: 52, mobile: 36 },
  fov: { desktop: 70, mobile: 78 },
  /** Share of cells that carry a panel (the rest stays black). */
  density: 0.74,
  photoShare: 1,
  maxDpr: { desktop: 1.6, mobile: 1.25 },
};
