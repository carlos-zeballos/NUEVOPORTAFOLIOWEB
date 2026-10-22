import { createContext, useContext } from "react";

export interface PageTransitionContextValue {
  transitionTo: (target: string) => void;
  navigateTo: (path: string, options?: { target?: string; fromHistory?: boolean }) => void;
  isTransitioning: boolean;
}

export const PageTransitionContext = createContext<PageTransitionContextValue | null>(null);

export function usePageTransition() {
  const context = useContext(PageTransitionContext);

  if (!context) {
    throw new Error("usePageTransition debe utilizarse dentro de PageTransitionProvider");
  }

  return context;
}
