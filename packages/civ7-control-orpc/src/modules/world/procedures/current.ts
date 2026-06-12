import type { Civ7RuntimeProbe } from "@civ7/direct-control";
import { Effect } from "effect";

import type { Civ7ControlOrpcContext } from "../../../context";
import type { Civ7ControlOrpcPlayableStatusResult } from "../../../dependencies/direct-control";
import {
  civ7ControlOrpcErrorCorrelationData,
  civ7ControlOrpcFailureDetail,
} from "../../../model/correlation";
import { civ7ControlOrpcImplementer } from "../../../procedure";
import type { Civ7WorldCurrentResult } from "../contract";

export const worldCurrentProcedure =
  civ7ControlOrpcImplementer.world.current.effect(function* ({
    context,
    errors,
  }) {
    return yield* Effect.tryPromise({
      try: async () =>
        worldCurrentResult(
          await context.directControl.getCiv7PlayableStatus(
            context.endpointDefaults,
          ),
        ),
      catch: (cause) =>
        errors.WORLD_CURRENT_UNAVAILABLE({
          data: {
            detail: civ7ControlOrpcFailureDetail(cause),
            procedureKey: "world.current",
            source: "direct-control-facade",
            ...civ7ControlOrpcErrorCorrelationData(context),
          },
        }),
    });
  });

function worldCurrentResult(
  status: Civ7ControlOrpcPlayableStatusResult,
): Civ7WorldCurrentResult {
  const inGame = status.playable || status.readiness === "app-ui-game";
  const snapshot = status.appUi.snapshot;
  const map = inGame ? worldMapFacts(status) : emptyMapFacts();
  const players = inGame ? worldPlayerFacts(status) : emptyPlayerFacts();
  const nextSteps = worldCurrentNextSteps(status, map);

  return {
    playable: status.playable,
    readiness: status.readiness,
    sourceStatus: {
      playableStatus: "read",
      game: inGame ? "read" : "skipped-not-playable",
      map: inGame ? mapSourceStatus(snapshot.map) : "skipped-not-playable",
      players: inGame
        ? playersSourceStatus(snapshot.players)
        : "skipped-not-playable",
    },
    turn: inGame
      ? {
          current: status.appUi.snapshot.game.turn,
          date: probeValue(status.appUi.snapshot.game.turnDate),
          age: status.appUi.snapshot.game.age,
          maxTurns: status.appUi.snapshot.game.maxTurns,
          hash: probeValue(status.appUi.snapshot.game.hash),
        }
      : {
          current: null,
          date: null,
          age: null,
          maxTurns: null,
          hash: null,
        },
    localPlayer: inGame
      ? {
          playerId: playerIdOrNull(status.appUi.snapshot.gameContext.localPlayerID),
          observerId: playerIdOrNull(
            status.appUi.snapshot.gameContext.localObserverID,
          ),
        }
      : {
          playerId: null,
          observerId: null,
        },
    map,
    players,
    summary: {
      hasMapDimensions: map.width != null && map.height != null
        && map.width > 0 && map.height > 0,
      alivePlayerCount: players.alivePlayerIds.length,
      nextStepCount: nextSteps.length,
    },
    nextSteps,
  };
}

function worldMapFacts(
  status: Civ7ControlOrpcPlayableStatusResult,
): Civ7WorldCurrentResult["map"] {
  const map = status.appUi.snapshot.map;
  return {
    width: probeValue(map.width),
    height: probeValue(map.height),
    plotCount: probeValue(map.plotCount),
    mapSize: probeValue(map.mapSize),
    randomSeed: probeValue(map.randomSeed),
  };
}

function emptyMapFacts(): Civ7WorldCurrentResult["map"] {
  return {
    width: null,
    height: null,
    plotCount: null,
    mapSize: null,
    randomSeed: null,
  };
}

function worldPlayerFacts(
  status: Civ7ControlOrpcPlayableStatusResult,
): Civ7WorldCurrentResult["players"] {
  const players = status.appUi.snapshot.players;
  return {
    maxPlayers: status.appUi.snapshot.players.maxPlayers,
    alivePlayerIds: integerArrayOrEmpty(probeValue(players.aliveIds)),
    aliveHumanIds: integerArrayOrEmpty(probeValue(players.aliveHumanIds)),
    aliveHumanCount: probeValue(players.numAliveHumans),
  };
}

function emptyPlayerFacts(): Civ7WorldCurrentResult["players"] {
  return {
    maxPlayers: null,
    alivePlayerIds: [],
    aliveHumanIds: [],
    aliveHumanCount: null,
  };
}

function worldCurrentNextSteps(
  status: Civ7ControlOrpcPlayableStatusResult,
  map: Civ7WorldCurrentResult["map"],
): Civ7WorldCurrentResult["nextSteps"] {
  if (status.playable || status.readiness === "app-ui-game") {
    if (map.width == null || map.height == null) {
      return [{
        kind: "inspect-world",
        source: "world.current",
        label:
          "World map facts are incomplete; inspect current world evidence before acting.",
      }];
    }

    return [{
      kind: "read-attention",
      source: "world.current",
      label: "Read current attention before choosing support actions.",
    }];
  }

  if (status.readiness === "shell") {
    return [{
      kind: "enter-game",
      source: "world.current",
      label: "Enter an active game before reading current world facts.",
    }];
  }

  return [{
    kind: "restore-readiness",
    source: "world.current",
    label: "Restore playable or game UI readiness before reading current world facts.",
  }];
}

function mapSourceStatus(
  map: Civ7ControlOrpcPlayableStatusResult["appUi"]["snapshot"]["map"],
): Civ7WorldCurrentResult["sourceStatus"]["map"] {
  return map.width.ok || map.height.ok || map.plotCount.ok || map.mapSize.ok
    ? "read"
    : "skipped-unavailable";
}

function playersSourceStatus(
  players: Civ7ControlOrpcPlayableStatusResult["appUi"]["snapshot"]["players"],
): Civ7WorldCurrentResult["sourceStatus"]["players"] {
  return players.aliveIds.ok || players.aliveHumanIds.ok
      || players.numAliveHumans.ok
    ? "read"
    : "skipped-unavailable";
}

function probeValue<T>(probe: Civ7RuntimeProbe<T>): T | null {
  return probe.ok ? probe.value : null;
}

function integerArrayOrEmpty(value: unknown): number[] {
  return Array.isArray(value)
    ? value.filter((item): item is number =>
        Number.isInteger(item) && item >= 0
      )
    : [];
}

function playerIdOrNull(value: unknown): number | null {
  return Number.isInteger(value) && Number(value) >= 0 ? Number(value) : null;
}
