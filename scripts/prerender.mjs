import { mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { basename, dirname, extname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { createServer } from "vite";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const dist = resolve(root, "dist");
const builtAssets = readdirSync(resolve(dist, "assets"));

const toBuiltAsset = (fileUrl) => {
  const path = decodeURIComponent(fileUrl.replace("file://", ""));
  const ext = extname(path);
  const stem = basename(path, ext).replace(/[^\w. -]/g, "_");
  const match = builtAssets.find((name) => name.startsWith(`${stem}-`) && name.endsWith(ext));
  return match ? `/assets/${match}` : "";
};

const logError = console.error;
console.error = (message, ...rest) => {
  if (typeof message === "string" && message.includes("useLayoutEffect does nothing on the server")) return;
  logError(message, ...rest);
};

const escapeAttr = (value) => value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

const withMeta = (html, { title, description, url, image, imageAlt, type }) => {
  let out = html
    .replace(/<title>[^<]*<\/title>/, `<title>${escapeAttr(title)}</title>`)
    .replace(/(<meta name="description" content=")[^"]*/, `$1${escapeAttr(description)}`)
    .replace(/(<link rel="canonical" href=")[^"]*/, `$1${url}`)
    .replace(/(<link rel="alternate" hreflang="[^"]+" href=")[^"]*/g, `$1${url}`)
    .replace(/(<meta property="og:url" content=")[^"]*/, `$1${url}`)
    .replace(/(<meta (?:property="og|name="twitter):title" content=")[^"]*/g, `$1${escapeAttr(title)}`)
    .replace(/(<meta (?:property="og|name="twitter):description" content=")[^"]*/g, `$1${escapeAttr(description)}`);
  if (type) out = out.replace(/(<meta property="og:type" content=")[^"]*/, `$1${type}`);
  if (image) {
    out = out
      .replace(/(<meta (?:property="og|name="twitter):image" content=")[^"]*/g, `$1${image}`)
      .replace(/(<meta property="og:image:type" content=")[^"]*/, "$1image/jpeg");
  }
  if (imageAlt) out = out.replace(/(<meta (?:property="og|name="twitter):image:alt" content=")[^"]*/g, `$1${escapeAttr(imageAlt)}`);
  return out;
};

const server = await createServer({ root, logLevel: "error", appType: "custom", server: { middlewareMode: true } });
try {
  const { default: App } = await server.ssrLoadModule("/src/App.tsx");
  const { setServerPath, servicePath, HOME_PATH, PROFILE_PATH } = await server.ssrLoadModule("/src/lib/router.ts");
  const { profileMeta } = await server.ssrLoadModule("/src/pages/profile/ProfilePage.tsx");
  const { serviceMeta } = await server.ssrLoadModule("/src/pages/service/ServicePage.tsx");
  const { services } = await server.ssrLoadModule("/src/content/services.ts");
  const { profileImages } = await server.ssrLoadModule("/src/content/profile.ts");
  const { SITE_URL, absoluteUrl } = await server.ssrLoadModule("/src/lib/seo.ts");
  const template = readFileSync(resolve(dist, "index.html"), "utf8");

  const routes = [
    { path: HOME_PATH, file: "index.html", priority: "1.0", changefreq: "weekly", image: `${SITE_URL}/og-image.png` },
    { path: PROFILE_PATH, file: "perfil/index.html", meta: profileMeta, priority: "0.7", changefreq: "monthly", image: profileImages.carlos },
    ...services.map((service) => ({
      path: servicePath(service.slug),
      file: `${servicePath(service.slug).slice(1)}/index.html`,
      meta: serviceMeta(service),
      priority: "0.9",
      changefreq: "monthly",
      image: service.examples[0]?.image,
    })),
  ];
  const absoluteAsset = (image) => {
    if (!image) return "";
    const path = image.startsWith("file://") ? toBuiltAsset(image) : image;
    return path.startsWith("/") ? `${SITE_URL}${path}` : path;
  };

  for (const { path, file, meta } of routes) {
    setServerPath(path);
    const markup = renderToString(createElement(App)).replace(/file:\/\/[^"'\s)]+/g, toBuiltAsset);
    let html = template.replace("<!--prerender-->", `<div data-prerender>${markup}</div>`)
      .replace(/"(image|primaryImageOfPage)":"\/assets\//g, `"$1":"${SITE_URL}/assets/`);
    if (meta) html = withMeta(html, { ...meta, url: absoluteUrl(meta.path) });
    const outPath = resolve(dist, file);
    mkdirSync(dirname(outPath), { recursive: true });
    writeFileSync(outPath, html);
    console.log(`prerender: ${markup.length} caracteres de HTML escritos en dist/${file}`);
  }

  const today = new Date().toISOString().slice(0, 10);
  const sitemap = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">',
    ...routes.map(({ path, priority, changefreq, image }) => {
      const imageUrl = absoluteAsset(image);
      return [
        "  <url>",
        `    <loc>${absoluteUrl(path)}</loc>`,
        `    <lastmod>${today}</lastmod>`,
        `    <changefreq>${changefreq}</changefreq>`,
        `    <priority>${priority}</priority>`,
        ...(imageUrl ? [`    <image:image><image:loc>${imageUrl}</image:loc></image:image>`] : []),
        "  </url>",
      ].join("\n");
    }),
    "</urlset>",
    "",
  ].join("\n");
  writeFileSync(resolve(dist, "sitemap.xml"), sitemap);
  console.log(`prerender: sitemap con ${routes.length} URLs`);
} finally {
  await server.close();
}
