import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

// Avisa a Bing, Yandex, Naver y Seznam (vía IndexNow) que las URLs del sitemap cambiaron.
// La clave debe coincidir con el archivo public/<KEY>.txt publicado en la raíz del sitio.
const KEY = "4558eb809c272c73609c22676dd7015b";
const HOST = "zebware.org";
const keyLocation = `https://${HOST}/${KEY}.txt`;

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const sitemap = readFileSync(resolve(root, "dist/sitemap.xml"), "utf8");
const urlList = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(([, url]) => url.trim());

const sleep = (ms) => new Promise((done) => setTimeout(done, ms));

// Hostinger tarda unos minutos en descargar la rama hostinger; IndexNow rechaza la petición si la clave aún no está publicada.
const waitForKey = async () => {
  for (let attempt = 1; attempt <= 20; attempt++) {
    try {
      const response = await fetch(keyLocation, { cache: "no-store" });
      if (response.ok && (await response.text()).trim() === KEY) return true;
    } catch {}
    await sleep(30_000);
  }
  return false;
};

if (!(await waitForKey())) {
  console.error(`La clave no está disponible en ${keyLocation}; no se envió nada.`);
  process.exit(1);
}

const response = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify({ host: HOST, key: KEY, keyLocation, urlList }),
});

console.log(`IndexNow respondió ${response.status} para ${urlList.length} URLs:\n${urlList.join("\n")}`);
if (!response.ok) process.exit(1);
