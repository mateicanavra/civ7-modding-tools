// ============================================================================
// HOOKS INDEX
// ============================================================================
// Re-exports all custom hooks.
// ============================================================================

export {
  type GenerationSnapshot,
  type UseGenerationOptions,
  type UseGenerationReturn,
  useGeneration,
} from "./useGeneration";
export { type ResolvedTheme, resolveThemeFromDom, useResolvedTheme } from "./useResolvedTheme";
export { useThemePreference } from "./useTheme";
export {
  type UseViewStateOptions,
  type UseViewStateReturn,
  useViewState,
} from "./useViewState";
