import { Mail } from "lucide-react";
import { contact } from "../content/site";
import { WhatsAppIcon } from "./ui/whatsapp-icon";

type ContactIconsProps = {
  whatsapp?: string;
  className?: string;
  linkClassName?: string;
  iconClassName?: string;
  tabIndex?: number;
};

export function ContactIcons({ whatsapp = contact.whatsapp, className = "flex gap-2", linkClassName = "", iconClassName = "h-4 w-4", tabIndex }: ContactIconsProps) {
  return (
    <span className={className}>
      <a href={whatsapp} target="_blank" rel="noreferrer" aria-label="Escribir por WhatsApp" title="WhatsApp" tabIndex={tabIndex} className={linkClassName}>
        <WhatsAppIcon className={iconClassName} aria-hidden="true" />
      </a>
      <a href={`mailto:${contact.email}`} aria-label="Enviar un correo" title="Correo" tabIndex={tabIndex} className={linkClassName}>
        <Mail className={iconClassName} strokeWidth={1.7} aria-hidden="true" />
      </a>
    </span>
  );
}
