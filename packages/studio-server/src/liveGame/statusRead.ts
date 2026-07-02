import type { LiveGameStatusBody } from "@civ7/studio-contract";
import { Effect } from "effect";
import { Civ7TunerClient } from "../services/Civ7TunerClient.js";

export type LiveGameStatusOutput = LiveGameStatusBody &
  Readonly<{
    ok: boolean;
    playable: boolean;
    observedAt: string;
    status: Record<string, unknown> | { error: string };
    appUi: Record<string, unknown> | { error: string };
    mapSummary: Record<string, unknown> | { error: string };
    autoplay: Record<string, unknown> | { error: string };
  }>;

export const readLiveGameStatusBody: Effect.Effect<LiveGameStatusOutput, never, Civ7TunerClient> =
  Effect.gen(function* () {
    const settled = yield* Effect.all(
      {
        status: Civ7TunerClient.playableStatus().pipe(Effect.either),
        appUi: Civ7TunerClient.appUiSnapshot().pipe(Effect.either),
        mapSummary: Civ7TunerClient.liveMapSummary().pipe(Effect.either),
        autoplay: Civ7TunerClient.autoplayStatus().pipe(Effect.either),
      },
      { concurrency: "unbounded" }
    );
    const playableStatus = settled.status._tag === "Right" ? settled.status.right : undefined;
    return {
      ok: Boolean(playableStatus && playableStatus.readiness !== "unavailable"),
      playable: playableStatus?.playable ?? false,
      observedAt: new Date().toISOString(),
      status: fieldOrError(settled.status, playableStatus),
      appUi: fieldOrError(settled.appUi),
      mapSummary: fieldOrError(settled.mapSummary),
      autoplay: fieldOrError(settled.autoplay),
    };
  });

/**
 * Map a `civ7.live.status` per-field result to the contract's
 * `unknownRecord | { error }` union, matching the legacy `allSettled` body:
 * a fulfilled value passes through; a rejection becomes `{ error: String(reason) }`.
 */
export function fieldOrError<A>(
  either: { _tag: "Left"; left: unknown } | { _tag: "Right"; right: A },
  override?: A
): Record<string, unknown> | { error: string } {
  if (either._tag === "Right") return (override ?? either.right) as Record<string, unknown>;
  return { error: String(either.left) };
}
