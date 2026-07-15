import {
  type JsonWireObject,
  type MapConfigEnvelope,
  runInGame,
  typeboxInputSchemaFromContractProcedure,
} from "@civ7/studio-contract";
import type { StandardSchemaV1 } from "@standard-schema/spec";
import { Value } from "typebox/value";
import { describe, expect, it } from "vitest";

import { buildRunInGameStartRequest } from "../../src/features/runInGame/api";

describe("Run in Game request validation", () => {
  it("rejects undeclared raw-control tunnel fields at the public boundary", () => {
    const startInputSchema = typeboxInputSchemaFromContractProcedure(runInGame.start);
    const rawKeys = [
      "args",
      "command",
      "context",
      "script",
      "javascript",
      "operationType",
      "rawCommand",
      "rawJs",
      "session",
      "stateName",
    ] as const;

    for (const key of rawKeys) {
      const topLevelPayload = validRunInGameRequest({ [key]: "raw-control" });
      expect(Value.Check(startInputSchema, topLevelPayload)).toBe(false);
    }
  });

  it("rejects undeclared private-looking top-level fields in the contract", () => {
    const startInputSchema = typeboxInputSchemaFromContractProcedure(runInGame.start);
    const standardSchema = runInGame.start["~orpc"].inputSchema as StandardSchemaV1;

    expect(Value.Check(startInputSchema, validRunInGameRequest({ leaseId: "runtime-lease" }))).toBe(
      false
    );
    expect(
      Value.Check(startInputSchema, validRunInGameRequest({ serverInstanceId: "studio-server" }))
    ).toBe(false);
    for (const privateField of [
      "runArtifactId",
      "runCorrelation",
      "generationManifest",
      "generationManifestDigest",
      "manifestPath",
    ]) {
      expect(
        Value.Check(startInputSchema, validRunInGameRequest({ [privateField]: "private" }))
      ).toBe(false);
    }
    expect(
      "issues" in
        standardSchema["~standard"].validate(validRunInGameRequest({ leaseId: "runtime-lease" }))
    ).toBe(true);
    expect(
      "issues" in
        standardSchema["~standard"].validate(
          validRunInGameRequest({ serverInstanceId: "studio-server" })
        )
    ).toBe(true);
  });

  it("requires one complete canonical envelope at the oRPC boundary", () => {
    const startInputSchema = typeboxInputSchemaFromContractProcedure(runInGame.start);
    const complete = validRunInGameRequest();

    expect(Value.Check(startInputSchema, complete)).toBe(true);
    expect(
      Value.Check(startInputSchema, {
        ...complete,
        canonicalConfig: {
          id: "studio-current",
          name: "Studio Current",
          description: "Incomplete config envelope.",
          recipe: "standard",
          sortIndex: 9999,
          config: { ok: true },
        },
      })
    ).toBe(false);
  });

  it("keeps cancellation input to request id only", () => {
    const cancelInputSchema = typeboxInputSchemaFromContractProcedure(runInGame.cancel);
    const cancelStandardSchema = runInGame.cancel["~orpc"].inputSchema as StandardSchemaV1;

    expect(Value.Check(cancelInputSchema, { requestId: "studio-run-in-game-1" })).toBe(true);
    expect(
      Value.Check(cancelInputSchema, { requestId: "studio-run-in-game-1", cancel: true })
    ).toBe(false);
    expect(
      Value.Check(cancelInputSchema, {
        requestId: "studio-run-in-game-1",
        operationType: "cancel",
      })
    ).toBe(false);
    expect(
      Value.Check(cancelInputSchema, {
        requestId: "studio-run-in-game-1",
        leaseId: "runtime-lease-private",
      })
    ).toBe(false);
    expect(
      "issues" in
        cancelStandardSchema["~standard"].validate({
          requestId: "studio-run-in-game-1",
          leaseId: "runtime-lease-private",
        })
    ).toBe(true);
  });

  it("keeps status and diagnostics lookup inputs closed at the oRPC boundary", () => {
    const statusStandardSchema = runInGame.status["~orpc"].inputSchema as StandardSchemaV1;
    const diagnosticsStandardSchema = runInGame.diagnostics["~orpc"]
      .inputSchema as StandardSchemaV1;

    expect(
      "issues" in
        statusStandardSchema["~standard"].validate({
          requestId: "studio-run-in-game-1",
          generationManifest: "private",
        })
    ).toBe(true);
    expect(
      "issues" in
        diagnosticsStandardSchema["~standard"].validate({
          diagnosticsId: "run-diagnostics-public",
          sections: {},
        })
    ).toBe(true);
  });

  it("builds the public oRPC start input from the browser handoff shape", () => {
    const startInputSchema = typeboxInputSchemaFromContractProcedure(runInGame.start);
    const setupConfig = {
      savedConfig: {
        id: "tot-basic-mods",
        displayName: "Test of Time Basic Mods",
        fileName: "ToT_BasicModsEnabled.Civ7Cfg",
        path: "/private-sentinel/Civ7/Saves/ToT_BasicModsEnabled.Civ7Cfg",
      },
      gameOptions: { GameSpeeds: "GAMESPEED_STANDARD" },
      playerOptions: [{ playerId: 0, options: { PlayerLeader: "LEADER_HATSHEPSUT" } }],
    };

    const request = buildRunInGameStartRequest({
      canonicalConfig: canonicalConfig({ continents: { targetLandRatio: 0.42 } }),
      seed: "1538316415",
      worldSettings: {
        mapSize: "MAPSIZE_HUGE",
        playerCount: 10,
        resources: "balanced",
      },
      setupConfig,
    });

    expect(Value.Check(startInputSchema, request)).toBe(true);
    expect(request).toEqual({
      canonicalConfig: canonicalConfig({ continents: { targetLandRatio: 0.42 } }),
      seed: "1538316415",
      worldSettings: {
        mapSize: "MAPSIZE_HUGE",
        playerCount: 10,
        resources: "balanced",
      },
      setupConfig,
    });
  });
});

function validRunInGameRequest(extra?: Record<string, unknown>): Record<string, unknown> {
  return {
    canonicalConfig: canonicalConfig({ ok: true }),
    seed: 123,
    worldSettings: {
      mapSize: "MAPSIZE_STANDARD",
    },
    ...extra,
  };
}

function canonicalConfig(config: JsonWireObject): MapConfigEnvelope {
  return {
    id: "studio-current",
    name: "Studio Current",
    description: "Current Studio editor configuration.",
    recipe: "standard" as const,
    sortIndex: 9999,
    latitudeBounds: { topLatitude: 80, bottomLatitude: -80 },
    config,
  };
}
