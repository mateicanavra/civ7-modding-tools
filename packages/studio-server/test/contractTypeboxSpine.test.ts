import {
  operationStatusTypeSchema,
  RecipeDagGetContract,
  runInGame,
  saveDeployStatusTypeSchema,
  studio,
  toStandardSchema,
  typeboxInputSchemaFromContractProcedure,
  typeboxOutputSchemaFromContractProcedure,
  typeboxSchemaFromStandardSchema,
} from "@civ7/studio-contract";
import { Type } from "typebox";
import { Value } from "typebox/value";
import { describe, expect, test } from "vitest";

const { operationsCurrent, studioEventSchema, studioOperationEventSchema } = studio;

describe("studio-server TypeBox contract spine", () => {
  test("recovers TypeBox origins from Standard Schema wrappers and contract procedures", () => {
    const schema = Type.Object(
      {
        nested: Type.Object(
          {
            count: Type.Integer(),
          },
          { additionalProperties: false }
        ),
      },
      { additionalProperties: false }
    );
    const standardSchema = toStandardSchema(schema);

    expect(typeboxSchemaFromStandardSchema(standardSchema)).toBe(schema);
    expect(typeboxInputSchemaFromContractProcedure(RecipeDagGetContract)).toBeTruthy();
    expect(typeboxOutputSchemaFromContractProcedure(RecipeDagGetContract)).toBeTruthy();

    const valid = standardSchema["~standard"].validate({
      nested: {
        count: 1,
        stripped: true,
      },
      stripped: true,
    });
    expect("value" in valid ? valid.value : undefined).toEqual({ nested: { count: 1 } });

    const invalid = standardSchema["~standard"].validate({
      nested: {
        count: "bad",
      },
    });
    expect("issues" in invalid ? invalid.issues?.[0]?.path : undefined).toEqual([
      { key: "nested" },
      { key: "count" },
    ]);
  });

  test("composes canonical operation DTO schemas into operations.current and operation events", () => {
    const operationsSchema = typeboxOutputSchemaFromContractProcedure(operationsCurrent);
    const runInGameRegistry = schemaProperty(
      schemaProperty(operationsSchema, "runInGame"),
      "active"
    );
    const runInGameRecent = schemaProperty(schemaProperty(operationsSchema, "runInGame"), "recent");
    const saveDeployRegistry = schemaProperty(
      schemaProperty(operationsSchema, "saveDeploy"),
      "active"
    );
    const saveDeployRecent = schemaProperty(
      schemaProperty(operationsSchema, "saveDeploy"),
      "recent"
    );

    expect(unionOption(runInGameRegistry, 0)).toBe(operationStatusTypeSchema);
    expect((runInGameRecent as { items?: unknown }).items).toBe(operationStatusTypeSchema);
    expect(unionOption(saveDeployRegistry, 0)).toBe(saveDeployStatusTypeSchema);
    expect((saveDeployRecent as { items?: unknown }).items).toBe(saveDeployStatusTypeSchema);

    expect(
      Value.Check(operationsSchema, {
        ok: true,
        serverInstanceId: "studio-test",
        serverStartedAt: "2026-06-15T00:00:00.000Z",
        observedAt: "2026-06-15T00:00:01.000Z",
        runInGame: {
          active: null,
          recent: [
            {
              requestId: "run-1",
              phase: "completed",
              status: "completed",
              recoveryActions: ["copy-diagnostics"],
            },
          ],
        },
        saveDeploy: {
          active: {
            ok: true,
            requestId: "save-1",
            phase: "complete",
            status: "complete",
            saved: true,
            deployed: true,
            recoveryActions: ["copy-diagnostics"],
          },
          recent: [],
        },
      })
    ).toBe(true);

    const runInGameOperationEvent = unionOption(studioOperationEventSchema, 0);
    const saveDeployOperationEvent = unionOption(studioOperationEventSchema, 1);
    expect(schemaProperty(runInGameOperationEvent, "status")).toBe(operationStatusTypeSchema);
    expect(schemaProperty(saveDeployOperationEvent, "status")).toBe(saveDeployStatusTypeSchema);

    expect(
      Value.Check(saveDeployStatusTypeSchema, {
        ok: false,
        requestId: "save-hostile",
        phase: "failed",
        status: "failed",
        saved: true,
        deployed: false,
        safeFailureCategory: "deployment",
        recoveryActions: ["copy-diagnostics"],
        path: "/Users/private/config.json",
        stderr: "secret deploy output",
      })
    ).toBe(false);
    expect(
      Value.Check(operationStatusTypeSchema, {
        requestId: "run-hostile",
        phase: "failed",
        status: "failed",
        safeFailureCategory: "runtime-control",
        recoveryActions: ["copy-diagnostics"],
        error: "private Error.message",
        cause: { path: "/Users/private" },
      })
    ).toBe(false);
  });

  test("keeps runInGame.cancel on the closed request-id input and public status output", () => {
    const input = typeboxInputSchemaFromContractProcedure(runInGame.cancel);
    const output = typeboxOutputSchemaFromContractProcedure(runInGame.cancel);

    expect(schemaProperty(input, "requestId")).toBeTruthy();
    expect(
      Object.keys((input as { properties?: Record<string, unknown> }).properties ?? {})
    ).toEqual(["requestId"]);
    expect((input as { additionalProperties?: unknown }).additionalProperties).toBe(false);
    expect(output).toBe(operationStatusTypeSchema);
    expect(Value.Check(input, { requestId: "studio-run-in-game-cancel" })).toBe(true);
    expect(Value.Check(input, { requestId: "studio-run-in-game-cancel", leaseId: "private" })).toBe(
      false
    );
  });

  test("keeps the Studio event union TypeBox-owned and sealed to hello, operation, and live-game", () => {
    expect(unionOption(studioEventSchema, 0)).toBeTruthy();
    expect(unionOption(studioEventSchema, 1)).toBe(studioOperationEventSchema);
    expect(unionOption(studioEventSchema, 2)).toBeTruthy();

    expect(
      Value.Check(studioEventSchema, {
        type: "hello",
        serverInstanceId: "studio-test",
        serverStartedAt: "2026-06-15T00:00:00.000Z",
        observedAt: "2026-06-15T00:00:01.000Z",
      })
    ).toBe(true);
    expect(
      Value.Check(studioEventSchema, {
        type: "live-game",
        observedAt: "2026-06-15T00:00:01.000Z",
        state: {
          status: "ok",
          readiness: "ready",
          snapshotStatus: "idle",
          bindingStatus: "unbound-runtime",
          failureCount: 0,
        },
      })
    ).toBe(true);
    expect(
      Value.Check(studioEventSchema, {
        type: "diagnostic",
        observedAt: "2026-06-15T00:00:01.000Z",
        details: {},
      })
    ).toBe(false);
  });
});

function schemaProperty(schema: unknown, key: string): unknown {
  return (schema as { properties?: Record<string, unknown> }).properties?.[key];
}

function unionOption(schema: unknown, index: number): unknown {
  return (schema as { anyOf?: unknown[] }).anyOf?.[index];
}
