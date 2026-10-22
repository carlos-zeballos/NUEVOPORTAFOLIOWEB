import { useEffect, useMemo, useState } from "react";
import { introPhases } from "../tunnel/tunnelConfig";
import { heroSignals } from "./heroSignals";

const words = ["¡NOSOTROS LA CONSTRUIMOS!"];
const FONT = '"Archivo Black", "Arial Black", sans-serif';
const OUT_MS = 380;
const CYCLE_MS = 4600;

type Glyph = { char: string; x: number; z: number; ry: number; w: number; line: number; accent: boolean };

const splitLines = (word: string) => {
  const space = word.indexOf(" ");
  return space < 0 ? [word] : [word.slice(0, space), word.slice(space + 1)];
};

function layout(word: string, fontSize: number): Glyph[] {
  const ctx = document.createElement("canvas").getContext("2d");
  if (!ctx) return [];
  ctx.font = `400 ${fontSize}px ${FONT}`;
  const tracking = -0.02 * fontSize;
  const lines = splitLines(word);
  return lines.flatMap((text, line) => {
    const widths = Array.from(text).map((char) => ctx.measureText(char).width + tracking);
    const total = widths.reduce((sum, w) => sum + w, 0);
    const radius = total * 0.9;
    let cursor = -total / 2;
    return Array.from(text).map((char, i) => {
      const center = cursor + widths[i] / 2;
      cursor += widths[i];
      const theta = center / radius;
      return { char, line, accent: lines.length > 1 && line === lines.length - 1, w: widths[i], x: total / 2 + radius * Math.sin(theta), z: radius * (1 - Math.cos(theta)), ry: (-theta * 180) / Math.PI };
    });
  });
}

export function HeroCylinderTitle() {
  const [index, setIndex] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const [fontSize, setFontSize] = useState(0);
  const word = words[index];

  useEffect(() => {
    const measure = () => {
      const mobile = window.innerWidth < 768;
      const base = Math.min(window.innerWidth * (mobile ? 0.14 : 0.075), 112);
      const ctx = document.createElement("canvas").getContext("2d");
      let widest = 0;
      if (ctx) {
        ctx.font = `400 ${base}px ${FONT}`;
        widest = Math.max(...words.flatMap(splitLines).map((line) => ctx.measureText(line).width * 0.98));
      }
      const fit = widest ? (window.innerWidth * (mobile ? 0.88 : 0.44)) / widest : 1;
      setFontSize(Math.round(base * Math.min(1, fit)));
    };
    measure();
    document.fonts?.load(`400 40px ${FONT}`).then(measure).catch(() => undefined);
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  useEffect(() => {
    if (words.length < 2) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let current = 0;
    let outTimer = 0;
    const advance = () => {
      if (!heroSignals.running || heroSignals.reveal < introPhases.heroReady) return;
      current = (current + 1) % words.length;
      heroSignals.featured = current;
      heroSignals.featuredAt = performance.now();
      const next = current;
      window.clearTimeout(outTimer);
      if (reduced) {
        setIndex(next);
        return;
      }
      setLeaving(true);
      outTimer = window.setTimeout(() => {
        setIndex(next);
        setLeaving(false);
      }, OUT_MS);
    };
    const cycle = window.setInterval(advance, CYCLE_MS);
    return () => {
      window.clearInterval(cycle);
      window.clearTimeout(outTimer);
    };
  }, []);

  const glyphs = useMemo(() => (fontSize ? layout(word, fontSize) : []), [word, fontSize]);

  return (
    <div className={`zt${leaving ? " is-leaving" : ""}`} aria-hidden="true" style={fontSize ? { fontSize } : undefined}>
      {glyphs.length ? (
        <div className="zt-stage" key={word}>
          {glyphs.map((glyph, i) => (
            <span key={i} className={`zt-char${glyph.accent ? " is-accent" : ""}`} style={{ transform: `translate3d(${(glyph.x - glyph.w / 2).toFixed(1)}px,${glyph.line}em,${glyph.z.toFixed(1)}px) rotateY(${glyph.ry.toFixed(2)}deg)` }}>
              <i style={{ animationDelay: `${i * 26}ms` }}>{glyph.char === " " ? "\u00a0" : glyph.char}</i>
            </span>
          ))}
        </div>
      ) : (
        <span className="zt-fallback">{word}</span>
      )}
    </div>
  );
}
