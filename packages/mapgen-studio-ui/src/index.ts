/**
 * `@swooper/mapgen-studio-ui` — public barrel (value-clean; structure-rewire §3.5).
 *
 * B2 surface: the 16 primitives (15 shadcn `components/ui` + FieldRow) and the
 * lib foundation (`cn`, `useResolvedTheme`/`resolveThemeFromDom`, `LAYOUT`).
 * B3 surface: the composites (12: AppBrand, AppFooter, StageViewTabs,
 * ViewControls, WaterStatsSection, OptionSelect, DisclosureHeader, EmptyState,
 * ErrorBanner, the 3 preset dialogs) + layout (LeftDock, RightDock).
 * B4 surface: the forms group (11: the 7 config widgets + the 3 BrowserConfig
 * templates + SchemaConfigForm) with `configWidgets` and the public
 * `useConfigCollapse` collapse engine (SchemaConfigForm's documented
 * `data-config-*`/`configContentId` counterpart — structure-rewire §3.5).
 * SchemaForm stays internal: it is the five-module unit's private core
 * (SchemaConfigForm is the public engine; §3.5 lists no SchemaForm export).
 * B5 surface: the panels (ExplorePanel, GameConsole, RecipePanel) + the
 * recipe-dag split's PipelineStage (owns `RecipeDagLoadStatus`; the layout/
 * presentation modules stay internal) + the `panels/statusLabels` formatters
 * (the split-formatter module — the four functions the panels and StudioShell
 * word operation status with, plus the re-homed `RunInGameRelation` union).
 * `parseArtifactPresentation` is additionally public for the app's recipe-
 * corpus classification contract test (every served artifact id must classify
 * into a semantic icon domain — the test pairs the app's DAG service with the
 * package's parser).
 * B6 surface: AppHeader (E4a redesign — props-driven view over the
 * `AppHeaderSetupState` view-model + intent callbacks; the app container owns
 * the setup-config updates and the difficulty double-write).
 * Each branch adds its exports here and raises the `verify` export floor.
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
  AppHeader,
  type AppHeaderProps,
  type AppHeaderSetupState,
} from "./components/composites/AppHeader.js";
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
// forms — the five-module cohesive unit's public surface (structure-rewire §3.5)
export {
  BrowserConfigArrayFieldTemplate,
  BrowserConfigFieldTemplate,
  type BrowserConfigFormContext,
  BrowserConfigObjectFieldTemplate,
  type ConfigCollapseContext,
} from "./components/forms/rjsfTemplates.js";
export {
  CheckboxWidget,
  configWidgets,
  NumberWidget,
  SelectWidget,
  SwitchWidget,
  TagSelectWidget,
  TextareaWidget,
  TextWidget,
} from "./components/forms/rjsfWidgets.js";
export {
  SchemaConfigForm,
  type SchemaConfigFormProps,
} from "./components/forms/SchemaConfigForm.js";
export {
  type UseConfigCollapseArgs,
  useConfigCollapse,
} from "./components/forms/useConfigCollapse.js";
// layout
export { LeftDock, type LeftDockProps } from "./components/layout/LeftDock.js";
export { RightDock, type RightDockProps } from "./components/layout/RightDock.js";
// panels
export { ExplorePanel, type ExplorePanelProps } from "./components/panels/ExplorePanel.js";
export {
  GameConsole,
  type GameConsoleLiveRuntime,
  type GameConsoleProps,
} from "./components/panels/GameConsole.js";
export { RecipePanel, type RecipePanelProps } from "./components/panels/RecipePanel.js";
export { parseArtifactPresentation } from "./components/panels/recipe-dag/artifactPresentation.js";
export {
  PipelineStage,
  type PipelineStageProps,
  type RecipeDagLoadStatus,
} from "./components/panels/recipe-dag/PipelineStage.js";
export {
  formatMapConfigSaveDeployPhaseLabel,
  formatRunInGamePhaseLabel,
  type RunInGameRelation,
  runInGamePrimaryActionLabel,
  runInGameRequiresProcessRestart,
} from "./components/panels/statusLabels.js";
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
