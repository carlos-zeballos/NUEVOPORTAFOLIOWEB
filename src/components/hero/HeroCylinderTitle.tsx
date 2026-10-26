import { useEffect, useState, type CSSProperties } from "react";
import { introPhases } from "../tunnel/tunnelConfig";
import { heroSignals, onHeroRevealChange } from "./heroSignals";

/** The copy fades in at portalEnd + 0.06; the words rise once it is visible. */
const ENTER_AT = introPhases.portalEnd + 0.07;

const lines = [
  [{ text: "¡Nosotros" }],
  [{ text: "la" }, { text: "construimos!", accent: true }],
];

/** Flat title in the same style as the section headings (word rise + shine on the green word). */
export function HeroCylinderTitle() {
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    const sync = () => {
      if (heroSignals.reveal >= ENTER_AT) setEntered(true);
      else if (heroSignals.reveal < introPhases.portalEnd) setEntered(false);
    };
    sync();
    return onHeroRevealChange(sync);
  }, []);

  let index = 0;
  return (
    <p className={`zt${entered ? " is-entered" : ""}`} aria-hidden="true">
      {lines.map((words, line) => (
        <span className="zt-line" key={line}>
          {words.map(({ text, accent }, i) => (
            <span key={text}>
              {i > 0 && " "}
              <span className="zt-mask">
                <span className={`zt-word${accent ? " is-accent text-shine" : ""}`} style={{ "--i": index++ } as CSSProperties}>{text}</span>
              </span>
            </span>
          ))}
        </span>
      ))}
    </p>
  );
}
