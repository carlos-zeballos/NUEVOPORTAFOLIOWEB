import { companies } from "../../content/profile";

type Company = (typeof companies)[number];

const LOGO_AREA = 4200;
const logoHeight = (ratio: number) => Math.min(62, Math.max(26, Math.round(Math.sqrt(LOGO_AREA / ratio))));

function CompanyMark({ company, hidden }: { company: Company; hidden?: boolean }) {
  const height = Math.round(logoHeight(company.ratio) * (company.scale ?? 1));
  const size = { height, width: Math.round(height * company.ratio) };
  return <img className="pf-logo" src={company.logo} alt={hidden ? "" : company.name} style={size} loading="lazy" decoding="async" draggable={false} />;
}

export function CompaniesMarquee() {
  return (
    <section aria-labelledby="pf-companies-title" className="border-y border-white/[0.08] py-[clamp(2.5rem,6vh,3.75rem)]">
      <h2 id="pf-companies-title" className="pf-shell pf-eyebrow mb-9">Empresas que participaron en mi vida profesional</h2>
      <div className="pf-marquee-wrap pf-fade-x overflow-hidden">
        <ul className="pf-marquee items-center">
          {companies.map((company) => <li key={company.name} className="flex h-16 items-center px-[clamp(1.75rem,3.4vw,3.25rem)]"><CompanyMark company={company} /></li>)}
          {companies.map((company) => <li key={`${company.name}-copy`} className="flex h-16 items-center px-[clamp(1.75rem,3.4vw,3.25rem)]" aria-hidden="true"><CompanyMark company={company} hidden /></li>)}
        </ul>
      </div>
    </section>
  );
}
