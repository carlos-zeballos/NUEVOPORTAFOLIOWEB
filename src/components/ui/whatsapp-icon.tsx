import type { SVGProps } from "react";
import { siWhatsapp } from "simple-icons";

type IconProps = SVGProps<SVGSVGElement> & { strokeWidth?: number | string };

export function WhatsAppIcon({ strokeWidth: _strokeWidth, ...props }: IconProps) {
  return <svg viewBox="0 0 24 24" fill="currentColor" {...props}><path d={siWhatsapp.path} /></svg>;
}
