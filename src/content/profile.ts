import { siAngular, siClaude, siDocker, siExpress, siGit, siJavascript, siMysql, siN8n, siNestjs, siNodedotjs, siPostgresql, siReact, siSupabase, siTailwindcss, siTypescript } from "simple-icons";

export const profileImages = {
  carlos: new URL("../public/Assets/perfil/carlos-dark.webp", import.meta.url).href,
  mfh: new URL("../public/Assets/perfil/mfh.webp", import.meta.url).href,
  mirasol: new URL("../public/Assets/perfil/mirasol.webp", import.meta.url).href,
  arteMichell: new URL("../public/Assets/perfil/arte-michell.webp", import.meta.url).href,
  alpacaFiesta: new URL("../public/Assets/perfil/alpaca-fiesta.webp", import.meta.url).href,
  kuroNakama: new URL("../public/Assets/perfil/kuro-nakama.webp", import.meta.url).href,
  kuroSushi: new URL("../public/Assets/perfil/kuro-sushi.webp", import.meta.url).href,
  globalVertical: new URL("../public/Assets/perfil/global-vertical.webp", import.meta.url).href,
  ayd: new URL("../public/Assets/perfil/ayd-grupo.webp", import.meta.url).href,
  boda: new URL("../public/Assets/perfil/boda-stephany-julio.webp", import.meta.url).href,
  bodaMobile: new URL("../public/Assets/screens/boda.webp", import.meta.url).href,
  heroVideoWebm: new URL("../public/Assets/perfil/hero-arequipa.webm", import.meta.url).href,
  heroVideoMp4: new URL("../public/Assets/perfil/hero-arequipa.mp4", import.meta.url).href,
  heroPoster: new URL("../public/Assets/perfil/hero-arequipa.webp", import.meta.url).href,
  studioVideo: new URL("../public/Assets/firefly-scroll-desktop.webm", import.meta.url).href,
  /** H.264 copy listed first: iOS Safari plays WebM unreliably. */
  studioVideoMp4: new URL("../public/Assets/firefly-scroll-desktop.mp4", import.meta.url).href,
};

export const profileNav = [
  { label: "Inicio", href: "#pf-inicio" },
  { label: "Proyectos", href: "#pf-proyectos" },
  { label: "Sobre mí", href: "#pf-sobre-mi" },
  { label: "Zebware", href: "#pf-zebware" },
  { label: "Ruta", href: "#pf-ruta" },
  { label: "Contacto", href: "#pf-contacto" },
];

export const heroWords = [
  { word: "webs", image: profileImages.kuroSushi },
  { word: "sistemas", image: profileImages.mfh },
  { word: "apps", image: profileImages.kuroNakama },
  { word: "plataformas", image: profileImages.mirasol },
];

const companyLogo = (file: string) => new URL(`../public/Assets/logos/${file}`, import.meta.url).href;

/** `ratio` is the logo's width / height, used to give every mark the same visual weight; `scale` compensates thin or airy artwork. */
export const companies: { name: string; logo: string; ratio: number; scale?: number }[] = [
  { name: "Kuro Sushi Fusion", logo: companyLogo("kuro.webp"), ratio: 1.66 },
  { name: "Arte Michell", logo: companyLogo("arte-michell.svg"), ratio: 5.32, scale: 1.4 },
  { name: "Mirasol", logo: companyLogo("mirasol.webp"), ratio: 4.44 },
  { name: "MFH Knits", logo: companyLogo("mfh-knits.svg"), ratio: 2.67 },
  { name: "Alpaca Fiesta", logo: companyLogo("alpaca-fiesta.webp"), ratio: 0.73 },
  { name: "ODAM Clínica odontológica", logo: companyLogo("odam.webp"), ratio: 1.34 },
  { name: "Universidad Católica San Pablo", logo: companyLogo("ucsp.svg"), ratio: 2.33 },
  { name: "IDAT", logo: companyLogo("idat.svg"), ratio: 0.6 },
  { name: "Asociación Internacional de la Alpaca", logo: companyLogo("aia.svg"), ratio: 1.88 },
];

export const introText =
  "Más de cinco años liderando equipos me enseñaron a convertir problemas reales en *soluciones simples.* Hoy construyo aplicaciones web de *punta a punta,* del requisito al despliegue, para empresas que necesitan que su tecnología *funcione.* Desde Arequipa para todo el Perú.";

export const introStats = [
  { value: 5, suffix: "+", decimals: 0, label: "Años liderando equipos" },
  { value: 1.5, suffix: "+", decimals: 1, label: "Años como full stack" },
  { value: 18.27, suffix: "", decimals: 2, label: "Promedio ponderado IDAT" },
  { value: 9, suffix: "/351", decimals: 0, label: "Décimo superior IDAT" },
];

export const projects = [
  { title: "MFH Knits", tags: "Grupo Michell · Sistema B2B", image: profileImages.mfh, link: null },
  { title: "Mirasol", tags: "Grupo Michell · Plataforma", image: profileImages.mirasol, link: "https://mirasol.com.pe/intro" },
  { title: "Arte Michell", tags: "Plataforma · Backend propio", image: profileImages.arteMichell, link: "https://www.artemichell.com/" },
  { title: "Alpaca Fiesta", tags: "Landing · Evento nacional", image: profileImages.alpacaFiesta, link: "https://alpacafiestaperu.com/" },
  { title: "Kuro Nakama", tags: "Fidelización · App web", image: profileImages.kuroNakama, link: "https://kuronakama.com/" },
  { title: "Kuro Sushi", tags: "Web · Restaurante", image: profileImages.kuroSushi, link: "https://kurosushifusion.com/" },
  { title: "Global Vertical", tags: "Web corporativa", image: profileImages.globalVertical, link: "https://gvertical.com/" },
  { title: "A&D Grupo", tags: "Web corporativa · Concesionaria", image: profileImages.ayd, link: "https://aydgrupo.com/" },
  { title: "Boda Stephany & Julio", tags: "Invitación digital", image: profileImages.boda, link: "https://boda-stephany-julio.vercel.app/" },
];

export const studioStats = [
  { value: 8, suffix: "+", label: "Proyectos entregados" },
  { value: 5, suffix: "", label: "Clientes corporativos" },
  { value: 2, suffix: "", label: "Días para resolver un hackeo" },
];

export const methods = ["Scrum", "Kanban", "Jira", "Trello"];

export const route = [
  {
    title: "Desarrollador Full Stack",
    org: "Zebware · Freelance",
    period: "Jul 2025 — Actualidad",
    description: "Aplicaciones de punta a punta para Grupo Michell, Conceptual Estudio Creativo, Global Vertical Construction, Concesionaria A&D y la Asociación Internacional de la Alpaca.",
  },
  {
    title: "Director General y Fundador",
    org: "Kuro Sushi Fusion",
    period: "Jul 2018 — Actualidad",
    description: "Dirijo estrategia, finanzas, operaciones y equipo. Incrementé la rentabilidad en 25% y desarrollé los sistemas digitales de pedidos y fidelización.",
  },
  {
    title: "Administrador de Operaciones Comerciales",
    org: "QHATUM E.I.R.L.",
    period: "Ago 2024 — Ago 2025",
    description: "Operaciones, inventarios, ventas y proveedores, con herramientas digitales de seguimiento y comunicación en inglés con clientes internacionales.",
  },
  {
    title: "Coordinador de Gestión y Apoyo Comunitario",
    org: "Clínica Odontológica ODAM",
    period: "Ene 2021 — Dic 2023",
    description: "Digitalización de registros clínicos, documentación, cobranza y seguimiento financiero de seguros dentales.",
  },
  {
    title: "Desarrollo de Sistemas Front-end y Back-end",
    org: "Instituto IDAT",
    period: "2023 — 2026",
    description: "Último ciclo con promedio de 18.27/20. Cursando Inteligencia Artificial, Aplicaciones Seguras y Aplicaciones en la Nube.",
  },
  {
    title: "Licenciado en Administración de Empresas",
    org: "Universidad Católica San Pablo",
    period: "2014 — 2020 · Título 2024",
    description: "La base de negocio que hoy aplico para que cada sistema responda a un objetivo real de la empresa.",
  },
];

export const techMarquee = [siJavascript, siTypescript, siNodedotjs, siExpress, siNestjs, siReact, siAngular, siPostgresql, siMysql, siSupabase, siDocker, siGit, siTailwindcss, siN8n, siClaude];

export const achievements = [
  { award: "Décimo superior del programa", detail: "Puesto 9 de 351 · Ciclo 2025-I", year: "2025", org: "IDAT" },
  { award: "Promedio ponderado 18.27/20", detail: "20/20 en Desarrollo de Interfaces 2 e Innovación y Transformación Digital", year: "Actual", org: "IDAT" },
  { award: "Programa de Actualización en Gestión de Base de Datos con SQL", detail: "168 horas · 20/20 · 13 oct — 9 nov", year: "2025", org: "SKILL" },
  { award: "Curso de Actualización en MySQL", detail: "56 horas · 20/20", year: "2025", org: "SKILL" },
  { award: "Curso de Actualización en PostgreSQL", detail: "56 horas · 20/20", year: "2025", org: "SKILL" },
  { award: "Curso de Actualización en SQL Server", detail: "56 horas · 20/20", year: "2025", org: "SKILL" },
  { award: "Ofimática Intermedia", detail: "120 horas · 17/20 · 3 jun — 30 ago · Instituto de Informática", year: "2024", org: "UNSA" },
  { award: "SAP MM — Gestión de Logística y Materiales (Key User)", detail: "30 horas", year: "2021", org: "Prime Institute" },
  { award: "Excel Negocios (Básico, Intermedio y Avanzado)", detail: "30 horas", year: "2021", org: "Prime Institute" },
  { award: "Gestión de Proyectos — Project Management", detail: "24 horas", year: "2021", org: "Prime Institute" },
  { award: "Power BI — Power Business Intelligence", detail: "24 horas", year: "2021", org: "Prime Institute" },
  { award: "Especialización (PED) en Finanzas", detail: "165 horas académicas · 10 créditos · 17 may — 27 oct", year: "2021", org: "UCSP" },
  { award: "Diplomado en Gestión Pública", detail: "Diplomado", year: "2024", org: "ENADEP" },
  { award: "Diplomado en Políticas Públicas y Gestión Estatal", detail: "Diplomado", year: "2025", org: "ENADEP" },
];
