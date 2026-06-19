import { describe, expect, test } from "vitest";
import {
  decideScanRootProtection,
  declarationForFileLayerRule,
  evaluateProtectedMutationGuard,
  runFileLayerProtectedMutationRule,
  stagedPathsFromNameStatus,
} from "../../src/lib/protected-zones/index.js";
import {
  defaultHostPolicyDocument,
  readHostPolicyState,
  unavailableHostPolicyState,
} from "../../src/lib/host-policy.js";

describe("protected zone file-layer execution", () => {
  test("rejects an unknown generated zone before staged no-op behavior", () => {
    const result = runFileLayerProtectedMutationRule({
      id: "file-layer-unknown-zone",
      lane: "enforced",
      ownerTool: "file-layer",
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
        ownerTool: "file-layer",
        message: "Generated output must be regenerated.",
        generatedZone: "swooper-map-generated",
      },
      {
        staged: true,
        stagedPaths: [
          {
            path: "mods/mod-swooper-maps/src/maps/generated/example.ts",
            action: "modified",
          },
        ],
      }
    );

    expect(result.exitCode).toBe(1);
    expect(result.diagnostics[0]).toMatchObject({
      ruleId: "file-layer-generated-zone",
      path: "mods/mod-swooper-maps/src/maps/generated/example.ts",
      severity: "error",
      baselined: false,
    });
    expect(result.diagnostics[0]?.message).toContain("nx run mod-swooper-maps:gen:maps");
  });

  test("refuses forbidden artifacts separately from generated surfaces", () => {
    const result = runFileLayerProtectedMutationRule(
      {
        id: "file-layer-forbidden-artifact",
        lane: "enforced",
        ownerTool: "file-layer",
        message: "pnpm artifacts are forbidden in this Bun-only repo.",
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
          ruleId: "file-layer-forbidden-artifact",
          path: "pnpm-lock.yaml",
          message: "pnpm artifacts are forbidden in this Bun-only repo.",
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
        ownerTool: "file-layer",
        message: "Generated output must be regenerated.",
        generatedZone: "swooper-map-generated",
      },
      {
        staged: true,
        stagedPaths: [
          {
            path: "mods/mod-swooper-maps/src/maps/generated/example.ts",
            action: "modified",
          },
        ],
      }
    );

    expect(result.diagnostics[0]?.severity).toBe("error");
  });

  test("classifies rename and copy name-status paths", () => {
    expect(stagedPathsFromNameStatus("R100\0old.ts\0new.ts\0C100\0a.ts\0b.ts\0")).toEqual([
      { path: "old.ts", action: "renamed-from" },
      { path: "new.ts", action: "renamed-to" },
      { path: "a.ts", action: "copied-from" },
      { path: "b.ts", action: "copied-to" },
    ]);
  });

  test("returns not-applicable decisions for clean staged paths", () => {
    const state = declarationForFileLayerRule({
      id: "file-layer-generated-zone",
      lane: "enforced",
      ownerTool: "file-layer",
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

  test("scan-root refusals carry owner and recovery", () => {
    const generated = decideScanRootProtection("mods/mod-swooper-maps/src/maps/generated");
    expect(generated).toMatchObject({
      kind: "refused-generated-output",
      reason: "generated-output",
      owner: { ownerId: "swooper-maps-workflow" },
      recovery: { actionKind: "command" },
    });

    const unavailable = decideScanRootProtection("packages", {
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

  test("scan-root protection preserves protected host-surface state", () => {
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
      decideScanRootProtection("protected/root", { hostPolicyState: state })
    ).toMatchObject({
      kind: "refused-protected-root",
      reason: "protected-root",
      owner: { ownerId: "swooper-maps-workflow" },
    });
  });
});
