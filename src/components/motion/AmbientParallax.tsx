import { useEffect, useRef } from "react";
import { heroSignals, onHeroRevealChange, onHeroRunningChange } from "../hero/heroSignals";
import { TUNNEL_HIDDEN_AT } from "../tunnel/tunnelConfig";

export function AmbientParallax() {
  const grainRef = useRef<HTMLDivElement>(null);

  /** The grain sits above the hero; over the bright tunnel panels it reads as TV static. */
  useEffect(() => {
    const grain = grainRef.current;
    if (!grain) return;
    const sync = () => {
      const overTunnel = heroSignals.running && heroSignals.reveal < TUNNEL_HIDDEN_AT;
      grain.style.display = overTunnel ? "none" : "";
    };
    sync();
    const offReveal = onHeroRevealChange(sync);
    const offRunning = onHeroRunningChange(sync);
    return () => {
      offReveal();
      offRunning();
    };
  }, []);

  return (
    <div className="ambient-parallax" aria-hidden="true">
      <div ref={grainRef} className="ambient-grain" />
    </div>
  );
}
