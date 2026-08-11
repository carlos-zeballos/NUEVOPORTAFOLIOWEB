import { Button } from "./ui/button";

const links = [
  ["Servicios", "servicios"],
  ["Nosotros", "nosotros"],
  ["Proyectos", "proyectos"],
  ["Equipo", "equipo"],
  ["Contacto", "contacto"],
];

export function Navbar() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 flex items-center justify-between px-6 py-5 md:px-8 lg:px-16">
      <a href="#inicio" className="text-xl font-bold lowercase tracking-[-0.04em] text-foreground" aria-label="Zebware, inicio">
        <span className="text-primary">[</span> zebware <span className="text-primary">]</span>
      </a>
      <nav className="hidden items-center gap-8 md:flex" aria-label="Navegación principal">
        {links.map(([label, section]) => (
          <a key={section} href={`#${section}`} className="text-xs uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-foreground">
            {label}
          </a>
        ))}
      </nav>
      <Button variant="navCta" size="lg" className="hidden rounded-lg px-6 text-xs uppercase tracking-widest md:inline-flex">
        Cotizar
      </Button>
    </header>
  );
}
