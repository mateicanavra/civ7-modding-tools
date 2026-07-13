import { makeGitProviderFromCommandHandler } from "@habitat/cli/providers/git/index";
import {
  captureOutput,
  type HabitatCommandResult,
  makeHabitatCommandResult,
} from "@habitat/cli/resources/command/index";
import { FileReadFailed } from "@habitat/cli/resources/errors/index";
import type { HabitatPlatformService } from "@habitat/cli/resources/platform/index";
import type { CheckReport, HabitatDiagnostic } from "@habitat/cli/service/model/check/index";
import { type RuleRegistryRecord, ruleFactsCatalog } from "@habitat/cli/service/model/rules/index";
import { checkRouter } from "@habitat/cli/service/modules/check/router";
import { Effect, Match, Option } from "effect";
import { withFiberContext } from "effect-orpc/node";
import { describe, expect, test } from "vitest";
import { makeTestHabitatServiceDeps } from "../support/habitat-service-deps.js";

const fixture = {
  repoRoot: "/repo",
  ruleId: "introduced-rule",
  existingRuleId: "existing-rule",
  baselinePath: ".habitat/fixtures/rules/introduced-rule/baseline.json",
  manifestPath: ".habitat/fixtures/rules/introduced-rule/rule-introduction-manifest.json",
  absoluteBaselinePath: "/repo/.habitat/fixtures/rules/introduced-rule/baseline.json",
  absoluteManifestPath:
    "/repo/.habitat/fixtures/rules/introduced-rule/rule-introduction-manifest.json",
  seededBaselineBody: '["src/a.ts::early finding","src/z.ts::late finding"]',
  sortedBaselineWrite: '[\n  "src/a.ts::early finding",\n  "src/z.ts::late finding"\n]\n',
  existingRuleManifestBody: '{"id":"existing-rule"}',
  validManifestBody:
    '{"changeId":"fixture-change","ruleId":"introduced-rule","ownerProject":"habitat","runner":"grit","baselinePath":".habitat/fixtures/rules/introduced-rule/baseline.json","initialBaselineKeys":["src/a.ts::early finding","src/z.ts::late finding"],"comparisonBase":"main"}',
  mismatchedManifestBody:
    '{"changeId":"fixture-change","ruleId":"different-rule","ownerProject":"habitat","runner":"grit","baselinePath":".habitat/fixtures/rules/introduced-rule/baseline.json","initialBaselineKeys":["src/a.ts::early finding","src/z.ts::late finding"],"comparisonBase":"main"}',
} as const;
describe("Habitat check rule-introduction manifest service boundary", () => {
  test("accepts a declared manifest while reporting baseline integrity", async () => {
    const harness = createHarness({ baseline: "seeded" });

    const report = await harness.reportBaselineIntegrity();
    const integrity = baselineIntegrityReport(report);

    expect(report.ok).toBe(true);
    expect(integrity.status).toBe("pass");
    expect(manifestReadCount(harness)).toBe(1);
  });

  test("refuses a seeded baseline when the registry has no manifest relation", async () => {
    const harness = createHarness({
      baseline: "seeded",
      manifest: { relation: false },
    });

    const integrity = baselineIntegrityReport(await harness.reportBaselineIntegrity());

    expect(integrity.status).toBe("fail");
    manifestRefusalDiagnostic(integrity, "rule-introduction-manifest-missing");
    expect(manifestReadCount(harness)).toBe(0);
  });

  test("refuses a declared manifest that disappears before the service reads it", async () => {
    const harness = createHarness({
      baseline: "seeded",
      manifest: { relation: true },
    });

    const integrity = baselineIntegrityReport(await harness.reportBaselineIntegrity());

    expect(integrity.status).toBe("fail");
    expect(manifestRefusalDiagnostic(integrity, "rule-introduction-manifest-malformed").path).toBe(
      fixture.manifestPath
    );
    expect(manifestReadCount(harness)).toBe(1);
  });

  test.each([
    ["invalid JSON", "{"],
    [
      "TypeBox-invalid JSON",
      `{"changeId":"","ruleId":"introduced-rule","ownerProject":"habitat","runner":"grit","baselinePath":".habitat/fixtures/rules/introduced-rule/baseline.json","initialBaselineKeys":["src/a.ts::early finding","src/z.ts::late finding"],"comparisonBase":"main"}`,
    ],
  ])("refuses %s as a malformed manifest", async (_caseName, manifestBody) => {
    const harness = createHarness({
      baseline: "seeded",
      manifest: { relation: true, body: manifestBody },
    });

    const integrity = baselineIntegrityReport(await harness.reportBaselineIntegrity());

    expect(integrity.status).toBe("fail");
    manifestRefusalDiagnostic(integrity, "rule-introduction-manifest-malformed");
    expect(manifestReadCount(harness)).toBe(1);
  });

  test("refuses a schema-valid manifest whose rule identity does not match", async () => {
    const harness = createHarness({
      baseline: "seeded",
      manifest: {
        relation: true,
        body: fixture.mismatchedManifestBody,
      },
    });

    const integrity = baselineIntegrityReport(await harness.reportBaselineIntegrity());

    expect(integrity.status).toBe("fail");
    manifestRefusalDiagnostic(integrity, "rule-introduction-manifest-mismatch");
    expect(manifestReadCount(harness)).toBe(1);
  });

  test("writes one sorted baseline after a valid manifest admits expansion", async () => {
    const harness = createHarness({ baseline: "empty" });

    const result = await harness.expandBaseline();

    expect(result.kind).toBe("expanded");
    expect(harness.writes).toEqual([
      {
        path: fixture.absoluteBaselinePath,
        contents: fixture.sortedBaselineWrite,
      },
    ]);
    expect(manifestReadCount(harness)).toBe(1);
  });

  test.each([
    ["malformed", "{", "rule-introduction-manifest-malformed"],
    ["mismatched", fixture.mismatchedManifestBody, "rule-introduction-manifest-mismatch"],
  ] as const)("does not write when expansion sees a %s manifest", async (_caseName, manifestBody, expectedReason) => {
    const harness = createHarness({
      baseline: "empty",
      manifest: { relation: true, body: manifestBody },
    });

    expectExpansionRefusal(await harness.expandBaseline(), expectedReason);
    expect(harness.writes).toEqual([]);
    expect(manifestReadCount(harness)).toBe(1);
  });

  test("does not write when expansion has no manifest relation", async () => {
    const harness = createHarness({
      baseline: "empty",
      manifest: { relation: false },
    });

    expectExpansionRefusal(await harness.expandBaseline(), "rule-introduction-manifest-missing");
    expect(harness.writes).toEqual([]);
    expect(manifestReadCount(harness)).toBe(0);
  });

  test("does not write when the expansion manifest disappears before reading", async () => {
    const harness = createHarness({
      baseline: "empty",
      manifest: { relation: true },
    });

    expectExpansionRefusal(await harness.expandBaseline(), "rule-introduction-manifest-malformed");
    expect(harness.writes).toEqual([]);
    expect(manifestReadCount(harness)).toBe(1);
  });
});

type ManifestRefusalReason =
  | "rule-introduction-manifest-missing"
  | "rule-introduction-manifest-malformed"
  | "rule-introduction-manifest-mismatch";

const expansionRefusalSignals: Readonly<Record<ManifestRefusalReason, RegExp>> = {
  "rule-introduction-manifest-missing": /no accepted .*rule-introduction.*manifest/i,
  "rule-introduction-manifest-malformed": /rule-introduction.*manifest.*(?:unreadable|malformed)/i,
  "rule-introduction-manifest-mismatch": /rule-introduction.*manifest.*does not match/i,
};

interface ManifestFixture {
  readonly relation: boolean;
  readonly body?: string;
}

interface HarnessOptions {
  readonly baseline: "empty" | "seeded";
  readonly manifest?: ManifestFixture;
}

interface ServiceHarness {
  readonly reads: string[];
  readonly writes: Array<{ readonly path: string; readonly contents: string }>;
  readonly reportBaselineIntegrity: () => Promise<CheckReport>;
  readonly expandBaseline: () => Promise<
    | { readonly kind: "expanded"; readonly messages: readonly string[] }
    | { readonly kind: "refused"; readonly message: string }
  >;
}

function createHarness(options: HarnessOptions): ServiceHarness {
  const reads: string[] = [];
  const writes: Array<{ path: string; contents: string }> = [];
  const manifest = options.manifest ?? {
    relation: true,
    body: fixture.validManifestBody,
  };
  const baselineBody = Match.value(options.baseline).pipe(
    Match.when("empty", () => "[]"),
    Match.when("seeded", () => fixture.seededBaselineBody),
    Match.exhaustive
  );
  const manifestEntries = Option.fromNullable(manifest.body).pipe(
    Option.match({
      onNone: (): Array<[string, string]> => [],
      onSome: (body): Array<[string, string]> => [[fixture.absoluteManifestPath, body]],
    })
  );
  const files = new Map<string, string>([
    [fixture.absoluteBaselinePath, baselineBody],
    ...manifestEntries,
  ]);

  const baseDeps = makeTestHabitatServiceDeps();
  const platform = fakePlatform(baseDeps.platform, files, reads, writes);
  const grit = {
    ...baseDeps.grit,
    runRules: (selectedRules: readonly { readonly id: string }[]) =>
      Effect.succeed(
        new Map(
          selectedRules.map((rule) => [
            rule.id,
            {
              result: { exitCode: 1, diagnostics: diagnostics() },
              durationMs: 0,
              disposition: { kind: "executed" as const },
            },
          ])
        )
      ),
  };
  const rules = ruleFactsCatalog({
    schemaVersion: 2,
    ownerRoots: { habitat: "tools/habitat" },
    rules: [ruleRegistryRecord(manifest.relation)],
  });

  const deps = makeTestHabitatServiceDeps({
    git: fakeGitProvider(),
    grit,
    platform,
    rules,
  });
  const report = checkRouter.report.callable({ context: { deps } });
  const expand = checkRouter.expandBaseline.callable({ context: { deps } });

  return {
    reads,
    writes,
    reportBaselineIntegrity: () => {
      const program = withFiberContext(() =>
        report({
          selectors: { rule: fixture.ruleId },
          baselineIntegrity: true,
          base: "main",
        })
      );
      return Effect.runPromise(program);
    },
    expandBaseline: () => {
      const program = withFiberContext(() =>
        expand({
          selectors: { rule: fixture.ruleId },
          base: "main",
        })
      );
      return Effect.runPromise(program);
    },
  };
}

function fakePlatform(
  base: HabitatPlatformService,
  files: ReadonlyMap<string, string>,
  reads: string[],
  writes: Array<{ path: string; contents: string }>
): HabitatPlatformService {
  return {
    ...base,
    repoRoot: fixture.repoRoot,
    isDirectory: (targetPath) =>
      Effect.succeed(targetPath === `${fixture.repoRoot}/.habitat/baselines`),
    isDirectorySync: (targetPath) => targetPath === `${fixture.repoRoot}/.habitat/baselines`,
    isFile: (targetPath) => files.has(targetPath),
    isFileEffect: (targetPath) => Effect.succeed(files.has(targetPath)),
    makeDirectory: () => Effect.void,
    pathExists: (targetPath) => files.has(targetPath),
    readDirectory: () => Effect.succeed([]),
    readDirectorySync: () => [],
    readText: (targetPath) => {
      reads.push(targetPath);
      return Effect.fromNullable(files.get(targetPath)).pipe(
        Effect.mapError(() => new FileReadFailed({ path: targetPath, cause: "missing fixture" }))
      );
    },
    readTextSync: (targetPath) => {
      const body = files.get(targetPath);
      if (body === undefined) throw new Error(`Missing fixture: ${targetPath}`);
      return body;
    },
    statKind: (targetPath) =>
      Match.value(files.has(targetPath)).pipe(
        Match.when(true, () => "File" as const),
        Match.orElse(() => undefined)
      ),
    writeText: (targetPath, contents) =>
      Effect.sync(() => {
        writes.push({ path: targetPath, contents });
      }),
  };
}

function fakeGitProvider() {
  const existingRulePath = `.habitat/global/workspace/_blueprints/project-boundary-model/${fixture.existingRuleId}/rule.json`;
  return makeGitProviderFromCommandHandler(
    (argv, options) =>
      Match.value(argv).pipe(
        Match.when(
          (args) => args[0] === "merge-base",
          () => commandResult(argv, options.cwd, "merge-base-sha\n")
        ),
        Match.when(
          (args) => args[0] === "ls-tree",
          () => commandResult(argv, options.cwd, `${existingRulePath}\n`)
        ),
        Match.when(
          (args) => args[0] === "show" && args[1] === `merge-base-sha:${existingRulePath}`,
          () => commandResult(argv, options.cwd, fixture.existingRuleManifestBody)
        ),
        Match.orElse(() => commandResult(argv, options.cwd, "", 1, "not found\n"))
      ),
    { repoRoot: fixture.repoRoot }
  );
}

function ruleRegistryRecord(hasManifestRelation: boolean): RuleRegistryRecord {
  const supportFiles = Match.value(hasManifestRelation).pipe(
    Match.when(true, () => ({
      baseline: fixture.baselinePath,
      ruleIntroductionManifest: fixture.manifestPath,
    })),
    Match.orElse(() => ({ baseline: fixture.baselinePath }))
  );
  return {
    schemaVersion: 2,
    id: fixture.ruleId,
    title: "Introduced Rule",
    placement: {
      niche: "fixtures",
      blueprint: "_self",
      category: "quality",
    },
    operation: { kind: "check" },
    ownerProject: "habitat",
    lane: "enforced",
    forbids: "fixture violations",
    why: "Exercises rule-introduction baseline admission through the service boundary.",
    remediate: null,
    message: "Resolve the fixture violation.",
    pathCoverage: [{ kind: "workspace-gate" }],
    scanRoots: ["src"],
    supportFiles,
    runner: {
      name: "grit",
      files: { pattern: `.habitat/fixtures/rules/${fixture.ruleId}/pattern.md` },
      patternName: fixture.ruleId,
    },
  };
}

function diagnostics(): HabitatDiagnostic[] {
  return [
    {
      ruleId: fixture.ruleId,
      path: "src/z.ts",
      message: "late finding",
      severity: "error",
      baselined: false,
    },
    {
      ruleId: fixture.ruleId,
      path: "src/a.ts",
      message: "early finding",
      severity: "error",
      baselined: false,
    },
  ];
}

function baselineIntegrityReport(report: CheckReport) {
  const integrity = report.rules.find((rule) => rule.ruleId === "baseline-integrity");
  if (!integrity) throw new Error("Expected baseline integrity report.");
  return integrity;
}

function manifestRefusalDiagnostic(
  integrity: ReturnType<typeof baselineIntegrityReport>,
  reason: ManifestRefusalReason
): HabitatDiagnostic {
  const diagnostic = integrity.diagnostics.find((candidate) =>
    candidate.message.includes(`(${reason})`)
  );
  if (!diagnostic) throw new Error(`Expected baseline integrity refusal '${reason}'.`);
  return diagnostic;
}

function expectExpansionRefusal(
  result: Awaited<ReturnType<ServiceHarness["expandBaseline"]>>,
  reason: ManifestRefusalReason
): void {
  expect(result.kind).toBe("refused");
  if (result.kind !== "refused")
    throw new Error(`Expected baseline expansion refusal '${reason}'.`);
  expect(result.message).toMatch(expansionRefusalSignals[reason]);
}

function manifestReadCount(harness: ServiceHarness): number {
  return harness.reads.filter((targetPath) => targetPath === fixture.absoluteManifestPath).length;
}

function commandResult(
  argv: readonly string[],
  cwd: string,
  stdout: string,
  exitCode = 0,
  stderr = ""
): HabitatCommandResult {
  return makeHabitatCommandResult(
    {
      commandId: `git-${argv.join("-")}`,
      kind: "git-state",
      executable: "git",
      argv,
      cwd,
      captureGitState: false,
    },
    {
      exit: { code: exitCode, signal: null, interrupted: false },
      stdout: captureOutput(stdout),
      stderr: captureOutput(stderr),
    }
  );
}
