import { cn } from "../../lib/utils";

const logoUrl = new URL("../../public/Assets/zebware-logo.png", import.meta.url).href;

export function BrandLogo({ className }: { className?: string }) {
  return <img src={logoUrl} alt="Zebware" width={1100} height={258} decoding="async" className={cn("inline-block h-[1em] w-auto select-none", className)} draggable={false} />;
}
