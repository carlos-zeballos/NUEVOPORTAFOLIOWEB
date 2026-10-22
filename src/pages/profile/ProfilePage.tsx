import { ProfileLoader } from "./ProfileLoader";
import { ProfileNav } from "./ProfileNav";
import { ProfileHero } from "./ProfileHero";
import { CompaniesMarquee } from "./CompaniesMarquee";
import { ProfileIntro } from "./ProfileIntro";
import { ProfileProjects } from "./ProfileProjects";
import { ProfileZebware } from "./ProfileZebware";
import { ProfileRoute } from "./ProfileRoute";
import { ProfileAchievements } from "./ProfileAchievements";
import { ProfileFooter } from "./ProfileFooter";
import { contact, socials } from "../../content/site";
import { profileImages, projects } from "../../content/profile";
import { PROFILE_PATH } from "../../lib/router";
import { BUSINESS_ID, jsonLd, SITE_URL, usePageMeta, type PageMeta } from "../../lib/seo";
import "./profile.css";

export const profileMeta: PageMeta = {
  path: PROFILE_PATH,
  title: "Carlos Zeballos | Desarrollador Full Stack en Arequipa, Perú",
  description: "Carlos Zeballos, desarrollador full stack en Arequipa y fundador de Zebware. Proyectos para Grupo Michell, A&D y Kuro, stack, certificaciones y CV.",
  image: `${SITE_URL}/og/perfil.jpg`,
  imageAlt: "Carlos Zeballos, desarrollador full stack en Arequipa, Perú",
  type: "profile",
};

const personSchema = {
  "@type": "Person",
  "@id": `${SITE_URL}/perfil#person`,
  name: "Carlos Fernando Zeballos Chávez",
  alternateName: "Carlos Zeballos",
  jobTitle: "Desarrollador Full Stack",
  url: `${SITE_URL}/perfil`,
  image: new URL(profileImages.carlos, SITE_URL).href,
  email: `mailto:${contact.email}`,
  address: { "@type": "PostalAddress", addressLocality: "Arequipa", addressCountry: "PE" },
  worksFor: { "@id": BUSINESS_ID },
  alumniOf: [
    { "@type": "CollegeOrUniversity", name: "Universidad Católica San Pablo" },
    { "@type": "EducationalOrganization", name: "Instituto IDAT" },
  ],
  knowsAbout: ["JavaScript", "TypeScript", "Node.js", "React", "Angular", "PostgreSQL", "APIs REST", "Inteligencia artificial"],
  sameAs: socials.filter(({ label }) => label === "LinkedIn" || label === "GitHub").map(({ href }) => href),
};

const profileSchema = jsonLd({
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "ProfilePage",
      "@id": `${SITE_URL}/perfil#webpage`,
      url: `${SITE_URL}/perfil`,
      name: profileMeta.title,
      description: profileMeta.description,
      inLanguage: "es-PE",
      isPartOf: { "@id": `${SITE_URL}/#website` },
      mainEntity: { "@id": personSchema["@id"] },
      hasPart: projects.filter((project) => project.link).map((project) => ({ "@type": "CreativeWork", name: project.title, description: project.tags, url: project.link, creator: { "@id": personSchema["@id"] } })),
    },
    personSchema,
  ],
});

export function ProfilePage() {
  usePageMeta(profileMeta);

  return (
    <div className="pf-root relative isolate min-h-screen font-sora text-[#f5f7f5]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: profileSchema }} />
      <ProfileLoader />
      <ProfileNav />
      <main>
        <ProfileHero />
        <CompaniesMarquee />
        <ProfileIntro />
        <ProfileProjects />
        <ProfileZebware />
        <ProfileRoute />
        <ProfileAchievements />
      </main>
      <ProfileFooter />
    </div>
  );
}
