// ============================================================================
// CONFIG UTILITIES
// ============================================================================
// Helper functions for working with pipeline configurations.
// ============================================================================

import type {
  PipelineConfig,
  ConfigValue,
  ConfigPatch,
  WorldSettings,
  RecipeSettings,
  StageOption,
  StepOption,
  DataTypeOption,
  StepConfig } from
'../types';
import { formatStageName } from './formatting';

/**
 * Deep clone a configuration object.
 * Use this before making mutations to avoid reference issues.
 */
export function cloneConfig<T>(config: T): T {
  return JSON.parse(JSON.stringify(config));
}

/**
 * Apply a config patch using shallow copies (efficient immutable update).
 * Only clones objects along the path, not the entire tree.
 */
export function applyConfigPatch(
config: PipelineConfig,
patch: ConfigPatch)
: PipelineConfig {
  const { path, value } = patch;

  if (path.length === 0) {
    return config;
  }

  // Create shallow copy of root
  const newConfig = { ...config };
  let current: Record<string, unknown> = newConfig;

  // Walk the path, creating shallow copies along the way
  for (let i = 0; i < path.length - 1; i++) {
    const key = path[i];
    current[key] = { ...(current[key] as Record<string, unknown>) };
    current = current[key] as Record<string, unknown>;
  }

  // Set the final value
  current[path[path.length - 1]] = value;

  return newConfig;
}

/**
 * Update a nested value in a config object by path.
 * Returns a new config object (immutable update using deep clone).
 *
 * @deprecated Use applyConfigPatch for better performance
 * @example
 * updateConfigValue(config, ['foundation', 'knobs', 'plateCount'], 28)
 */
export function updateConfigValue(
config: PipelineConfig,
path: string[],
value: ConfigValue)
: PipelineConfig {
  const newConfig = cloneConfig(config);
  let current: Record<string, unknown> = newConfig;

  for (let i = 0; i < path.length - 1; i++) {
    if (current[path[i]] === undefined) {
      current[path[i]] = {};
    }
    current = current[path[i]] as Record<string, unknown>;
  }

  current[path[path.length - 1]] = value;
  return newConfig;
}

/**
 * Get a nested value from a config object by path.
 * Returns undefined if path doesn't exist.
 */
export function getConfigValue(
config: PipelineConfig,
path: string[])
: ConfigValue | undefined {
  let current: unknown = config;

  for (const key of path) {
    if (current === undefined || current === null) return undefined;
    current = (current as Record<string, unknown>)[key];
  }

  return current as ConfigValue;
}

/**
 * Get all stage names from a config.
 */
export function getStageNames(config: PipelineConfig): string[] {
  return Object.keys(config);
}

/**
 * Check if two configs are equal (deep comparison).
 */
export function configsEqual(a: PipelineConfig, b: PipelineConfig): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

/**
 * Check if world settings are equal.
 */
export function worldSettingsEqual(
a: WorldSettings,
b: WorldSettings)
: boolean {
  return (
    a.mode === b.mode &&
    a.mapSize === b.mapSize &&
    a.playerCount === b.playerCount &&
    a.resources === b.resources);

}

/**
 * Check if recipe settings are equal.
 */
export function recipeSettingsEqual(
a: RecipeSettings,
b: RecipeSettings)
: boolean {
  return a.recipe === b.recipe && a.preset === b.preset && a.seed === b.seed;
}

/**
 * Merge partial config into base config.
 * Useful for applying presets.
 */
export function mergeConfigs(
base: PipelineConfig,
override: Partial<PipelineConfig>)
: PipelineConfig {
  const result = cloneConfig(base);

  for (const [stageName, stageConfig] of Object.entries(override)) {
    if (stageConfig) {
      result[stageName] = {
        ...result[stageName],
        ...stageConfig
      };
    }
  }

  return result;
}

// ============================================================================
// Derivation Helpers (for controlled components)
// ============================================================================

/**
 * Derive stage options from a pipeline config.
 * Use this to populate stage selectors in controlled components.
 */
export function deriveStagesFromConfig(config: PipelineConfig): StageOption[] {
  return Object.keys(config).map((stage, index) => ({
    value: stage,
    label: formatStageName(stage),
    index
  }));
}

/**
 * Derive step options from a specific stage in the config.
 * Use this to populate step selectors in controlled components.
 */
export function deriveStepsFromStage(
config: PipelineConfig,
stageName: string)
: StepOption[] {
  const stageConfig = config[stageName] as
  {advanced?: Record<string, Record<string, StepConfig>>;} |
  undefined;

  if (!stageConfig?.advanced) return [];

  const steps: StepOption[] = [];
  Object.entries(stageConfig.advanced).forEach(([category, stepsMap]) => {
    Object.keys(stepsMap).forEach((stepName) => {
      steps.push({
        value: stepName,
        label: stepName,
        category
      });
    });
  });

  return steps;
}

/**
 * Filter data type options based on the selected step's category.
 * Returns only data types that match the step's category.
 */
export function filterDataTypesForStep(
allDataTypes: readonly DataTypeOption[],
steps: StepOption[],
selectedStep: string)
: DataTypeOption[] {
  const currentStepObj = steps.find((s) => s.value === selectedStep);
  const category = currentStepObj?.category;

  return allDataTypes.filter((dt) => {
    if (!category) return false;
    return dt.value === category;
  });
}
