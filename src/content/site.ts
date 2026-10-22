import { Github, Instagram, Linkedin } from "lucide-react";
import { WhatsAppIcon } from "../components/ui/whatsapp-icon";

export const contact = {
  whatsapp: "https://wa.me/51946691999?text=Hola%20Zebware%2C%20quiero%20cotizar%20un%20proyecto",
  phone: "+51 946 691 999",
  email: "carlos.fernando.zeballos@gmail.com",
  city: "Arequipa, Perú",
};

export const socials = [
  { href: "https://wa.me/51946691999", label: "WhatsApp", Icon: WhatsAppIcon },
  { href: "https://instagram.com/zebware.pe", label: "Instagram", Icon: Instagram },
  { href: "https://www.linkedin.com/in/carlos-zeballos-28500a202/", label: "LinkedIn", Icon: Linkedin },
  { href: "https://github.com/carlos-zeballos", label: "GitHub", Icon: Github },
];

export const faqs = [
  {
    question: "¿Cuánto cuesta una página web en Perú?",
    answer: "Una web informativa cuesta entre S/ 1,200 y 1,800, y una web con panel administrativo entre S/ 2,500 y 3,800 (sin IGV). Como referencia: tiendas online desde S/ 2,500, apps desde S/ 2,500 (app web) o S/ 8,000 (publicada en tiendas), asistentes de IA desde S/ 1,500 más mensualidad e invitaciones digitales desde S/ 150. El precio final depende del alcance: número de páginas, panel administrativo, integraciones o pagos. Te enviamos una cotización clara y sin costo en menos de 24 horas.",
  },
  {
    question: "¿Cuánto tarda en estar lista mi web?",
    answer: "Una página web estándar suele entregarse desde siete días hábiles desde el inicio acordado. Proyectos más grandes, como e-commerce, apps o integraciones, pueden tomar más tiempo; siempre fijamos la fecha de entrega antes de comenzar.",
  },
  {
    question: "¿Qué servicios ofrece Zebware?",
    answer: "Diseñamos y desarrollamos páginas web, tiendas online (e-commerce), aplicaciones móviles para iOS y Android, soluciones de inteligencia artificial y automatizaciones como chatbots y agentes, software a medida e invitaciones digitales.",
  },
  {
    question: "¿Trabajan con clientes fuera de Arequipa o del Perú?",
    answer: "Sí. Atendemos a empresas de Lima, Arequipa, Cusco, Trujillo y de todo el Perú, además de clientes del extranjero, de forma remota, con videollamadas, avances compartidos y comunicación directa por WhatsApp o correo.",
  },
  {
    question: "¿Cómo se realiza el pago?",
    answer: "En Perú trabajamos con un adelanto al inicio y el saldo a la entrega, por Yape, Plin o transferencia bancaria. Para clientes del extranjero usamos transferencia internacional o la plataforma que acordemos.",
  },
  {
    question: "¿Qué necesito para empezar?",
    answer: "Solo tu idea, tu logotipo si ya lo tienes y algunas referencias que te gusten. Si te falta contenido, lo definimos juntos en la reunión inicial y te ayudamos a prepararlo.",
  },
  {
    question: "¿Puedo actualizar mi web después de la entrega?",
    answer: "Sí. Te entregamos tu web lista para crecer, con indicaciones para cambios simples, y ofrecemos un plan de mantenimiento mensual para actualizaciones, mejoras y soporte.",
  },
];
