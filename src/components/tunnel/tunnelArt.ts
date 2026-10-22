import { CanvasTexture, LinearFilter, LinearMipmapLinearFilter, SRGBColorSpace } from "three";
import { tunnelPalette } from "./tunnelConfig";

export const ATLAS_GRID = 5;
export const ATLAS_TILES = ATLAS_GRID * ATLAS_GRID;

type Ctx = CanvasRenderingContext2D;

function rng(seed: number) {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function pick<T>(list: T[], random: () => number) {
  return list[Math.floor(random() * list.length)];
}

function gradient(ctx: Ctx, s: number, random: () => number, colors: string[]) {
  const angle = random() * Math.PI * 2;
  const g = ctx.createLinearGradient(
    s / 2 - Math.cos(angle) * s * 0.7,
    s / 2 - Math.sin(angle) * s * 0.7,
    s / 2 + Math.cos(angle) * s * 0.7,
    s / 2 + Math.sin(angle) * s * 0.7,
  );
  colors.forEach((color, index) => g.addColorStop(index / Math.max(1, colors.length - 1), color));
  return g;
}

function wave(ctx: Ctx, s: number, random: () => number) {
  const base = s * (0.35 + random() * 0.4);
  const amp = s * (0.08 + random() * 0.16);
  const freq = 1 + random() * 1.6;
  const phase = random() * Math.PI * 2;
  ctx.beginPath();
  ctx.moveTo(0, s);
  for (let x = 0; x <= s; x += 8) ctx.lineTo(x, base + Math.sin((x / s) * Math.PI * freq + phase) * amp);
  ctx.lineTo(s, s);
  ctx.closePath();
  ctx.fillStyle = gradient(ctx, s, random, [pick(tunnelPalette.art, random), pick(tunnelPalette.deep, random)]);
  ctx.fill();
}

function arc(ctx: Ctx, s: number, random: () => number) {
  const cx = s * (0.2 + random() * 0.6);
  const cy = s * (0.3 + random() * 0.7);
  const r = s * (0.22 + random() * 0.3);
  ctx.lineWidth = r * (0.35 + random() * 0.3);
  ctx.lineCap = "round";
  ctx.strokeStyle = gradient(ctx, s, random, [pick(tunnelPalette.art, random), pick(tunnelPalette.art, random)]);
  const start = random() * Math.PI * 2;
  ctx.beginPath();
  ctx.arc(cx, cy, r, start, start + Math.PI * (0.9 + random() * 0.7));
  ctx.stroke();
}

function disc(ctx: Ctx, s: number, random: () => number) {
  const r = s * (0.3 + random() * 0.35);
  const edge = random() < 0.5 ? 0 : s;
  ctx.beginPath();
  ctx.arc(edge, s * (0.3 + random() * 0.6), r, 0, Math.PI * 2);
  ctx.fillStyle = gradient(ctx, s, random, [pick(tunnelPalette.art, random), pick(tunnelPalette.deep, random)]);
  ctx.fill();
}

function steps(ctx: Ctx, s: number, random: () => number) {
  const count = 2 + Math.floor(random() * 3);
  const w = s / (count + 1);
  ctx.fillStyle = gradient(ctx, s, random, [pick(tunnelPalette.art, random), pick(tunnelPalette.deep, random)]);
  ctx.beginPath();
  ctx.moveTo(s, s);
  for (let i = 0; i <= count; i += 1) {
    const y = s * (0.2 + (i / count) * 0.55);
    ctx.lineTo(s - i * w, y);
    ctx.lineTo(s - (i + 1) * w, y);
  }
  ctx.lineTo(0, s);
  ctx.closePath();
  ctx.fill();
}

function band(ctx: Ctx, s: number, random: () => number) {
  ctx.save();
  ctx.translate(s / 2, s / 2);
  ctx.rotate((random() - 0.5) * 1.6);
  ctx.fillStyle = gradient(ctx, s, random, [pick(tunnelPalette.art, random), pick(tunnelPalette.art, random)]);
  ctx.fillRect(-s, -s * (0.06 + random() * 0.12), s * 2, s * (0.12 + random() * 0.2));
  ctx.restore();
}

function lines(ctx: Ctx, s: number, random: () => number) {
  ctx.strokeStyle = pick(tunnelPalette.art, random);
  ctx.globalAlpha = 0.55;
  ctx.lineWidth = s * 0.008;
  const gap = s * (0.05 + random() * 0.05);
  for (let y = gap; y < s; y += gap) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(s, y + Math.sin(y * 0.02) * s * 0.06);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

const shapes = [wave, arc, disc, steps, band];

export function drawArt(ctx: Ctx, size: number, seed: number) {
  const random = rng(seed * 9301 + 49297);
  ctx.save();
  ctx.fillStyle = gradient(ctx, size, random, [pick(tunnelPalette.deep, random), pick(tunnelPalette.art.slice(1, 4), random)]);
  ctx.fillRect(0, 0, size, size);
  if (seed % 5 === 3) lines(ctx, size, random);
  const count = 2 + Math.floor(random() * 2);
  for (let i = 0; i < count; i += 1) pick(shapes, random)(ctx, size, random);
  const shade = ctx.createLinearGradient(0, 0, 0, size);
  shade.addColorStop(0, "rgba(0,0,0,0)");
  shade.addColorStop(1, "rgba(0,0,0,0.28)");
  ctx.fillStyle = shade;
  ctx.fillRect(0, 0, size, size);
  ctx.restore();
}

function drawPhoto(ctx: Ctx, size: number, image: HTMLImageElement) {
  const ratio = image.naturalWidth / image.naturalHeight;
  const sw = ratio > 1 ? image.naturalHeight : image.naturalWidth;
  const sx = ratio > 1 ? (image.naturalWidth - sw) / 2 : 0;
  ctx.drawImage(image, sx, 0, sw, sw, 0, 0, size, size);
}

/** Tiles [0, ATLAS_TILES - photos.length) are generated art; the remaining ones hold the photos. */
export function createTunnelAtlas(photos: string[], tile: number) {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = tile * ATLAS_GRID;
  const ctx = canvas.getContext("2d")!;
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.minFilter = LinearMipmapLinearFilter;
  texture.magFilter = LinearFilter;
  texture.anisotropy = 4;

  const at = (index: number, draw: (ctx: Ctx) => void) => {
    ctx.save();
    ctx.translate((index % ATLAS_GRID) * tile, Math.floor(index / ATLAS_GRID) * tile);
    ctx.beginPath();
    ctx.rect(0, 0, tile, tile);
    ctx.clip();
    draw(ctx);
    ctx.restore();
  };

  const firstPhoto = ATLAS_TILES - photos.length;
  for (let i = 0; i < ATLAS_TILES; i += 1) at(i, (c) => drawArt(c, tile, i + 1));

  let disposed = false;
  photos.forEach((src, index) => {
    const image = new Image();
    image.decoding = "async";
    image.onload = () => {
      if (disposed) return;
      at(firstPhoto + index, (c) => drawPhoto(c, tile, image));
      texture.needsUpdate = true;
    };
    image.src = src;
  });

  return {
    texture,
    firstPhoto,
    dispose: () => {
      disposed = true;
      texture.dispose();
    },
  };
}
