import { FullScreenScrollFX, type FullScreenFXSection } from "../ui/full-screen-scroll-fx";

const atmospheres = [
  "radial-gradient(circle at 72% 42%,rgba(3,234,0,.16),transparent 28%),linear-gradient(125deg,#020303 10%,#0a110d 62%,#030504)",
  "radial-gradient(circle at 26% 62%,rgba(210,225,216,.1),transparent 32%),linear-gradient(145deg,#030504,#101512 58%,#040605)",
  "radial-gradient(circle at 50% 35%,rgba(3,234,0,.1),transparent 22%),linear-gradient(115deg,#020303,#08100a 52%,#030504)",
  "radial-gradient(circle at 78% 72%,rgba(120,145,132,.12),transparent 28%),linear-gradient(135deg,#050706,#0b0f0c 48%,#020303)",
];

const sections: FullScreenFXSection[] = [
  { id: "strategy", leftLabel: "Estrategia", title: <>Ideas que <em>impactan</em></>, rightLabel: "Dirección" },
  { id: "experience", leftLabel: "Diseño", title: <>Experiencias que <em>conectan</em></>, rightLabel: "Usuarios" },
  { id: "technology", leftLabel: "Tecnología", title: <>Sistemas que <em>escalan</em></>, rightLabel: "Precisión" },
  { id: "results", leftLabel: "Impacto", title: <>Resultados que <em>importan</em></>, rightLabel: "Crecimiento" },
].map((section, index) => ({ ...section, renderBackground: () => <div style={{ background: atmospheres[index] }} /> }));

export function LayeredTextSection() {
  return (
    <section id="layered-section" className="relative bg-[#030504]">
      <FullScreenScrollFX
        sections={sections}
        header={<><span>¿Por qué</span><span>Zebware?</span></>}
        footer={<span>Diseñamos para avanzar</span>}
        colors={{ text: "rgba(245,248,246,.94)", overlay: "rgba(2,4,3,.18)", pageBg: "#030504", stageBg: "#030504" }}
        ariaLabel="Por qué elegir Zebware"
      />
    </section>
  );
}
