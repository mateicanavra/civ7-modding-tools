import { runInGame, typeboxInputSchemaFromContractProcedure } from "@civ7/studio-contract";
import type { StandardSchemaV1 } from "@standard-schema/spec";
import { Value } from "typebox/value";
import { describe, expect, it } from "vitest";

import { assertNoRawControlFields } from "../../src/server/runInGame/requestValidation";

describe("Run in Game request validation", () => {
  it("rejects raw-control top-level tunnel fields in TypeBox and nested fields in host validation", () => {
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
      expect(Value.Check(startInputSchema, topLevelPayload)).toBe(true);
      expect(() => assertNoRawControlFields(topLevelPayload)).toThrow("raw control commands");

      const nestedPayload = validRunInGameRequest({
        source: {
          kind: "editor",
          editorSessionId: "studio-current",
          payload: {
            configId: "studio-current",
            label: "Studio Current",
            mapScript: "{swooper-maps}/maps/studio-current.js",
            pipelineConfig: {
              nested: {
                [key]: "raw-control",
              },
            },
            recipeId: "mod-swooper-maps/standard",
          },
        },
      });
      expect(Value.Check(startInputSchema, nestedPayload)).toBe(true);
      expect(() => assertNoRawControlFields(nestedPayload)).toThrow("raw control commands");
    }
  });

  it("rejects raw control command fields anywhere in the payload", () => {
    expect(() =>
      assertNoRawControlFields({
        config: {
          nested: {
            rawJs: "UI.notifyUIReady()",
          },
        },
      })
    ).toThrow("raw control commands");
    expect(() =>
      assertNoRawControlFields({
        config: {
          operations: [
            {
              rawCommand: "GameplayMap.revealAll()",
            },
          ],
        },
      })
    ).toThrow("raw control commands");
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
      expect(Value.Check(startInputSchema, validRunInGameRequest({ [privateField]: "private" })))
        .toBe(false);
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
});

function validRunInGameRequest(extra?: Record<string, unknown>): Record<string, unknown> {
  return {
    source: {
      kind: "editor",
      editorSessionId: "studio-current",
      payload: {
        configId: "studio-current",
        label: "Studio Current",
        mapScript: "{swooper-maps}/maps/studio-current.js",
        pipelineConfig: { ok: true },
        recipeId: "mod-swooper-maps/standard",
      },
    },
    recipeSettings: {
      recipe: "mod-swooper-maps/standard",
      seed: 123,
    },
    worldSettings: {
      mapSize: "MAPSIZE_STANDARD",
    },
    ...extra,
  };
}
