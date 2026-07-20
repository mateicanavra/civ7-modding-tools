import type { Civ7PlayableStatusResult } from "@civ7/direct-control";
import type { LiveGameStatusBody } from "@civ7/studio-contract";
import { Effect, Option } from "effect";
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

export const readLiveGameStatusBody = Civ7TunerClient.playableStatus().pipe(
  Effect.match({ onFailure: failedStatus, onSuccess: observedStatus })
);

function failedStatus(cause: unknown): LiveGameStatusOutput {
  const error = { error: String(cause) };
  return {
    ok: false,
    playable: false,
    observedAt: new Date().toISOString(),
    status: error,
    appUi: error,
    mapSummary: error,
    autoplay: error,
  };
}

function observedStatus(status: Civ7PlayableStatusResult) {
  const appUi = status.appUi;
  const snapshot = appUi.snapshot;
  const turn = Option.liftPredicate(snapshot.game.turn, (value) => value >= 0).pipe(
    Option.match({
      onNone: () => ({}),
      onSome: (value) => ({ turn: { ok: true as const, value } }),
    })
  );
  return {
    ok: status.readiness !== "unavailable",
    playable: status.playable,
    observedAt: new Date().toISOString(),
    status,
    appUi,
    mapSummary: {
      host: appUi.host,
      port: appUi.port,
      state: appUi.state,
      map: {
        randomSeed: snapshot.map.randomSeed,
        width: snapshot.map.width,
        height: snapshot.map.height,
      },
      game: {
        ...turn,
        hash: snapshot.game.hash,
      },
    },
    autoplay: {
      host: appUi.host,
      port: appUi.port,
      state: appUi.state,
      autoplay: snapshot.autoplay,
      game: snapshot.game,
      gameContext: snapshot.gameContext,
    },
  } satisfies LiveGameStatusOutput;
}
