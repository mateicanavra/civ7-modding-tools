import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { NodeContext } from "@effect/platform-node";
import {
  type GitProviderService,
  makeGitProviderFromCommandHandler,
} from "@habitat/cli/providers/git/index";
import {
  captureOutput,
  type HabitatCommandResult,
  makeHabitatCommandResult,
} from "@habitat/cli/resources/command/index";
import {
  isDirectory,
  isFile,
  makeDirectory,
  readDirectory,
  readText,
  writeText,
} from "@habitat/cli/resources/platform/index";
import {
  applyBaseline,
  type BaselineAuthorityContext,
  type BaselineRuleContractInput,
  baselineFailureDiagnostic,
  isBaselineLocked,
  type RuleIntroductionBaselineManifest,
} from "@habitat/cli/service/model/baseline/index";
import {
  baselineIntegrityFindingsEffect,
  checkBaselineIntegrityEffect,
  guardBaselineExpansionEffect,
  loadBaselineStateEffect,
  validateBaselineContractEffect,
} from "@habitat/cli/service/model/baseline/operations.policy";
import type { HabitatDiagnostic } from "@habitat/cli/service/model/check/index";
import { Effect, Match, Schema } from "effect";
import { afterEach, describe, expect, test } from "vitest";

const tempDirs: string[] = [];
const stringifyJsonDocument = Schema.encodeSync(Schema.parseJson());
const withNodeContext = Effect.provide(NodeContext.layer);

afterEach(() => {
  tempDirs.splice(0).forEach((directory) => rmSync(directory, { recursive: true, force: true }));
});

describe("Habitat baseline contract", () => {
  test("treats explicit empty baseline files as locked contract state", async () => {
    const ctx = createBaselineContext({
      registry: [rule("existing-rule")],
      rulePackAtBase: ["existing-rule"],
      baselinesAtBase: new Map([["existing-rule", []]]),
    });
    writeBaselineFile(ctx.baselinesDir, "existing-rule", []);

    const state = await loadState(rule("existing-rule"), ctx);
    expect(state).toMatchObject({ kind: "explicit-empty", ruleId: "existing-rule", locked: true });
    expect(isBaselineLocked(state)).toBe(true);
    expect(await checkIntegrity("main", ctx)).toEqual({ status: "accepted", refusals: [] });
  });

  test("loads subject-local baseline files from the authority tree", async () => {
    const ctx = createBaselineContext({
      registry: [rule("subject-local-rule")],
      rulePackAtBase: ["subject-local-rule"],
      baselinesAtBase: new Map(),
    });
    const baselinePath = writeSubjectLocalBaselineFile(ctx.repoRoot, "subject-local-rule", []);

    const state = await loadState(rule("subject-local-rule", { baselinePath }), ctx);

    expect(state).toMatchObject({
      kind: "explicit-empty",
      ruleId: "subject-local-rule",
      locked: true,
    });
  });

  test("applies explicit debt baselines and leaves new errors unbaselined", async () => {
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
    const state = await loadState(rule("existing-rule"), ctx);
    expect(state).toMatchObject({ kind: "explicit-debt", locked: false });
    expect(applyBaseline(diagnostics, state)).toMatchObject({ status: "applied", refusals: [] });
    expect(diagnostics.map((entry) => entry.baselined)).toEqual([true, false]);
    expect(isBaselineLocked(state)).toBe(false);
  });

  test("spends occurrence-aware coverage once per matching diagnostic", async () => {
    const diagnosticKey = baselineDiagnosticKey("src/a.ts", "repeated debt");
    const ctx = createBaselineContext({
      registry: [rule("counted-rule")],
      rulePackAtBase: ["counted-rule"],
      baselinesAtBase: new Map([["counted-rule", occurrenceBaselineBody([[diagnosticKey, 2]])]]),
    });
    writeOccurrenceBaselineFile(ctx.baselinesDir, "counted-rule", [[diagnosticKey, 2]]);

    const diagnostics = [
      diagnostic("counted-rule", "src/a.ts", "repeated debt"),
      diagnostic("counted-rule", "src/a.ts", "repeated debt"),
      diagnostic("counted-rule", "src/a.ts", "repeated debt"),
    ];
    const state = await loadState(rule("counted-rule"), ctx);

    expect(state).toMatchObject({
      kind: "explicit-debt",
      coverage: "occurrence",
      occurrences: [{ key: diagnosticKey, count: 2 }],
    });
    expect(applyBaseline(diagnostics, state)).toMatchObject({
      status: "applied",
      diagnosticsCovered: 2,
    });
    expect(diagnostics.map((entry) => entry.baselined)).toEqual([true, true, false]);
  });

  test("applies large occurrence counts without expanding them into memory", async () => {
    const diagnosticKey = baselineDiagnosticKey("src/a.ts", "repeated debt");
    const count = 1_000_000_000;
    const ctx = createBaselineContext({
      registry: [rule("large-count-rule")],
      rulePackAtBase: ["large-count-rule"],
      baselinesAtBase: new Map([
        ["large-count-rule", occurrenceBaselineBody([[diagnosticKey, count]])],
      ]),
    });
    writeOccurrenceBaselineFile(ctx.baselinesDir, "large-count-rule", [[diagnosticKey, count]]);
    const diagnostics = [diagnostic("large-count-rule", "src/a.ts", "repeated debt")];
    const state = await loadState(rule("large-count-rule"), ctx);

    expect(state).toMatchObject({ occurrences: [{ key: diagnosticKey, count }] });
    expect(applyBaseline(diagnostics, state)).toMatchObject({
      status: "applied",
      diagnosticsCovered: 1,
    });
  });

  test("fails missing required baseline files for registered rules", async () => {
    const ctx = createBaselineContext({
      registry: [rule("missing-rule")],
      rulePackAtBase: ["missing-rule"],
      baselinesAtBase: new Map(),
    });

    const state = await loadState(rule("missing-rule"), ctx);
    expect(state).toMatchObject({ kind: "baseline-refusal", reason: "missing-baseline" });
    const validation = await validateContract(ctx);
    expect(validation.refusals).toEqual([
      expect.objectContaining({ ruleId: "missing-rule", reason: "missing-baseline" }),
    ]);
  });

  test("fails malformed, non-string, duplicate, unsorted, and invalid-count baselines", async () => {
    const cases = [
      { ruleId: "bad-json", body: "{", reason: "malformed-baseline" },
      { ruleId: "non-array", body: '{"items":[]}', reason: "malformed-baseline" },
      { ruleId: "non-string", body: "[1]", reason: "non-string-baseline-key" },
      { ruleId: "duplicate", body: '["a::b","a::b"]', reason: "duplicate-baseline-key" },
      { ruleId: "unsorted", body: '["z::b","a::b"]', reason: "unsorted-baseline" },
      {
        ruleId: "empty-occurrence",
        body: occurrenceBaselineBody([]),
        reason: "malformed-baseline",
      },
      {
        ruleId: "duplicate-occurrence",
        body: occurrenceBaselineBody([
          ["a::b", 1],
          ["a::b", 2],
        ]),
        reason: "duplicate-baseline-key",
      },
      {
        ruleId: "unsorted-occurrence",
        body: occurrenceBaselineBody([
          ["z::b", 1],
          ["a::b", 1],
        ]),
        reason: "unsorted-baseline",
      },
      {
        ruleId: "zero-count",
        body: occurrenceBaselineBody([["a::b", 0]]),
        reason: "malformed-baseline",
      },
      {
        ruleId: "fractional-count",
        body: occurrenceBaselineBody([["a::b", 1.5]]),
        reason: "malformed-baseline",
      },
    ] as const;
    const ctx = createBaselineContext({
      registry: cases.map(({ ruleId }) => rule(ruleId)),
      rulePackAtBase: cases.map(({ ruleId }) => ruleId),
      baselinesAtBase: new Map(),
    });

    for (const item of cases) {
      writeFileSync(path.join(ctx.baselinesDir, `${item.ruleId}.json`), `${item.body}\n`);
      const state = await loadState(rule(item.ruleId), ctx);
      expect(state).toMatchObject({ kind: "baseline-refusal", reason: item.reason });
    }
  });

  test("fails orphan baseline files", async () => {
    const ctx = createBaselineContext({
      registry: [rule("registered-rule")],
      rulePackAtBase: ["registered-rule"],
      baselinesAtBase: new Map([["registered-rule", []]]),
    });
    writeBaselineFile(ctx.baselinesDir, "registered-rule", []);
    writeBaselineFile(ctx.baselinesDir, "orphan-rule", []);

    expect((await validateContract(ctx)).refusals).toEqual([
      expect.objectContaining({ ruleId: "orphan-rule", reason: "orphan-baseline" }),
    ]);
  });

  test("rejects parser-owned baselining when explicit Habitat state owns the rule", async () => {
    const ctx = createBaselineContext({
      registry: [rule("explicit-rule")],
      rulePackAtBase: ["explicit-rule"],
      baselinesAtBase: new Map([["explicit-rule", ["src/a.ts::tracked debt"]]]),
    });
    writeBaselineFile(ctx.baselinesDir, "explicit-rule", ["src/a.ts::tracked debt"]);
    const state = await loadState(rule("explicit-rule"), ctx);

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

  test("accepts occurrence debt shrinkage and refuses count growth", async () => {
    const diagnosticKey = baselineDiagnosticKey("src/example.ts", "repeated diagnostic");
    const base = occurrenceBaselineBody([[diagnosticKey, 3]]);
    const ctx = createBaselineContext({
      registry: [rule("counted-rule")],
      rulePackAtBase: ["counted-rule"],
      baselinesAtBase: new Map([["counted-rule", base]]),
    });
    writeOccurrenceBaselineFile(ctx.baselinesDir, "counted-rule", [[diagnosticKey, 2]]);
    expect(await checkIntegrity("main", ctx)).toEqual({ status: "accepted", refusals: [] });

    writeOccurrenceBaselineFile(ctx.baselinesDir, "counted-rule", [[diagnosticKey, 4]]);
    expect(await checkIntegrity("main", ctx)).toMatchObject({
      status: "refused",
      refusals: [
        expect.objectContaining({
          reason: "baseline-growth-existing-rule",
          addedKeys: [diagnosticKey],
        }),
      ],
    });
  });

  test("refuses occurrence-to-key coverage broadening", async () => {
    const diagnosticKey = baselineDiagnosticKey("src/example.ts", "repeated diagnostic");
    const ctx = createBaselineContext({
      registry: [rule("counted-rule")],
      rulePackAtBase: ["counted-rule"],
      baselinesAtBase: new Map([["counted-rule", occurrenceBaselineBody([[diagnosticKey, 2]])]]),
    });
    writeBaselineFile(ctx.baselinesDir, "counted-rule", [diagnosticKey]);

    expect(await checkIntegrity("main", ctx)).toMatchObject({
      status: "refused",
      refusals: [
        expect.objectContaining({
          reason: "baseline-growth-existing-rule",
          addedKeys: [diagnosticKey],
          message: expect.stringContaining("broadened exact occurrence coverage"),
        }),
      ],
    });
  });

  test("compares baseline authority against pre-D14A authored authority paths", async () => {
    const ctx = createBaselineContext({
      registry: [rule("existing-rule")],
      rulePackAtBase: stringifyJsonDocument({
        rules: [
          {
            id: "existing-rule",
            runner: "habitat",
            ownerProject: "habitat",
          },
        ],
      }),
      baselinesAtBase: new Map([["existing-rule", ["src/example.ts::diagnostic"]]]),
      authorityLayoutAtBase: "pre-d14a",
    });
    writeBaselineFile(ctx.baselinesDir, "existing-rule", ["src/example.ts::diagnostic"]);

    expect(await checkIntegrity("main", ctx)).toEqual({ status: "accepted", refusals: [] });
  });

  test("loads base rule identity from manifest content instead of manifest location", async () => {
    const ctx = createBaselineContext({
      registry: [rule("relocated-rule")],
      rulePackAtBase: ["relocated-rule"],
      baselinesAtBase: new Map([["relocated-rule", []]]),
      authorityLayoutAtBase: "relocated-manifest",
    });
    writeBaselineFile(ctx.baselinesDir, "relocated-rule", []);

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
    expect(await guardExpansion("new-rule", ["src/example.ts::diagnostic"], "main", ctx)).toEqual(
      expect.objectContaining({
        status: "refused",
        refusal: expect.objectContaining({ reason: "rule-introduction-manifest-missing" }),
      })
    );

    expect(
      await checkIntegrity("main", {
        ...ctx,
        ruleIntroductionManifests: [
          {
            changeId: "fixture-change",
            ruleId: "new-rule",
            ownerProject: "habitat",
            runner: "grit",
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
        registry: [
          rule("new-rule", {
            ownerProject: "@habitat/cli",
            runner: "grit",
          }),
        ],
        ruleIntroductionManifests: [
          {
            changeId: "fixture-change",
            ruleId: "new-rule",
            ownerProject: "habitat",
            runner: "habitat",
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

  test("binds introduced occurrence debt to exact manifest multiplicity", async () => {
    const diagnosticKey = baselineDiagnosticKey("src/example.ts", "repeated diagnostic");
    const secondDiagnosticKey = baselineDiagnosticKey("src/z.ts", "single diagnostic");
    const ctx = createBaselineContext({
      registry: [rule("new-counted-rule")],
      rulePackAtBase: ["existing-rule"],
      baselinesAtBase: new Map(),
    });
    writeOccurrenceBaselineFile(ctx.baselinesDir, "new-counted-rule", [
      [diagnosticKey, 2],
      [secondDiagnosticKey, 1],
    ]);

    const exactManifest: RuleIntroductionBaselineManifest = {
      changeId: "fixture-change",
      ruleId: "new-counted-rule",
      ownerProject: "habitat",
      runner: "grit",
      baselinePath: ".habitat/baselines/new-counted-rule.json",
      initialBaselineKeys: [diagnosticKey, diagnosticKey, secondDiagnosticKey],
      comparisonBase: "main",
    };
    expect(
      await checkIntegrity("main", {
        ...ctx,
        ruleIntroductionManifests: [exactManifest],
      })
    ).toEqual({ status: "accepted", refusals: [] });

    expect(
      await checkIntegrity("main", {
        ...ctx,
        ruleIntroductionManifests: [{ ...exactManifest, initialBaselineKeys: [diagnosticKey] }],
      })
    ).toMatchObject({
      status: "refused",
      refusals: [expect.objectContaining({ reason: "rule-introduction-manifest-mismatch" })],
    });

    expect(
      await checkIntegrity("main", {
        ...ctx,
        ruleIntroductionManifests: [
          {
            ...exactManifest,
            initialBaselineKeys: [secondDiagnosticKey, diagnosticKey, diagnosticKey],
          },
        ],
      })
    ).toMatchObject({
      status: "refused",
      refusals: [expect.objectContaining({ reason: "rule-introduction-manifest-mismatch" })],
    });
  });

  test("loads an introduced rule manifest from its registry support relation", async () => {
    const fixture = {
      ruleId: "file-backed-new-rule",
      key: "src/example.ts::diagnostic",
    };
    const manifestPath = `.habitat/rules/${fixture.ruleId}/rule-introduction-baseline.json`;
    const ctx = createBaselineContext({
      registry: [rule(fixture.ruleId, { ruleIntroductionManifestPath: manifestPath })],
      rulePackAtBase: ["existing-rule"],
      baselinesAtBase: new Map(),
    });
    writeBaselineFile(ctx.baselinesDir, fixture.ruleId, [fixture.key]);
    writeRuleIntroductionManifestFile(ctx.repoRoot, manifestPath, {
      changeId: "fixture-change",
      ruleId: fixture.ruleId,
      ownerProject: "habitat",
      runner: "grit",
      baselinePath: `.habitat/baselines/${fixture.ruleId}.json`,
      initialBaselineKeys: [fixture.key],
      comparisonBase: "main",
    });

    expect(await checkIntegrity("main", ctx)).toEqual({ status: "accepted", refusals: [] });
    expect(await guardExpansion(fixture.ruleId, [fixture.key], "main", ctx)).toMatchObject({
      status: "accepted",
      ruleId: fixture.ruleId,
      occurrences: [{ key: fixture.key, count: 1 }],
    });
  });

  test("refuses unreadable, invalid JSON, and schema-invalid introduction manifests", async () => {
    const cases = [
      {
        suffix: "unreadable",
        writeManifest: (_repoRoot: string, _manifestPath: string) => undefined,
      },
      {
        suffix: "invalid-json",
        writeManifest: (repoRoot: string, manifestPath: string) =>
          writeRawRuleIntroductionManifestFile(repoRoot, manifestPath, "{"),
      },
      {
        suffix: "invalid-schema",
        writeManifest: (repoRoot: string, manifestPath: string) =>
          writeRawRuleIntroductionManifestFile(
            repoRoot,
            manifestPath,
            stringifyJsonDocument({ ruleId: "incomplete" })
          ),
      },
    ];

    for (const item of cases) {
      const ruleId = `new-rule-${item.suffix}`;
      const diagnosticKey = `src/${item.suffix}.ts::diagnostic`;
      const manifestPath = `.habitat/rules/${ruleId}/rule-introduction-baseline.json`;
      const ctx = createBaselineContext({
        registry: [rule(ruleId, { ruleIntroductionManifestPath: manifestPath })],
        rulePackAtBase: ["existing-rule"],
        baselinesAtBase: new Map(),
      });
      writeBaselineFile(ctx.baselinesDir, ruleId, [diagnosticKey]);
      item.writeManifest(ctx.repoRoot, manifestPath);

      expect(await checkIntegrity("main", ctx)).toMatchObject({
        status: "refused",
        refusals: [
          expect.objectContaining({
            ruleId,
            path: manifestPath,
            reason: "rule-introduction-manifest-malformed",
          }),
        ],
      });
      expect(await guardExpansion(ruleId, [diagnosticKey], "main", ctx)).toMatchObject({
        status: "refused",
        refusal: expect.objectContaining({
          ruleId,
          path: manifestPath,
          reason: "rule-introduction-manifest-malformed",
        }),
      });
    }
  });

  test("refuses a schema-valid introduction manifest with mismatched authority", async () => {
    const fixture = {
      ruleId: "mismatched-new-rule",
      key: "src/example.ts::diagnostic",
    };
    const manifestPath = `.habitat/rules/${fixture.ruleId}/rule-introduction-baseline.json`;
    const ctx = createBaselineContext({
      registry: [rule(fixture.ruleId, { ruleIntroductionManifestPath: manifestPath })],
      rulePackAtBase: ["existing-rule"],
      baselinesAtBase: new Map(),
    });
    writeBaselineFile(ctx.baselinesDir, fixture.ruleId, [fixture.key]);
    writeRuleIntroductionManifestFile(ctx.repoRoot, manifestPath, {
      changeId: "fixture-change",
      ruleId: "different-rule",
      ownerProject: "habitat",
      runner: "grit",
      baselinePath: `.habitat/baselines/${fixture.ruleId}.json`,
      initialBaselineKeys: [fixture.key],
      comparisonBase: "main",
    });

    expect(await checkIntegrity("main", ctx)).toMatchObject({
      status: "refused",
      refusals: [expect.objectContaining({ reason: "rule-introduction-manifest-mismatch" })],
    });
    expect(await guardExpansion(fixture.ruleId, [fixture.key], "main", ctx)).toMatchObject({
      status: "refused",
      refusal: expect.objectContaining({ reason: "rule-introduction-manifest-mismatch" }),
    });
  });

  test("refuses Graphite child growth when an explicit trusted parent contains the rule", async () => {
    const diagnosticKey = baselineDiagnosticKey("src/downstack.ts", "child-added debt");
    const trunkContext = createBaselineContext({
      registry: [
        rule("downstack-rule", {
          ruleIntroductionManifestPath: ".habitat/rules/downstack-rule/missing-manifest.json",
        }),
      ],
      rulePackAtBase: ["unrelated-trunk-rule"],
      baselinesAtBase: new Map(),
    });
    writeBaselineFile(trunkContext.baselinesDir, "downstack-rule", [diagnosticKey]);

    expect(
      await checkIntegrity("main", {
        ...trunkContext,
        ruleIntroductionManifests: [
          {
            changeId: "fixture-change",
            ruleId: "downstack-rule",
            ownerProject: "habitat",
            runner: "grit",
            baselinePath: ".habitat/baselines/downstack-rule.json",
            initialBaselineKeys: [diagnosticKey],
            comparisonBase: "main",
          },
        ],
      })
    ).toEqual({ status: "accepted", refusals: [] });

    const trustedParentContext = createBaselineContext({
      registry: [
        rule("downstack-rule", {
          ruleIntroductionManifestPath: ".habitat/rules/downstack-rule/missing-manifest.json",
        }),
      ],
      rulePackAtBase: ["downstack-rule"],
      baselinesAtBase: new Map([["downstack-rule", []]]),
      mergeBase: "trusted-parent-sha",
    });
    writeBaselineFile(trustedParentContext.baselinesDir, "downstack-rule", [diagnosticKey]);

    expect(await integrityFindings("agent-HR-parent", trustedParentContext)).toEqual([
      expect.objectContaining({
        file: ".habitat/baselines/downstack-rule.json",
        ruleId: "downstack-rule",
        addedKeys: [diagnosticKey],
        reason: expect.stringContaining("existing rule 'downstack-rule' grew"),
      }),
    ]);
    expect(
      await guardExpansion(
        "downstack-rule",
        [diagnosticKey],
        "agent-HR-parent",
        trustedParentContext
      )
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
      authorityLayoutAtBase: "pre-d14a",
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
  options: {
    exceptionPath?: string;
    ownerProject?: string;
    runner?: string;
    baselinePath?: string;
    ruleIntroductionManifestPath?: string;
  } = {}
): BaselineRuleContractInput {
  return {
    id,
    exceptionPath: options.exceptionPath,
    ownerProject: options.ownerProject ?? "habitat",
    runner: options.runner ?? "grit",
    baselinePath: options.baselinePath ?? `.habitat/baselines/${id}.json`,
    ruleIntroductionManifestPath: options.ruleIntroductionManifestPath,
  };
}

async function checkIntegrity(base: string, context: BaselineTestContext) {
  const result = await Effect.runPromise(
    checkBaselineIntegrityEffect(base, context).pipe(withNodeContext)
  );
  return result;
}

async function loadState(rule: BaselineRuleContractInput, context: BaselineTestContext) {
  const result = await Effect.runPromise(
    loadBaselineStateEffect(rule, context).pipe(withNodeContext)
  );
  return result;
}

async function validateContract(context: BaselineTestContext) {
  const result = await Effect.runPromise(
    validateBaselineContractEffect(context).pipe(withNodeContext)
  );
  return result;
}

async function integrityFindings(base: string, context: BaselineTestContext) {
  const result = await checkIntegrity(base, context);
  return Effect.runPromise(baselineIntegrityFindingsEffect(result));
}

async function guardExpansion(
  ruleId: string,
  keys: readonly string[],
  base: string,
  context: BaselineTestContext
) {
  const result = await Effect.runPromise(
    guardBaselineExpansionEffect(ruleId, keys, base, context).pipe(withNodeContext)
  );
  return result;
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

function baselineDiagnosticKey(pathName: string, message: string): string {
  return `${pathName}::${message}`;
}

interface BaselineTestContext extends BaselineAuthorityContext {
  readonly git: GitProviderService;
  readonly repoRoot: string;
  readonly baselinesDir: string;
}

interface BaselineContextOptions {
  registry: BaselineRuleContractInput[];
  rulePackAtBase: string[] | string | null;
  baselinesAtBase: Map<string, string[] | string>;
  authorityLayoutAtBase?: "current" | "pre-d14a" | "relocated-manifest";
  mergeBase?: string | null;
}

function createBaselineContext(options: BaselineContextOptions): BaselineTestContext {
  const repoRoot = mkdtempSync(path.join(tmpdir(), "habitat-baseline-test-"));
  tempDirs.push(repoRoot);
  const baselinesDir = path.join(repoRoot, ".habitat", "baselines");
  mkdirSync(baselinesDir, { recursive: true });
  return {
    fileSystem: {
      isDirectory,
      isFile,
      makeDirectory,
      readDirectory,
      readText,
      writeText,
    },
    repoRoot,
    baselinesDir,
    registry: options.registry,
    git: makeGitProviderFromCommandHandler((argv, runOptions) =>
      baselineGitCommandResult(argv, runOptions.cwd, options)
    ),
  };
}

function baselineGitCommandResult(
  argv: readonly string[],
  cwd: string,
  options: BaselineContextOptions
): HabitatCommandResult {
  return Match.value(argv[0]).pipe(
    Match.when("merge-base", () => mergeBaseCommandResult(argv, cwd, options.mergeBase)),
    Match.when("show", () => showMock(argv[1] ?? "", cwd, options)),
    Match.when("ls-tree", () => lsTreeMock(argv, cwd, options)),
    Match.orElse(() => commandResult(argv, cwd, "", 1, `unexpected command: ${argv.join(" ")}\n`))
  );
}

function mergeBaseCommandResult(
  argv: readonly string[],
  cwd: string,
  mergeBase: string | null | undefined
): HabitatCommandResult {
  return Match.value(mergeBase).pipe(
    Match.when(Match.null, () => commandResult(argv, cwd, "", 1, "no merge-base\n")),
    Match.when(Match.undefined, () => commandResult(argv, cwd, "merge-base-sha\n")),
    Match.orElse((resolved) => commandResult(argv, cwd, `${resolved}\n`))
  );
}

function lsTreeMock(argv: readonly string[], cwd: string, options: BaselineContextOptions) {
  const comparisonSha = options.mergeBase ?? "merge-base-sha";
  const expected = ["ls-tree", "-r", "--name-only", comparisonSha, ".habitat"];
  return Match.value(options).pipe(
    Match.when({ authorityLayoutAtBase: "pre-d14a" }, () =>
      commandResult(argv, cwd, "", 1, "not found\n")
    ),
    Match.when(
      () =>
        argv.length !== expected.length || argv.some((entry, index) => entry !== expected[index]),
      () => commandResult(argv, cwd, "", 1, `unexpected command: ${argv.join(" ")}\n`)
    ),
    Match.when(
      (candidate) => !Array.isArray(candidate.rulePackAtBase),
      () => commandResult(argv, cwd, "", 1, "not found\n")
    ),
    Match.orElse((candidate) =>
      commandResult(
        argv,
        cwd,
        ruleManifestList(candidate.rulePackAtBase, candidate.authorityLayoutAtBase)
      )
    )
  );
}

function ruleManifestList(
  rulePackAtBase: string[] | string | null,
  layout: BaselineContextOptions["authorityLayoutAtBase"]
): string {
  return Match.value(rulePackAtBase).pipe(
    Match.when(
      Array.isArray,
      (ruleIds) => `${ruleIds.map((id) => baseRuleManifestPath(id, layout)).join("\n")}\n`
    ),
    Match.orElse(() => "")
  );
}

function showMock(spec: string, cwd: string, options: BaselineContextOptions) {
  const comparisonSha = options.mergeBase ?? "merge-base-sha";
  const ruleRegistryAtBase = Match.value(options.authorityLayoutAtBase).pipe(
    Match.when(
      "pre-d14a",
      () => "tools/habitat/src/service/model/check/policy/rule-runtime/rules.json"
    ),
    Match.orElse(() => ".habitat/rules/index.json")
  );
  const baselinePrefix = Match.value(options.authorityLayoutAtBase).pipe(
    Match.when("pre-d14a", () => `${comparisonSha}:tools/habitat/baselines/`),
    Match.orElse(() => `${comparisonSha}:.habitat/baselines/`)
  );
  return Match.value(spec).pipe(
    Match.when(`${comparisonSha}:${ruleRegistryAtBase}`, () =>
      showRuleRegistry(cwd, spec, options.rulePackAtBase)
    ),
    Match.when(
      (candidate) =>
        candidate.startsWith(`${comparisonSha}:.habitat/`) && candidate.endsWith("/rule.json"),
      () => showRuleManifest(cwd, spec, comparisonSha, options)
    ),
    Match.when(
      (candidate) => candidate.startsWith(baselinePrefix) && candidate.endsWith(".json"),
      () => showBaseline(cwd, spec, baselinePrefix, options.baselinesAtBase)
    ),
    Match.orElse(() => commandResult(["show", spec], cwd, "", 1, "not found\n"))
  );
}

function showRuleRegistry(
  cwd: string,
  spec: string,
  rulePackAtBase: string[] | string | null
): HabitatCommandResult {
  return Match.value(rulePackAtBase).pipe(
    Match.when(Match.null, () => commandResult(["show", spec], cwd, "", 1, "not found\n")),
    Match.when(Match.string, (contents) => commandResult(["show", spec], cwd, contents)),
    Match.orElse((ruleIds) =>
      commandResult(
        ["show", spec],
        cwd,
        stringifyJsonDocument({
          schemaVersion: 2,
          ownerRoots: { habitat: "tools/habitat" },
          rules: ruleIds.map(baseRuleRecord),
        })
      )
    )
  );
}

function showRuleManifest(
  cwd: string,
  spec: string,
  comparisonSha: string,
  options: BaselineContextOptions
): HabitatCommandResult {
  const manifestPath = spec.slice(`${comparisonSha}:`.length);
  const ruleId = Match.value(options.rulePackAtBase).pipe(
    Match.when(
      Array.isArray,
      (ruleIds) =>
        ruleIds.find(
          (candidate) =>
            baseRuleManifestPath(candidate, options.authorityLayoutAtBase) === manifestPath
        ) ?? null
    ),
    Match.orElse(() => null)
  );
  return Match.value(ruleId).pipe(
    Match.when(Match.string, (ruleId) =>
      commandResult(["show", spec], cwd, stringifyJsonDocument(baseRuleRecord(ruleId)))
    ),
    Match.orElse(() => commandResult(["show", spec], cwd, "", 1, "not found\n"))
  );
}

function showBaseline(
  cwd: string,
  spec: string,
  prefix: string,
  baselinesAtBase: ReadonlyMap<string, string[] | string>
): HabitatCommandResult {
  const ruleId = spec.slice(prefix.length, -".json".length);
  return Match.value(baselinesAtBase.get(ruleId)).pipe(
    Match.when(Match.undefined, () => commandResult(["show", spec], cwd, "", 1, "not found\n")),
    Match.when(Match.string, (contents) => commandResult(["show", spec], cwd, contents)),
    Match.orElse((entries) => commandResult(["show", spec], cwd, stringifyJsonDocument(entries)))
  );
}

function baseRuleManifestPath(
  id: string,
  layout: "current" | "pre-d14a" | "relocated-manifest" = "current"
) {
  return Match.value(layout).pipe(
    Match.when("relocated-manifest", () => `.habitat/future/rule-inventory/${id}/rule.json`),
    Match.orElse(
      () => `.habitat/global/workspace/_blueprints/project-boundary-model/${id}/rule.json`
    )
  );
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
    schemaVersion: 2,
    id,
    title: id,
    placement: {
      niche: "global/workspace",
      blueprint: "project-boundary-model",
      category: "structure",
    },
    operation: { kind: "check" },
    ownerProject: "habitat",
    lane: "enforced",
    forbids: "fixture violation",
    why: "fixture base registry record for D5 baseline authority tests",
    remediate: null,
    message: "fixture baseline authority diagnostic",
    pathCoverage: [{ kind: "workspace-gate" }],
    supportFiles: {
      baseline: `.habitat/global/workspace/_blueprints/project-boundary-model/${id}/baseline.json`,
    },
    runner: {
      name: "habitat",
      mode: "script",
      runtime: "node",
      files: {
        script: `.habitat/global/workspace/_blueprints/project-boundary-model/${id}/check.mjs`,
      },
    },
  };
}

function writeBaselineFile(baselinesDir: string, ruleId: string, entries: string[]) {
  mkdirSync(baselinesDir, { recursive: true });
  writeFileSync(path.join(baselinesDir, `${ruleId}.json`), `${stringifyJsonDocument(entries)}\n`);
}

function writeOccurrenceBaselineFile(
  baselinesDir: string,
  ruleId: string,
  entries: readonly (readonly [key: string, count: number])[]
) {
  mkdirSync(baselinesDir, { recursive: true });
  writeFileSync(path.join(baselinesDir, `${ruleId}.json`), `${occurrenceBaselineBody(entries)}\n`);
}

function occurrenceBaselineBody(
  entries: readonly (readonly [key: string, count: number])[]
): string {
  return stringifyJsonDocument({
    schemaVersion: 1,
    occurrences: entries.map(([key, count]) => ({ key, count })),
  });
}

function writeRuleIntroductionManifestFile(
  repoRoot: string,
  manifestPath: string,
  manifest: RuleIntroductionBaselineManifest
) {
  writeRawRuleIntroductionManifestFile(repoRoot, manifestPath, stringifyJsonDocument(manifest));
}

function writeRawRuleIntroductionManifestFile(
  repoRoot: string,
  manifestPath: string,
  contents: string
) {
  const absolutePath = path.join(repoRoot, manifestPath);
  mkdirSync(path.dirname(absolutePath), { recursive: true });
  writeFileSync(absolutePath, `${contents}\n`);
}

function writeSubjectLocalBaselineFile(repoRoot: string, ruleId: string, entries: string[]) {
  const packetDir = path.join(
    repoRoot,
    ".habitat",
    "civ7",
    "mapgen",
    "domain",
    "blueprints",
    "_self",
    "structure",
    "check",
    ruleId
  );
  mkdirSync(packetDir, { recursive: true });
  writeFileSync(path.join(packetDir, `baseline.json`), `${stringifyJsonDocument(entries)}\n`);
  return path.relative(repoRoot, path.join(packetDir, "baseline.json")).split(path.sep).join("/");
}
