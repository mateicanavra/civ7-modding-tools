import { useCallback, useEffect, useRef, useState } from "react";

import { fetchCiv7SetupConfig } from "../../features/civ7Setup/api";
import {
  type Civ7SetupSnapshotLike,
  normalizeStudioSetupConfig,
  studioSetupConfigFromLiveSnapshot,
} from "../../features/civ7Setup/setupConfig";
import {
  buildLiveRuntimeSetupRequestKey,
  buildLiveRuntimeSnapshotRequest,
  buildLiveRuntimeSnapshotState,
  buildLiveRuntimeSuggestionRecords,
  type LiveRuntimeSnapshotRequest,
  type LiveRuntimeSnapshotState,
  type LiveRuntimeStatusState,
  type LiveRuntimeSuggestionRecord,
  shouldCommitLiveRuntimeSetup,
  shouldCommitLiveRuntimeSnapshot,
} from "../../features/liveRuntime/model";
import type { orpcClient as OrpcClient } from "../../lib/orpc";
import { isAbortLikeError } from "../../shared/async";

export type UseLiveRuntimeArgs = {
  /**
   * oRPC client used by the snapshot read (`civ7.live.snapshot`). Threaded IN as a
   * param (not the module import) so the abort/staleness contracts (LR-2/LR-3) are
   * exercisable with a mock `orpcClient` in `renderHook` tests.
   */
  orpcClient: typeof OrpcClient;
};

export type UseLiveRuntimeResult = {
  /** Live runtime status state (snapshot/binding/failure machine). */
  liveRuntime: LiveRuntimeStatusState;
  /** Setter for `liveRuntime` — used by autoplay toggle (slice 2.12) + run-in-game (2.11). */
  setLiveRuntime: React.Dispatch<React.SetStateAction<LiveRuntimeStatusState>>;
  /** Live runtime sync-back suggestion records (visible-studio-control only). */
  liveRuntimeSuggestions: ReadonlyArray<LiveRuntimeSuggestionRecord>;
  /** Live setup snapshot (idle/ok/error) consumed by the host setup-options derivation. */
  liveSetup: {
    status: "idle" | "ok" | "error";
    setup?: Civ7SetupSnapshotLike;
    updatedAt?: string;
    error?: string;
  };
  /**
   * Entry point wired into `useStudioEvents`: ingests a live status event, advances
   * `liveRuntime`, and fans out the bounded setup/snapshot reads. Null-request events
   * abort + skip the snapshot read (LR-6).
   */
  applyLiveGameState: (statusState: LiveRuntimeStatusState) => void;
};

/**
 * `useLiveRuntime` — owns the live-runtime snapshot/setup staleness machine: the
 * abort/mounted-lifecycle refs, the live status/suggestions/setup state, the
 * mount-lifecycle effect (which aborts both in-flight requests on unmount), and
 * the three event-driven read functions (`readLiveRuntimeSnapshot`,
 * `refreshLiveSetupFromEvent`, `applyLiveGameState`).
 *
 * This is the atomic mount-lifecycle group (invariant b): the abort/mounted refs
 * (`liveSnapshotAbortRef`, `liveSetupAbortRef`, `activeLive*RequestKeyRef`,
 * `liveRuntimeMountedRef`, `liveSnapshotFailureCountRef`) travel WITH the mount
 * lifecycle and the three read functions into one hook — they cannot be split.
 *
 * Load-bearing invariants preserved verbatim from the prior host body:
 * - LR-2: `readLiveRuntimeSnapshot` aborts the prior in-flight snapshot controller
 *   (`liveSnapshotAbortRef.current?.abort()`) BEFORE starting a new one, then stores
 *   the new controller + request key, so an older response never overwrites a newer.
 * - LR-3: every post-await setState is guarded by `liveRuntimeMountedRef.current`
 *   (and `isAbortLikeError`) so no setState fires after unmount.
 * - LR-6: `applyLiveGameState`'s null-request path aborts + nulls the request key and
 *   does NOT fetch; a valid request fires the read.
 * - LR-7: the snapshotStatus 'loading' transition only fires on a snapshotId change /
 *   non-ok prior status.
 * - LR-4/LR-8: `liveSnapshotFailureCountRef` is display-only — no timer/retry/cadence
 *   is introduced; the bodies stay event-driven (bounded reads).
 *
 * The `orpcClient` is threaded IN as a param (LR-2/LR-3 testability); all other
 * dependencies (`fetchCiv7SetupConfig`, the model builders/staleness guards) are
 * pure module imports.
 */
export function useLiveRuntime(args: UseLiveRuntimeArgs): UseLiveRuntimeResult {
  const { orpcClient } = args;

  const liveSnapshotFailureCountRef = useRef(0);
  const activeLiveSnapshotRequestKeyRef = useRef<string | null>(null);
  const activeLiveSetupRequestKeyRef = useRef<string | null>(null);
  const liveSnapshotAbortRef = useRef<AbortController | null>(null);
  const liveSetupAbortRef = useRef<AbortController | null>(null);
  const liveRuntimeMountedRef = useRef(true);
  const [liveRuntime, setLiveRuntime] = useState<LiveRuntimeStatusState>({
    status: "idle",
    snapshotStatus: "idle",
    bindingStatus: "unbound-runtime",
    failureCount: 0,
  });
  const [liveRuntimeSuggestions, setLiveRuntimeSuggestions] = useState<
    ReadonlyArray<LiveRuntimeSuggestionRecord>
  >([]);
  const [liveSetup, setLiveSetup] = useState<{
    status: "idle" | "ok" | "error";
    setup?: Civ7SetupSnapshotLike;
    updatedAt?: string;
    error?: string;
  }>({ status: "idle" });

  useEffect(() => {
    liveRuntimeMountedRef.current = true;
    return () => {
      liveRuntimeMountedRef.current = false;
      liveSnapshotAbortRef.current?.abort();
      liveSetupAbortRef.current?.abort();
    };
  }, []);

  const readLiveRuntimeSnapshot = useCallback(
    async (request: LiveRuntimeSnapshotRequest) => {
      liveSnapshotAbortRef.current?.abort();
      const snapshotAbortController = new AbortController();
      liveSnapshotAbortRef.current = snapshotAbortController;
      activeLiveSnapshotRequestKeyRef.current = request.key;

      try {
        // Snapshot remains request/response. The event stream tells us when live
        // status changed; the existing request-key guard still owns stale result
        // rejection.
        let body: unknown;
        try {
          body = await orpcClient.civ7.live.snapshot(
            {
              x: request.bounds.x,
              y: request.bounds.y,
              width: request.bounds.width,
              height: request.bounds.height,
              fields: request.fields.join(","),
              maxPlots: request.maxPlots,
              ...(request.playerId === undefined ? {} : { playerId: request.playerId }),
            },
            { signal: snapshotAbortController.signal }
          );
        } catch (snapshotErr) {
          if (!liveRuntimeMountedRef.current || isAbortLikeError(snapshotErr)) throw snapshotErr;
          body = {
            ok: false,
            error: snapshotErr instanceof Error ? snapshotErr.message : "Live snapshot unavailable",
          };
        }
        if (!liveRuntimeMountedRef.current) return;
        if (
          !shouldCommitLiveRuntimeSnapshot({
            activeRequestKey: activeLiveSnapshotRequestKeyRef.current,
            resultRequestKey: request.key,
            aborted: snapshotAbortController.signal.aborted,
          })
        ) {
          return;
        }
        const snapshotState = buildLiveRuntimeSnapshotState({
          request,
          body,
          observedAtFallback: new Date().toISOString(),
        });
        liveSnapshotFailureCountRef.current =
          snapshotState.status === "ok" ? 0 : liveSnapshotFailureCountRef.current + 1;
        setLiveRuntime((current) => ({
          ...current,
          snapshotStatus: snapshotState.status,
          snapshotHash: snapshotState.snapshotHash ?? current.snapshotHash,
          bindingStatus: snapshotState.status === "ok" ? current.bindingStatus : "partial",
          failureCount: Math.max(current.failureCount ?? 0, liveSnapshotFailureCountRef.current),
          error: snapshotState.status === "ok" ? current.error : snapshotState.error,
        }));
      } catch (err) {
        if (!liveRuntimeMountedRef.current || isAbortLikeError(err)) return;
        if (
          !shouldCommitLiveRuntimeSnapshot({
            activeRequestKey: activeLiveSnapshotRequestKeyRef.current,
            resultRequestKey: request.key,
          })
        ) {
          return;
        }
        liveSnapshotFailureCountRef.current += 1;
        const snapshotState: LiveRuntimeSnapshotState = {
          status: "error",
          requestKey: request.key,
          error: err instanceof Error ? err.message : "Live snapshot unavailable",
        };
        setLiveRuntime((current) => ({
          ...current,
          snapshotStatus: "error",
          bindingStatus: "partial",
          failureCount: Math.max(current.failureCount ?? 0, liveSnapshotFailureCountRef.current),
          error: snapshotState.error,
        }));
      }
    },
    [orpcClient]
  );

  const refreshLiveSetupFromEvent = useCallback(async (statusState: LiveRuntimeStatusState) => {
    liveSetupAbortRef.current?.abort();
    const setupAbortController = new AbortController();
    liveSetupAbortRef.current = setupAbortController;
    const setupRequestKey = buildLiveRuntimeSetupRequestKey(statusState);
    activeLiveSetupRequestKeyRef.current = setupRequestKey;
    const shouldCommitSetup = () =>
      liveRuntimeMountedRef.current &&
      shouldCommitLiveRuntimeSetup({
        activeRequestKey: activeLiveSetupRequestKeyRef.current,
        resultRequestKey: setupRequestKey,
        aborted: setupAbortController.signal.aborted,
      });

    try {
      const setup = await fetchCiv7SetupConfig({ signal: setupAbortController.signal });
      if (!shouldCommitSetup()) return;
      const suggestedSetupConfig = setup.ok
        ? normalizeStudioSetupConfig(studioSetupConfigFromLiveSnapshot(setup.setup))
        : undefined;
      if (setup.ok) {
        setLiveSetup({ status: "ok", setup: setup.setup, updatedAt: setup.observedAt });
      } else {
        setLiveSetup({
          status: "error",
          error: setup.error,
          updatedAt: setup.observedAt ?? new Date().toISOString(),
        });
      }
      setLiveRuntimeSuggestions(
        buildLiveRuntimeSuggestionRecords({
          sourceSnapshotId: statusState.snapshotId,
          seed: statusState.seed,
          setupConfig: suggestedSetupConfig,
          provedStudioRun: false,
        })
      );
    } catch (err) {
      if (!liveRuntimeMountedRef.current || isAbortLikeError(err)) return;
      if (!shouldCommitSetup()) return;
      const observedAt = new Date().toISOString();
      setLiveSetup({
        status: "error",
        error: err instanceof Error ? err.message : "Live setup unavailable",
        updatedAt: observedAt,
      });
      setLiveRuntimeSuggestions(
        buildLiveRuntimeSuggestionRecords({
          sourceSnapshotId: statusState.snapshotId,
          seed: statusState.seed,
          provedStudioRun: false,
          now: () => new Date(observedAt),
        })
      );
    }
  }, []);

  const applyLiveGameState = useCallback(
    (statusState: LiveRuntimeStatusState) => {
      const snapshotRequest = buildLiveRuntimeSnapshotRequest({ status: statusState });
      if (!snapshotRequest) {
        activeLiveSnapshotRequestKeyRef.current = null;
        liveSnapshotAbortRef.current?.abort();
      }

      setLiveRuntime((current) => ({
        ...statusState,
        snapshotStatus:
          snapshotRequest === null
            ? statusState.snapshotStatus
            : current.snapshotId === statusState.snapshotId && current.snapshotStatus === "ok"
              ? current.snapshotStatus
              : "loading",
        failureCount: Math.max(statusState.failureCount ?? 0, liveSnapshotFailureCountRef.current),
      }));
      void refreshLiveSetupFromEvent(statusState);
      if (snapshotRequest) void readLiveRuntimeSnapshot(snapshotRequest);
    },
    [readLiveRuntimeSnapshot, refreshLiveSetupFromEvent]
  );

  return {
    liveRuntime,
    setLiveRuntime,
    liveRuntimeSuggestions,
    liveSetup,
    applyLiveGameState,
  };
}
