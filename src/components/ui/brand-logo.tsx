import { cn } from "../../lib/utils";

const logoUrl = new URL("../../public/Assets/zebware-logo.webp", import.meta.url).href;

export function BrandLogo({ className, loading }: { className?: string; loading?: "lazy" | "eager" }) {
  return <img src={logoUrl} alt="Zebware" width={546} height={128} loading={loading} decoding="async" className={cn("inline-block h-[1em] w-auto select-none", className)} draggable={false} />;
}
