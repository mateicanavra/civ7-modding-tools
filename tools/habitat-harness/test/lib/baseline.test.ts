import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { NodeContext } from "@effect/platform-node";
import { Effect, Layer } from "effect";
import { afterEach, describe, expect, test } from "vitest";
import {
  applyBaseline,
  type BaselineAuthorityContext,
  type BaselineRuleContractInput,
  baselineFailureDiagnostic,
  isBaselineLocked,
  loadBaselineState,
  validateBaselineContract,
} from "../../src/domains/baseline-authority/index.js";
import {
  baselineIntegrityFindingsEffect,
  checkBaselineIntegrityEffect,
  guardBaselineExpansionEffect,
} from "../../src/domains/baseline-authority/operations.js";
import type { HabitatDiagnostic } from "../../src/domains/structural-check/schema.js";
import {
  captureOutput,
  type HabitatCommandResult,
  makeHabitatCommandResult,
} from "../../src/providers/command/index.js";
import { makeFakeGitProviderLayer } from "../../src/providers/git/index.js";

const tempDirs: string[] = [];

afterEach(() => {
  while (tempDirs.length > 0) {
    const dir = tempDirs.pop();
    if (dir) rmSync(dir, { recursive: true, force: true });
  }
});

describe("Habitat baseline contract", () => {
  test("treats explicit empty baseline files as locked contract state", async () => {
    const ctx = createBaselineContext({
      registry: [rule("existing-rule")],
      rulePackAtBase: ["existing-rule"],
      baselinesAtBase: new Map([["existing-rule", []]]),
    });
    writeBaselineFile(ctx.baselinesDir, "existing-rule", []);

    const state = loadBaselineState(rule("existing-rule"), ctx);
    expect(state).toMatchObject({ kind: "explicit-empty", ruleId: "existing-rule", locked: true });
    expect(isBaselineLocked(state)).toBe(true);
    expect(await checkIntegrity("main", ctx)).toEqual({ status: "accepted", refusals: [] });
  });

  test("applies explicit debt baselines and leaves new errors unbaselined", () => {
    const ctx = createBaselineContext({
      registry: [rule("existing-rule")],
      rulePackAtBase: ["existing-rule"],
      baselinesAtBase: new Map([
        ["existing-rule", ["src/a.ts::tracked debt", "src/b.ts::old debt"]],
      ]),
    });
    writeBaselineFile(ctx.baselinesDir, "existing-rule", [
      "src/a.ts::tracked debt",
      "src/b.ts::old debt",
    ]);

    const diagnostics = [
      diagnostic("existing-rule", "src/a.ts", "tracked debt"),
      diagnostic("existing-rule", "src/c.ts", "new debt"),
    ];
    const state = loadBaselineState(rule("existing-rule"), ctx);
    expect(state).toMatchObject({ kind: "explicit-debt", locked: false });
    expect(applyBaseline(diagnostics, state)).toMatchObject({ status: "applied", refusals: [] });
    expect(diagnostics.map((entry) => entry.baselined)).toEqual([true, false]);
    expect(isBaselineLocked(state)).toBe(false);
  });

  test("fails missing required baseline files for registered rules", () => {
    const ctx = createBaselineContext({
      registry: [rule("missing-rule")],
      rulePackAtBase: ["missing-rule"],
      baselinesAtBase: new Map(),
    });

    const state = loadBaselineState(rule("missing-rule"), ctx);
    expect(state).toMatchObject({ kind: "baseline-refusal", reason: "missing-baseline" });
    const validation = validateBaselineContract(ctx);
    expect(validation.refusals).toEqual([
      expect.objectContaining({ ruleId: "missing-rule", reason: "missing-baseline" }),
    ]);
  });

  test("fails malformed, non-array, non-string, duplicate, and unsorted baseline files", () => {
    const cases = [
      { ruleId: "bad-json", body: "{", reason: "malformed-baseline" },
      { ruleId: "non-array", body: '{"items":[]}', reason: "malformed-baseline" },
      { ruleId: "non-string", body: "[1]", reason: "non-string-baseline-key" },
      { ruleId: "duplicate", body: '["a::b","a::b"]', reason: "duplicate-baseline-key" },
      { ruleId: "unsorted", body: '["z::b","a::b"]', reason: "unsorted-baseline" },
    ] as const;
    const ctx = createBaselineContext({
      registry: cases.map(({ ruleId }) => rule(ruleId)),
      rulePackAtBase: cases.map(({ ruleId }) => ruleId),
      baselinesAtBase: new Map(),
    });

    for (const item of cases) {
      writeFileSync(path.join(ctx.baselinesDir, `${item.ruleId}.json`), `${item.body}\n`);
      const state = loadBaselineState(rule(item.ruleId), ctx);
      expect(state).toMatchObject({ kind: "baseline-refusal", reason: item.reason });
    }
  });

  test("fails orphan baseline files", () => {
    const ctx = createBaselineContext({
      registry: [rule("registered-rule")],
      rulePackAtBase: ["registered-rule"],
      baselinesAtBase: new Map([["registered-rule", []]]),
    });
    writeBaselineFile(ctx.baselinesDir, "registered-rule", []);
    writeBaselineFile(ctx.baselinesDir, "orphan-rule", []);

    expect(validateBaselineContract(ctx).refusals).toEqual([
      expect.objectContaining({ ruleId: "orphan-rule", reason: "orphan-baseline" }),
    ]);
  });

  test("rejects parser-owned baselining when explicit Habitat state owns the rule", () => {
    const ctx = createBaselineContext({
      registry: [rule("explicit-rule")],
      rulePackAtBase: ["explicit-rule"],
      baselinesAtBase: new Map([["explicit-rule", ["src/a.ts::tracked debt"]]]),
    });
    writeBaselineFile(ctx.baselinesDir, "explicit-rule", ["src/a.ts::tracked debt"]);
    const state = loadBaselineState(rule("explicit-rule"), ctx);

    const result = applyBaseline(
      [diagnostic("explicit-rule", "src/a.ts", "tracked debt", true)],
      state
    );
    expect(result).toMatchObject({
      status: "refused",
      refusals: [expect.objectContaining({ reason: "parser-owned-baseline-without-contract" })],
    });
    expect(baselineFailureDiagnostic("explicit-rule", result.refusals[0])).toMatchObject({
      ruleId: "explicit-rule",
      severity: "error",
      baselined: false,
    });
  });

  test("rejects added entries for existing rules relative to the merge-base", async () => {
    const ctx = createBaselineContext({
      registry: [rule("existing-rule")],
      rulePackAtBase: ["existing-rule"],
      baselinesAtBase: new Map([["existing-rule", []]]),
    });
    writeBaselineFile(ctx.baselinesDir, "existing-rule", ["src/example.ts::diagnostic"]);

    expect(await integrityFindings("main", ctx)).toEqual([
      expect.objectContaining({
        file: ".habitat/baselines/existing-rule.json",
        ruleId: "existing-rule",
        addedKeys: ["src/example.ts::diagnostic"],
        reason: expect.stringContaining(
          "baselines are shrink-only outside rule-introduction changes"
        ),
      }),
    ]);
  });

  test("compares baseline authority against pre-D14A authored artifact paths", async () => {
    const ctx = createBaselineContext({
      registry: [rule("existing-rule")],
      rulePackAtBase: JSON.stringify({
        rules: [
          {
            id: "existing-rule",
            ownerTool: "command-check",
            ownerProject: "@internal/habitat-harness",
          },
        ],
      }),
      baselinesAtBase: new Map([["existing-rule", ["src/example.ts::diagnostic"]]]),
      artifactLayoutAtBase: "pre-d14a",
    });
    writeBaselineFile(ctx.baselinesDir, "existing-rule", ["src/example.ts::diagnostic"]);

    expect(await checkIntegrity("main", ctx)).toEqual({ status: "accepted", refusals: [] });
  });

  test("requires rule-introduction manifests for seeded new-rule baselines", async () => {
    const ctx = createBaselineContext({
      registry: [rule("new-rule")],
      rulePackAtBase: ["existing-rule"],
      baselinesAtBase: new Map(),
    });
    writeBaselineFile(ctx.baselinesDir, "new-rule", ["src/example.ts::diagnostic"]);

    expect(await integrityFindings("main", ctx)).toEqual([
      expect.objectContaining({
        ruleId: "new-rule",
        reason: expect.stringContaining("no accepted rule-introduction baseline manifest"),
      }),
    ]);

    expect(
      await checkIntegrity("main", {
        ...ctx,
        ruleIntroductionManifests: [
          {
            changeId: "fixture-change",
            ruleId: "new-rule",
            ownerProject: "@internal/habitat-harness",
            ownerTool: "pattern-check",
            baselinePath: ".habitat/baselines/new-rule.json",
            initialBaselineKeys: ["src/example.ts::diagnostic"],
            comparisonBase: "main",
          },
        ],
      })
    ).toEqual({ status: "accepted", refusals: [] });

    expect(
      await checkIntegrity("main", {
        ...ctx,
        registry: [rule("new-rule", "none", "@internal/habitat-harness", "pattern-check")],
        ruleIntroductionManifests: [
          {
            changeId: "fixture-change",
            ruleId: "new-rule",
            ownerProject: "@internal/habitat-harness",
            ownerTool: "command-check",
            baselinePath: ".habitat/baselines/new-rule.json",
            initialBaselineKeys: ["src/example.ts::diagnostic"],
            comparisonBase: "main",
          },
        ],
      })
    ).toMatchObject({
      status: "refused",
      refusals: [expect.objectContaining({ reason: "rule-introduction-manifest-mismatch" })],
    });
  });

  test("refuses Graphite child growth when an explicit trusted parent contains the rule", async () => {
    const key = "src/downstack.ts::child-added debt";
    const trunkContext = createBaselineContext({
      registry: [rule("downstack-rule")],
      rulePackAtBase: ["unrelated-trunk-rule"],
      baselinesAtBase: new Map(),
    });
    writeBaselineFile(trunkContext.baselinesDir, "downstack-rule", [key]);

    expect(
      await checkIntegrity("main", {
        ...trunkContext,
        ruleIntroductionManifests: [
          {
            changeId: "fixture-change",
            ruleId: "downstack-rule",
            ownerProject: "@internal/habitat-harness",
            ownerTool: "pattern-check",
            baselinePath: ".habitat/baselines/downstack-rule.json",
            initialBaselineKeys: [key],
            comparisonBase: "main",
          },
        ],
      })
    ).toEqual({ status: "accepted", refusals: [] });

    const trustedParentContext = createBaselineContext({
      registry: [rule("downstack-rule")],
      rulePackAtBase: ["downstack-rule"],
      baselinesAtBase: new Map([["downstack-rule", []]]),
      mergeBase: "trusted-parent-sha",
    });
    writeBaselineFile(trustedParentContext.baselinesDir, "downstack-rule", [key]);

    expect(await integrityFindings("agent-HR-parent", trustedParentContext)).toEqual([
      expect.objectContaining({
        file: ".habitat/baselines/downstack-rule.json",
        ruleId: "downstack-rule",
        addedKeys: [key],
        reason: expect.stringContaining("existing rule 'downstack-rule' grew"),
      }),
    ]);
    expect(
      await guardExpansion("downstack-rule", [key], "agent-HR-parent", trustedParentContext)
    ).toEqual(
      expect.objectContaining({
        status: "refused",
        refusal: expect.objectContaining({ reason: "baseline-growth-existing-rule" }),
        message: expect.stringContaining("existing rule 'downstack-rule'"),
      })
    );
  });

  test("reports comparison-source failures", async () => {
    const ctx = createBaselineContext({
      registry: [rule("existing-rule")],
      rulePackAtBase: ["existing-rule"],
      baselinesAtBase: new Map([["existing-rule", []]]),
      mergeBase: null,
    });
    writeBaselineFile(ctx.baselinesDir, "existing-rule", []);

    expect(await integrityFindings("main", ctx)).toEqual([
      expect.objectContaining({
        ruleId: "baseline-integrity",
        reason: expect.stringContaining("comparison-base-unavailable"),
      }),
    ]);
  });

  test("reports missing, malformed, and unreadable base comparison inputs", async () => {
    const missingBaseRules = createBaselineContext({
      registry: [rule("existing-rule")],
      rulePackAtBase: null,
      baselinesAtBase: new Map([["existing-rule", []]]),
    });
    writeBaselineFile(missingBaseRules.baselinesDir, "existing-rule", []);
    expect(await integrityFindings("main", missingBaseRules)).toEqual([
      expect.objectContaining({ reason: expect.stringContaining("base-rule-registry-missing") }),
    ]);

    const malformedBaseRules = createBaselineContext({
      registry: [rule("existing-rule")],
      rulePackAtBase: "{",
      baselinesAtBase: new Map([["existing-rule", []]]),
      artifactLayoutAtBase: "pre-d14a",
    });
    writeBaselineFile(malformedBaseRules.baselinesDir, "existing-rule", []);
    expect(await integrityFindings("main", malformedBaseRules)).toEqual([
      expect.objectContaining({ reason: expect.stringContaining("base-rule-registry-malformed") }),
    ]);

    const badBaseBaseline = createBaselineContext({
      registry: [rule("existing-rule")],
      rulePackAtBase: ["existing-rule"],
      baselinesAtBase: new Map([["existing-rule", "{"]]),
    });
    writeBaselineFile(badBaseBaseline.baselinesDir, "existing-rule", [
      "src/example.ts::diagnostic",
    ]);
    expect(await integrityFindings("main", badBaseBaseline)).toEqual([
      expect.objectContaining({ reason: expect.stringContaining("base-baseline-unreadable") }),
    ]);
  });

  test("refuses baseline expansion writes for existing-rule growth before callers write files", async () => {
    const ctx = createBaselineContext({
      registry: [rule("existing-rule")],
      rulePackAtBase: ["existing-rule"],
      baselinesAtBase: new Map([["existing-rule", []]]),
    });

    expect(
      await guardExpansion("existing-rule", ["src/example.ts::diagnostic"], "main", ctx)
    ).toEqual(
      expect.objectContaining({
        status: "refused",
        refusal: expect.objectContaining({ reason: "baseline-growth-existing-rule" }),
        message: expect.stringContaining("Refusing baseline write for existing rule"),
      })
    );
  });
});

function rule(
  id: string,
  exceptionPath = "none",
  ownerProject = "@internal/habitat-harness",
  ownerTool = "pattern-check"
): BaselineRuleContractInput {
  return {
    id,
    exceptionPath,
    ownerProject,
    ownerTool,
  };
}

function checkIntegrity(base: string, context: BaselineTestContext) {
  return runBaselineEffect(checkBaselineIntegrityEffect(base, context), context);
}

async function integrityFindings(base: string, context: BaselineTestContext) {
  const result = await checkIntegrity(base, context);
  return Effect.runPromise(baselineIntegrityFindingsEffect(result));
}

function guardExpansion(
  ruleId: string,
  keys: readonly string[],
  base: string,
  context: BaselineTestContext
) {
  return runBaselineEffect(guardBaselineExpansionEffect(ruleId, keys, base, context), context);
}

function runBaselineEffect<A, E>(
  effect: Effect.Effect<A, E, never>,
  context: BaselineTestContext
): Promise<A> {
  return Effect.runPromise(
    effect.pipe(Effect.provide(Layer.mergeAll(NodeContext.layer, context.gitLayer)))
  );
}

function diagnostic(
  ruleId: string,
  pathName: string,
  message: string,
  baselined = false
): HabitatDiagnostic {
  return {
    ruleId,
    path: pathName,
    message,
    severity: "error",
    baselined,
  };
}

interface BaselineTestContext extends BaselineAuthorityContext {
  readonly repoRoot: string;
  readonly baselinesDir: string;
  readonly gitLayer: ReturnType<typeof makeFakeGitProviderLayer>;
}

function createBaselineContext(options: {
  registry: BaselineRuleContractInput[];
  rulePackAtBase: string[] | string | null;
  baselinesAtBase: Map<string, string[] | string>;
  artifactLayoutAtBase?: "current" | "pre-d14a";
  mergeBase?: string | null;
}): BaselineTestContext {
  const repoRoot = mkdtempSync(path.join(tmpdir(), "habitat-baseline-test-"));
  tempDirs.push(repoRoot);
  const baselinesDir = path.join(repoRoot, ".habitat", "baselines");
  mkdirSync(baselinesDir, { recursive: true });
  return {
    repoRoot,
    baselinesDir,
    registry: options.registry,
    gitLayer: makeFakeGitProviderLayer((argv, runOptions) => {
      if (argv[0] === "merge-base") {
        return options.mergeBase === null
          ? commandResult(argv, runOptions.cwd, "", 1, "no merge-base\n")
          : commandResult(argv, runOptions.cwd, `${options.mergeBase ?? "merge-base-sha"}\n`);
      }
      if (argv[0] === "show") {
        return showMock(argv[1] ?? "", runOptions.cwd, options);
      }
      if (argv[0] === "ls-tree") {
        return lsTreeMock(argv, runOptions.cwd, options);
      }
      return commandResult(argv, runOptions.cwd, "", 1, `unexpected command: ${argv.join(" ")}\n`);
    }),
  };
}

function lsTreeMock(
  argv: readonly string[],
  cwd: string,
  options: {
    rulePackAtBase: string[] | string | null;
    baselinesAtBase: Map<string, string[] | string>;
    artifactLayoutAtBase?: "current" | "pre-d14a";
    mergeBase?: string | null;
  }
) {
  if (options.artifactLayoutAtBase === "pre-d14a") {
    return commandResult(argv, cwd, "", 1, "not found\n");
  }
  const comparisonSha = options.mergeBase ?? "merge-base-sha";
  const expected = ["ls-tree", "-r", "--name-only", comparisonSha, ".habitat/rules"];
  if (argv.length !== expected.length || argv.some((entry, index) => entry !== expected[index])) {
    return commandResult(argv, cwd, "", 1, `unexpected command: ${argv.join(" ")}\n`);
  }
  if (!Array.isArray(options.rulePackAtBase)) {
    return commandResult(argv, cwd, "", 1, "not found\n");
  }
  return commandResult(
    argv,
    cwd,
    `${options.rulePackAtBase.map((id) => `.habitat/rules/${id}/rule.json`).join("\n")}\n`
  );
}

function showMock(
  spec: string,
  cwd: string,
  options: {
    rulePackAtBase: string[] | string | null;
    baselinesAtBase: Map<string, string[] | string>;
    artifactLayoutAtBase?: "current" | "pre-d14a";
    mergeBase?: string | null;
  }
) {
  const comparisonSha = options.mergeBase ?? "merge-base-sha";
  const ruleRegistryAtBase =
    options.artifactLayoutAtBase === "pre-d14a"
      ? "tools/habitat-harness/src/rules/rules.json"
      : ".habitat/rules/index.json";
  if (spec === `${comparisonSha}:${ruleRegistryAtBase}`) {
    if (options.rulePackAtBase === null)
      return commandResult(["show", spec], cwd, "", 1, "not found\n");
    if (typeof options.rulePackAtBase === "string") {
      return commandResult(["show", spec], cwd, options.rulePackAtBase);
    }
    return commandResult(
      ["show", spec],
      cwd,
      JSON.stringify(
        {
          schemaVersion: 1,
          ownerRoots: {
            "@internal/habitat-harness": "tools/habitat-harness",
          },
          rules: options.rulePackAtBase.map(baseRuleRecord),
        },
        null,
        2
      )
    );
  }
  const prefix =
    options.artifactLayoutAtBase === "pre-d14a"
      ? `${comparisonSha}:tools/habitat-harness/baselines/`
      : `${comparisonSha}:.habitat/baselines/`;
  if (spec.startsWith(prefix) && spec.endsWith(".json")) {
    const ruleId = spec.slice(prefix.length, -".json".length);
    const baseline = options.baselinesAtBase.get(ruleId);
    if (baseline !== undefined) {
      return commandResult(
        ["show", spec],
        cwd,
        typeof baseline === "string" ? baseline : JSON.stringify(baseline)
      );
    }
  }
  return commandResult(["show", spec], cwd, "", 1, "not found\n");
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

function baseRuleRecord(id: string) {
  return {
    id,
    ownerProject: "@internal/habitat-harness",
    ownerTool: "command-check",
    lane: "enforced",
    scope: "tools/habitat-harness/**",
    forbids: "fixture violation",
    why: "fixture base registry record for D5 baseline authority tests",
    detect: ["fixture", id],
    remediate: null,
    message: "fixture baseline authority diagnostic",
    exceptionPath: "none",
    pathCoverage: [{ kind: "workspace-gate" }],
  };
}

function writeBaselineFile(baselinesDir: string, ruleId: string, entries: string[]) {
  mkdirSync(baselinesDir, { recursive: true });
  writeFileSync(path.join(baselinesDir, `${ruleId}.json`), `${JSON.stringify(entries, null, 2)}\n`);
}
