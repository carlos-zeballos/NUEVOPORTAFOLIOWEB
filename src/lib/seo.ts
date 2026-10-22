import { useEffect } from "react";
import type { Service } from "../content/services";
import { HOME_PATH, servicePath } from "./router";

export const SITE_URL = "https://zebware.org";
export const BUSINESS_ID = `${SITE_URL}/#business`;
export const WEBSITE_ID = `${SITE_URL}/#website`;

/** `image` must be a 1200×630 JPEG, matching the og:image size declared in index.html. */
export type PageMeta = { title: string; description: string; path: string; image?: string; imageAlt?: string; type?: "website" | "profile" };

export const absoluteUrl = (path: string) => (path === HOME_PATH ? `${SITE_URL}/` : `${SITE_URL}${path}`);

/** JSON for a `<script type="application/ld+json">`, safe to inline in HTML. */
export const jsonLd = (data: unknown) => JSON.stringify(data).replace(/</g, "\\u003c");

export const metaTags = (url: string, { title, description, image, imageAlt, type }: PageMeta): [string, string, string][] => [
  ['meta[name="description"]', "content", description],
  ['link[rel="canonical"]', "href", url],
  ['link[rel="alternate"][hreflang="es-PE"]', "href", url],
  ['link[rel="alternate"][hreflang="x-default"]', "href", url],
  ['meta[property="og:url"]', "content", url],
  ['meta[property="og:title"]', "content", title],
  ['meta[property="og:description"]', "content", description],
  ['meta[name="twitter:title"]', "content", title],
  ['meta[name="twitter:description"]', "content", description],
  ...(type ? [['meta[property="og:type"]', "content", type] as [string, string, string]] : []),
  ...(image
    ? ([
        ['meta[property="og:image"]', "content", image],
        ['meta[property="og:image:type"]', "content", "image/jpeg"],
        ['meta[name="twitter:image"]', "content", image],
      ] as [string, string, string][])
    : []),
  ...(imageAlt
    ? ([
        ['meta[property="og:image:alt"]', "content", imageAlt],
        ['meta[name="twitter:image:alt"]', "content", imageAlt],
      ] as [string, string, string][])
    : []),
];

/** Keeps title, description, canonical and social tags in sync on client-side navigation. */
export function usePageMeta(meta: PageMeta) {
  const { title, description, path, image, imageAlt, type } = meta;
  useEffect(() => {
    const previousTitle = document.title;
    const changes = metaTags(absoluteUrl(path), { title, description, path, image, imageAlt, type }).flatMap(([selector, attribute, value]) => {
      const element = document.querySelector(selector);
      if (!element) return [];
      const previous = element.getAttribute(attribute);
      element.setAttribute(attribute, value);
      return [{ element, attribute, previous }];
    });
    document.title = title;
    return () => {
      document.title = previousTitle;
      changes.forEach(({ element, attribute, previous }) => previous !== null && element.setAttribute(attribute, previous));
    };
  }, [title, description, path, image, imageAlt, type]);
}

const priceSpecification = (min: number, max?: number) => ({
  "@type": "PriceSpecification",
  priceCurrency: "PEN",
  minPrice: min,
  ...(max ? { maxPrice: max } : {}),
  valueAddedTaxIncluded: false,
});

/** The home page node; the business and website nodes live in index.html for every route. */
export const homePageSchema = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "@id": `${SITE_URL}/#webpage`,
  url: `${SITE_URL}/`,
  name: "Desarrollo Web en Perú | Páginas Web, Apps e IA | Zebware",
  isPartOf: { "@id": WEBSITE_ID },
  about: { "@id": BUSINESS_ID },
  inLanguage: "es-PE",
  primaryImageOfPage: `${SITE_URL}/og-image.png`,
};

/** Service, its plans as offers, the page and its breadcrumb. */
export function serviceSchema(service: Service, meta: PageMeta, image?: string) {
  const url = absoluteUrl(servicePath(service.slug));
  const prices = service.plans.flatMap((plan) => [plan.min, plan.max ?? plan.min]);
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Service",
        "@id": `${url}#service`,
        name: `${service.title} ${service.accent}`,
        serviceType: service.title,
        description: service.about,
        url,
        ...(image ? { image } : {}),
        provider: { "@id": BUSINESS_ID },
        areaServed: { "@type": "Country", name: "Perú" },
        availableChannel: { "@type": "ServiceChannel", serviceUrl: url, availableLanguage: ["es", "en"] },
        offers: {
          "@type": "AggregateOffer",
          priceCurrency: "PEN",
          lowPrice: Math.min(...prices),
          highPrice: Math.max(...prices),
          offerCount: service.plans.length,
          offers: service.plans.map((plan) => ({
            "@type": "Offer",
            name: plan.name,
            description: `${plan.summary} ${plan.features.join(". ")}.`,
            url: `${url}#cotizar`,
            priceCurrency: "PEN",
            price: plan.min,
            priceSpecification: plan.monthly
              ? [priceSpecification(plan.min, plan.max), { "@type": "UnitPriceSpecification", priceCurrency: "PEN", price: plan.monthly, unitCode: "MON", referenceQuantity: { "@type": "QuantitativeValue", value: 1, unitCode: "MON" }, valueAddedTaxIncluded: false }]
              : priceSpecification(plan.min, plan.max),
            seller: { "@id": BUSINESS_ID },
          })),
        },
      },
      {
        "@type": "WebPage",
        "@id": `${url}#webpage`,
        url,
        name: meta.title,
        description: meta.description,
        inLanguage: "es-PE",
        isPartOf: { "@id": WEBSITE_ID },
        about: { "@id": `${url}#service` },
        breadcrumb: { "@id": `${url}#breadcrumb` },
        ...(image ? { primaryImageOfPage: image } : {}),
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${url}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Inicio", item: `${SITE_URL}/` },
          { "@type": "ListItem", position: 2, name: service.title, item: url },
        ],
      },
    ],
  };
}

/** Catalog of every service, linked from the business entity in index.html. */
export function catalogSchema(services: Service[]) {
  return {
    "@context": "https://schema.org",
    "@type": "OfferCatalog",
    "@id": `${SITE_URL}/#catalog`,
    name: "Servicios digitales Zebware",
    itemListElement: services.map((service) => {
      const url = absoluteUrl(servicePath(service.slug));
      return {
        "@type": "Offer",
        url,
        priceSpecification: priceSpecification(service.priceFrom),
        itemOffered: { "@type": "Service", "@id": `${url}#service`, name: service.title, description: service.summary, areaServed: "PE", url },
      };
    }),
  };
}
