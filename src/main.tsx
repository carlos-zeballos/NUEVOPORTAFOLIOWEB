import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

if ("scrollRestoration" in history) history.scrollRestoration = "manual";
if (window.location.hash) history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
const resetInitialScroll = () => window.scrollTo({ top: 0, left: 0, behavior: "auto" });
resetInitialScroll();
requestAnimationFrame(resetInitialScroll);
window.addEventListener("load", resetInitialScroll, { once: true });

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode><App /></React.StrictMode>,
);
