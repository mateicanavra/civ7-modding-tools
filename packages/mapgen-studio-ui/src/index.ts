/**
 * `@swooper/mapgen-studio-ui` — public barrel (value-clean; structure-rewire §3.5).
 *
 * B2 surface: the 16 primitives (15 shadcn `components/ui` + FieldRow) and the
 * lib foundation (`cn`, `useResolvedTheme`/`resolveThemeFromDom`, `LAYOUT`).
 * Components land branch-by-branch (B3 composites + layout → B4 forms →
 * B5 panels → B6 AppHeader); each branch adds its exports here and raises
 * the `verify` export floor. Final surface: the 46 design-synced components
 * (+ TooltipProvider and the lib exports — `cn`, `useResolvedTheme`,
 * `LAYOUT`, statusLabels formatters, `useConfigCollapse`).
 *
 * Deliberately ABSENT: `toast` (LEDGER adjudication 8 — consumers import it
 * from "sonner" directly); app-domain values of any kind.
 */

// forms — FieldRow (homed with the forms group; story title stays `primitives/FieldRow`)
export { FieldRow, type FieldRowProps } from "./components/forms/FieldRow.js";
// primitives — the shadcn sub-barrel (15 components + families)
export * from "./components/ui/index.js";

// lib foundation
export { LAYOUT, type LayoutConfig } from "./lib/layout.js";
export {
  type ResolvedTheme,
  resolveThemeFromDom,
  useResolvedTheme,
} from "./lib/useResolvedTheme.js";
export { cn } from "./lib/utils.js";

// public type surface (also exposed via the `./types` types-only condition)
export type * from "./types/index.js";
