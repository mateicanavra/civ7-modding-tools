// ============================================================================
// COMPONENTS INDEX
// ============================================================================
// Re-exports all components for cleaner imports.
// ============================================================================

// Layout components
export { AppBrand } from "./AppBrand";
export { AppFooter, type AppFooterProps, FOOTER_HEIGHT } from "./AppFooter";
export { AppHeader, type AppHeaderProps } from "./AppHeader";
export { ExplorePanel, type ExplorePanelProps } from "./ExplorePanel";
// Form fields (only `FieldRow` remains — the old lightMode/hex field set was
// dead and removed; UI primitives now live in `src/components/ui` (shadcn)).
export * from "./fields";
export { GameConsole, type GameConsoleLiveRuntime, type GameConsoleProps } from "./GameConsole";
// Panel components
export { RecipePanel, type RecipePanelProps } from "./RecipePanel";

// Form components
export { ViewControls, type ViewControlsProps } from "./ViewControls";
export { WaterStatsSection, type WaterStatsSectionProps } from "./WaterStatsSection";
