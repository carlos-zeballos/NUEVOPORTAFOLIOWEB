import { useSyncExternalStore } from "react";

export const HOME_PATH = "/";
export const PROFILE_PATH = "/perfil";
export const SERVICES_PATH = "/servicios";

export const servicePath = (slug: string) => `${SERVICES_PATH}/${slug}`;

export function serviceSlugOf(path: string) {
  return path.startsWith(`${SERVICES_PATH}/`) ? path.slice(SERVICES_PATH.length + 1) : null;
}

const listeners = new Set<() => void>();
let serverPath = HOME_PATH;

const normalize = (path: string) => path.replace(/\/+$/, "") || HOME_PATH;

export function setServerPath(path: string) {
  serverPath = normalize(path);
}

export function currentPath() {
  return typeof window === "undefined" ? serverPath : normalize(window.location.pathname);
}

let renderedPath: string | null = null;

function routeSnapshot() {
  renderedPath ??= currentPath();
  return renderedPath;
}

export function commitRoute(path?: string) {
  if (path && normalize(path) !== currentPath()) history.pushState(null, "", normalize(path));
  renderedPath = currentPath();
  listeners.forEach((listener) => listener());
}

export function hasPendingRoute() {
  return routeSnapshot() !== currentPath();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function usePath() {
  return useSyncExternalStore(subscribe, routeSnapshot, () => serverPath);
}
