/**
 * `@swooper/mapgen-studio-ui` — public barrel (value-clean; structure-rewire §3.5).
 *
 * B2 surface: the 16 primitives (15 shadcn `components/ui` + FieldRow) and the
 * lib foundation (`cn`, `useResolvedTheme`/`resolveThemeFromDom`, `LAYOUT`).
 * B3 surface: the composites (12: AppBrand, AppFooter, StageViewTabs,
 * ViewControls, WaterStatsSection, OptionSelect, DisclosureHeader, EmptyState,
 * ErrorBanner, the 3 preset dialogs) + layout (LeftDock, RightDock).
 * Components land branch-by-branch (B4 forms → B5 panels → B6 AppHeader);
 * each branch adds its exports here and raises the `verify` export floor.
 * Final surface: the 46 design-synced components (+ TooltipProvider and the
 * lib exports — `cn`, `useResolvedTheme`, `LAYOUT`, statusLabels formatters,
 * `useConfigCollapse`).
 *
 * Deliberately ABSENT: `toast` (LEDGER adjudication 8 — consumers import it
 * from "sonner" directly); app-domain values of any kind.
 */

// composites
export { AppBrand } from "./components/composites/AppBrand.js";
export { AppFooter, type AppFooterProps } from "./components/composites/AppFooter.js";
export {
  DisclosureHeader,
  type DisclosureHeaderProps,
  type DisclosureRootRenderProps,
} from "./components/composites/DisclosureHeader.js";
export { EmptyState, type EmptyStateProps } from "./components/composites/EmptyState.js";
export { ErrorBanner, type ErrorBannerProps } from "./components/composites/ErrorBanner.js";
export { OptionSelect, type OptionSelectProps } from "./components/composites/OptionSelect.js";
export {
  PresetConfirmDialog,
  type PresetConfirmDialogProps,
  PresetErrorDialog,
  type PresetErrorDialogProps,
  PresetSaveDialog,
  type PresetSaveDialogProps,
} from "./components/composites/PresetDialogs.js";
export {
  type StageView,
  StageViewTabs,
  type StageViewTabsProps,
} from "./components/composites/StageViewTabs.js";
export { ViewControls, type ViewControlsProps } from "./components/composites/ViewControls.js";
export {
  type WaterStatsLayerRef,
  type WaterStatsRow,
  WaterStatsSection,
  type WaterStatsSectionProps,
  type WaterStatsSummary,
} from "./components/composites/WaterStatsSection.js";
// forms — FieldRow (homed with the forms group; story title stays `primitives/FieldRow`)
export { FieldRow, type FieldRowProps } from "./components/forms/FieldRow.js";
// layout
export { LeftDock, type LeftDockProps } from "./components/layout/LeftDock.js";
export { RightDock, type RightDockProps } from "./components/layout/RightDock.js";
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
