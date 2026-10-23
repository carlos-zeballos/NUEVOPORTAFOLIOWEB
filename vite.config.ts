import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";

/** The prerendered HTML paints without the app bundle, so it should not compete with CSS and fonts. */
const lowPriorityEntry = (): Plugin => ({
  name: "low-priority-entry",
  apply: "build",
  transformIndexHtml: {
    order: "post",
    handler: (html) => html.replace(/<script type="module" crossorigin src="/g, '<script type="module" crossorigin fetchpriority="low" src="'),
  },
});

export default defineConfig({
  plugins: [react(), lowPriorityEntry()],
});
