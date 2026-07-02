// ============================================================================
// EXPLORE PANEL
// ============================================================================
// Stage selector, step list, data type list, and view controls.
// Fully controlled component - all options passed via props.
// ============================================================================

import {
  Activity,
  Bug,
  CircleDot,
  Compass,
  Flame,
  GitBranch,
  Hexagon,
  Layers,
  Maximize,
  SquareStack,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { LAYOUT } from "../../lib/layout.js";
import { cn } from "../../lib/utils.js";
import type {
  DataTypeOption,
  OverlayOption,
  RenderModeOption,
  SpaceOption,
  StageOption,
  StepOption,
  VariantOption,
} from "../../types/index.js";
import { DisclosureHeader } from "../composites/DisclosureHeader.js";
import {
  type WaterStatsLayerRef,
  WaterStatsSection,
  type WaterStatsSummary,
} from "../composites/WaterStatsSection.js";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip.js";
// ============================================================================
// Props
// ============================================================================
// Generic over the water-stats layer-ref type (the WaterStatsSection contract):
// the app instantiates TRef at its WIDER viz-domain ref so the ref handed back
// through `onRiverLakeInspectorLayerSelect` keeps every field the caller
// supplied (e.g. stepId/visibility), not just the narrow rendered slice.
export interface ExplorePanelProps<TRef extends WaterStatsLayerRef = WaterStatsLayerRef> {
  /** Available stages to select from */
  stages: StageOption[];
  /** Currently selected stage */
  selectedStage: string;
  /** Callback when stage selection changes */
  onSelectedStageChange: (stage: string) => void;
  /** Available steps for the current stage */
  steps: StepOption[];
  /** Currently selected step */
  selectedStep: string;
  /** Callback when step selection changes */
  onSelectedStepChange: (step: string) => void;
  /** Available data types (formerly "layers") */
  dataTypeOptions: DataTypeOption[];
  /** Currently selected data type */
  selectedDataType: string;
  /** Callback when data type selection changes */
  onSelectedDataTypeChange: (dataType: string) => void;
  /** Available spaces (spaceId) for selected data type */
  spaceOptions: SpaceOption[];
  /** Currently selected space */
  selectedSpace: string;
  /** Callback when space selection changes */
  onSelectedSpaceChange: (space: string) => void;
  /** Available render modes (`kind[:role]`) */
  renderModeOptions: RenderModeOption[];
  /** Currently selected render mode */
  selectedRenderMode: string;
  /** Callback when render mode selection changes */
  onSelectedRenderModeChange: (renderMode: string) => void;
  /** Available variants for selected render mode */
  variantOptions: VariantOption[];
  /** Currently selected variant */
  selectedVariant: string;
  /** Callback when variant selection changes */
  onSelectedVariantChange: (variant: string) => void;
  /** Overlay options for correlation mode */
  overlayOptions: OverlayOption[];
  /** Currently selected overlay option */
  selectedOverlay: string;
  /** Callback when overlay selection changes */
  onSelectedOverlayChange: (overlay: string) => void;
  /** Overlay opacity (0..1) */
  overlayOpacity: number;
  /** Callback when overlay opacity changes */
  onOverlayOpacityChange: (opacity: number) => void;
  /** Whether era control is active */
  eraEnabled: boolean;
  /** Era control mode */
  eraMode: "auto" | "fixed";
  /** Current era value */
  eraValue: number;
  /** Minimum era value */
  eraMin: number;
  /** Maximum era value */
  eraMax: number;
  /** Callback when era mode changes */
  onEraModeChange: (mode: "auto" | "fixed") => void;
  /** Callback when era value changes */
  onEraValueChange: (era: number) => void;
  /** Whether to show edge visualization */
  showEdges: boolean;
  /** Callback when edge visibility changes */
  onShowEdgesChange: (show: boolean) => void;
  /** Whether debug layers/variants are visible */
  showDebugLayers: boolean;
  /** Callback when debug visibility changes */
  onShowDebugLayersChange: (show: boolean) => void;
  /** Callback when fit view is requested */
  onFitView: () => void;
  /** Whether the stage section is expanded (optional controlled mode) */
  stageExpanded?: boolean;
  /** Callback when stageExpanded changes (optional controlled mode) */
  onStageExpandedChange?: (expanded: boolean) => void;
  /** Whether the step section is expanded (optional controlled mode) */
  stepExpanded?: boolean;
  /** Callback when stepExpanded changes (optional controlled mode) */
  onStepExpandedChange?: (expanded: boolean) => void;
  /** Whether the layers section is expanded (optional controlled mode) */
  layersExpanded?: boolean;
  /** Callback when layersExpanded changes (optional controlled mode) */
  onLayersExpandedChange?: (expanded: boolean) => void;
  /** River/Lake/Floodplain inspector summary (Water proof section) */
  riverLakeInspectorSummary?: WaterStatsSummary<TRef> | null;
  /** Callback when a water-proof evidence layer chip is clicked */
  onRiverLakeInspectorLayerSelect?: (ref: TRef) => void;
  /** Whether the water-proof section is expanded (optional controlled mode) */
  waterStatsExpanded?: boolean;
  /** Callback when waterStatsExpanded changes (optional controlled mode) */
  onWaterStatsExpandedChange?: (expanded: boolean) => void;
}
// ============================================================================
// Component
// ============================================================================
export function ExplorePanel<TRef extends WaterStatsLayerRef = WaterStatsLayerRef>({
  stages,
  selectedStage,
  onSelectedStageChange,
  steps,
  selectedStep,
  onSelectedStepChange,
  dataTypeOptions,
  selectedDataType,
  onSelectedDataTypeChange,
  spaceOptions,
  selectedSpace,
  onSelectedSpaceChange,
  renderModeOptions,
  selectedRenderMode,
  onSelectedRenderModeChange,
  variantOptions,
  selectedVariant,
  onSelectedVariantChange,
  overlayOptions,
  selectedOverlay,
  onSelectedOverlayChange,
  overlayOpacity,
  onOverlayOpacityChange,
  eraEnabled,
  eraMode,
  eraValue,
  eraMin,
  eraMax,
  onEraModeChange,
  onEraValueChange,
  showEdges,
  onShowEdgesChange,
  showDebugLayers,
  onShowDebugLayersChange,
  onFitView,
  stageExpanded: stageExpandedProp,
  onStageExpandedChange,
  stepExpanded: stepExpandedProp,
  onStepExpandedChange,
  layersExpanded: layersExpandedProp,
  onLayersExpandedChange,
  riverLakeInspectorSummary,
  onRiverLakeInspectorLayerSelect,
  waterStatsExpanded: waterStatsExpandedProp,
  onWaterStatsExpandedChange,
}: ExplorePanelProps<TRef>) {
  const [localStageExpanded, setLocalStageExpanded] = useState(true);
  const [localStepExpanded, setLocalStepExpanded] = useState(true);
  const [localLayersExpanded, setLocalLayersExpanded] = useState(true);
  const [localWaterStatsExpanded, setLocalWaterStatsExpanded] = useState(false);
  const [groupOpen, setGroupOpen] = useState<Record<string, boolean>>({});

  const isStageExpanded = stageExpandedProp ?? localStageExpanded;
  const setIsStageExpanded = (next: boolean) => {
    onStageExpandedChange?.(next);
    if (stageExpandedProp === undefined) setLocalStageExpanded(next);
  };

  const isStepExpanded = stepExpandedProp ?? localStepExpanded;
  const setIsStepExpanded = (next: boolean) => {
    onStepExpandedChange?.(next);
    if (stepExpandedProp === undefined) setLocalStepExpanded(next);
  };

  const isLayersExpanded = layersExpandedProp ?? localLayersExpanded;
  const setIsLayersExpanded = (next: boolean) => {
    onLayersExpandedChange?.(next);
    if (layersExpandedProp === undefined) setLocalLayersExpanded(next);
  };

  const isWaterStatsExpanded = waterStatsExpandedProp ?? localWaterStatsExpanded;
  const setIsWaterStatsExpanded = (next: boolean) => {
    onWaterStatsExpandedChange?.(next);
    if (waterStatsExpandedProp === undefined) setLocalWaterStatsExpanded(next);
  };
  const currentStage = stages.find((s) => s.value === selectedStage);
  const currentStep = steps.find((s) => s.value === selectedStep);
  const currentLayer = dataTypeOptions.find((dt) => dt.value === selectedDataType);
  const currentLayerGroup = currentLayer?.group ?? "";
  // Auto-select data type when only one is available
  useEffect(() => {
    if (dataTypeOptions.length === 1 && selectedDataType !== dataTypeOptions[0].value) {
      onSelectedDataTypeChange(dataTypeOptions[0].value);
    }
  }, [dataTypeOptions, selectedDataType, onSelectedDataTypeChange]);

  // Auto-open the current layer's group when it changes — done during render via
  // the store-prev-value pattern instead of in an effect
  // (react-hooks/set-state-in-effect). Parity: fires on the same currentLayerGroup
  // transition as the prior effect; mount is a no-op (groupOpen starts empty, so
  // `?? true` treats every group as already open).
  const [prevLayerGroup, setPrevLayerGroup] = useState(currentLayerGroup);
  if (currentLayerGroup !== prevLayerGroup) {
    setPrevLayerGroup(currentLayerGroup);
    if (currentLayerGroup) {
      setGroupOpen((prev) => {
        const current = prev[currentLayerGroup] ?? true;
        if (current) return prev;
        return { ...prev, [currentLayerGroup]: true };
      });
    }
  }
  // ==========================================================================
  // Handlers
  // ==========================================================================
  const handleSelectStage = (stageValue: string) => {
    onSelectedStageChange(stageValue);
  };
  const handleSelectStep = (stepValue: string) => {
    onSelectedStepChange(stepValue);
  };
  const handleSelectLayer = (layerValue: string) => {
    onSelectedDataTypeChange(layerValue);
  };
  // ==========================================================================
  // Styles
  // ==========================================================================
  // Token-driven chrome; theme follows the single `.dark` class. The dock
  // floats over the deck.gl map, so it rides the `popover` tier. Active list
  // items use the steel contour (a thin rule + `bg-muted`), not a saturated
  // slab.
  const panelBg = "bg-popover/95";
  const panelBorder = "border-border";
  const textPrimary = "text-foreground";
  const textSecondary = "text-muted-foreground";
  const textMuted = "text-muted-foreground/70";
  const borderSubtle = "border-border-subtle";
  const listMaxHeight = "max-h-[200px]";
  // Stage list styles
  const stageItemBase = `w-full text-left px-3 py-2 text-data font-medium transition-colors cursor-pointer flex items-center gap-2`;
  const stageItemActive = "bg-accent text-foreground";
  const stageItemInactive = "text-muted-foreground hover:bg-accent hover:text-foreground";
  // Step/DataType list styles
  const stepItemBase = `w-full text-left px-3 py-1.5 text-data font-mono transition-colors cursor-pointer flex items-center gap-2 border-l-2`;
  const stepItemActive = "border-primary bg-accent text-foreground";
  const stepItemInactive =
    "border-transparent text-muted-foreground hover:bg-accent hover:text-foreground";
  const iconBtn =
    "h-7 w-7 flex items-center justify-center rounded transition-colors shrink-0 text-muted-foreground hover:text-foreground hover:bg-accent";
  const iconBtnActive =
    "h-7 w-7 flex items-center justify-center rounded transition-colors shrink-0 text-foreground bg-muted";
  // Segmented controls for mutually-exclusive option sets (Render / Space):
  // an inset container on the control-background token bounds the options so
  // they read as one control; the active segment lifts one surface tier
  // (Pass-2 explore-toolbar spec). Independent toggles keep `iconBtn`.
  // Toolbar cluster anatomy (Pass-3): a cluster heading names the target
  // (View = camera/map, Layer = selected data); row labels sit a tier below.
  const clusterHeading = cn("text-label font-semibold uppercase tracking-wider", textSecondary);
  const rowLabel = cn("text-label uppercase tracking-wider", textMuted);
  const segGroup =
    "inline-flex items-center rounded border border-border-subtle bg-input-background p-0.5";
  const segBtn =
    "h-6 w-6 flex items-center justify-center rounded-sm transition-colors shrink-0 text-muted-foreground hover:text-foreground";
  const segBtnActive =
    "h-6 w-6 flex items-center justify-center rounded-sm transition-colors shrink-0 text-foreground bg-muted";
  const stageBadge = (isActive: boolean) =>
    cn(
      "w-5 h-5 flex items-center justify-center rounded-full text-label font-semibold shrink-0",
      isActive ? "bg-muted text-foreground" : "bg-muted/50 text-muted-foreground"
    );
  const stepBadge = (isActive: boolean) =>
    cn(
      "w-4 h-4 flex items-center justify-center rounded text-[9px] font-mono shrink-0",
      isActive ? "bg-muted text-foreground" : "bg-muted/50 text-muted-foreground"
    );
  // Render mode icons map
  const getRenderModeIcon = (value: string) => {
    const kind = value.split(":")[0] ?? value;
    switch (value) {
      case "hexagonal":
      case "grid":
        return <Hexagon className="w-3.5 h-3.5" />;
      case "points":
        return <CircleDot className="w-3.5 h-3.5" />;
      case "fields":
      case "vectors":
        return <Activity className="w-3.5 h-3.5" />;
      case "heatmap":
        return <Flame className="w-3.5 h-3.5" />;
      default:
        if (kind === "points") return <CircleDot className="w-3.5 h-3.5" />;
        if (kind === "segments") return <GitBranch className="w-3.5 h-3.5" />;
        if (kind === "gridFields") return <Activity className="w-3.5 h-3.5" />;
        return <Hexagon className="w-3.5 h-3.5" />;
    }
  };

  const getSpaceIcon = (value: string) => {
    switch (value) {
      case "tile.hexOddR":
      case "tile.hexOddQ":
        return <Hexagon className="w-3.5 h-3.5" />;
      case "mesh.world":
        return <SquareStack className="w-3.5 h-3.5" />;
      case "world.xy":
        return <Layers className="w-3.5 h-3.5" />;
      default:
        return <Layers className="w-3.5 h-3.5" />;
    }
  };

  const groupedDataTypes = (() => {
    const indexByValue = new Map<string, number>();
    for (let i = 0; i < dataTypeOptions.length; i++)
      indexByValue.set(dataTypeOptions[i]!.value, i + 1);

    const order: string[] = [];
    const groups = new Map<string, DataTypeOption[]>();
    for (const dt of dataTypeOptions) {
      const key = dt.group ?? "";
      if (!groups.has(key)) {
        groups.set(key, []);
        order.push(key);
      }
      groups.get(key)!.push(dt);
    }
    return order.map((key) => ({ key, label: key, items: groups.get(key) ?? [], indexByValue }));
  })();

  // The data-type group disclosure is identified by its group name as a stable,
  // markup-safe id slug, so the toggle's `aria-controls` points at the rendered list.
  const groupListId = (key: string) => `explore-data-group-${key.replace(/[^a-zA-Z0-9_-]+/g, "-")}`;
  const isGroupExpanded = (key: string) => groupOpen[key] ?? true;
  const toggleGroupExpanded = (key: string) => {
    if (!key) return;
    setGroupOpen((prev) => {
      const current = prev[key] ?? true;
      return { ...prev, [key]: !current };
    });
  };
  // ==========================================================================
  // Render
  // ==========================================================================
  // Width comes from the LAYOUT geometry authority; the panel caps at the
  // dock's header→footer column (`max-h-full`) and scrolls internally instead
  // of underlapping the footer on short viewports. pointer-events-auto restores
  // interactivity inside the pass-through dock.
  return (
    <div
      style={{ width: LAYOUT.EXPLORE_PANEL_WIDTH }}
      className={cn(
        "flex flex-col max-h-full rounded-lg border overflow-y-auto overflow-x-hidden custom-scrollbar shadow-lg backdrop-blur-sm pointer-events-auto",
        panelBg,
        panelBorder
      )}
    >
      {/* 1. STAGE SECTION */}
      <div className={cn("flex-shrink-0 border-b", borderSubtle)}>
        <DisclosureHeader
          className="px-3 py-2.5"
          expanded={isStageExpanded}
          onToggle={setIsStageExpanded}
          controls="explore-stage-list"
          icon={<Compass className={cn("w-4 h-4 shrink-0", textSecondary)} />}
          title={<span className={cn("text-[13px] font-semibold", textPrimary)}>Stage</span>}
          summary={
            <span className={cn("text-[12px] font-semibold", textPrimary, "truncate")}>
              {currentStage?.label ?? ""}
            </span>
          }
          trailing={<span className={cn("text-label", textMuted)}>{stages.length}</span>}
        />
      </div>
      {isStageExpanded ? (
        <div
          id="explore-stage-list"
          className={cn(
            "flex-shrink-0 py-1 border-b",
            borderSubtle,
            listMaxHeight,
            "overflow-y-auto custom-scrollbar"
          )}
        >
          {stages.map((stage, index) => (
            <button
              key={stage.value}
              onClick={() => handleSelectStage(stage.value)}
              aria-current={stage.value === selectedStage ? "true" : undefined}
              className={cn(
                stageItemBase,
                stage.value === selectedStage ? stageItemActive : stageItemInactive
              )}
            >
              <span className={stageBadge(stage.value === selectedStage)}>{index + 1}</span>
              <span className="truncate">{stage.label}</span>
            </button>
          ))}
        </div>
      ) : null}

      {/* 2. STEP SECTION */}
      <div className={cn("flex-shrink-0 border-b", borderSubtle)}>
        <DisclosureHeader
          className="px-3 py-2"
          expanded={isStepExpanded}
          onToggle={setIsStepExpanded}
          controls="explore-step-list"
          icon={<Layers className={cn("w-3.5 h-3.5 shrink-0", textSecondary)} />}
          title={
            <span
              className={cn("text-data font-semibold", textSecondary, "uppercase tracking-wider")}
            >
              Step
            </span>
          }
          summary={
            <span className={cn("text-data font-mono", textPrimary, "truncate")}>
              {currentStep?.label ?? ""}
            </span>
          }
          trailing={<span className={cn("text-label", textMuted)}>{steps.length}</span>}
        />
      </div>
      {isStepExpanded ? (
        <div
          id="explore-step-list"
          className={cn(
            "flex-shrink-0 pb-2 border-b",
            borderSubtle,
            listMaxHeight,
            "overflow-y-auto custom-scrollbar"
          )}
        >
          {steps.length > 0 ? (
            steps.map((step, index) => (
              <button
                key={`${step.category}-${step.value}`}
                onClick={() => handleSelectStep(step.value)}
                aria-current={step.value === selectedStep ? "true" : undefined}
                className={cn(
                  stepItemBase,
                  step.value === selectedStep ? stepItemActive : stepItemInactive
                )}
              >
                <span className={stepBadge(step.value === selectedStep)}>{index + 1}</span>
                <span className="truncate">{step.label}</span>
              </button>
            ))
          ) : (
            <div className={cn("px-3 py-2 text-data", textMuted, "italic")}>No steps available</div>
          )}
        </div>
      ) : null}

      {/* WATER PROOF SECTION — River/Lake/Floodplain inspector rows */}
      <WaterStatsSection
        summary={riverLakeInspectorSummary}
        onLayerSelect={onRiverLakeInspectorLayerSelect}
        expanded={isWaterStatsExpanded}
        onExpandedChange={setIsWaterStatsExpanded}
      />

      {/* 3. LAYERS SECTION. The debug toggle lives on this header — it filters
          which entries the data list shows (`includeDebug`), so it belongs to
          the list, not to the view toolbar (Pass-3 explore-toolbar spec). It is
          a sibling of the disclosure button, never nested inside it. */}
      <div className={cn("flex-shrink-0 border-b", borderSubtle, "flex items-center")}>
        <DisclosureHeader
          className="w-auto flex-1 min-w-0 pl-3 pr-2 py-2"
          expanded={isLayersExpanded}
          onToggle={setIsLayersExpanded}
          controls="explore-layers-list"
          icon={<SquareStack className={cn("w-3.5 h-3.5 shrink-0", textSecondary)} />}
          title={
            <span
              className={cn("text-data font-semibold", textSecondary, "uppercase tracking-wider")}
            >
              Data
            </span>
          }
          summary={
            <span className={cn("text-data font-mono", textPrimary, "truncate")}>
              {currentLayer?.label ?? ""}
            </span>
          }
          trailing={<span className={cn("text-label", textMuted)}>{dataTypeOptions.length}</span>}
        />
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => onShowDebugLayersChange(!showDebugLayers)}
              aria-label={showDebugLayers ? "Hide debug layers" : "Show debug layers"}
              aria-pressed={showDebugLayers}
              className={cn("mr-2", showDebugLayers ? iconBtnActive : iconBtn)}
            >
              <Bug className="w-3.5 h-3.5" />
            </button>
          </TooltipTrigger>
          <TooltipContent>
            {showDebugLayers ? "Hide debug layers" : "Show debug layers"}
          </TooltipContent>
        </Tooltip>
      </div>
      {isLayersExpanded ? (
        <div
          id="explore-layers-list"
          className={cn(
            "flex-shrink-0 pb-2 border-b",
            borderSubtle,
            listMaxHeight,
            "overflow-y-auto custom-scrollbar"
          )}
        >
          {groupedDataTypes.map((group) => {
            const expanded = !group.key || isGroupExpanded(group.key);
            return (
              <React.Fragment key={group.key || "__ungrouped__"}>
                {group.key ? (
                  // The toggle's accessible name is the visible group name; the
                  // expand/collapse state is conveyed by aria-expanded, so no
                  // aria-label override is needed (it would mask the group name).
                  // Row eyebrow type (text-label/uppercase) stays on the title
                  // node — never the merged row class — so the feature-tier cn
                  // can't clobber the dense font-size against the color.
                  <DisclosureHeader
                    className="px-3 pt-2 pb-1"
                    expanded={expanded}
                    onToggle={() => toggleGroupExpanded(group.key)}
                    controls={groupListId(group.key)}
                    title={
                      <span className="text-label uppercase tracking-wider text-muted-foreground/70 truncate">
                        {group.label}
                      </span>
                    }
                    trailing={
                      <span className={cn("text-label", textMuted)}>{group.items.length}</span>
                    }
                  />
                ) : null}
                {expanded ? (
                  <div id={group.key ? groupListId(group.key) : undefined}>
                    {group.items.map((dataType) => {
                      const idx = group.indexByValue.get(dataType.value) ?? 0;
                      return (
                        <button
                          key={dataType.value}
                          onClick={() => handleSelectLayer(dataType.value)}
                          aria-current={dataType.value === selectedDataType ? "true" : undefined}
                          className={cn(
                            stepItemBase,
                            dataType.value === selectedDataType ? stepItemActive : stepItemInactive
                          )}
                        >
                          <span className={stepBadge(dataType.value === selectedDataType)}>
                            {idx}
                          </span>
                          <span className="truncate">{dataType.label}</span>
                        </button>
                      );
                    })}
                  </div>
                ) : null}
              </React.Fragment>
            );
          })}
        </div>
      ) : null}

      {/* 4. VIEW + LAYER TOOLBAR — controls grouped by target (Pass-3):
          VIEW acts on the camera/map display; LAYER acts on the selected data
          layer's presentation. Rows are label-left / control-right. */}
      <div className="flex-shrink-0 p-2 flex flex-col gap-2">
        {/* VIEW cluster: camera + map-display */}
        <div className="flex items-center justify-between gap-2">
          <span className={clusterHeading}>View</span>
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <button onClick={onFitView} aria-label="Fit to view" className={iconBtn}>
                  <Maximize className="w-3.5 h-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent>Fit to view</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => onShowEdgesChange(!showEdges)}
                  aria-label={showEdges ? "Hide edges" : "Show edges"}
                  aria-pressed={showEdges}
                  className={showEdges ? iconBtnActive : iconBtn}
                >
                  <GitBranch className="w-3.5 h-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent>{showEdges ? "Hide edges" : "Show edges"}</TooltipContent>
            </Tooltip>
          </div>
        </div>

        <div className={cn("border-t", borderSubtle)} />

        {/* LAYER cluster: how the selected data layer renders. ("Layer", not
            "Data" — the Data list section sits directly above this toolbar.) */}
        <div className="flex flex-col gap-1.5">
          <span className={clusterHeading}>Layer</span>
          <div className="flex items-center justify-between gap-2">
            <span className={rowLabel}>Render</span>
            <div className={segGroup}>
              {renderModeOptions.map((option) => (
                <Tooltip key={option.value}>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => onSelectedRenderModeChange(option.value)}
                      aria-label={option.label}
                      aria-pressed={selectedRenderMode === option.value}
                      className={selectedRenderMode === option.value ? segBtnActive : segBtn}
                    >
                      {getRenderModeIcon(option.value)}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>{option.label}</TooltipContent>
                </Tooltip>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className={rowLabel}>Space</span>
            <div className={segGroup}>
              {spaceOptions.map((option) => (
                <Tooltip key={option.value}>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => onSelectedSpaceChange(option.value)}
                      aria-label={option.label}
                      aria-pressed={selectedSpace === option.value}
                      className={selectedSpace === option.value ? segBtnActive : segBtn}
                    >
                      {getSpaceIcon(option.value)}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>{option.label}</TooltipContent>
                </Tooltip>
              ))}
            </div>
          </div>
        </div>

        {eraEnabled ? (
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className={cn("text-label uppercase tracking-wider", textMuted)}>Era</span>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={() => onEraModeChange(eraMode === "auto" ? "fixed" : "auto")}
                    className={cn(
                      "px-2 h-6 rounded text-label font-semibold uppercase tracking-wider transition-colors",
                      eraMode === "auto"
                        ? "bg-muted text-foreground"
                        : "bg-input-background border border-input text-muted-foreground"
                    )}
                  >
                    Auto
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  {eraMode === "auto" ? "Auto (follow selected layer)" : "Manual era"}
                </TooltipContent>
              </Tooltip>
            </div>
            <input
              type="range"
              min={eraMin}
              max={eraMax}
              step={1}
              value={eraValue}
              disabled={eraMode === "auto"}
              onChange={(e) => onEraValueChange(Number(e.target.value))}
              aria-label="Era"
              className="w-full accent-primary"
            />
            <div className="flex items-center justify-between text-label">
              <span className={textMuted}>{`Era ${eraValue}`}</span>
              <span className={textMuted}>{`${eraMin}-${eraMax}`}</span>
            </div>
          </div>
        ) : null}

        {variantOptions.length > 1 ? (
          <label className="flex flex-col gap-1">
            <span className={cn("text-label uppercase tracking-wider", textMuted)}>Variant</span>
            <select
              value={selectedVariant}
              onChange={(e) => onSelectedVariantChange(e.target.value)}
              className="h-8 rounded px-2 text-data bg-input-background border border-input text-foreground"
            >
              {variantOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <span className={cn("text-label", textMuted)}>
              Semantic slices like <span className="text-muted-foreground">era:2</span>, not
              styling.
            </span>
          </label>
        ) : null}

        {overlayOptions.length ? (
          <label className="flex flex-col gap-1">
            <span className={cn("text-label uppercase tracking-wider", textMuted)}>Overlay</span>
            <select
              value={selectedOverlay}
              onChange={(e) => onSelectedOverlayChange(e.target.value)}
              className="h-8 rounded px-2 text-data bg-input-background border border-input text-foreground"
            >
              {overlayOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            {selectedOverlay ? (
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between text-label">
                  <span className={textMuted}>Opacity</span>
                  <span className={textMuted}>{Math.round(overlayOpacity * 100)}%</span>
                </div>
                <input
                  type="range"
                  min={0.1}
                  max={0.9}
                  step={0.05}
                  value={overlayOpacity}
                  onChange={(e) => onOverlayOpacityChange(Number(e.target.value))}
                  aria-label="Overlay opacity"
                  className="w-full accent-primary"
                />
              </div>
            ) : null}
          </label>
        ) : null}
      </div>
    </div>
  );
}
