// ============================================================================
// RECIPE PANEL
// ============================================================================
// Left sidebar for recipe selection and pipeline configuration.
// Fully controlled component - all options passed via props.
// Uses path-based patching for efficient state updates.
// ============================================================================

import type { MapConfigSaveDeployStatus } from "@civ7/studio-contract";
import {
  BookOpen,
  Braces,
  Eraser,
  Focus,
  ListCollapse,
  Save,
  Settings,
  TriangleAlert,
} from "lucide-react";
import React, { useMemo, useRef, useState } from "react";
import type { XSchema } from "typebox/schema";
import { LAYOUT } from "../../lib/layout.js";
import { cn } from "../../lib/utils.js";
import type { PipelineConfig, RecipeSettings, SelectOption } from "../../types/index.js";
import { DisclosureHeader } from "../composites/DisclosureHeader.js";
import { OptionSelect } from "../composites/OptionSelect.js";
import { SchemaConfigForm } from "../forms/SchemaConfigForm.js";
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
  config: PipelineConfig | null;
  /** Config schema (recipe artifacts) */
  configSchema: XSchema;
  /** Path-based patch callback for efficient state updates */
  onConfigChange: (next: PipelineConfig) => void;
  /** Callback to reset config to defaults */
  onConfigReset: () => void;
  /** Available recipe options */
  recipeOptions: ReadonlyArray<SelectOption>;
  /** Available preset options */
  presetOptions: ReadonlyArray<SelectOption>;
  /** Currently selected step (for focus mode) */
  selectedStep: string;
  /** Current recipe settings */
  settings: RecipeSettings;
  /** Callback when recipe settings change */
  onSettingsChange: (settings: RecipeSettings) => void;
  /** Callback to save preset to current */
  onSaveToCurrent: () => void;
  /** Callback to save preset as new */
  onSaveAsNew: () => void;
  /** Callback to import preset */
  onImportPreset: () => void;
  /** Callback to export preset */
  onExportPreset: () => void;
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
  /** Recovery commands shown when persisted authoring cannot resolve to a config. */
  authoringBlocked?: Readonly<{
    reason: "missing-catalog-source" | "invalid-persistence";
    onSelectExistingCatalogConfig: () => void;
    onCreateNewEditorConfig: () => void;
  }>;
}
// ============================================================================
// Main Component
// ============================================================================
export const RecipePanel: React.FC<RecipePanelProps> = ({
  config,
  configSchema,
  onConfigChange,
  onConfigReset,
  recipeOptions,
  presetOptions,
  selectedStep,
  settings,
  onSettingsChange,
  onSaveToCurrent,
  onSaveAsNew,
  onImportPreset,
  onExportPreset,
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
  authoringBlocked,
}) => {
  // ==========================================================================
  // Local State
  // ==========================================================================
  const [localRecipeCollapsed, setLocalRecipeCollapsed] = useState(false);
  const [localConfigCollapsed, setLocalConfigCollapsed] = useState(false);
  const [localConfigEditingEnabled, setLocalConfigEditingEnabled] = useState(true);
  const [showJson, setShowJson] = useState(false);
  const [showAllSteps, setShowAllSteps] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
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
  const saveActionDisabled =
    isSaveDisabled || isSaveDeployRunning || authoringBlocked !== undefined;
  const saveLabel = saveDeployStatus
    ? formatMapConfigSaveDeployPhaseLabel(saveDeployStatus.phase)
    : "Save & Deploy Config";
  const saveTitle = isSaveDeployRunning
    ? `Save & Deploy Config: ${saveLabel}`
    : saveActionDisabled
      ? authoringBlocked
        ? "Recover the authoring source before saving"
        : "Save unavailable while another operation is running"
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
  const filteredConfig = useMemo(() => {
    if (config === null) return null;
    if (showAllSteps || !selectedStep) return config;
    if (config[selectedStep])
      return {
        [selectedStep]: config[selectedStep],
      };
    return config;
  }, [config, selectedStep, showAllSteps]);
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
  // ==========================================================================
  // Handlers
  // ==========================================================================
  const updateSetting = <K extends keyof RecipeSettings>(key: K, value: RecipeSettings[K]) => {
    onSettingsChange({
      ...settings,
      [key]: value,
    });
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
  const iconBtn =
    "h-7 w-7 flex items-center justify-center rounded transition-colors shrink-0 text-muted-foreground hover:text-foreground hover:bg-accent";
  const iconBtnActive =
    "h-7 w-7 flex items-center justify-center rounded transition-colors shrink-0 text-foreground bg-muted";
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

        {/* Recipe & Preset Selection */}
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
                value={settings.recipe}
                onValueChange={(value) => updateSetting("recipe", value)}
                ariaLabel="Recipe"
                options={recipeOptions.map((opt) => ({
                  value: opt.value,
                  label: opt.label,
                }))}
                className="flex-1"
                disabled={authoringBlocked !== undefined}
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
                value={settings.preset}
                onValueChange={(value) => updateSetting("preset", value)}
                ariaLabel="Config"
                options={presetOptions.map((opt) => ({
                  value: opt.value,
                  label: opt.label,
                }))}
                className="flex-1"
                disabled={authoringBlocked !== undefined}
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
              authoringBlocked ? null : (
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
                        className={!showAllSteps ? iconBtnActive : iconBtn}
                      >
                        <Focus className="w-3.5 h-3.5" aria-hidden="true" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      {showAllSteps ? "Focus Current Step" : "Show All Steps"}
                    </TooltipContent>
                  </Tooltip>
                </>
              )
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
            {authoringBlocked ? (
              <div className="px-3 py-4">
                <div className="border border-warning/40 bg-warning/10 p-3 text-data">
                  <div className="flex items-start gap-2">
                    <TriangleAlert
                      className="mt-0.5 h-4 w-4 shrink-0 text-warning"
                      aria-hidden="true"
                    />
                    <div className="space-y-3">
                      <p className={cn("font-medium", textPrimary)}>
                        {authoringBlocked.reason === "missing-catalog-source"
                          ? "The saved catalog config is no longer available."
                          : "The saved authoring config is invalid."}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={authoringBlocked.onSelectExistingCatalogConfig}
                        >
                          Select existing catalog config
                        </Button>
                        <Button size="sm" onClick={authoringBlocked.onCreateNewEditorConfig}>
                          Create new editor config
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
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
                        className={stickyAutoExpand ? iconBtnActive : iconBtn}
                      >
                        <ListCollapse className="w-3.5 h-3.5" aria-hidden="true" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      {stickyAutoExpand
                        ? "Auto-Expand on Scroll: On"
                        : "Auto-Expand on Scroll: Off"}
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={() => setShowResetModal(true)}
                        aria-label="Reset Config to Defaults"
                        className={iconBtn}
                      >
                        <Eraser className="w-3.5 h-3.5" aria-hidden="true" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>Reset to Defaults</TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={() => setShowJson(!showJson)}
                        aria-label={showJson ? "Show Form View" : "Show JSON View"}
                        aria-pressed={showJson}
                        className={showJson ? iconBtnActive : iconBtn}
                      >
                        <Braces className="w-3.5 h-3.5" aria-hidden="true" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      {showJson ? "Show Form View" : "Show JSON View"}
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
                  {config === null ? null : showJson ? (
                    <div className="border border-border-subtle rounded p-2.5 max-h-[240px] overflow-auto bg-surface-sunken">
                      <pre
                        className={cn(
                          "text-label font-mono leading-relaxed",
                          textMuted,
                          "whitespace-pre-wrap break-all"
                        )}
                      >
                        {JSON.stringify(filteredConfig, null, 2)}
                      </pre>
                    </div>
                  ) : (
                    <SchemaConfigForm
                      schema={configSchema}
                      value={config}
                      focusPath={focusPath}
                      disabled={!configEditingEnabled}
                      collapse={collapse}
                      onChange={(next) => onConfigChange(next)}
                    />
                  )}
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
            )}
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
                <DropdownMenuItem onSelect={() => onExportPreset()}>Export…</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => onImportPreset()}>Import…</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Reset Confirmation Dialog */}
      <Dialog open={showResetModal} onOpenChange={setShowResetModal}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eraser className="w-4 h-4" />
              Reset Config
            </DialogTitle>
            <DialogDescription>
              This will reset the complete config to its default values.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              variant="destructive"
              onClick={() => {
                onConfigReset();
                setShowResetModal(false);
              }}
            >
              Reset
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
