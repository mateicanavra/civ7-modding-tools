// ============================================================================
// FORMATTING UTILITIES
// ============================================================================
// Helper functions for formatting display values.
// ============================================================================

/**
 * Format a stage/step name for display.
 * Converts kebab-case to Title Case.
 *
 * @example formatStageName('morphology-coasts') // 'Morphology Pre'
 */
export function formatStageName(name: string): string {
  return name.
  split('-').
  map((word) => word.charAt(0).toUpperCase() + word.slice(1)).
  join(' ');
}

/**
 * Format a camelCase field name for display.
 * Converts camelCase to Title Case with spaces.
 *
 * @example formatFieldName('plateCount') // 'Plate Count'
 */
export function formatFieldName(name: string): string {
  return name.
  replace(/([A-Z])/g, ' $1').
  replace(/^./, (str) => str.toUpperCase()).
  trim();
}

/**
 * Format a resource mode for compact display.
 *
 * @example formatResourceMode('balanced') // 'Bal'
 */
export function formatResourceMode(mode: string): string {
  const shortNames: Record<string, string> = {
    balanced: 'Bal',
    strategic: 'Strat'
  };
  return shortNames[mode] || mode;
}

/**
 * Generate a random seed string.
 *
 * @param max Maximum value (default 10000)
 */
export function generateSeed(max = 10000): string {
  return Math.floor(Math.random() * max).toString();
}