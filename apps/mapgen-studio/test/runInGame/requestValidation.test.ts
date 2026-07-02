import { runInGame, typeboxInputSchemaFromContractProcedure } from "@civ7/studio-contract";
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
      expect(Value.Check(startInputSchema, topLevelPayload)).toBe(false);
      expect(() => assertNoRawControlFields(topLevelPayload)).toThrow("raw control commands");

      const nestedPayload = validRunInGameRequest({
        config: {
          nested: {
            [key]: "raw-control",
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
});

function validRunInGameRequest(extra?: Record<string, unknown>): Record<string, unknown> {
  return {
    recipeId: "mod-swooper-maps/standard",
    seed: 123,
    mapSize: "MAPSIZE_STANDARD",
    config: { ok: true },
    ...extra,
  };
}
