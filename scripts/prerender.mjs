import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { basename, extname, resolve } from "node:path";
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

const server = await createServer({ root, logLevel: "error", appType: "custom", server: { middlewareMode: true } });
try {
  const { default: App } = await server.ssrLoadModule("/src/App.tsx");
  const markup = renderToString(createElement(App)).replace(/file:\/\/[^"'\s)]+/g, toBuiltAsset);
  const htmlPath = resolve(dist, "index.html");
  const html = readFileSync(htmlPath, "utf8").replace("<!--prerender-->", `<div data-prerender>${markup}</div>`);
  writeFileSync(htmlPath, html);
  console.log(`prerender: ${markup.length} caracteres de HTML escritos en dist/index.html`);
} finally {
  await server.close();
}
