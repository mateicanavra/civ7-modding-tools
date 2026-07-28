import {
  decideAcquisitionRootProtection,
  declarationForFileLayerRule,
  defaultHostPolicyDocument,
  evaluateProtectedMutationGuard,
  parseStagedPathsFromNameStatus,
  readHostPolicyState,
  runFileLayerProtectedMutationRule,
  unavailableHostPolicyState,
} from "@habitat/cli/service/model/host/index";
import { describe, expect, test } from "vitest";

describe("protected zone file-layer execution", () => {
  const generatedZoneRunner = {
    name: "habitat",
    mode: "file-layer",
    guard: "generated-zone",
  } as const;
  const forbiddenFileRunner = {
    name: "habitat",
    mode: "file-layer",
    guard: "forbidden-file-name",
  } as const;

  test("rejects an unknown generated zone before staged no-op behavior", () => {
    const result = runFileLayerProtectedMutationRule({
      id: "file-layer-unknown-zone",
      lane: "enforced",
      runner: generatedZoneRunner,
      message: "Generated output must be regenerated.",
      generatedZone: "unknown-zone",
    });

    expect(result.exitCode).toBe(1);
    expect(result.diagnostics).toEqual([
      {
        ruleId: "file-layer-unknown-zone",
        path: ".",
        message:
          "Unknown generated zone 'unknown-zone'. Regenerate through openspec/changes/deep-habitat-host-policy-boundary-gate; this repo cannot regenerate that surface in CI.",
        severity: "error",
        baselined: false,
      },
    ]);
  });

  test("refuses staged generated surface edits through a protected-zone decision", () => {
    const result = runFileLayerProtectedMutationRule(
      {
        id: "file-layer-generated-zone",
        lane: "enforced",
        runner: generatedZoneRunner,
        message: "Generated output must be regenerated.",
        generatedZone: "swooper-map-generated",
      },
      {
        staged: true,
        stagedPaths: [
          {
            path: "apps/mods/map/swooper-physics/src/maps/generated/example.ts",
            action: "modified",
          },
        ],
      }
    );

    expect(result.exitCode).toBe(1);
    expect(result.diagnostics[0]).toMatchObject({
      ruleId: "file-layer-generated-zone",
      path: "apps/mods/map/swooper-physics/src/maps/generated/example.ts",
      severity: "error",
      baselined: false,
    });
    expect(result.diagnostics[0]?.message).toContain("nx run swooper-physics-mod:gen:maps");
  });

  test("refuses forbidden files separately from generated surfaces", () => {
    const result = runFileLayerProtectedMutationRule(
      {
        id: "file-layer-forbidden-file",
        lane: "enforced",
        runner: forbiddenFileRunner,
        message: "pnpm files are forbidden in this Bun-only repo.",
        forbiddenFileNames: ["pnpm-lock.yaml"],
      },
      {
        staged: true,
        stagedPaths: [{ path: "pnpm-lock.yaml", action: "added" }],
      }
    );

    expect(result).toEqual({
      exitCode: 1,
      diagnostics: [
        {
          ruleId: "file-layer-forbidden-file",
          path: "pnpm-lock.yaml",
          message: "pnpm files are forbidden in this Bun-only repo.",
          severity: "error",
          baselined: false,
        },
      ],
    });
  });

  test("does not downgrade protected authority refusals for advisory file-layer rows", () => {
    const result = runFileLayerProtectedMutationRule(
      {
        id: "file-layer-advisory-generated-zone",
        lane: "advisory",
        runner: generatedZoneRunner,
        message: "Generated output must be regenerated.",
        generatedZone: "swooper-map-generated",
      },
      {
        staged: true,
        stagedPaths: [
          {
            path: "apps/mods/map/swooper-physics/src/maps/generated/example.ts",
            action: "modified",
          },
        ],
      }
    );

    expect(result.diagnostics[0]?.severity).toBe("error");
  });

  test("preserves add, modify, delete, rename, and copy name-status actions", () => {
    expect(
      parseStagedPathsFromNameStatus(
        "A\0added.ts\0M\0modified.ts\0D\0deleted.ts\0R100\0old.ts\0new.ts\0C100\0a.ts\0b.ts\0"
      )
    ).toEqual({
      ok: true,
      paths: [
        { path: "added.ts", action: "added" },
        { path: "modified.ts", action: "modified" },
        { path: "deleted.ts", action: "deleted" },
        { path: "old.ts", action: "renamed-from" },
        { path: "new.ts", action: "renamed-to" },
        { path: "a.ts", action: "copied-from" },
        { path: "b.ts", action: "copied-to" },
      ],
    });
  });

  test.each([
    ["missing terminal NUL", "D\0deleted.ts"],
    ["missing deleted path", "D\0"],
    ["incomplete rename", "R100\0old.ts\0"],
    ["unknown status", "Q\0path.ts\0"],
    ["type-change status", "T\0path.ts\0"],
    ["unmerged status", "U\0path.ts\0"],
    ["rename score above 100", "R101\0old.ts\0new.ts\0"],
    ["copy score above 100", "C999\0old.ts\0new.ts\0"],
  ])("refuses %s in cached name-status output", (_, output) => {
    expect(parseStagedPathsFromNameStatus(output)).toMatchObject({ ok: false });
  });

  test("returns not-applicable decisions for clean staged paths", () => {
    const state = declarationForFileLayerRule({
      id: "file-layer-generated-zone",
      lane: "enforced",
      runner: generatedZoneRunner,
      message: "Generated output must be regenerated.",
      generatedZone: "swooper-map-generated",
    });

    const decisions = evaluateProtectedMutationGuard(state, [
      { path: "packages/example/src/index.ts", action: "modified" },
    ]);

    expect(decisions).toEqual([
      {
        kind: "not-applicable",
        path: "packages/example/src/index.ts",
        action: "modified",
      },
    ]);
  });

  test("uses path-segment-safe prefix matching", () => {
    const decisions = evaluateProtectedMutationGuard(
      {
        kind: "ready",
        declaration: {
          kind: "protected-surface",
          declarationId: "protected-config",
          surfaceKind: "protected",
          matcher: { kind: "prefix", value: "protected/config" },
          owner: {
            ownerId: "host-owner",
            displayName: "Host owner",
            recoveryContact: "docs/host.md",
          },
          recovery: {
            ownerId: "host-owner",
            actionKind: "documented-workflow",
            documentRef: "docs/host.md",
            retryCondition: "Retry through the host workflow.",
          },
        },
      },
      [{ path: "protected/configuration.ts", action: "modified" }]
    );

    expect(decisions).toEqual([
      {
        kind: "not-applicable",
        path: "protected/configuration.ts",
        action: "modified",
      },
    ]);
  });

  test("models protected host-surface decisions separately from generated edits", () => {
    const decisions = evaluateProtectedMutationGuard(
      {
        kind: "ready",
        declaration: {
          kind: "protected-surface",
          declarationId: "protected-config",
          surfaceKind: "protected",
          matcher: { kind: "exact", value: "protected/config.json" },
          owner: {
            ownerId: "host-owner",
            displayName: "Host owner",
            recoveryContact: "docs/host.md",
          },
          recovery: {
            ownerId: "host-owner",
            actionKind: "documented-workflow",
            documentRef: "docs/host.md",
            retryCondition: "Retry through the host workflow.",
          },
        },
      },
      [{ path: "protected/config.json", action: "modified" }]
    );

    expect(decisions).toEqual([
      {
        kind: "refused-direct-protected-edit",
        path: "protected/config.json",
        action: "modified",
        surfaceKind: "protected",
        owner: {
          ownerId: "host-owner",
          displayName: "Host owner",
          recoveryContact: "docs/host.md",
        },
        recovery: {
          ownerId: "host-owner",
          actionKind: "documented-workflow",
          documentRef: "docs/host.md",
          retryCondition: "Retry through the host workflow.",
        },
      },
    ]);
  });

  test("acquisition-root refusals carry owner and recovery", () => {
    const generated = decideAcquisitionRootProtection(
      "apps/mods/map/swooper-physics/src/maps/generated"
    );
    expect(generated).toMatchObject({
      kind: "refused-generated-output",
      reason: "generated-output",
      owner: { ownerId: "swooper-maps-workflow" },
      recovery: { actionKind: "command" },
    });

    const unavailable = decideAcquisitionRootProtection("packages", {
      hostPolicyState: unavailableHostPolicyState(
        "civ7-repo-host-policy",
        "host policy unavailable"
      ),
    });
    expect(unavailable).toMatchObject({
      kind: "refused-protected-root",
      reason: "protected-root",
      owner: { ownerId: "host-policy" },
      recovery: { actionKind: "documented-workflow" },
    });
  });

  test("acquisition-root protection preserves protected host-surface state", () => {
    const state = readHostPolicyState({
      ...defaultHostPolicyDocument,
      declarations: [
        ...defaultHostPolicyDocument.declarations,
        {
          policyId: defaultHostPolicyDocument.policyId,
          declarationId: "protected-root",
          ownerId: "swooper-maps-workflow",
          kind: "protected-surface",
          matcher: { kind: "prefix", value: "protected/root" },
          mutationLane: "blocked",
          recovery: {
            ownerId: "swooper-maps-workflow",
            actionKind: "documented-workflow",
            documentRef: "docs/protected.md",
            retryCondition: "Use the host-owned protected-surface workflow.",
          },
        },
      ],
    });

    expect(
      decideAcquisitionRootProtection("protected/root", { hostPolicyState: state })
    ).toMatchObject({
      kind: "refused-protected-root",
      reason: "protected-root",
      owner: { ownerId: "swooper-maps-workflow" },
    });
  });
});
