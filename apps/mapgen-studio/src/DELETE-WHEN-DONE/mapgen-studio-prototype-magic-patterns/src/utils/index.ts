// ============================================================================
// UTILS INDEX
// ============================================================================
// Re-exports all utility functions.
// ============================================================================

export { cn } from './cn';

export {
  formatStageName,
  formatFieldName,
  formatResourceMode,
  generateSeed } from
'./formatting';

export {
  // Config manipulation
  cloneConfig,
  applyConfigPatch,
  updateConfigValue,
  getConfigValue,
  getStageNames,
  mergeConfigs,
  // Equality checks
  configsEqual,
  worldSettingsEqual,
  recipeSettingsEqual,
  // Derivation helpers (for controlled components)
  deriveStagesFromConfig,
  deriveStepsFromStage,
  filterDataTypesForStep } from
'./config';