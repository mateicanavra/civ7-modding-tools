import { captureOutput, makeHabitatCommandResult } from "@habitat/cli/resources/command/index";
import { affirmedBlueprintContinuityReportEffect } from "@habitat/cli/service/model/check/policy/structural/blueprint-continuity-execution.policy";
import type { StructuralGitPort } from "@habitat/cli/service/model/check/policy/structural/context.policy";
import { applyStagedPathActions } from "@habitat/cli/service/model/host/index";
import { Effect } from "effect";
import { describe, expect, test } from "vitest";

const manifestPath = ".habitat/blueprints/domain/source-topology/rule.json";
const registryIndexPath = ".habitat/index.json";

describe("affirmed blueprint continuity execution", () => {
  test("evaluates the staged manifest blob rather than worktree state", async () => {
    const observed: string[] = [];
    const report = await Effect.runPromise(
      affirmedBlueprintContinuityReportEffect({
        repoRoot: "/repo",
        git: gitPort({
          observed,
          stagedManifest: manifest({ placementBlueprint: "recipe" }),
        }),
      })
    );

    expect(report.status).toBe("fail");
    expect(report.diagnostics[0]?.message).toContain(
      'physically owned by "domain" but declares placement.blueprint "recipe"'
    );
    expect(observed).toEqual([
      `show-index:${registryIndexPath}`,
      `show:HEAD:${registryIndexPath}`,
      `show:HEAD:${manifestPath}`,
      `show-index:${manifestPath}`,
    ]);
  });

  test.each([
    ["missing", null],
    ["malformed", "{not-json"],
  ])("fails closed when the %s staged manifest blob cannot be admitted", async (_, stagedManifest) => {
    const report = await Effect.runPromise(
      affirmedBlueprintContinuityReportEffect({
        repoRoot: "/repo",
        git: gitPort({ stagedManifest }),
      })
    );

    expect(report.status).toBe("fail");
    expect(report.diagnostics).toHaveLength(1);
    expect(report.diagnostics[0]?.path).toBe(manifestPath);
  });

  test("fails closed before reading authority when staged actions are truncated", async () => {
    const observed: string[] = [];
    const report = await Effect.runPromise(
      affirmedBlueprintContinuityReportEffect({
        repoRoot: "/repo",
        git: gitPort({
          observed,
          stagedActionsTruncated: true,
          stagedManifest: manifest({ placementBlueprint: "domain" }),
        }),
      })
    );

    expect(report.status).toBe("fail");
    expect(report.diagnostics[0]?.message).toContain("truncated");
    expect(observed).toEqual([]);
  });

  test.each([
    ["missing", null],
    ["malformed", "{not-json"],
  ])("fails closed when the %s staged registry index cannot be admitted", async (_, stagedIndex) => {
    const report = await Effect.runPromise(
      affirmedBlueprintContinuityReportEffect({
        repoRoot: "/repo",
        git: gitPort({
          stagedIndex,
          stagedManifest: manifest({ placementBlueprint: "domain" }),
        }),
      })
    );

    expect(report.status).toBe("fail");
    expect(report.diagnostics).toHaveLength(1);
    expect(report.diagnostics[0]?.path).toBe(registryIndexPath);
  });

  test("fails closed when staged name-status records are malformed", async () => {
    const observed: string[] = [];
    const report = await Effect.runPromise(
      affirmedBlueprintContinuityReportEffect({
        repoRoot: "/repo",
        git: gitPort({
          observed,
          stagedActions: "R100\0old-path\0",
          stagedManifest: manifest({ placementBlueprint: "domain" }),
        }),
      })
    );

    expect(report.status).toBe("fail");
    expect(report.diagnostics[0]?.message).toContain("requires 2 path tokens");
    expect(observed).toEqual([]);
  });

  test.each([
    [
      "retired manifest filename",
      ".habitat/blueprints/domain/source-topology/source-topology.rule.json",
      "must be named rule.json",
    ],
    [
      "retired category and operation packet nesting",
      ".habitat/blueprints/domain/structure/check/source-topology/rule.json",
      "must not use category/operation-kind path nesting",
    ],
  ])("rejects %s from the exact staged registry inventory", async (_, stalePath, message) => {
    const report = await Effect.runPromise(
      affirmedBlueprintContinuityReportEffect({
        repoRoot: "/repo",
        git: gitPort({
          stagedActions: `A\0${stalePath}\0`,
          stagedManifest: null,
          stagedManifests: {
            [stalePath]: manifest({ placementBlueprint: "domain" }),
          },
        }),
      })
    );

    expect(report.status).toBe("fail");
    expect(report.diagnostics).toEqual([
      expect.objectContaining({
        path: stalePath,
        message: expect.stringContaining(message),
      }),
    ]);
  });

  test("correlates a delete and add by stable rule id across blueprint owners", async () => {
    const recipeManifestPath = ".habitat/blueprints/recipe/source-topology/rule.json";
    const report = await Effect.runPromise(
      affirmedBlueprintContinuityReportEffect({
        repoRoot: "/repo",
        git: gitPort({
          headPaths: [manifestPath],
          stagedActions: `D\0${manifestPath}\0A\0${recipeManifestPath}\0`,
          stagedManifest: null,
          stagedManifests: {
            [recipeManifestPath]: manifest({ placementBlueprint: "recipe" }),
          },
        }),
      })
    );

    expect(report.status).toBe("fail");
    expect(report.diagnostics.some(({ message }) => message.includes("cannot change owner"))).toBe(
      true
    );
  });

  test("rejects partial retirement and admits complete authority-packet retirement", async () => {
    const structurePath = ".habitat/blueprints/domain/source-topology/structure.toml";
    const headManifest = structureManifest(structurePath);
    const partial = await Effect.runPromise(
      affirmedBlueprintContinuityReportEffect({
        repoRoot: "/repo",
        git: gitPort({
          headPaths: [manifestPath, structurePath],
          headManifests: { [manifestPath]: headManifest },
          stagedActions: `D\0${manifestPath}\0`,
          stagedManifest: null,
        }),
      })
    );
    const complete = await Effect.runPromise(
      affirmedBlueprintContinuityReportEffect({
        repoRoot: "/repo",
        git: gitPort({
          headPaths: [manifestPath, structurePath],
          headManifests: { [manifestPath]: headManifest },
          stagedActions: `D\0${manifestPath}\0D\0${structurePath}\0`,
          stagedManifest: null,
        }),
      })
    );

    expect(partial.status).toBe("fail");
    expect(partial.diagnostics[0]?.message).toContain("staged residue remains");
    expect(complete.status).toBe("pass");
  });

  test("rejects injected manifestFilePath and legacy _blueprints demotion", async () => {
    const injected = JSON.stringify({
      ...JSON.parse(manifest({ placementBlueprint: "domain" })),
      manifestFilePath: manifestPath,
    });
    const injectedReport = await Effect.runPromise(
      affirmedBlueprintContinuityReportEffect({
        repoRoot: "/repo",
        git: gitPort({ stagedManifest: injected }),
      })
    );
    const legacyPath = ".habitat/_blueprints/domain/source-topology/rule.json";
    const demotionReport = await Effect.runPromise(
      affirmedBlueprintContinuityReportEffect({
        repoRoot: "/repo",
        git: gitPort({
          headPaths: [manifestPath],
          stagedActions: `D\0${manifestPath}\0A\0${legacyPath}\0`,
          stagedManifest: null,
          stagedManifests: {
            [legacyPath]: manifest({ placementBlueprint: "domain" }),
          },
        }),
      })
    );

    expect(injectedReport.status).toBe("fail");
    expect(demotionReport.status).toBe("fail");
    expect(
      demotionReport.diagnostics.some(({ message }) =>
        message.includes("into niche or remainder authority")
      )
    ).toBe(true);
  });

  test("rejects removing an owner root used only by an unchanged niche rule", async () => {
    const nichePath = ".habitat/civ7/mapgen/domains/rules/niche-owner/rule.json";
    const report = await Effect.runPromise(
      affirmedBlueprintContinuityReportEffect({
        repoRoot: "/repo",
        git: gitPort({
          headPaths: [nichePath],
          headManifests: {
            [nichePath]: manifest({
              id: "niche-owner",
              ownerProject: "mod-swooper-maps",
              placementBlueprint: "domain",
            }),
          },
          headIndex: registryIndex({
            habitat: "tools/habitat",
            "mod-swooper-maps": "mods/mod-swooper-maps",
          }),
          stagedActions: `M\0${registryIndexPath}\0`,
          stagedIndex: registryIndex({ habitat: "tools/habitat" }),
          stagedManifest: null,
        }),
      })
    );

    expect(report.status).toBe("fail");
    expect(report.diagnostics[0]?.message).toContain(
      'declares unknown ownerProject "mod-swooper-maps"'
    );
  });

  test("rejects a changed manifest that duplicates an unchanged niche rule id", async () => {
    const nichePath = ".habitat/civ7/mapgen/domains/rules/shared-id/rule.json";
    const addedPath = ".habitat/blueprints/domain/shared-id/rule.json";
    const report = await Effect.runPromise(
      affirmedBlueprintContinuityReportEffect({
        repoRoot: "/repo",
        git: gitPort({
          headPaths: [nichePath],
          headManifests: {
            [nichePath]: manifest({
              id: "shared-id",
              ownerProject: "mod-swooper-maps",
              placementBlueprint: "domain",
            }),
          },
          headIndex: registryIndex({
            habitat: "tools/habitat",
            "mod-swooper-maps": "mods/mod-swooper-maps",
          }),
          stagedActions: `A\0${addedPath}\0`,
          stagedIndex: registryIndex({
            habitat: "tools/habitat",
            "mod-swooper-maps": "mods/mod-swooper-maps",
          }),
          stagedManifest: null,
          stagedManifests: {
            [addedPath]: manifest({ id: "shared-id", placementBlueprint: "domain" }),
          },
        }),
      })
    );

    expect(report.status).toBe("fail");
    expect(
      report.diagnostics.some(({ message }) => message.toLowerCase().includes("duplicate"))
    ).toBe(true);
  });

  test("applies lossless staged actions to the HEAD inventory", () => {
    expect(
      applyStagedPathActions(
        ["keep.ts", "delete.ts", "rename-old.ts", "copy-source.ts"],
        [
          { path: "added.ts", action: "added" },
          { path: "keep.ts", action: "modified" },
          { path: "delete.ts", action: "deleted" },
          { path: "rename-old.ts", action: "renamed-from" },
          { path: "rename-new.ts", action: "renamed-to" },
          { path: "copy-source.ts", action: "copied-from" },
          { path: "copy-target.ts", action: "copied-to" },
        ]
      )
    ).toEqual(["added.ts", "copy-source.ts", "copy-target.ts", "keep.ts", "rename-new.ts"]);
  });
});

function gitPort(options: {
  readonly headIndex?: string | null;
  readonly headManifests?: Readonly<Record<string, string | null>>;
  readonly headPaths?: readonly string[];
  readonly stagedActions?: string;
  readonly stagedManifest: string | null;
  readonly stagedManifests?: Readonly<Record<string, string | null>>;
  readonly observed?: string[];
  readonly stagedActionsTruncated?: boolean;
  readonly stagedIndex?: string | null;
}): StructuralGitPort {
  const observed = options.observed ?? [];
  return {
    diffNameOnly: () => Effect.succeed(gitResult("")),
    diffNameStatus: () =>
      Effect.succeed(
        gitResult(options.stagedActions ?? `M\0${manifestPath}\0`, options.stagedActionsTruncated)
      ),
    lsTreeNameOnly: () => Effect.succeed(options.headPaths ?? [manifestPath]),
    mergeBase: () => Effect.succeed(null),
    show: (_ref, repoPath) =>
      Effect.sync(() => {
        observed.push(`show:HEAD:${repoPath}`);
        if (repoPath === registryIndexPath)
          return options.headIndex === undefined ? registryIndex() : options.headIndex;
        return options.headManifests?.[repoPath] ?? manifest({ placementBlueprint: "domain" });
      }),
    showIndex: (repoPath) =>
      Effect.sync(() => {
        observed.push(`show-index:${repoPath}`);
        if (repoPath === registryIndexPath) {
          return options.stagedIndex === undefined ? registryIndex() : options.stagedIndex;
        }
        if (Object.hasOwn(options.stagedManifests ?? {}, repoPath))
          return options.stagedManifests?.[repoPath] ?? null;
        return options.stagedManifest;
      }),
    visiblePathInventory: () => Effect.succeed(null),
  };
}

function registryIndex(
  ownerRoots: Readonly<Record<string, string>> = { habitat: "tools/habitat" }
): string {
  return JSON.stringify({
    schemaVersion: 2,
    ownerRoots,
  });
}

function manifest({
  placementBlueprint,
  id = "source-topology",
  ownerProject = "habitat",
}: {
  readonly placementBlueprint: string;
  readonly id?: string;
  readonly ownerProject?: string;
}): string {
  return JSON.stringify({
    schemaVersion: 2,
    id,
    title: "Source Topology",
    placement: {
      niche: "civ7/mapgen/domains",
      blueprint: placementBlueprint,
      category: "structure",
    },
    operation: { kind: "check" },
    ownerProject,
    lane: "enforced",
    forbids: "invalid source topology",
    why: "The constructible kind has one stable topology.",
    remediate: null,
    message: "Restore the source topology.",
    pathCoverage: [{ kind: "workspace-gate" }],
    forbiddenFileNames: ["invalid.ts"],
    runner: {
      name: "habitat",
      mode: "file-layer",
      guard: "forbidden-file-name",
    },
  });
}

function structureManifest(structurePath: string): string {
  const record = JSON.parse(manifest({ placementBlueprint: "domain" })) as Record<string, unknown>;
  delete record.forbiddenFileNames;
  return JSON.stringify({
    ...record,
    runner: {
      name: "habitat",
      mode: "structure",
      files: { structure: structurePath },
    },
  });
}

function gitResult(stdout: string, truncated = false) {
  return makeHabitatCommandResult(
    {
      commandId: "git-test",
      kind: "git-state",
      executable: "git",
      argv: [],
      cwd: "/repo",
    },
    { stdout: { ...captureOutput(stdout), truncated } }
  );
}
