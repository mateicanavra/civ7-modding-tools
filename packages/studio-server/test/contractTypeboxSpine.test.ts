import { readFileSync } from "node:fs";
import { readdir } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
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

const repoRoot = fileURLToPath(new URL("../../..", import.meta.url));

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

  test("keeps active Studio contract modules free of stale schema-tech residue", async () => {
    const studioSources = [
      ...(await sourceFiles(join(repoRoot, "packages/studio-server/src"))),
      ...(await sourceFiles(join(repoRoot, "packages/studio-contract/src"))),
    ];
    const appStudioSources = await sourceFiles(join(repoRoot, "apps/mapgen-studio/src"));
    const studioText = studioSources.map((file) => readFileSync(file, "utf8")).join("\n");
    const nonRouterText = studioSources
      .filter((file) => !file.includes("/router/"))
      .map((file) => readFileSync(file, "utf8"))
      .join("\n");
    const appText = appStudioSources
      .filter((file) => !file.includes("/browser-runner/"))
      .map((file) => readFileSync(file, "utf8"))
      .join("\n");

    expect(studioText).not.toMatch(
      /from ["']zod["']|\bz\.infer\b|legacy Studio success I\/O schemas.*Zod|remain Zod|zod-derived/
    );
    expect(appText).not.toMatch(/zod-derived/);
    expect(nonRouterText).not.toMatch(/from ["']effect-orpc["'];/);

    const routerText = readFileSync(
      join(repoRoot, "packages/studio-server/src/router/index.ts"),
      "utf8"
    );
    expect(routerText).toMatch(/from "effect-orpc"/);
  });

  test("keeps app operation DTO usage derived from the package contract", async () => {
    const runInGameStatusPath = join(
      repoRoot,
      "apps/mapgen-studio/src/features/runInGame/status.ts"
    );
    const mapConfigStatusPath = join(
      repoRoot,
      "apps/mapgen-studio/src/features/mapConfigSave/status.ts"
    );
    const runInGameFeatureStatus = readFileSync(runInGameStatusPath, "utf8");
    const mapConfigFeatureStatus = readFileSync(mapConfigStatusPath, "utf8");
    const appStudioSources = await sourceFiles(join(repoRoot, "apps/mapgen-studio/src"));
    const appTestSources = await sourceFiles(join(repoRoot, "apps/mapgen-studio/test"));
    const appDtoConsumerSources = [...appStudioSources, ...appTestSources]
      .filter((file) => file !== runInGameStatusPath && file !== mapConfigStatusPath)
      .map((file) => readFileSync(file, "utf8"))
      .join("\n");
    const appSources = [
      readFileSync(join(repoRoot, "apps/mapgen-studio/src/features/runInGame/api.ts"), "utf8"),
      readFileSync(join(repoRoot, "apps/mapgen-studio/src/features/mapConfigSave/api.ts"), "utf8"),
      readFileSync(join(repoRoot, "apps/mapgen-studio/src/app/operationAdoption.ts"), "utf8"),
    ].join("\n");
    const serverRunInGameSourceFiles = await sourceFiles(
      join(repoRoot, "apps/mapgen-studio/src/server/runInGame")
    );
    const serverRunInGameSources = [
      ...serverRunInGameSourceFiles.map((file) => readFileSync(file, "utf8")),
      readFileSync(join(repoRoot, "apps/mapgen-studio/src/server/studio/engines.ts"), "utf8"),
      readFileSync(join(repoRoot, "apps/mapgen-studio/src/server/studio/context.ts"), "utf8"),
    ].join("\n");
    const evidenceTypes = readFileSync(
      join(repoRoot, "apps/mapgen-studio/src/server/runInGame/evidenceTypes.ts"),
      "utf8"
    );

    expect(runInGameFeatureStatus).toMatch(/from "@civ7\/studio-contract"/);
    expect(mapConfigFeatureStatus).toMatch(/from "@civ7\/studio-contract"/);
    expect(runInGameFeatureStatus).not.toMatch(/@civ7\/studio-server/);
    expect(mapConfigFeatureStatus).not.toMatch(/@civ7\/studio-server/);
    expect(runInGameFeatureStatus).not.toMatch(
      /export\s+type\s+\{[\s\S]*\}\s+from\s+["']@civ7\/studio-server["']/
    );
    expect(mapConfigFeatureStatus).not.toMatch(
      /export\s+type\s+\{[\s\S]*\}\s+from\s+["']@civ7\/studio-server["']/
    );
    expect(runInGameFeatureStatus).not.toMatch(
      /export\s+(?:type\s+)?\{[^}]*\btype\s+RunInGame[A-Za-z]+[^}]*\}\s*(?:from\s+["'][^"']+["'])?;|export\s+type\s+\{[^}]*RunInGame[A-Za-z]+[^}]*\}\s*;/
    );
    expect(mapConfigFeatureStatus).not.toMatch(
      /export\s+(?:type\s+)?\{[^}]*\btype\s+MapConfigSaveDeploy[A-Za-z]+[^}]*\}\s*(?:from\s+["'][^"']+["'])?;|export\s+type\s+\{[^}]*MapConfigSaveDeploy[A-Za-z]+[^}]*\}\s*;/
    );
    expect(runInGameFeatureStatus).not.toMatch(/RunInGameOperationStatus\s*=\s*Readonly/);
    expect(mapConfigFeatureStatus).not.toMatch(/MapConfigSaveDeployStatus\s*=\s*Readonly/);
    expect(appDtoConsumerSources).not.toMatch(
      /import\s+type\s+\{[^}]*RunInGame[A-Za-z]+[^}]*\}\s+from\s+["'](?:[^"']*features\/runInGame\/status|\.\/status)["']|import\s+\{[^}]*type\s+RunInGame[A-Za-z]+[^}]*\}\s+from\s+["'](?:[^"']*features\/runInGame\/status|\.\/status)["']/
    );
    expect(appDtoConsumerSources).not.toMatch(
      /import\s+type\s+\{[^}]*MapConfigSaveDeploy[A-Za-z]+[^}]*\}\s+from\s+["'](?:[^"']*features\/mapConfigSave\/status|\.\/status)["']|import\s+\{[^}]*type\s+MapConfigSaveDeploy[A-Za-z]+[^}]*\}\s+from\s+["'](?:[^"']*features\/mapConfigSave\/status|\.\/status)["']/
    );
    expect(appSources).not.toMatch(/as RunInGameOperationStatus|as MapConfigSaveDeployStatus/);
    expect(serverRunInGameSources).not.toMatch(/features\/runInGame\/status/);
    expect(serverRunInGameSources).not.toMatch(
      /as Awaited<ReturnType<StudioServerContext\["runInGame(?:Start|Status)"\]>>|as RunInGameOperationEvent\["status"\]/
    );
    expect(evidenceTypes).not.toMatch(/export type \{[\s\S]*from "@civ7\/studio-server"/);
    expect(evidenceTypes).not.toMatch(
      /(?:export\s+)?(?:type|interface)\s+RunInGame(?!Detailed)[A-Za-z]+/
    );
    expect(evidenceTypes).toMatch(/RunInGameDetailedExactAuthorshipEvidence/);
    expect(evidenceTypes).toMatch(
      /RunInGameExactAuthorshipEvidence as PublicRunInGameExactAuthorshipEvidence/
    );
  });
});

function schemaProperty(schema: unknown, key: string): unknown {
  return (schema as { properties?: Record<string, unknown> }).properties?.[key];
}

function unionOption(schema: unknown, index: number): unknown {
  return (schema as { anyOf?: unknown[] }).anyOf?.[index];
}

async function sourceFiles(root: string): Promise<string[]> {
  const entries = await readdir(root, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const path = join(root, entry.name);
      if (entry.isDirectory()) return sourceFiles(path);
      return path.endsWith(".ts") || path.endsWith(".tsx") ? [path] : [];
    })
  );
  return nested.flat();
}
