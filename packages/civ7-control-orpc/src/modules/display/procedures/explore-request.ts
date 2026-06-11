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
 *   1. suspend the DisplayQueueManager (App UI) so nothing can mount —
 *      verified by readback before anything mutates,
 *   2. applyCiv7ExploreGrant (Visibility.setTrackedVisibilityGrant over every
 *      plot, one Tuner exec),
 *   3. drain: hold the grant for at least settleMs (the FOW renderer streams
 *      the reveal progressively; releasing early strands the paint mid-sweep),
 *      purging the suspended queue every pollMs until quiescePolls consecutive
 *      empty purges or the hard cap (settleMs + maxExtraWaitMs),
 *   4. resume the queue, then release the grant (visible count reverts,
 *      revealed state persists — that IS explore semantics).
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
    const facadeCall = <T>(call: () => Promise<T>) =>
      Effect.tryPromise({
        try: call,
        catch: () => errors.EXPLORE_FAILED({ data: errorData }),
      });
    const readVisibilitySummary = () =>
      facadeCall(() =>
        context.directControl.getCiv7VisibilitySummary(
          { playerId: input.playerId },
          context.endpointDefaults,
        )
      );

    const pollMs = input.pollMs ?? DEFAULT_EXPLORE_POLL_MS;
    const quiescePolls = input.quiescePolls ?? DEFAULT_EXPLORE_QUIESCE_POLLS;
    const maxExtraWaitMs = input.maxExtraWaitMs
      ?? DEFAULT_EXPLORE_MAX_EXTRA_WAIT_MS;

    const before = yield* readVisibilitySummary();
    const resumedInline = yield* Ref.make(false);

    return yield* Effect.acquireUseRelease(
      // Acquire: suspend the display queue, verified by readback — the state
      // machine gate before any mutation runs.
      Effect.gen(function* () {
        const suspend = yield* facadeCall(() =>
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
          const grant = yield* facadeCall(() =>
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
                  const purge = yield* facadeCall(() =>
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
          const resume = yield* facadeCall(() =>
            context.directControl.resumeCiv7DisplayQueue(
              context.endpointDefaults,
            )
          );
          yield* Ref.set(resumedInline, true);
          const release = yield* facadeCall(() =>
            context.directControl.releaseCiv7ExploreGrant(
              { playerId: input.playerId, grantId: grant.grantId },
              context.endpointDefaults,
            )
          );
          const after = yield* readVisibilitySummary();

          return displayExploreRequestResult({
            playerId: input.playerId,
            before,
            after,
            grantId: grant.grantId,
            grantedPlots: grant.grantedPlots,
            grantReleased: release.released,
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
