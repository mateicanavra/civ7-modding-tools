// ============================================================================
// COMPONENTS INDEX
// ============================================================================
// Re-exports all components for cleaner imports.
// ============================================================================

// Layout components
export { AppBrand } from './AppBrand';
export { AppHeader, HEADER_HEIGHT, type AppHeaderProps } from './AppHeader';
export { AppFooter, FOOTER_HEIGHT, type AppFooterProps } from './AppFooter';

// Panel components
export { RecipePanel, type RecipePanelProps } from './RecipePanel';
export { ExplorePanel, type ExplorePanelProps } from './ExplorePanel';

// Form components
export { ViewControls, type ViewControlsProps } from './ViewControls';

// UI primitives (shadcn/ui style)
export * from './ui';

// Form fields
export * from './fields';
