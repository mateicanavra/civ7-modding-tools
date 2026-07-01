import { STUDIO_AUTHORING_STATE_KEY } from "@/features/studioState/persistence";
import { useAuthoringStore } from "@/stores/authoringStore";
import { useRunStore } from "@/stores/runStore";
import { useViewStore } from "@/stores/viewStore";

/**
 * Per-story reset of the three studio Zustand stores.
 *
 * The stores are module singletons (no provider), so mutations leak across
 * stories inside one preview iframe. Pure leaves with fixture props shouldn't
 * touch store state at all — these resets are the safety net so a leaf that DOES
 * read a store sees deterministic defaults.
 *
 * INIT snapshots are captured ONCE at module load, immediately after importing
 * the stores and before any story mutates them. `authoringStore`'s
 * `buildInitialAuthoringData()` runs at its own module load reading whatever is
 * in `localStorage` at that moment (empty in a fresh iframe → app defaults). The
 * stores use immutable value/updater setters, so each setter produces a NEW state
 * object and never mutates the captured INIT reference — a shallow capture is
 * safe to restore via `setState(INIT, true)`.
 */
const VIEW_INIT = useViewStore.getState();
const RUN_INIT = useRunStore.getState();
const AUTH_INIT = useAuthoringStore.getState();

export function resetStudioStores(): void {
  useViewStore.setState(VIEW_INIT, true);
  useRunStore.setState(RUN_INIT, true);
  useAuthoringStore.setState(AUTH_INIT, true);
  try {
    localStorage.removeItem(STUDIO_AUTHORING_STATE_KEY);
  } catch {
    // localStorage hygiene is best-effort; never fail a story over it.
  }
}
