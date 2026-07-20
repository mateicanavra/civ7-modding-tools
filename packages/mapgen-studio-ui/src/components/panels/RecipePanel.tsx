// ============================================================================
// RECIPE PANEL
// ============================================================================
// Left sidebar for recipe selection and pipeline configuration.
// Fully controlled component - all options passed via props.
// Uses path-based patching for efficient state updates.
// ============================================================================

import type { MapConfigSaveDeployStatus } from "@civ7/studio-contract";
import { BookOpen, Eraser, Focus, ListCollapse, Save, Settings } from "lucide-react";
import React, { useMemo, useRef, useState } from "react";
import type { XSchema } from "typebox/schema";
import { iconButton, iconButtonActive } from "../../lib/iconButton.js";
import { LAYOUT } from "../../lib/layout.js";
import { cn } from "../../lib/utils.js";
import type { PipelineConfig, SelectOption } from "../../types/index.js";
import { DisclosureHeader } from "../composites/DisclosureHeader.js";
import { OptionSelect } from "../composites/OptionSelect.js";
import { setAtPath } from "../forms/pathUtils.js";
import { SchemaConfigForm } from "../forms/SchemaConfigForm.js";
import {
  normalizeSchemaForRjsf,
  schemaDefaultsFor,
  toRjsfSchema,
  tryGetSchemaAtPath,
} from "../forms/schemaPresentation.js";
import { useConfigCollapse } from "../forms/useConfigCollapse.js";
import { Button } from "../ui/button.js";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog.js";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu.js";
import { Switch } from "../ui/switch.js";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip.js";
import { formatMapConfigSaveDeployPhaseLabel } from "./statusLabels.js";
// ============================================================================
// Props
// ============================================================================
export interface RecipePanelProps {
  /** Current pipeline configuration */
  config: PipelineConfig;
  /** Config schema (recipe artifacts) */
  configSchema: XSchema;
  /** Path-based patch callback for efficient state updates */
  onConfigChange: (next: PipelineConfig) => void;
  /** Available recipe options */
  recipeOptions: ReadonlyArray<SelectOption>;
  /** Available complete config options */
  configOptions: ReadonlyArray<SelectOption>;
  /** Currently selected step (for focus mode) */
  selectedStep: string;
  /** Active recipe identity */
  recipeId: string;
  /** Installs the selected recipe's complete default config. */
  onRecipeChange: (recipeId: string) => void;
  /** Active complete config identity. */
  configId: string;
  /** Installs a complete catalog config. */
  onConfigSelect: (configId: string) => void;
  /** Callback to save the active config to its current identity */
  onSaveToCurrent: () => void;
  /** Callback to save the active config under a new identity */
  onSaveAsNew: () => void;
  /** Callback to import a complete config */
  onImportConfig: () => void;
  /** Callback to export the active complete config */
  onExportConfig: () => void;
  /** Whether config save/deploy is running */
  isSaveDeployRunning?: boolean;
  /** Current config save/deploy status */
  saveDeployStatus?: MapConfigSaveDeployStatus | null;
  /** Whether save actions are disabled by another Studio operation */
  isSaveDisabled?: boolean;
  /** Whether settings have changed since last run */
  isDirty: boolean;
  /** Whether config editing is enabled (optional controlled mode) */
  configEditingEnabled?: boolean;
  /** Callback when config editing enablement changes (optional controlled mode) */
  onConfigEditingEnabledChange?: (enabled: boolean) => void;
  /** Whether the recipe section is collapsed (optional controlled mode) */
  recipeCollapsed?: boolean;
  /** Callback when recipe collapsed changes (optional controlled mode) */
  onRecipeCollapsedChange?: (collapsed: boolean) => void;
  /** Whether the config section is collapsed (optional controlled mode) */
  configCollapsed?: boolean;
  /** Callback when config collapsed changes (optional controlled mode) */
  onConfigCollapsedChange?: (collapsed: boolean) => void;
}
// ============================================================================
// Main Component
// ============================================================================
export const RecipePanel: React.FC<RecipePanelProps> = ({
  config,
  configSchema,
  onConfigChange,
  recipeOptions,
  configOptions,
  selectedStep,
  recipeId,
  onRecipeChange,
  configId,
  onConfigSelect,
  onSaveToCurrent,
  onSaveAsNew,
  onImportConfig,
  onExportConfig,
  isSaveDeployRunning = false,
  saveDeployStatus,
  isSaveDisabled = false,
  isDirty,
  configEditingEnabled: configEditingEnabledProp,
  onConfigEditingEnabledChange,
  recipeCollapsed: recipeCollapsedProp,
  onRecipeCollapsedChange,
  configCollapsed: configCollapsedProp,
  onConfigCollapsedChange,
}) => {
  // ==========================================================================
  // Local State
  // ==========================================================================
  const [localRecipeCollapsed, setLocalRecipeCollapsed] = useState(false);
  const [localConfigCollapsed, setLocalConfigCollapsed] = useState(false);
  const [localConfigEditingEnabled, setLocalConfigEditingEnabled] = useState(true);
  const [showAllSteps, setShowAllSteps] = useState(false);
  // Scoped reset (flat-and-flush delta 5): the confirmation dialog is owned
  // here but always targets ONE stage — pointer for the patch, label for the
  // dialog copy. Null ⇒ closed. There is no global reset affordance.
  const [stageResetTarget, setStageResetTarget] = useState<{
    pointer: string;
    label: string;
  } | null>(null);
  const [showSaveMenu, setShowSaveMenu] = useState(false);

  const configEditingEnabled = configEditingEnabledProp ?? localConfigEditingEnabled;
  const setConfigEditingEnabled = (next: boolean) => {
    onConfigEditingEnabledChange?.(next);
    if (configEditingEnabledProp === undefined) setLocalConfigEditingEnabled(next);
  };
  const recipeCollapsed = recipeCollapsedProp ?? localRecipeCollapsed;
  const setRecipeCollapsed = (next: boolean) => {
    onRecipeCollapsedChange?.(next);
    if (recipeCollapsedProp === undefined) setLocalRecipeCollapsed(next);
  };
  const configCollapsed = configCollapsedProp ?? localConfigCollapsed;
  const setConfigCollapsed = (next: boolean) => {
    onConfigCollapsedChange?.(next);
    if (configCollapsedProp === undefined) setLocalConfigCollapsed(next);
  };
  const saveActionDisabled = isSaveDisabled || isSaveDeployRunning;
  const saveLabel = saveDeployStatus
    ? formatMapConfigSaveDeployPhaseLabel(saveDeployStatus.phase)
    : "Save & Deploy Config";
  const saveTitle = isSaveDeployRunning
    ? `Save & Deploy Config: ${saveLabel}`
    : saveActionDisabled
      ? "Save unavailable while another operation is running"
      : "Save & Deploy Config";

  // Close the save menu the instant the action transitions to disabled. Done
  // during render via the store-prev-value pattern rather than in an effect
  // (react-hooks/set-state-in-effect). Parity with the prior effect: it fires
  // only on the disabled transition; mount is a no-op (the menu starts closed)
  // and the menu stays closed across a later re-enable, exactly as before.
  const [prevSaveActionDisabled, setPrevSaveActionDisabled] = useState(saveActionDisabled);
  if (saveActionDisabled !== prevSaveActionDisabled) {
    setPrevSaveActionDisabled(saveActionDisabled);
    if (saveActionDisabled) setShowSaveMenu(false);
  }
  // ==========================================================================
  // Derived State
  // ==========================================================================
  const focusPath = !showAllSteps && selectedStep ? [selectedStep] : null;
  // Config-object collapse (Pass-4): collapsed by default with manual expand;
  // the focused stage root defaults expanded; the sticky toggle (default OFF)
  // hands expansion to the scroll engine.
  const [stickyAutoExpand, setStickyAutoExpand] = useState(false);
  const configScrollRef = useRef<HTMLDivElement | null>(null);
  const collapse = useConfigCollapse({
    scrollRootRef: configScrollRef,
    sticky: stickyAutoExpand,
    focusRootPointer: focusPath ? `/${focusPath.join("/")}` : null,
  });
  // Normalized rjsf view of the config schema — the same normalization the
  // form itself applies — so a stage's reset patch resolves defaults from the
  // exact schema shape the form renders.
  const rjsfSchema = useMemo(() => {
    try {
      return toRjsfSchema(normalizeSchemaForRjsf(configSchema));
    } catch {
      return null;
    }
  }, [configSchema]);
  const confirmStageReset = () => {
    if (!stageResetTarget) return;
    const path = stageResetTarget.pointer.split("/").filter(Boolean);
    const stageSchema = rjsfSchema ? tryGetSchemaAtPath(rjsfSchema, path) : null;
    const defaults = schemaDefaultsFor(stageSchema);
    if (defaults !== undefined) {
      onConfigChange(setAtPath(config, path, defaults) as PipelineConfig);
    }
    setStageResetTarget(null);
  };
  // ==========================================================================
  // Styles
  // ==========================================================================
  // Token-driven chrome; theme follows the single `.dark` class. The dock
  // floats over the deck.gl map, so it rides the `popover` tier; the sunken
  // section sits on `surface-sunken`.
  const panelBg = "bg-popover/95";
  const panelBorder = "border-border";
  const sectionBg = "bg-surface-sunken/80";
  const textPrimary = "text-foreground";
  const textSecondary = "text-muted-foreground";
  const textMuted = "text-muted-foreground/70";
  const borderColor = "border-border";
  const borderSubtle = "border-border-subtle";
  // ==========================================================================
  // Render
  // ==========================================================================
  return (
    <>
      {/* Width comes from the LAYOUT geometry authority (Pass-2: 340px); height
          shrinks to fit but is capped by the dock's header→footer column
          (`max-h-full`). pointer-events-auto restores interactivity inside the
          pass-through dock. */}
      <div
        style={{ width: LAYOUT.PANEL_WIDTH }}
        className={cn(
          "flex flex-col max-h-full rounded-lg border overflow-hidden shadow-lg backdrop-blur-sm pointer-events-auto",
          panelBg,
          panelBorder
        )}
      >
        {/* Header */}
        <div className={cn("flex-shrink-0 border-b", borderSubtle)}>
          <DisclosureHeader
            className="px-3 py-2.5"
            chevron={false}
            expanded={!recipeCollapsed}
            onToggle={() => setRecipeCollapsed(!recipeCollapsed)}
            controls="recipe-panel-recipe-section"
            icon={<BookOpen className={cn("w-4 h-4 shrink-0", textSecondary)} aria-hidden="true" />}
            title={<span className={cn("text-[13px] font-semibold", textPrimary)}>Recipe</span>}
            trailing={
              isDirty ? (
                <span className="text-[9px] font-medium uppercase tracking-wider text-primary">
                  Modified
                </span>
              ) : null
            }
          />
        </div>

        {/* Recipe and complete-config selection */}
        {!recipeCollapsed && (
          <div
            id="recipe-panel-recipe-section"
            className={cn("flex-shrink-0 px-3 py-3 space-y-2 border-b", borderSubtle)}
          >
            <div className="flex items-center gap-3">
              <span
                className={cn(
                  "text-label font-medium uppercase tracking-wider w-14 shrink-0",
                  textMuted
                )}
              >
                Recipe
              </span>
              <OptionSelect
                value={recipeId}
                onValueChange={onRecipeChange}
                ariaLabel="Recipe"
                options={recipeOptions.map((opt) => ({
                  value: opt.value,
                  label: opt.label,
                }))}
                className="flex-1"
              />
            </div>

            <div className="flex items-center gap-3">
              <span
                className={cn(
                  "text-label font-medium uppercase tracking-wider w-14 shrink-0",
                  textMuted
                )}
              >
                Config
              </span>
              <OptionSelect
                value={configId}
                onValueChange={onConfigSelect}
                ariaLabel="Config"
                options={configOptions.map((opt) => ({
                  value: opt.value,
                  label: opt.label,
                }))}
                className="flex-1"
              />
            </div>
          </div>
        )}

        {/* Config Section Header */}
        <div className={cn("flex-shrink-0 border-b", borderSubtle)}>
          <DisclosureHeader
            className="px-3 py-2.5 cursor-pointer"
            chevron={false}
            expanded={!configCollapsed}
            onToggle={() => setConfigCollapsed(!configCollapsed)}
            controls="recipe-panel-config-section"
            icon={<Settings className={cn("w-4 h-4 shrink-0", textSecondary)} aria-hidden="true" />}
            title={<span className={cn("text-[13px] font-semibold", textPrimary)}>Config</span>}
            // role="button" div (not a <button>) because the trailing zone nests
            // interactive controls; the Enter/Space keyboard contract comes from
            // the primitive (p.onKeyDown).
            render={(p) => (
              <div
                role={p.role}
                tabIndex={p.tabIndex}
                aria-expanded={p["aria-expanded"]}
                aria-controls={p["aria-controls"]}
                onClick={p.onClick}
                onKeyDown={p.onKeyDown}
                className={p.className}
              >
                {p.children}
              </div>
            )}
            trailing={
              <>
                {/* Caller-owned stopPropagation: clicking the On label / Switch
                    must NOT toggle the section. */}
                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  <span
                    className={cn(
                      "text-[9px] font-medium uppercase tracking-wider",
                      configEditingEnabled ? "text-primary" : textMuted
                    )}
                  >
                    {configEditingEnabled ? "Editing" : "Locked"}
                  </span>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Switch
                        checked={configEditingEnabled}
                        onCheckedChange={setConfigEditingEnabled}
                        aria-label={
                          configEditingEnabled ? "Lock config editing" : "Enable config editing"
                        }
                      />
                    </TooltipTrigger>
                    <TooltipContent>
                      {configEditingEnabled ? "Lock config editing" : "Enable config editing"}
                    </TooltipContent>
                  </Tooltip>
                </div>

                {/* Focus button self-guards its own click. */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowAllSteps(!showAllSteps);
                      }}
                      aria-label={showAllSteps ? "Focus Current Step" : "Show All Steps"}
                      aria-pressed={showAllSteps}
                      className={!showAllSteps ? iconButtonActive : iconButton}
                    >
                      <Focus className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {showAllSteps ? "Focus Current Step" : "Show All Steps"}
                  </TooltipContent>
                </Tooltip>
              </>
            }
          />
        </div>

        {/* Config Content */}
        {!configCollapsed && (
          <div
            id="recipe-panel-config-section"
            ref={configScrollRef}
            className="flex-1 overflow-y-auto overflow-x-hidden"
          >
            <>
              {/* Config Actions */}
              <div
                className={cn(
                  "px-3 py-2 flex items-center gap-2",
                  !configEditingEnabled && "opacity-40 pointer-events-none select-none"
                )}
              >
                <div className="flex-1" />

                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={() => setStickyAutoExpand(!stickyAutoExpand)}
                      aria-label={
                        stickyAutoExpand
                          ? "Disable Auto-Expand on Scroll"
                          : "Enable Auto-Expand on Scroll"
                      }
                      aria-pressed={stickyAutoExpand}
                      className={stickyAutoExpand ? iconButtonActive : iconButton}
                    >
                      <ListCollapse className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {stickyAutoExpand ? "Auto-Expand on Scroll: On" : "Auto-Expand on Scroll: Off"}
                  </TooltipContent>
                </Tooltip>
              </div>

              {/* Config Form / JSON. pb-6 matches the h-6 scroll-edge fade below:
                at full scroll the fade overlays only this padding, never the
                last field row. */}
              <div
                className={cn(
                  "px-3 pb-6",
                  !configEditingEnabled && "opacity-40 pointer-events-none select-none"
                )}
              >
                <SchemaConfigForm
                  schema={configSchema}
                  value={config}
                  focusPath={focusPath}
                  disabled={!configEditingEnabled}
                  collapse={collapse}
                  onStageResetRequest={(pointer, label) => setStageResetTarget({ pointer, label })}
                  onChange={(next) => onConfigChange(next)}
                />
              </div>
              {/* Scroll-edge fade: sticky inside the scroll container so mid-scroll
                cuts read as "more below" instead of the end of the form. The
                negative margin keeps it from adding scroll height; it fades to
                the panel surface (popover) and never intercepts the pointer. */}
              <div
                aria-hidden="true"
                className="sticky bottom-0 -mt-6 h-6 shrink-0 pointer-events-none bg-gradient-to-t from-popover to-transparent"
              />
            </>
          </div>
        )}

        {/* Footer */}
        <div className={cn("flex-shrink-0 px-3 py-2.5 border-t", borderColor, sectionBg)}>
          <div className="flex items-center gap-2">
            {/*
              Save & Deploy menu — Radix `DropdownMenu` (role=menu/menuitem,
              Escape, arrow-key roving focus, focus trap + restore for free). The
              Actions map directly to the repo-backed save and portable
              import/export boundaries. Radix closes on select; the controlled
              open state lets disabled transitions force-close it.

              This is the panel's only footer action: running lives exclusively
              in the footer run console (Pass-2 run-console spec — one Run CTA).
            */}
            <DropdownMenu open={showSaveMenu} onOpenChange={setShowSaveMenu}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      disabled={saveActionDisabled}
                      className={cn("flex-1", isSaveDeployRunning && "opacity-70 cursor-wait")}
                    >
                      <Save className="w-4 h-4" aria-hidden="true" />
                      <span>Save & Deploy</span>
                    </Button>
                  </DropdownMenuTrigger>
                </TooltipTrigger>
                <TooltipContent>{saveTitle}</TooltipContent>
              </Tooltip>

              <DropdownMenuContent align="end" side="top" className="w-36">
                <DropdownMenuItem onSelect={() => onSaveToCurrent()}>
                  Save & Deploy
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => onSaveAsNew()}>
                  Save & Deploy As…
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => onExportConfig()}>Export…</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => onImportConfig()}>Import…</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Stage Reset Confirmation Dialog — copy names the one stage it acts
          on; confirming patches only that stage back to its schema defaults. */}
      <Dialog
        open={stageResetTarget !== null}
        onOpenChange={(open) => {
          if (!open) setStageResetTarget(null);
        }}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eraser className="w-4 h-4" />
              Reset {stageResetTarget?.label}
            </DialogTitle>
            <DialogDescription>
              This will reset {stageResetTarget?.label} overrides to their default values.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button variant="destructive" onClick={confirmStageReset}>
              Reset
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
