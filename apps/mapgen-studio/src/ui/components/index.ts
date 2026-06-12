// ============================================================================
// COMPONENTS INDEX
// ============================================================================
// Re-exports all components for cleaner imports.
// ============================================================================

// Layout components
export { AppBrand } from './AppBrand';
export { AppHeader, type AppHeaderProps } from './AppHeader';
export { AppFooter, FOOTER_HEIGHT, type AppFooterProps } from './AppFooter';
export { GameConsole, type GameConsoleProps, type GameConsoleLiveRuntime } from './GameConsole';

// Panel components
export { RecipePanel, type RecipePanelProps } from './RecipePanel';
export { ExplorePanel, type ExplorePanelProps } from './ExplorePanel';
export { WaterStatsSection, type WaterStatsSectionProps } from './WaterStatsSection';

// Form components
export { ViewControls, type ViewControlsProps } from './ViewControls';

// Form fields (only `FieldRow` remains — the old lightMode/hex field set was
// dead and removed; UI primitives now live in `src/components/ui` (shadcn)).
export * from './fields';
