/**
 * Design-system surface for the Claude Design sync (window.MapGenStudio).
 *
 * Curated re-export barrel that SCOPES the importable bundle to the design
 * system's public components — not the whole app. The two existing source
 * barrels cover the shadcn primitives and most composites; OptionSelect and
 * StageViewTabs are exported here explicitly because they aren't in
 * `src/ui/components/index.ts`.
 *
 * Owned by the design-sync workflow (config `entry`). Safe to regenerate.
 */
export * from "@/components/ui/index";
export * from "@/ui/components/index";
export { OptionSelect } from "@/ui/components/OptionSelect";
export { StageViewTabs } from "@/ui/components/StageViewTabs";

// Batch 1 (2026-06): floating shell chrome + preset dialog flows. FieldRow is
// already re-exported through `@/ui/components/index` (the `./fields` barrel), so
// it is surfaced via componentSrcMap alone — re-exporting it here would collide.
export { LeftDock } from "@/app/LeftDock";
export { RightDock } from "@/app/RightDock";
export { ErrorBanner } from "@/app/ErrorBanner";
export {
  PresetErrorDialog,
  PresetSaveDialog,
  PresetConfirmDialog,
} from "@/features/presets/PresetDialogs";

// Batch 2 (2026-06): the rjsf config-form cluster — the design-system-skinned
// RJSF widgets + field/object/array templates that drive the schema config form.
// Not in any source barrel, so re-exported explicitly here.
export {
  TextWidget,
  TextareaWidget,
  NumberWidget,
  SelectWidget,
  CheckboxWidget,
  SwitchWidget,
  TagSelectWidget,
} from "@/features/configOverrides/rjsfWidgets";
export {
  BrowserConfigFieldTemplate,
  BrowserConfigObjectFieldTemplate,
  BrowserConfigArrayFieldTemplate,
} from "@/features/configOverrides/rjsfTemplates";

// Batch 3 (2026-06): the recipe-DAG stage view — the dependency graph rendered
// as a first-class stage (SVG node/lane/edge canvas from a RecipeDagResult).
export { PipelineStage } from "@/features/recipeDag/PipelineStage";

// Batch 5 (2026-06): the config-authoring ENGINE — composes the Batch-2 rjsf
// widgets + templates against a real schema (@rjsf/core + ajv8). This is the
// working whole; SchemaForm is its internal rjsf bridge, not a separate card.
export { SchemaConfigForm } from "@/features/configOverrides/SchemaConfigForm";
