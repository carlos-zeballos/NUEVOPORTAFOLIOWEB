import { forwardRef } from "react";

export const PANEL_WIDTHS = [8, 13, 9, 17, 11, 10, 12, 9, 11] as const;

function PanelLayer({ color, type }: { color: string; type: "white" | "black" }) {
  let offset = 0;

  return PANEL_WIDTHS.map((width, index) => {
    const left = offset;
    offset += width;

    return (
      <div
        key={`${type}-${index}`}
        data-transition-panel={type}
        className="will-change-transform"
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: `${left}%`,
          width: `calc(${width}% + 2px)`,
          backgroundColor: color,
        }}
      />
    );
  });
}

export const PageTransitionOverlay = forwardRef<HTMLDivElement>((_, ref) => {
  return (
    <div
      ref={ref}
      data-page-transition-overlay
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100dvh",
        overflow: "hidden",
        zIndex: 99999,
        pointerEvents: "none",
        opacity: 0,
        visibility: "hidden",
      }}
    >
      <div style={{ position: "absolute", inset: 0, zIndex: 10 }}><PanelLayer color="#0B0F0C" type="white" /></div>
      <div style={{ position: "absolute", inset: 0, zIndex: 20 }}><PanelLayer color="#030504" type="black" /></div>
    </div>
  );
});

PageTransitionOverlay.displayName = "PageTransitionOverlay";
