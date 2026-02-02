// ============================================================================
// SERVICES INDEX
// ============================================================================
// Re-exports all service modules.
// ============================================================================

export {
  // Generation API
  startGeneration,
  getGenerationStatus,
  waitForGeneration,

  // Presets API
  listPresets,
  getPreset,
  savePreset,
  updatePreset,
  deletePreset,

  // Mock API for development
  mockApi,

  // Error class
  ApiError } from
'./api';