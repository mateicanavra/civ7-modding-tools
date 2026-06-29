import { useCallback, useEffect, useMemo } from "react";

import {
  findVariantIdForEra,
  findVariantKeyForEra,
  listEraVariants,
  parseEraVariantKey,
  resolveFixedEraUiValue,
} from "../../features/viz/era";
import { applyRiverLakeInspectorSelection } from "../../features/viz/inspectorSelection";
import {
  buildRiverLakeFloodplainInspectorSummary,
  type RiverLakeInspectorLayerRef,
} from "../../features/viz/riverLakeInspector";
import { type UseVizStateResult, useVizState } from "../../features/viz/useVizState";
import type { RecipeArtifacts, StudioRecipeId } from "../../recipes/catalog";
import { getOverlaySuggestions } from "../../recipes/overlaySuggestions";
import { formatErrorForUi } from "../../shared/errorFormat";
import { clampNumber } from "../../shared/number";
import { useViewStore } from "../../stores/viewStore";
import type {
  DataTypeOption,
  OverlayOption,
  RenderModeOption,
  SpaceOption,
  StageOption,
  StepOption,
  VariantOption,
} from "../../ui/types";
import { formatStageName } from "../../ui/utils/formatting";

/** The resolved (dataType, space, renderMode, variant) tuple driving the canvas. */
export type VizSelection = {
  dataTypeId: string;
  spaceId: string;
  renderModeId: string;
  variantId: string;
};

export type UseVizSelectionArgs = {
  /** `recipeSettings.recipe` — drives the overlay-suggestion catalog (recipe-only). */
  recipe: StudioRecipeId;
  /** Host-owned recipe artifacts (shared with the config-form surface), threaded in. */
  recipeArtifacts: RecipeArtifacts;
  /** `browserRunner.state.running`, derived in host render scope; gates pending selection. */
  browserRunning: boolean;
  /** The single-owner error channel setter from `useStudioOperations`. */
  setLocalError: (message: string | null) => void;
};

export type UseVizSelectionResult = {
  /**
   * The raw `useVizState` handle, exposed BY VALUE (no new memoization) so its
   * per-render fresh-object identity is preserved for the host consumers that
   * still read it (the `vizIngestRef` sink, deck-autofit (slice 2.7b),
   * `backgroundGridEnabled`, `useBrowserRun`, and the canvas/explore JSX).
   */
  viz: UseVizStateResult;
  stages: StageOption[];
  steps: StepOption[];
  dataTypeOptions: DataTypeOption[];
  spaceOptions: SpaceOption[];
  renderModeOptions: RenderModeOption[];
  variantOptions: VariantOption[];
  overlayOptions: OverlayOption[];
  selection: VizSelection | null;
  eraEnabled: boolean;
  eraRange: { min: number; max: number } | null;
  eraDisplayValue: number;
  riverLakeInspectorSummary: ReturnType<typeof buildRiverLakeFloodplainInspectorSummary>;
  /** Single-owner navigation facade (§7.2): select a stage + (explicit/first) step. */
  navigateTo: (stageId: string, stepId?: string) => void;
  handleStageChange: (stageId: string) => void;
  handleStepChange: (stepId: string) => void;
  handleDataTypeChange: (next: string) => void;
  handleSpaceChange: (next: string) => void;
  handleRenderModeChange: (next: string) => void;
  handleVariantChange: (next: string) => void;
  handleEraModeChange: (nextMode: "auto" | "fixed") => void;
  handleEraValueChange: (nextEra: number) => void;
  handleRiverLakeInspectorLayerSelect: (ref: RiverLakeInspectorLayerRef) => void;
};

/**
 * `useVizSelection` — the visualization selection/exploration fixpoint.
 *
 * It owns `useVizState` plus the full stage → step → dataType → space →
 * renderMode → variant → era → overlay cascade, and is the SOLE writer of the
 * selected stage/step and the mutable `viz` object; only the viz read-projection
 * is threaded back out (architecture/10 §7.1/§7.2).
 *
 * Three structural invariants make this one indivisible hook:
 *  1. `overlayDataTypeKey` is derived in render phase BEFORE the internal
 *     `useVizState` (the forward edge of a genuine cycle: `overlayDataTypeKey` →
 *     `useVizState`, and `overlayVariantKeyPreference` ← back-edge). Moving it
 *     into state/effect would feed `useVizState` a stale `null` for one render
 *     (LS-6).
 *  2. The stage → step → viz-sync trio (stage-clamp / step-clamp / viz-sync) is
 *     Tier-A atomic and MUST stay in source order; the viz-sync effect keeps its
 *     `exhaustive-deps` suppression (deps `[selectedStepId]` only) — it reads
 *     `viz.selectedStepId` purely as a dedupe guard, and listing it would create
 *     an echo loop (SS-4).
 *  3. The era/overlay group (manualEra-clamp → overlay-prune → overlay-variant-
 *     pref) writes `setManualEra` / `setOverlaySelectionId` /
 *     `setOverlayVariantKeyPreference`, whose output PERSISTS (not self-healing),
 *     so the source order is load-bearing (EO-1).
 */
export function useVizSelection({
  recipe,
  recipeArtifacts,
  browserRunning,
  setLocalError,
}: UseVizSelectionArgs): UseVizSelectionResult {
  const showEdges = useViewStore((s) => s.showEdges);
  const overlaySelectionId = useViewStore((s) => s.overlaySelectionId);
  const setOverlaySelectionId = useViewStore((s) => s.setOverlaySelectionId);
  const overlayOpacity = useViewStore((s) => s.overlayOpacity);
  const overlayVariantKeyPreference = useViewStore((s) => s.overlayVariantKeyPreference);
  const setOverlayVariantKeyPreference = useViewStore((s) => s.setOverlayVariantKeyPreference);
  const eraMode = useViewStore((s) => s.eraMode);
  const setEraMode = useViewStore((s) => s.setEraMode);
  const manualEra = useViewStore((s) => s.manualEra);
  const setManualEra = useViewStore((s) => s.setManualEra);
  const selectedStageId = useViewStore((s) => s.selectedStageId);
  const setSelectedStageId = useViewStore((s) => s.setSelectedStageId);
  const selectedStepId = useViewStore((s) => s.selectedStepId);
  const setSelectedStepId = useViewStore((s) => s.setSelectedStepId);

  // Overlay suggestions are recipe-derived ONLY; `overlayDataTypeKey` must be
  // resolved in render phase before `useVizState` below (the forward edge of the
  // overlay cycle — see invariant 1).
  const overlaySuggestions = useMemo(() => getOverlaySuggestions(recipe), [recipe]);
  const overlaySelection = overlaySuggestions.find((opt) => opt.id === overlaySelectionId) ?? null;
  const overlayDataTypeKey = overlaySelection?.overlayDataTypeKey ?? null;

  const viz = useVizState({
    enabled: true,
    showEdgeOverlay: showEdges,
    overlayDataTypeKey,
    overlayVariantKeyPreference,
    overlayOpacity,
    allowPendingSelection: browserRunning,
    onError: (e) => setLocalError(formatErrorForUi(e)),
  });

  const dataTypeModel = viz.dataTypeModel;

  const stages: StageOption[] = useMemo(() => {
    return recipeArtifacts.uiMeta.stages.map((stage, index) => ({
      value: stage.stageId,
      label: stage.stageLabel ?? formatStageName(stage.stageId),
      index: index + 1,
    }));
  }, [recipeArtifacts.uiMeta.stages]);

  const steps: StepOption[] = useMemo(() => {
    if (!selectedStageId) return [];

    const labelByFullStepId = new Map(
      recipeArtifacts.uiMeta.stages.flatMap((stage) =>
        stage.steps.map((step) => [step.fullStepId, step.stepLabel] as const)
      )
    );

    const stage = recipeArtifacts.uiMeta.stages.find((s) => s.stageId === selectedStageId);
    return (
      stage?.steps.map((step) => ({
        value: step.fullStepId,
        label: labelByFullStepId.get(step.fullStepId) ?? step.stepLabel ?? step.stepId,
        category: selectedStageId,
      })) ?? []
    );
  }, [recipeArtifacts.uiMeta.stages, selectedStageId]);

  useEffect(() => {
    if (stages.length === 0) return;
    setSelectedStageId((prev) => (stages.some((s) => s.value === prev) ? prev : stages[0]!.value));
  }, [stages]);

  useEffect(() => {
    if (steps.length === 0) return;
    setSelectedStepId((prev) => (steps.some((s) => s.value === prev) ? prev : steps[0]!.value));
  }, [steps]);

  useEffect(() => {
    if (!selectedStepId) return;
    if (viz.selectedStepId === selectedStepId) return;
    viz.setSelectedStepId(selectedStepId);
    viz.setSelectedLayerKey(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedStepId]);

  const dataTypeOptions: DataTypeOption[] = useMemo(() => {
    if (!dataTypeModel) return [];
    return dataTypeModel.dataTypes.map((dt) => ({
      value: dt.dataTypeId,
      label: dt.label,
      group: dt.group,
    }));
  }, [dataTypeModel]);

  const riverLakeInspectorSummary = useMemo(
    () => buildRiverLakeFloodplainInspectorSummary(viz.manifest),
    [viz.manifest]
  );

  const selection = useMemo(() => {
    if (!dataTypeModel) return null;
    for (const dt of dataTypeModel.dataTypes) {
      for (const space of dt.spaces) {
        for (const rm of space.renderModes) {
          for (const variant of rm.variants) {
            if (variant.layerKey === viz.selectedLayerKey) {
              return {
                dataTypeId: dt.dataTypeId,
                spaceId: space.spaceId,
                renderModeId: rm.renderModeId,
                variantId: variant.variantId,
              };
            }
          }
        }
      }
    }
    const firstDt = dataTypeModel.dataTypes[0];
    const firstSpace = firstDt?.spaces[0];
    const firstRm = firstSpace?.renderModes[0];
    const firstVariant = firstRm?.variants[0];
    if (!firstDt || !firstSpace || !firstRm || !firstVariant) return null;
    return {
      dataTypeId: firstDt.dataTypeId,
      spaceId: firstSpace.spaceId,
      renderModeId: firstRm.renderModeId,
      variantId: firstVariant.variantId,
    };
  }, [dataTypeModel, viz.selectedLayerKey]);

  const selectedDataType = useMemo(() => {
    if (!dataTypeModel || !selection) return null;
    return dataTypeModel.dataTypes.find((x) => x.dataTypeId === selection.dataTypeId) ?? null;
  }, [dataTypeModel, selection]);

  const selectedSpace = useMemo(() => {
    if (!selectedDataType || !selection) return null;
    return (
      selectedDataType.spaces.find((s) => s.spaceId === selection.spaceId) ??
      selectedDataType.spaces[0] ??
      null
    );
  }, [selectedDataType, selection]);

  const selectedRenderMode = useMemo(() => {
    if (!selectedSpace || !selection) return null;
    return (
      selectedSpace.renderModes.find((rm) => rm.renderModeId === selection.renderModeId) ??
      selectedSpace.renderModes[0] ??
      null
    );
  }, [selectedSpace, selection]);

  const selectedVariants = selectedRenderMode?.variants ?? [];
  const selectedVariant = useMemo(() => {
    if (!selection) return selectedVariants[0] ?? null;
    return (
      selectedVariants.find((v) => v.variantId === selection.variantId) ??
      selectedVariants[0] ??
      null
    );
  }, [selectedVariants, selection]);
  const selectedVariantKey = selectedVariant?.layer.variantKey ?? null;

  const spaceOptions: SpaceOption[] = useMemo(() => {
    if (!selectedDataType) return [];
    return selectedDataType.spaces.map((s) => ({ value: s.spaceId, label: s.label }));
  }, [selectedDataType]);

  const renderModeOptions: RenderModeOption[] = useMemo(() => {
    if (!selectedSpace) return [];
    return selectedSpace.renderModes.map((rm) => ({
      value: rm.renderModeId,
      label: rm.label,
    }));
  }, [selectedSpace]);

  const variantOptions: VariantOption[] = useMemo(
    () => selectedVariants.map((v) => ({ value: v.variantId, label: v.label })),
    [selectedVariants]
  );

  const eraVariants = useMemo(() => listEraVariants(selectedVariants), [selectedVariants]);
  const eraRange = useMemo(() => {
    if (!eraVariants.length) return null;
    const min = eraVariants[0]?.era ?? 1;
    const max = eraVariants[eraVariants.length - 1]?.era ?? min;
    return { min, max };
  }, [eraVariants]);
  const autoEra = useMemo(() => parseEraVariantKey(selectedVariantKey), [selectedVariantKey]);
  const eraEnabled = Boolean(eraRange);
  const fixedEraUiValue = useMemo(
    () =>
      resolveFixedEraUiValue({
        variants: selectedVariants,
        selectedVariantKey,
        requestedEra: manualEra,
      }),
    [manualEra, selectedVariantKey, selectedVariants]
  );
  const eraDisplayValue = eraMode === "fixed" ? fixedEraUiValue : (autoEra ?? eraRange?.min ?? 1);

  useEffect(() => {
    if (!eraRange) return;
    setManualEra((prev) => clampNumber(prev, eraRange.min, eraRange.max));
  }, [eraRange]);

  const overlayCandidates: OverlayOption[] = useMemo(() => {
    if (!dataTypeModel || !selection) return [];
    const out: OverlayOption[] = [];
    for (const suggestion of overlaySuggestions) {
      if (suggestion.primaryDataTypeKey !== selection.dataTypeId) continue;
      const overlayDt = dataTypeModel.dataTypes.find(
        (dt) => dt.dataTypeId === suggestion.overlayDataTypeKey
      );
      if (!overlayDt) continue;
      out.push({ value: suggestion.id, label: suggestion.label });
    }
    return out;
  }, [dataTypeModel, overlaySuggestions, selection]);

  const overlayOptions: OverlayOption[] = useMemo(() => {
    if (!overlayCandidates.length) return [];
    return [{ value: "", label: "No overlay" }, ...overlayCandidates];
  }, [overlayCandidates]);

  useEffect(() => {
    if (!overlayCandidates.length) {
      if (overlaySelectionId) setOverlaySelectionId("");
      return;
    }
    if (overlaySelectionId && !overlayCandidates.some((opt) => opt.value === overlaySelectionId)) {
      setOverlaySelectionId("");
    }
  }, [overlayCandidates, overlaySelectionId]);

  useEffect(() => {
    if (eraMode !== "fixed" || !overlaySelection || !dataTypeModel || !selection) {
      setOverlayVariantKeyPreference((prev) => (prev === null ? prev : null));
      return;
    }

    const overlayDataType = dataTypeModel.dataTypes.find(
      (dataType) => dataType.dataTypeId === overlaySelection.overlayDataTypeKey
    );
    if (!overlayDataType) {
      setOverlayVariantKeyPreference((prev) => (prev === null ? prev : null));
      return;
    }

    const preferredSpace =
      overlayDataType.spaces.find((space) => space.spaceId === selection.spaceId) ??
      overlayDataType.spaces[0] ??
      null;
    if (!preferredSpace) {
      setOverlayVariantKeyPreference((prev) => (prev === null ? prev : null));
      return;
    }

    const preferredRenderMode =
      preferredSpace.renderModes.find(
        (renderMode) => renderMode.renderModeId === selection.renderModeId
      ) ??
      preferredSpace.renderModes[0] ??
      null;

    const availableVariants = preferredRenderMode?.variants.length
      ? preferredRenderMode.variants
      : preferredSpace.renderModes.flatMap((renderMode) => renderMode.variants);
    const resolvedVariantKey = findVariantKeyForEra(availableVariants, manualEra);
    setOverlayVariantKeyPreference((prev) =>
      prev === resolvedVariantKey ? prev : resolvedVariantKey
    );
  }, [dataTypeModel, eraMode, manualEra, overlaySelection, selection]);

  const selectLayerFor = useCallback(
    (
      dataTypeId: string,
      spaceId: string,
      renderModeId: string,
      opts?: { variantId?: string; variantKey?: string; era?: number }
    ) => {
      if (!dataTypeModel) return;
      const dt = dataTypeModel.dataTypes.find((x) => x.dataTypeId === dataTypeId);
      const space = dt?.spaces.find((s) => s.spaceId === spaceId) ?? dt?.spaces[0];
      const rm =
        space?.renderModes.find((x) => x.renderModeId === renderModeId) ?? space?.renderModes[0];
      if (!space || !rm) return;
      let variant = opts?.variantId
        ? (rm.variants.find((v) => v.variantId === opts.variantId) ?? null)
        : null;
      if (!variant && opts?.variantKey) {
        variant = rm.variants.find((v) => v.layer.variantKey === opts.variantKey) ?? null;
      }
      if (!variant && opts?.era != null) {
        const eraVariantId = findVariantIdForEra(rm.variants, opts.era);
        variant = eraVariantId
          ? (rm.variants.find((v) => v.variantId === eraVariantId) ?? null)
          : null;
      }
      if (!variant) variant = rm.variants[0] ?? null;
      viz.setSelectedLayerKey(variant?.layerKey ?? null);
    },
    [dataTypeModel, viz]
  );

  // `navigateTo` is the single-owner entry for STAGE navigation (§7.2): it selects a
  // stage and coordinates its step — either an explicit step or the stage's first.
  // The viz step/layer follow via the stage/step → viz-sync effect above.
  // `handleStageChange` routes through it; a within-stage step change is a direct
  // step write (handleStepChange) — it needs no stage coordination, and routing it
  // here would add a redundant same-value `setSelectedStageId` notification.
  const navigateTo = useCallback(
    (stageId: string, stepId?: string) => {
      setSelectedStageId(stageId);
      if (stepId !== undefined) {
        setSelectedStepId(stepId);
        return;
      }
      const stageMeta = recipeArtifacts.uiMeta.stages.find((s) => s.stageId === stageId);
      setSelectedStepId(stageMeta?.steps[0]?.fullStepId ?? "");
    },
    [recipeArtifacts.uiMeta.stages]
  );

  const handleStageChange = useCallback(
    (stageId: string) => {
      // Preserve the original guard: an unknown stage still selects the stage but
      // does NOT reset the step; only a valid stage takes the default-step path.
      if (!stages.some((s) => s.value === stageId)) {
        setSelectedStageId(stageId);
        return;
      }
      navigateTo(stageId);
    },
    [navigateTo, stages]
  );

  const handleStepChange = useCallback((stepId: string) => setSelectedStepId(stepId), []);

  const handleRiverLakeInspectorLayerSelect = useCallback(
    (ref: RiverLakeInspectorLayerRef) => {
      applyRiverLakeInspectorSelection(ref, {
        stages: recipeArtifacts.uiMeta.stages,
        setSelectedStageId,
        setSelectedStepId,
        setShowDebugLayers: viz.setShowDebugLayers,
        setVizSelectedStepId: viz.setSelectedStepId,
        setVizSelectedLayerKey: viz.setSelectedLayerKey,
      });
    },
    [recipeArtifacts.uiMeta.stages, viz]
  );

  const handleDataTypeChange = useCallback(
    (next: string) => {
      if (!dataTypeModel) return;
      const dt = dataTypeModel.dataTypes.find((x) => x.dataTypeId === next);
      const space = dt?.spaces[0];
      const rm = space?.renderModes[0];
      if (!space || !rm) return;
      if (eraMode === "fixed") {
        selectLayerFor(next, space.spaceId, rm.renderModeId, { era: manualEra });
        return;
      }
      selectLayerFor(next, space.spaceId, rm.renderModeId);
    },
    [dataTypeModel, eraMode, manualEra, selectLayerFor]
  );

  const handleSpaceChange = useCallback(
    (next: string) => {
      if (!selection) return;
      const dataTypeId = selection.dataTypeId;
      if (!dataTypeModel) return;
      const dt = dataTypeModel.dataTypes.find((x) => x.dataTypeId === dataTypeId);
      const space = dt?.spaces.find((s) => s.spaceId === next) ?? dt?.spaces[0];
      const rm = space?.renderModes[0];
      if (!space || !rm) return;
      if (eraMode === "fixed") {
        selectLayerFor(dataTypeId, space.spaceId, rm.renderModeId, { era: manualEra });
        return;
      }
      selectLayerFor(dataTypeId, space.spaceId, rm.renderModeId);
    },
    [dataTypeModel, eraMode, manualEra, selectLayerFor, selection]
  );

  const handleRenderModeChange = useCallback(
    (next: string) => {
      if (!selection) return;
      if (eraMode === "fixed") {
        selectLayerFor(selection.dataTypeId, selection.spaceId, next, { era: manualEra });
        return;
      }
      selectLayerFor(selection.dataTypeId, selection.spaceId, next);
    },
    [eraMode, manualEra, selectLayerFor, selection]
  );

  const handleVariantChange = useCallback(
    (next: string) => {
      if (!selection) return;
      const variant = selectedVariants.find((v) => v.variantId === next) ?? null;
      const parsedEra = parseEraVariantKey(variant?.layer.variantKey ?? null);
      if (parsedEra != null) setManualEra(parsedEra);
      if (parsedEra == null && eraMode === "fixed") setEraMode("auto");
      selectLayerFor(selection.dataTypeId, selection.spaceId, selection.renderModeId, {
        variantId: next,
      });
    },
    [eraMode, selectLayerFor, selection, selectedVariants]
  );

  const handleEraModeChange = useCallback(
    (nextMode: "auto" | "fixed") => {
      if (nextMode === "auto") {
        setEraMode("auto");
        return;
      }
      if (!selection || !eraRange) {
        setEraMode("fixed");
        return;
      }
      const seedEra = autoEra ?? manualEra ?? eraRange.min;
      const clampedEra = clampNumber(seedEra, eraRange.min, eraRange.max);
      setManualEra(clampedEra);
      setEraMode("fixed");
      selectLayerFor(selection.dataTypeId, selection.spaceId, selection.renderModeId, {
        era: clampedEra,
      });
    },
    [autoEra, eraRange, manualEra, selectLayerFor, selection]
  );

  const handleEraValueChange = useCallback(
    (nextEra: number) => {
      if (!selection || !eraRange) return;
      const clampedEra = clampNumber(nextEra, eraRange.min, eraRange.max);
      setManualEra(clampedEra);
      if (eraMode !== "fixed") setEraMode("fixed");
      selectLayerFor(selection.dataTypeId, selection.spaceId, selection.renderModeId, {
        era: clampedEra,
      });
    },
    [eraMode, eraRange, selectLayerFor, selection]
  );

  return {
    viz,
    stages,
    steps,
    dataTypeOptions,
    spaceOptions,
    renderModeOptions,
    variantOptions,
    overlayOptions,
    selection,
    eraEnabled,
    eraRange,
    eraDisplayValue,
    riverLakeInspectorSummary,
    navigateTo,
    handleStageChange,
    handleStepChange,
    handleDataTypeChange,
    handleSpaceChange,
    handleRenderModeChange,
    handleVariantChange,
    handleEraModeChange,
    handleEraValueChange,
    handleRiverLakeInspectorLayerSelect,
  };
}
