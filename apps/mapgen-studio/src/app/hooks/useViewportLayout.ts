import { LAYOUT } from "@swooper/mapgen-studio-ui";
import { type RefObject, useCallback, useEffect, useRef, useState } from "react";
import { prunePipelineExpandedStageIds } from "../../features/recipeDag/prunePipelineExpansion";
import {
  type RecipeDagQueryView,
  useRecipeDagQuery,
} from "../../features/recipeDag/useRecipeDagQuery";
import { type DeckCanvasApi } from "../../features/viz/DeckCanvas";
import { type StageView, useViewStore } from "../../stores/viewStore";

export type ViewportLayout = Readonly<{
  /** Attach to the canvas container; its measured rect drives `viewportSize`. */
  containerRef: RefObject<HTMLDivElement | null>;
  viewportSize: { width: number; height: number };
  /** Single owner of the deck canvas imperative handle (threaded by reference). */
  deckApiRef: RefObject<DeckCanvasApi | null>;
  /** Bumps when the deck canvas (re)mounts, so autofit can re-run after a remount. */
  deckApiReadyTick: number;
  handleDeckApiReady: () => void;
  panelTop: number;
  panelBottom: number;
  handleHeaderHeightChange: (height: number) => void;
  recipeDag: RecipeDagQueryView;
  pipelineExpandedStageIds: ReadonlySet<string>;
  handlePipelineStageToggle: (stageId: string) => void;
}>;

/**
 * `useViewportLayout` — owns the Studio canvas's spatial chrome: the deck
 * canvas handle, the measured viewport size, the docked-panel geometry, and the
 * recipe-DAG (pipeline view) read surface with its expansion state.
 *
 * This is a behavior-preserving extraction of the viewport/DAG/panel glue that
 * used to live inline at the top of `StudioShell`. It is initialized BEFORE the
 * viz-selection hook so that hook (and the deck-autofit hook) can consume
 * `deckApiRef`/`viewportSize`/`deckApiReadyTick` by value/reference. The
 * deck-autofit effects deliberately stay OUT of this hook — they depend on viz
 * VALUES produced downstream and are lifted in their own slice.
 */
export function useViewportLayout(args: { recipe: string; stageView: StageView }): ViewportLayout {
  const { recipe, stageView } = args;

  // Deck canvas handle + measured viewport ---------------------------------
  const deckApiRef = useRef<DeckCanvasApi | null>(null);
  const [deckApiReadyTick, setDeckApiReadyTick] = useState(0);
  const handleDeckApiReady = useCallback(() => setDeckApiReadyTick((prev) => prev + 1), []);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [viewportSize, setViewportSize] = useState({ width: 800, height: 600 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const update = () => {
      const rect = el.getBoundingClientRect();
      setViewportSize({ width: Math.max(1, rect.width), height: Math.max(1, rect.height) });
    };
    update();

    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", update);
      return () => window.removeEventListener("resize", update);
    }

    const ro = new ResizeObserver(() => update());
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Recipe DAG (pipeline view) read surface + expansion --------------------
  const pipelineExpandedStageIds = useViewStore((s) => s.pipelineExpandedStageIds);
  const setPipelineExpandedStageIds = useViewStore((s) => s.setPipelineExpandedStageIds);

  // Pipeline (recipe DAG) stage view — data via TanStack Query, gated on the
  // view being active (fetch on first activation, cached per recipe).
  const recipeDag = useRecipeDagQuery(recipe, {
    enabled: stageView === "pipeline",
  });
  // Prune pipeline expansion to stages that exist in the loaded DAG — switching
  // recipes must not carry phantom expanded ids across graphs.
  useEffect(() => {
    if (!recipeDag.dag) return;
    const known = new Set(recipeDag.dag.stages.map((stage) => stage.stageId));
    setPipelineExpandedStageIds((prev) => prunePipelineExpandedStageIds(prev, known));
  }, [recipeDag.dag, setPipelineExpandedStageIds]);
  const handlePipelineStageToggle = useCallback(
    (stageId: string) => {
      setPipelineExpandedStageIds((prev) => {
        const next = new Set(prev);
        if (next.has(stageId)) next.delete(stageId);
        else next.add(stageId);
        return next;
      });
    },
    [setPipelineExpandedStageIds]
  );

  // Docked-panel geometry --------------------------------------------------
  const [headerHeight, setHeaderHeight] = useState<number>(LAYOUT.HEADER_HEIGHT);
  const handleHeaderHeightChange = useCallback((height: number) => {
    setHeaderHeight((prev) => (prev === height ? prev : height));
  }, []);
  const panelTop = LAYOUT.SPACING + headerHeight + LAYOUT.SPACING;
  // The docks are pinned between the measured header and the footer bar (which
  // sits `bottom-4` and is FOOTER_HEIGHT tall), keeping one SPACING of air on
  // each side of the footer.
  const panelBottom = LAYOUT.FOOTER_HEIGHT + 2 * LAYOUT.SPACING;

  return {
    containerRef,
    viewportSize,
    deckApiRef,
    deckApiReadyTick,
    handleDeckApiReady,
    panelTop,
    panelBottom,
    handleHeaderHeightChange,
    recipeDag,
    pipelineExpandedStageIds,
    handlePipelineStageToggle,
  };
}
