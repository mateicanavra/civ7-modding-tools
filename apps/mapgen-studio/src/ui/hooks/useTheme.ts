import type { ThemePreference } from "@swooper/mapgen-studio-ui/types";
import { useEffect, useMemo, useState } from "react";

// ============================================================================
// Theme Preference Hook
// ============================================================================
//
// The app is themed by explicit `.dark`/`.light` classes on `<html>` (dark is
// the default; index.html pre-paints the class) — the CSS tokens ship with
// `@swooper/mapgen-studio-ui/theme.css` and resolve per-class, so the chrome
// carries NO runtime theme object and NO `lightMode` prop threading. The boolean this hook derives
// (`isLightMode`) survives ONLY because the deck.gl canvas grid color is drawn
// into a `<canvas>` with literal RGBA and cannot read a CSS class — it is a
// render input for `DeckCanvas`, not a theming prop for the chrome.

export function useThemePreference() {
  const [preference, setPreference] = useState<ThemePreference>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("theme-preference");
      if (stored === "light" || stored === "dark" || stored === "system") {
        return stored;
      }
    }
    return "system";
  });

  const [systemPrefersDark, setSystemPrefersDark] = useState(() => {
    if (typeof window !== "undefined") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    return true;
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e: MediaQueryListEvent) => setSystemPrefersDark(e.matches);
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  useEffect(() => {
    localStorage.setItem("theme-preference", preference);
  }, [preference]);

  const isLightMode = useMemo(() => {
    if (preference === "system") return !systemPrefersDark;
    return preference === "light";
  }, [preference, systemPrefersDark]);

  const cyclePreference = () => {
    setPreference((current) => {
      switch (current) {
        case "system":
          return "light";
        case "light":
          return "dark";
        case "dark":
          return "system";
        default:
          return "system";
      }
    });
  };

  return { preference, setPreference, isLightMode, cyclePreference };
}
