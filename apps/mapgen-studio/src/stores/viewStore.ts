import type { StageView } from "@swooper/mapgen-studio-ui";
import { create } from "zustand";

/**
 * `viewStore` — the single owner of browser-only VIEW state (architecture/10 §3).
 *
 * This is presentation state with NO server coupling and NO persistence contract:
 * canvas toggles, overlay selection, era mode, panel collapse, and the selected
 * stage/step. Per the "crisp rule" (§3) it lives in Zustand, never in TanStack
 * Query; server data is never mirrored in here. It is intentionally NOT persisted —
 * these are ephemeral view preferences, unlike the authoring/run state whose
 * localStorage schema is a parity contract that remains in `features/*` until
 * the localStorage bridge deletion slice owns that migration.
 *
 * Each field exposes a `setX` action whose signature mirrors React's `useState`
 * setter (value OR updater function), so the migration off scattered `useState`
 * is a drop-in: call sites that did `setManualEra((prev) => …)` keep working.
 */

type Updater<T> = T | ((prev: T) => T);

function resolve<T>(updater: Updater<T>, prev: T): T {
  return typeof updater === "function" ? (updater as (p: T) => T)(prev) : updater;
}

export type EraMode = "auto" | "fixed";

// `StageView` is component-owned (StageViewTabs re-homed it to
// @swooper/mapgen-studio-ui); the store imports it back and re-exports so
// existing app import sites keep working.
export type { StageView };

export type ViewState = {
  // Canvas layer toggles
  showGrid: boolean;
  showEdges: boolean;
  // Overlay selection
  overlaySelectionId: string;
  overlayOpacity: number;
  overlayVariantKeyPreference: string | null;
  // Era controls
  eraMode: EraMode;
  manualEra: number;
  // Panel collapse / expand
  recipeSectionCollapsed: boolean;
  configSectionCollapsed: boolean;
  exploreStageExpanded: boolean;
  exploreStepExpanded: boolean;
  exploreLayersExpanded: boolean;
  exploreWaterStatsExpanded: boolean;
  // Explore selection (single owner; App no longer mirrors these)
  selectedStageId: string;
  selectedStepId: string;
  // Stage view + pipeline (recipe DAG) view state. Pipeline selection and
  // expansion are deliberately separate from the map-explore `selectedStageId`
  // above — a pipeline stage node and an explore run-stage are different
  // concepts that happen to share a word. "" = no pipeline stage selected.
  stageView: StageView;
  pipelineSelectedStageId: string;
  pipelineExpandedStageIds: ReadonlySet<string>;

  setShowGrid: (next: Updater<boolean>) => void;
  setShowEdges: (next: Updater<boolean>) => void;
  setOverlaySelectionId: (next: Updater<string>) => void;
  setOverlayOpacity: (next: Updater<number>) => void;
  setOverlayVariantKeyPreference: (next: Updater<string | null>) => void;
  setEraMode: (next: Updater<EraMode>) => void;
  setManualEra: (next: Updater<number>) => void;
  setRecipeSectionCollapsed: (next: Updater<boolean>) => void;
  setConfigSectionCollapsed: (next: Updater<boolean>) => void;
  setExploreStageExpanded: (next: Updater<boolean>) => void;
  setExploreStepExpanded: (next: Updater<boolean>) => void;
  setExploreLayersExpanded: (next: Updater<boolean>) => void;
  setExploreWaterStatsExpanded: (next: Updater<boolean>) => void;
  setSelectedStageId: (next: Updater<string>) => void;
  setSelectedStepId: (next: Updater<string>) => void;
  setStageView: (next: Updater<StageView>) => void;
  setPipelineSelectedStageId: (next: Updater<string>) => void;
  setPipelineExpandedStageIds: (next: Updater<ReadonlySet<string>>) => void;
};

export const useViewStore = create<ViewState>((set) => ({
  showGrid: true,
  showEdges: true,
  overlaySelectionId: "",
  overlayOpacity: 0.45,
  overlayVariantKeyPreference: null,
  eraMode: "auto",
  manualEra: 1,
  recipeSectionCollapsed: false,
  configSectionCollapsed: false,
  exploreStageExpanded: true,
  exploreStepExpanded: true,
  exploreLayersExpanded: true,
  exploreWaterStatsExpanded: false,
  selectedStageId: "",
  selectedStepId: "",
  stageView: "map",
  pipelineSelectedStageId: "",
  pipelineExpandedStageIds: new Set<string>(),

  setShowGrid: (next) => set((s) => ({ showGrid: resolve(next, s.showGrid) })),
  setShowEdges: (next) => set((s) => ({ showEdges: resolve(next, s.showEdges) })),
  setOverlaySelectionId: (next) =>
    set((s) => ({ overlaySelectionId: resolve(next, s.overlaySelectionId) })),
  setOverlayOpacity: (next) => set((s) => ({ overlayOpacity: resolve(next, s.overlayOpacity) })),
  setOverlayVariantKeyPreference: (next) =>
    set((s) => ({ overlayVariantKeyPreference: resolve(next, s.overlayVariantKeyPreference) })),
  setEraMode: (next) => set((s) => ({ eraMode: resolve(next, s.eraMode) })),
  setManualEra: (next) => set((s) => ({ manualEra: resolve(next, s.manualEra) })),
  setRecipeSectionCollapsed: (next) =>
    set((s) => ({ recipeSectionCollapsed: resolve(next, s.recipeSectionCollapsed) })),
  setConfigSectionCollapsed: (next) =>
    set((s) => ({ configSectionCollapsed: resolve(next, s.configSectionCollapsed) })),
  setExploreStageExpanded: (next) =>
    set((s) => ({ exploreStageExpanded: resolve(next, s.exploreStageExpanded) })),
  setExploreStepExpanded: (next) =>
    set((s) => ({ exploreStepExpanded: resolve(next, s.exploreStepExpanded) })),
  setExploreLayersExpanded: (next) =>
    set((s) => ({ exploreLayersExpanded: resolve(next, s.exploreLayersExpanded) })),
  setExploreWaterStatsExpanded: (next) =>
    set((s) => ({ exploreWaterStatsExpanded: resolve(next, s.exploreWaterStatsExpanded) })),
  setSelectedStageId: (next) => set((s) => ({ selectedStageId: resolve(next, s.selectedStageId) })),
  setSelectedStepId: (next) => set((s) => ({ selectedStepId: resolve(next, s.selectedStepId) })),
  setStageView: (next) => set((s) => ({ stageView: resolve(next, s.stageView) })),
  setPipelineSelectedStageId: (next) =>
    set((s) => ({ pipelineSelectedStageId: resolve(next, s.pipelineSelectedStageId) })),
  setPipelineExpandedStageIds: (next) =>
    set((s) => ({ pipelineExpandedStageIds: resolve(next, s.pipelineExpandedStageIds) })),
}));
