import {
  defaultExploreSettleMs,
  type Civ7RuntimeProbe,
} from "@civ7/direct-control";
import { Effect, Ref } from "effect";

import type { Civ7ControlOrpcVisibilitySummaryResult } from "../../../dependencies/direct-control";
import { civ7ControlOrpcErrorCorrelationData } from "../../../model/correlation";
import { civ7ControlOrpcImplementer } from "../../../procedure";
import type { Civ7DisplayExploreRequestResult } from "../contract";

const DEFAULT_EXPLORE_POLL_MS = 2_500;
const DEFAULT_EXPLORE_QUIESCE_POLLS = 3;
const DEFAULT_EXPLORE_MAX_EXTRA_WAIT_MS = 60_000;

type ExploreDrainState = Readonly<{
  elapsedMs: number;
  quietPolls: number;
  drainPolls: number;
  quiesced: boolean;
  done: boolean;
  suppressed: ReadonlyMap<string, number>;
}>;

/**
 * Explores the whole map for a player — terrain becomes known (REVEALED /
 * fogged) without granting live vision — by orchestrating the direct-control
 * wire atoms as one Effect state machine:
 *
 *   0. read the visibility summary; when every plot is already revealed AND
 *      visible (a prior grant is still held) and fog restore was not
 *      requested, return a skipped already-explored result — re-granting
 *      against a held full-map grant is the second-call failure mode,
 *   1. suspend the DisplayQueueManager (App UI) so nothing can mount —
 *      verified by readback before anything mutates,
 *   2. applyCiv7ExploreGrant (Visibility.setTrackedVisibilityGrant over every
 *      plot, one Tuner exec),
 *   3. drain: hold the grant for at least settleMs (the FOW renderer streams
 *      the reveal progressively; releasing early strands the paint mid-sweep),
 *      purging the suspended queue every pollMs until quiescePolls consecutive
 *      empty purges or the hard cap (settleMs + maxExtraWaitMs),
 *   4. resume the queue; then, ONLY when `restoreFog` is set, release the
 *      grant (visible count reverts, revealed state persists, fog re-covers
 *      the terrain). By default the grant stays held so the map remains
 *      fully visible — the FOW render toggle/reveal pacing has no scripting
 *      binding (live-probed: WorldUI/Environment/Visibility expose none),
 *      so holding the grant is the only way to keep fog off.
 *
 * The queue resume is bound to an acquire/release boundary: a suspended queue
 * silently swallows every later display in the session, so the queue is
 * ALWAYS resumed even when the grant, drain, or release fails.
 */
export const displayExploreRequestProcedure =
  civ7ControlOrpcImplementer.display.explore.request.effect(function* ({
    context,
    errors,
    input,
  }) {
    const errorData = {
      procedureKey: "display.explore.request" as const,
      source: "direct-control-facade" as const,
      ...civ7ControlOrpcErrorCorrelationData(context),
    };
    const facadeCall = <T>(step: string, call: () => Promise<T>) =>
      Effect.tryPromise({
        try: call,
        catch: (cause) =>
          errors.EXPLORE_FAILED({
            data: {
              ...errorData,
              step,
              detail: cause instanceof Error ? cause.message : String(cause),
            },
          }),
      });
    const readVisibilitySummary = (step: string) =>
      facadeCall(step, () =>
        context.directControl.getCiv7VisibilitySummary(
          { playerId: input.playerId },
          context.endpointDefaults,
        )
      );

    const pollMs = input.pollMs ?? DEFAULT_EXPLORE_POLL_MS;
    const quiescePolls = input.quiescePolls ?? DEFAULT_EXPLORE_QUIESCE_POLLS;
    const maxExtraWaitMs = input.maxExtraWaitMs
      ?? DEFAULT_EXPLORE_MAX_EXTRA_WAIT_MS;

    const before = yield* readVisibilitySummary("read-visibility-before");

    // Idempotent short-circuit: when the pre-grant read already shows every
    // plot revealed AND visible, a prior explore grant is still held —
    // re-running Visibility.setTrackedVisibilityGrant against it is the
    // second-click failure mode, and there is nothing left to reveal. Skipped
    // when restoreFog is requested: that caller wants the release path.
    const beforeRevealed = probeValue(before.numPlotsRevealed);
    const beforeVisible = probeValue(before.numPlotsVisible);
    const mapPlotCount = probeValue(before.mapPlotCount);
    if (
      input.restoreFog !== true
      && beforeRevealed != null
      && beforeVisible != null
      && mapPlotCount != null
      && mapPlotCount > 0
      && beforeRevealed >= mapPlotCount
      && beforeVisible >= mapPlotCount
    ) {
      return {
        playerId: input.playerId,
        skipped: true,
        before: visibilityProbe(before),
        after: visibilityProbe(before),
        mapPlotCount,
        classification: "already-explored",
      } satisfies Civ7DisplayExploreRequestResult;
    }

    const resumedInline = yield* Ref.make(false);

    return yield* Effect.acquireUseRelease(
      // Acquire: suspend the display queue, verified by readback — the state
      // machine gate before any mutation runs.
      Effect.gen(function* () {
        const suspend = yield* facadeCall("suspend-display-queue", () =>
          context.directControl.suspendCiv7DisplayQueue(
            context.endpointDefaults,
          )
        );
        if (!suspend.isSuspended) {
          return yield* Effect.fail(
            errors.EXPLORE_SUSPENSION_UNVERIFIED({ data: errorData }),
          );
        }
        return suspend;
      }),
      () =>
        Effect.gen(function* () {
          const grant = yield* facadeCall("apply-explore-grant", () =>
            context.directControl.applyCiv7ExploreGrant(
              { playerId: input.playerId },
              context.endpointDefaults,
            )
          );
          const settleMs = input.settleMs
            ?? defaultExploreSettleMs(grant.plotCount);

          // Drain loop: exit only after quiescePolls consecutive empty purges
          // past settleMs — the deterministic "gameplay stopped enqueueing
          // displays" signal — or the hard cap (quiesced=false).
          const drained = yield* Effect.iterate(
            {
              elapsedMs: 0,
              quietPolls: 0,
              drainPolls: 0,
              quiesced: false,
              done: false,
              suppressed: new Map<string, number>(),
            } satisfies ExploreDrainState as ExploreDrainState,
            {
              while: (state) => !state.done,
              body: (state) =>
                Effect.gen(function* () {
                  yield* Effect.sleep(pollMs);
                  const purge = yield* facadeCall("drain-close-displays", () =>
                    context.directControl.closeCiv7Displays(
                      {},
                      context.endpointDefaults,
                    )
                  );
                  const suppressed = new Map(state.suppressed);
                  for (const row of purge.closed) {
                    suppressed.set(
                      row.category,
                      (suppressed.get(row.category) ?? 0) + row.closed,
                    );
                  }
                  const elapsedMs = state.elapsedMs + pollMs;
                  const quietPolls = purge.closedTotal === 0
                    ? state.quietPolls + 1
                    : 0;
                  const quiesced = elapsedMs >= settleMs
                    && quietPolls >= quiescePolls;
                  return {
                    elapsedMs,
                    quietPolls,
                    drainPolls: state.drainPolls + 1,
                    quiesced,
                    done: quiesced
                      || elapsedMs >= settleMs + maxExtraWaitMs,
                    suppressed,
                  };
                }),
            },
          );

          // Resume precedes the grant release so late displays cannot
          // re-queue mid-flight.
          const resume = yield* facadeCall("resume-display-queue", () =>
            context.directControl.resumeCiv7DisplayQueue(
              context.endpointDefaults,
            )
          );
          yield* Ref.set(resumedInline, true);
          const release = input.restoreFog === true
            ? yield* facadeCall("release-explore-grant", () =>
              context.directControl.releaseCiv7ExploreGrant(
                { playerId: input.playerId, grantId: grant.grantId },
                context.endpointDefaults,
              )
            )
            : null;
          const after = yield* readVisibilitySummary("read-visibility-after");

          return displayExploreRequestResult({
            playerId: input.playerId,
            before,
            after,
            grantId: grant.grantId,
            grantedPlots: grant.grantedPlots,
            grantReleased: release?.released ?? false,
            settleMs,
            drained,
            resumeVerified: !resume.isSuspended,
          });
        }),
      // Release: never leave the queue suspended — even when the grant,
      // drain, resume readback, or release fails.
      () =>
        Ref.get(resumedInline).pipe(
          Effect.flatMap((resumed) =>
            resumed ? Effect.void : Effect.promise(() =>
              context.directControl
                .resumeCiv7DisplayQueue(context.endpointDefaults)
                .then(() => undefined, () => undefined)
            )
          ),
        ),
    );
  });

function displayExploreRequestResult(input: Readonly<{
  playerId: number;
  before: Civ7ControlOrpcVisibilitySummaryResult;
  after: Civ7ControlOrpcVisibilitySummaryResult;
  grantId: number;
  grantedPlots: number;
  grantReleased: boolean;
  settleMs: number;
  drained: ExploreDrainState;
  resumeVerified: boolean;
}>): Civ7DisplayExploreRequestResult {
  const beforeRevealed = probeValue(input.before.numPlotsRevealed);
  const afterRevealed = probeValue(input.after.numPlotsRevealed);
  const classification =
    beforeRevealed != null && afterRevealed != null
        && afterRevealed > beforeRevealed
      ? "explored"
      : beforeRevealed != null && afterRevealed != null
          && afterRevealed === beforeRevealed
      ? "already-explored"
      : "unverified";
  return {
    playerId: input.playerId,
    skipped: false,
    before: visibilityProbe(input.before),
    after: visibilityProbe(input.after),
    grantId: input.grantId,
    grantedPlots: input.grantedPlots,
    grantReleased: input.grantReleased,
    settleMs: input.settleMs,
    drainPolls: input.drained.drainPolls,
    quiesced: input.drained.quiesced,
    suspendVerified: true,
    resumeVerified: input.resumeVerified,
    suppressedDisplays: [...input.drained.suppressed.entries()].map((
      [category, closed],
    ) => ({ category, closed })),
    mutation: "Visibility.setTrackedVisibilityGrant",
    discoveryPosture: "ui-suppressed-gameplay-discovers",
    classification,
  };
}

function visibilityProbe(
  summary: Civ7ControlOrpcVisibilitySummaryResult,
): Civ7DisplayExploreRequestResult["before"] {
  return {
    revealed: probeValue(summary.numPlotsRevealed),
    visible: probeValue(summary.numPlotsVisible),
  };
}

function probeValue<T>(probe: Civ7RuntimeProbe<T>): T | null {
  return probe.ok ? probe.value : null;
}
