import type { DeviceKind } from "../components/ui/case-device";
import { profileImages } from "./profile";

export type ServiceExample = {
  brand: string;
  name: string;
  descriptor: string;
  description: string;
  tags: string[];
  image: string;
  host: string;
  link: string | null;
  device: DeviceKind;
};

export type ServicePlan = {
  name: string;
  /** Price range in soles (S/), before IGV. Without `max` it reads "Desde". */
  min: number;
  max?: number;
  /** Recurring monthly fee, when the plan has one. */
  monthly?: number;
  summary: string;
  features: string[];
  featured?: boolean;
};

export type Service = {
  slug: string;
  title: string;
  /** Italic green half of the big title. */
  accent: string;
  /** One-liner used in the home list. */
  summary: string;
  /** Image previewed when hovering the service in the home list. */
  cover: string;
  /** Lowest plan price; derived from `plans`. */
  priceFrom: number;
  delivery: string;
  about: string;
  /** What every plan includes. */
  includes: string[];
  plans: ServicePlan[];
  /** Costs that are quoted apart from the plans. */
  extras: string[];
  factors: { title: string; detail: string }[];
  examples: ServiceExample[];
};

const cover = (name: string) => new URL(`../public/Assets/escenas/${name}.webp`, import.meta.url).href;

const examples = {
  mirasol: { brand: "Grupo Michell", name: "Mirasol", descriptor: "Plataforma web", description: "Experiencia web para la marca de hilados de Grupo Michell: narrativa visual, catálogo y navegación inmersiva.", tags: ["#Plataforma", "#Experiencia"], image: profileImages.mirasol, host: "mirasol.com.pe", link: "https://mirasol.com.pe/intro", device: "laptop" },
  globalVertical: { brand: "Global Vertical", name: "Global Vertical", descriptor: "Web corporativa", description: "Web corporativa para una constructora especializada en trabajos en altura, enfocada en generar confianza y solicitudes de cotización.", tags: ["#Corporativa", "#SEO"], image: profileImages.globalVertical, host: "gvertical.com", link: "https://gvertical.com/", device: "laptop" },
  kuroSushi: { brand: "Kuro", name: "Kuro Sushi", descriptor: "Carta y pedidos", description: "Web del restaurante con carta digital y pedidos directos, sin depender de aplicaciones de terceros.", tags: ["#Pedidos", "#Restaurante"], image: profileImages.kuroSushi, host: "kurosushifusion.com", link: "https://kurosushifusion.com/", device: "laptop" },
  kuroNakama: { brand: "Kuro", name: "Kuro Nakama", descriptor: "App de fidelización", description: "Aplicación de puntos y recompensas para clientes frecuentes, con registro, canje y panel de administración.", tags: ["#Fidelización", "#Panel admin"], image: profileImages.kuroNakama, host: "kuronakama.com", link: "https://kuronakama.com/", device: "laptop" },
  mfh: { brand: "Grupo Michell", name: "MFH Knits", descriptor: "Sistema B2B", description: "Sistema B2B que automatiza la gestión de pedidos y procesos internos entre la empresa y sus clientes corporativos.", tags: ["#Automatización", "#Backend propio"], image: profileImages.mfh, host: "mfhknits.com", link: null, device: "laptop" },
  arteMichell: { brand: "Grupo Michell", name: "Arte Michell", descriptor: "Experiencia digital", description: "Experiencia digital con identidad visual propia y contenido dinámico gestionado desde un backend a medida.", tags: ["#Diseño", "#Backend propio"], image: profileImages.arteMichell, host: "artemichell.com", link: "https://www.artemichell.com/", device: "laptop" },
  alpacaFiesta: { brand: "Evento nacional", name: "Alpaca Fiesta", descriptor: "Landing page", description: "Landing para un evento nacional: información clara, agenda y llamados a la acción pensados para celular.", tags: ["#Landing", "#Evento"], image: profileImages.alpacaFiesta, host: "alpacafiestaperu.com", link: "https://alpacafiestaperu.com/", device: "phone" },
  ayd: { brand: "A&D Grupo", name: "A&D Grupo", descriptor: "Web corporativa", description: "Web corporativa para una concesionaria de servicios integrales: presenta sus líneas de negocio y canaliza solicitudes de cotización.", tags: ["#Corporativa", "#Cotizaciones"], image: profileImages.ayd, host: "aydgrupo.com", link: "https://aydgrupo.com/", device: "laptop" },
  boda: { brand: "Stephany & Julio", name: "Boda Stephany & Julio", descriptor: "Invitación digital", description: "Invitación de boda que se abre como un sobre, con su historia, música, cuenta regresiva, ubicación y confirmación de asistencia.", tags: ["#Invitación", "#Boda"], image: profileImages.bodaMobile, host: "boda-stephany-julio.vercel.app", link: "https://boda-stephany-julio.vercel.app/", device: "phone" },
} satisfies Record<string, ServiceExample>;

const withPrice = (service: Omit<Service, "priceFrom">): Service => ({
  ...service,
  priceFrom: Math.min(...service.plans.map((plan) => plan.min)),
});

export const services: Service[] = [
  {
    slug: "paginas-web",
    title: "Páginas web",
    accent: "a medida",
    summary: "Sitios rápidos y memorables que convierten visitas en clientes.",
    cover: cover("navegador-vidrio"),
    delivery: "Desde 7 días hábiles",
    about: "Diseñamos y desarrollamos tu página web desde cero, con identidad propia, optimizada para Google y lista para recibir clientes por WhatsApp o formulario. Puede ser una web informativa o un sitio con panel administrativo para que actualices tú mismo el contenido.",
    includes: ["Diseño a medida, sin plantillas", "Adaptada a celular, tablet y escritorio", "Botón de WhatsApp y formulario de contacto", "SEO básico y carga rápida", "Certificado SSL", "Capacitación al entregar"],
    plans: [
      { name: "Web informativa", min: 1200, max: 1800, summary: "Para presentar tu negocio y recibir contactos.", features: ["Hasta 6 secciones o páginas", "Landing page o sitio corporativo", "Mapa, redes sociales y WhatsApp", "Textos e imágenes que nos entregas"] },
      { name: "Web administrable", min: 2500, max: 3800, featured: true, summary: "Con panel administrativo para editar tu contenido.", features: ["Hasta 12 páginas", "Panel para cambiar textos, fotos y precios", "Blog, noticias o portafolio de proyectos", "Animaciones a medida"] },
      { name: "Web a medida con sistema", min: 4000, max: 6000, summary: "Con funciones propias programadas desde cero.", features: ["Reservas, área de clientes o usuarios", "Panel administrativo con roles", "Integración con CRM, pagos u otros sistemas", "Escenas 3D y animaciones avanzadas"] },
    ],
    extras: ["Idioma adicional: desde S/ 400", "Dominio .com y hosting: desde S/ 300 al año", "Mantenimiento y cambios: desde S/ 80 al mes"],
    factors: [
      { title: "Páginas y secciones", detail: "Una web de una sola página no cuesta lo mismo que un sitio con varias páginas internas." },
      { title: "Panel administrativo", detail: "Si necesitas editar tú mismo textos, fotos, productos o publicaciones." },
      { title: "Funciones a medida", detail: "Reservas, usuarios, área de clientes o cotizadores programados para tu negocio." },
      { title: "Contenido", detail: "Si necesitas redacción, fotografía o video, o si ya tienes todo listo." },
      { title: "Animaciones y 3D", detail: "Efectos de scroll, animaciones a medida o escenas 3D como las de este sitio." },
      { title: "Idiomas e integraciones", detail: "Cada idioma o sistema conectado (CRM, pagos, mapas) suma trabajo." },
    ],
    examples: [examples.mirasol, examples.arteMichell, examples.ayd, examples.globalVertical, examples.alpacaFiesta],
  },
  {
    slug: "e-commerce",
    title: "E-commerce",
    accent: "que vende",
    summary: "Tiendas online listas para vender, con pagos y gestión simple.",
    cover: cover("producto-celular"),
    delivery: "Desde 3 semanas",
    about: "Creamos tu tienda online con catálogo, carrito y pagos en línea, para que vendas las 24 horas sin depender de marketplaces. Te entregamos un panel simple para gestionar productos, pedidos y stock.",
    includes: ["Catálogo con categorías y buscador", "Carrito y checkout optimizados para celular", "Pagos con tarjeta, Yape y Plin (Culqi, Izipay o Mercado Pago)", "Panel de productos y pedidos", "Avisos de pedido por WhatsApp y correo", "SEO para productos"],
    plans: [
      { name: "Tienda esencial", min: 2500, max: 3500, summary: "Para empezar a vender en línea.", features: ["Hasta 50 productos", "Una pasarela de pago", "Envío con tarifa fija o recojo en tienda", "Cargamos tus primeros 20 productos"] },
      { name: "Tienda profesional", min: 3800, max: 5500, featured: true, summary: "Para catálogos grandes y más ventas.", features: ["Hasta 300 productos con tallas y colores", "Delivery con tarifas por distrito", "Cupones, ofertas y reportes de ventas", "Control de stock"] },
      { name: "Tienda a medida", min: 6000, summary: "Integrada a la operación de tu empresa.", features: ["Inventario en varios almacenes", "Boletas y facturas electrónicas (SUNAT)", "Integración con tu ERP o CRM", "Ventas mayoristas o marketplace"] },
    ],
    extras: ["Mantenimiento y soporte: desde S/ 150 al mes", "Carga de productos adicionales: se cotiza por volumen", "La comisión por venta la cobra cada pasarela de pago"],
    factors: [
      { title: "Cantidad de productos", detail: "Número de productos, categorías y variantes como tallas o colores." },
      { title: "Métodos de pago", detail: "Izipay, Mercado Pago, Culqi, Yape, Plin o transferencia." },
      { title: "Envíos y delivery", detail: "Zonas, tarifas por distrito, recojo en tienda o integración con courier." },
      { title: "Facturación electrónica", detail: "Emisión automática de boletas y facturas conectada a SUNAT." },
      { title: "Carga de productos", detail: "Si cargamos nosotros el catálogo o lo hace tu equipo." },
      { title: "Integraciones", detail: "Conexión con tu sistema de inventario, ERP o redes sociales." },
    ],
    examples: [examples.kuroSushi],
  },
  {
    slug: "apps-moviles",
    title: "Apps móviles",
    accent: "iOS y Android",
    summary: "Aplicaciones iOS y Android con experiencias fluidas.",
    cover: cover("app-en-mano"),
    delivery: "Desde 4 semanas",
    about: "Desarrollamos aplicaciones para iOS y Android con una sola base de código, desde la idea y el diseño hasta la publicación en las tiendas. Si quieres validar tu idea primero, empezamos con una app web que se instala desde el navegador.",
    includes: ["Diseño de experiencia (UX/UI)", "Prototipo navegable antes de programar", "Registro e inicio de sesión", "Panel de administración web", "Pruebas en dispositivos reales", "Código y cuentas a tu nombre"],
    plans: [
      { name: "App web (PWA)", min: 2500, max: 5000, summary: "Se instala desde el navegador, sin pasar por las tiendas.", features: ["Funciona en iOS, Android y computadora", "Ícono en la pantalla de inicio", "Ideal para validar una idea o uso interno", "Hasta 8 pantallas"] },
      { name: "App MVP iOS y Android", min: 8000, max: 15000, featured: true, summary: "Tu primera versión publicada en las tiendas.", features: ["Publicación en App Store y Google Play", "Notificaciones push", "Hasta 15 pantallas", "Base de datos y usuarios"] },
      { name: "App de negocio", min: 15000, max: 35000, summary: "Para productos con pagos e integraciones.", features: ["Pagos y suscripciones dentro de la app", "API propia y roles de usuario", "Mapas, GPS, cámara o QR", "Integración con tus sistemas"] },
    ],
    extras: ["Cuenta de Apple: US$ 99 al año", "Cuenta de Google Play: US$ 25 una sola vez", "Mantenimiento anual: entre 15% y 25% del desarrollo"],
    factors: [
      { title: "Pantallas y funciones", detail: "Cuantas más pantallas y flujos, mayor el desarrollo y las pruebas." },
      { title: "Backend y datos", detail: "Base de datos, usuarios, roles y lógica de negocio a medida." },
      { title: "Pagos en la app", detail: "Cobros, suscripciones o recargas dentro de la aplicación." },
      { title: "Funciones del celular", detail: "Mapas, GPS, cámara, escaneo de QR o trabajo sin conexión." },
      { title: "Publicación", detail: "App web, o publicación y revisión en App Store y Google Play." },
      { title: "Mantenimiento", detail: "Actualizaciones de sistema operativo, mejoras y soporte." },
    ],
    examples: [examples.kuroNakama],
  },
  {
    slug: "ia-y-automatizaciones",
    title: "IA y automatizaciones",
    accent: "que trabajan por ti",
    summary: "Agentes, chatbots y flujos automáticos que hacen crecer tu empresa.",
    cover: cover("automatizacion-flujos"),
    delivery: "Desde 1 semana",
    about: "Implementamos chatbots y agentes de inteligencia artificial entrenados con la información de tu negocio, y automatizamos tareas repetitivas para que tu equipo se enfoque en vender y atender mejor. Se paga una instalación y una mensualidad que cubre el servicio funcionando.",
    includes: ["Entrenado con la información de tu negocio", "Atención automática las 24 horas", "Derivación a una persona cuando hace falta", "Pruebas antes de publicar", "Reportes de conversaciones", "Capacitación a tu equipo"],
    plans: [
      { name: "Asistente de WhatsApp", min: 1500, max: 2500, monthly: 150, summary: "Responde, comparte tu catálogo y agenda citas.", features: ["WhatsApp Business oficial", "Preguntas frecuentes, precios y catálogo", "Agenda de citas o reservas", "Hasta 2 flujos de atención"] },
      { name: "Automatización de procesos", min: 2500, max: 4000, monthly: 250, featured: true, summary: "Conecta tus herramientas y elimina tareas manuales.", features: ["Asistente de IA en WhatsApp o web", "Cotizaciones, pedidos y recordatorios automáticos", "Conexión con Google Sheets, correo o CRM", "Hasta 5 flujos automatizados"] },
      { name: "Agente a medida", min: 6000, monthly: 400, summary: "Integrado a los sistemas de tu empresa.", features: ["Varios canales: WhatsApp, web, Instagram", "Integración con tu CRM, ERP o base de datos", "Panel con métricas y conversaciones", "Flujos ilimitados"] },
    ],
    extras: ["La mensualidad incluye hosting, monitoreo y ajustes", "Uso de IA y mensajes de WhatsApp sobre el límite del plan: según consumo", "Nuevos flujos después de la entrega: se cotizan aparte"],
    factors: [
      { title: "Canales", detail: "WhatsApp, web, Instagram, Messenger o varios a la vez." },
      { title: "Flujos a automatizar", detail: "Cada proceso automatizado (citas, cotizaciones, pedidos) suma configuración." },
      { title: "Integraciones", detail: "Conexión con tu CRM, ERP, agenda, base de datos o sistema propio." },
      { title: "Entrenamiento", detail: "Cantidad de documentos, catálogos y casos que debe aprender la IA." },
      { title: "Volumen de conversaciones", detail: "Define el consumo mensual de la API de IA y de WhatsApp Business." },
      { title: "Soporte mensual", detail: "Ajustes, nuevas respuestas y monitoreo continuo." },
    ],
    examples: [examples.mfh],
  },
  {
    slug: "invitaciones-digitales",
    title: "Invitaciones digitales",
    accent: "que sorprenden",
    summary: "Invitaciones interactivas que sorprenden a tus invitados.",
    cover: cover("novia-invitacion"),
    delivery: "Desde 3 días hábiles",
    about: "Diseñamos invitaciones web a medida para bodas, quinceañeros, cumpleaños y eventos corporativos, no plantillas repetidas: se comparten por WhatsApp con un link y tus invitados confirman asistencia en segundos.",
    includes: ["Diseño personalizado para tu evento", "Música y cuenta regresiva", "Ubicación con Google Maps", "Confirmación de asistencia por WhatsApp", "Link listo para compartir", "Cambios incluidos antes de enviarla"],
    plans: [
      { name: "Invitación esencial", min: 150, max: 250, summary: "Todo lo necesario para tu evento.", features: ["Hasta 5 secciones", "Itinerario y dress code", "Galería de hasta 10 fotos", "Entrega en 3 días hábiles"] },
      { name: "Invitación premium", min: 300, max: 450, featured: true, summary: "Con invitados con nombre y control de asistencia.", features: ["Invitación personalizada por invitado", "Panel para ver quién confirmó", "Mesa de regalos y hospedaje", "Animación de apertura a medida"] },
      { name: "Evento corporativo", min: 600, summary: "Para lanzamientos, congresos y eventos de empresa.", features: ["Registro de asistentes con base de datos", "Acreditación con código QR", "Identidad visual de tu marca", "Agenda y ponentes"] },
    ],
    extras: ["Dominio propio (ej. tu-boda.com): desde S/ 80 al año", "Entrega urgente en 48 horas: +30%"],
    factors: [
      { title: "Secciones", detail: "Itinerario, dress code, mesa de regalos, hospedaje y más." },
      { title: "Animaciones", detail: "Efectos de apertura, transiciones y detalles interactivos." },
      { title: "Lista de invitados", detail: "Invitaciones con nombre y panel para ver quién confirmó." },
      { title: "Fotos y video", detail: "Galerías, video de presentación o sesión de fotos previa." },
      { title: "Dominio propio", detail: "Un link personalizado como tu-boda.com." },
      { title: "Fecha de entrega", detail: "Los pedidos urgentes pueden tener un recargo." },
    ],
    examples: [examples.boda],
  },
].map(withPrice);

export const findService = (slug: string) => services.find((service) => service.slug === slug);

const groupThousands = (value: number) => String(value).replace(/\B(?=(\d{3})+(?!\d))/g, ",");

export const formatPrice = (value: number) => `S/ ${groupThousands(value)}`;

export const formatPlanPrice = (plan: ServicePlan) =>
  plan.max ? `${formatPrice(plan.min)} – ${groupThousands(plan.max)}` : `Desde ${formatPrice(plan.min)}`;
