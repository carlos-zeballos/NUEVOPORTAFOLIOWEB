import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./fonts.css";
import "./index.css";

if ("scrollRestoration" in history) history.scrollRestoration = "manual";
if (window.location.hash) history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
const resetInitialScroll = () => window.scrollTo({ top: 0, left: 0, behavior: "auto" });
resetInitialScroll();
requestAnimationFrame(resetInitialScroll);
window.addEventListener("load", resetInitialScroll, { once: true });

const mount = () => ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode><App /></React.StrictMode>,
);

/** Chrome drops a paint record whose node is removed before the frame is presented, so the
 *  prerendered hero stays until the browser has reported it (or a short cap elapses). */
function whenPrerenderPresented(callback: () => void) {
  let done = false;
  let observer: PerformanceObserver | undefined;
  const run = () => {
    if (done) return;
    done = true;
    observer?.disconnect();
    callback();
  };
  setTimeout(run, 1200);
  if (PerformanceObserver.supportedEntryTypes?.includes("largest-contentful-paint")) {
    observer = new PerformanceObserver(run);
    observer.observe({ type: "largest-contentful-paint", buffered: true });
    return;
  }
  const titleFont = document.fonts?.load('400 1em "Archivo Black"') ?? Promise.resolve();
  void titleFont.catch(() => undefined).then(() => requestAnimationFrame(() => requestAnimationFrame(run)));
}

if (document.querySelector(".pr-home")) whenPrerenderPresented(mount);
else mount();
