import {
  DiagnosticCatalogEntrySchema,
  diagnosticCacheRequirementForGritCheck,
  diagnosticCatalogEntryFromNativeRule,
  diagnosticCatalogEntryFromRuleSourceFacts,
  diagnosticConsumerResultFromOutcome,
  diagnosticProviderFailureKinds,
  GritDiagnosticCatalogEntrySchema,
  NativeDiagnosticCatalogEntrySchema,
  observedNativeDiagnosticIdentity,
  renderDiagnosticProviderFailure,
} from "@internal/habitat-harness/service/model/check/diagnostics/index";
import type { RuleSourceFacts } from "@internal/habitat-harness/service/model/rules/registry/index";
import {
  type HabitatProcessRequest,
  makeHabitatCommandResult,
  type OutputCapture,
} from "@internal/habitat-harness/service/runtime/command/index";
import { defaultGritCommandTimeoutMs } from "@internal/habitat-harness/service/runtime/grit/constants";
import { gritRuleResultsFromReport } from "@internal/habitat-harness/service/runtime/grit/diagnostics";
import {
  discoverPatternScanRoots,
  makeFakeGritProviderLayer,
  runGritDiagnosticOutcomesEffect,
  runGritRulesEffect,
  validateScanRoots,
} from "@internal/habitat-harness/service/runtime/grit/index";
import {
  parseGritCheckOutput,
  parseGritCheckTextOutput,
} from "@internal/habitat-harness/service/runtime/grit/output";
import { decidePatternScanRoots } from "@internal/habitat-harness/service/runtime/grit/scan-roots/index";
import { repoRoot, toRepoRelative } from "@internal/habitat-harness/service/runtime/paths";
import { Effect, type Layer } from "effect";
import { Value } from "typebox/value";
import { describe, expect, test } from "vitest";

type GritProviderLayer = ReturnType<typeof makeFakeGritProviderLayer>;
type TestGritOptions = NonNullable<Parameters<typeof runGritRulesEffect>[1]> & {
  layer?: GritProviderLayer;
};

const unusedGritProviderLayer = makeFakeGritProviderLayer((request) => {
  throw new Error(`Unexpected Grit provider request: ${request.argv.join(" ")}`);
});

function runGritRules(selectedRules: readonly RuleSourceFacts[], options: TestGritOptions = {}) {
  const { layer = unusedGritProviderLayer, ...runOptions } = options;
  return Effect.runPromise(runGritRulesEffect(selectedRules, runOptions).pipe(provide(layer)));
}

function runGritDiagnosticOutcomes(
  selectedRules: readonly RuleSourceFacts[],
  options: TestGritOptions = {}
) {
  const { layer = unusedGritProviderLayer, ...runOptions } = options;
  return Effect.runPromise(
    runGritDiagnosticOutcomesEffect(selectedRules, runOptions).pipe(provide(layer))
  );
}

function provide(layer: GritProviderLayer) {
  return <A, E, R>(program: Effect.Effect<A, E, R>) =>
    Effect.provide(program, layer as Layer.Layer<R>);
}

describe("Grit check provider parser and diagnostics", () => {
  test("parses the pinned Grit check JSON shape from stderr", () => {
    const parsed = parseGritCheckOutput(
      commandResult({
        stderr: JSON.stringify({
          paths: ["packages/example/src/demo.ts"],
          results: [
            {
              check_id:
                "github.com/mateicanavra/civ7-modding-tools#adapter_base_standard_import/js",
              local_name: "adapter_base_standard_import",
              start: { line: 1, col: 1, offset: 0 },
              path: "packages/example/src/demo.ts",
              extra: { message: "fixture finding", severity: "error" },
            },
          ],
        }),
      })
    );

    expect(parsed.kind).toBe("parsed");
    if (parsed.kind !== "parsed") return;
    expect(parsed.parseStatus).toBe("parsed");
    expect(parsed.request).toMatchObject({
      commandFamily: "current-tree-json-check",
      outputContract: "json-report",
      cacheRequirement: { kind: "workspace-cache-allowed", observable: false },
    });
    expect("stdout" in parsed.request).toBe(false);
    expect("stderr" in parsed.request).toBe(false);
    expect(parsed.report.results[0]?.local_name).toBe("adapter_base_standard_import");
  });

  test("records freshness-required native request state", () => {
    const parsed = parseGritCheckOutput(
      commandResult({
        stderr: JSON.stringify({ paths: [], results: [] }),
      }),
      diagnosticCacheRequirementForGritCheck({
        cacheMode: "fresh",
        requireObservableCacheStatus: true,
      })
    );

    expect(parsed.kind).toBe("parsed");
    if (parsed.kind !== "parsed") return;
    expect(parsed.request.cacheRequirement).toEqual({ kind: "fresh-required", observable: true });
  });

  test("fails closed for no JSON, malformed JSON, and wrapper text", () => {
    const noJson = parseGritCheckOutput(commandResult());
    expect(noJson.kind).toBe("provider-failed");
    expect(noJson.kind === "provider-failed" ? noJson.failure : "unexpected").toBe("GritNoJson");

    const malformed = parseGritCheckOutput(commandResult({ stderr: '{"results":' }));
    expect(malformed.kind).toBe("provider-failed");
    expect(malformed.kind === "provider-failed" ? malformed.failure : "unexpected").toBe(
      "GritMalformedJson"
    );

    const wrapped = parseGritCheckOutput(commandResult({ stderr: 'prefix {"results":[]} suffix' }));
    expect(wrapped.kind).toBe("provider-failed");
    expect(wrapped.kind === "provider-failed" ? wrapped.failure : "unexpected").toBe(
      "GritMalformedJson"
    );
  });

  test("treats nonzero Grit exits as command failures before diagnostic mapping", () => {
    const failed = parseGritCheckOutput(
      commandResult({
        stderr: '{"paths":[],"results":[]}',
        exitCode: 2,
      })
    );

    expect(failed.kind).toBe("provider-failed");
    expect(failed.kind === "provider-failed" ? failed.failure : "unexpected").toBe(
      "GritCommandFailed"
    );
    expect(failed.parseStatus).toBe("unparsed");
  });

  test("treats truncated parser input as a provider contract failure", () => {
    const truncated = parseGritCheckOutput(
      makeHabitatCommandResult(
        {
          commandId: "parser-truncated",
          kind: "pattern-check",
          executable: "grit",
          argv: ["--json", "check"],
          cwd: repoRoot,
        },
        {
          stderr: { text: '{"paths":[', truncated: true, sha256: "test", bytes: 10 },
        }
      )
    );

    expect(truncated.kind).toBe("provider-failed");
    expect(truncated.kind === "provider-failed" ? truncated.failure : "unexpected").toBe(
      "GritProviderInternalContractViolation"
    );
  });

  test("distinguishes missing results from unexpected result shape", () => {
    const missingResults = parseGritCheckOutput(commandResult({ stderr: '{"paths":[]}' }));
    expect(missingResults.kind).toBe("provider-failed");
    expect(missingResults.kind === "provider-failed" ? missingResults.failure : "unexpected").toBe(
      "GritSchemaDrift"
    );

    const wrongShape = parseGritCheckOutput(
      commandResult({ stderr: '{"paths":[],"results":[{"local_name":5}]}' })
    );
    expect(wrongShape.kind).toBe("provider-failed");
    expect(wrongShape.kind === "provider-failed" ? wrongShape.failure : "unexpected").toBe(
      "GritUnexpectedResultShape"
    );
  });

  test("projects exact Grit pattern identities to Habitat rule ids", () => {
    const rule = fakeGritRule("adapter-base-standard-import", "adapter_base_standard_import");
    const diagnosticResults = gritRuleResultsFromReport([rule], {
      paths: ["packages/example/src/demo.ts"],
      results: [
        {
          local_name: "adapter_base_standard_import",
          path: "packages/example/src/demo.ts",
          start: { line: 3 },
          extra: { message: "base standard import" },
        },
        {
          local_name: "different_pattern",
          path: "packages/example/src/other.ts",
          start: { line: 1 },
          extra: { message: "wrong pattern" },
        },
      ],
    });

    const result = diagnosticResults.get(rule.id);
    expect(result?.exitCode).toBe(1);
    expect(result?.diagnostics).toEqual([
      {
        ruleId: rule.id,
        path: "packages/example/src/demo.ts",
        line: 3,
        message: "base standard import",
        severity: "error",
        baselined: false,
      },
    ]);
  });

  test("keeps wrong, missing, duplicate, and outside requested pattern findings distinct", () => {
    const requested = fakeGritRule("domain-deep-import", "domain_deep_import");
    const other = fakeGritRule("adapter-base-standard-import", "adapter_base_standard_import");
    const diagnosticResults = gritRuleResultsFromReport([requested, other], {
      paths: ["mods/mod-swooper-maps/src/recipes/demo.ts", "packages/example/src/demo.ts"],
      results: [
        {
          local_name: "domain_deep_import",
          path: "mods/mod-swooper-maps/src/recipes/demo.ts",
          start: { line: 1 },
          extra: { message: "first domain finding" },
        },
        {
          check_id: "github.com/mateicanavra/civ7-modding-tools#domain_deep_import/js",
          path: "mods/mod-swooper-maps/src/recipes/demo.ts",
          start: { line: 2 },
          extra: { message: "duplicate domain finding" },
        },
        {
          local_name: "outside_requested_set",
          path: "mods/mod-swooper-maps/src/recipes/outside.ts",
          start: { line: 3 },
          extra: { message: "outside finding" },
        },
      ],
    });

    expect(
      diagnosticResults.get(requested.id)?.diagnostics.map((diagnostic) => diagnostic.message)
    ).toEqual(["first domain finding", "duplicate domain finding"]);
    expect(diagnosticResults.get(other.id)).toEqual({ exitCode: 0, diagnostics: [] });
  });

  test("keeps valid zero findings distinct from provider failure", () => {
    const rule = fakeGritRule("domain-deep-import", "domain_deep_import");
    const result = gritRuleResultsFromReport([rule], { paths: [], results: [] }).get(rule.id);

    expect(result).toEqual({ exitCode: 0, diagnostics: [] });
  });

  test("strict diagnostic matching distinguishes missing and unexpected pattern identities", () => {
    const requested = fakeGritRule("domain-deep-import", "domain_deep_import");
    const other = fakeGritRule("adapter-base-standard-import", "adapter_base_standard_import");

    const missing = gritRuleResultsFromReport(
      [requested],
      { paths: [], results: [] },
      { requirePatternFinding: true }
    ).get(requested.id);
    expect(missing?.diagnostics[0]?.message).toContain("GritPatternMatchMissing");

    const unexpected = gritRuleResultsFromReport(
      [requested],
      {
        paths: ["packages/example/src/demo.ts"],
        results: [
          {
            local_name: "adapter_base_standard_import",
            path: "packages/example/src/demo.ts",
          },
        ],
      },
      { rejectUnexpectedPatternIdentity: true }
    );
    expect(unexpected.get(requested.id)?.diagnostics[0]?.message).toContain(
      "GritUnexpectedDiagnosticIdentity"
    );
    expect(unexpected.get(other.id)).toBeUndefined();
  });

  test("rejects conflicting observed Grit identity fields", () => {
    const rule = fakeGritRule("domain-deep-import", "domain_deep_import");
    const diagnosticResults = gritRuleResultsFromReport([rule], {
      paths: ["mods/mod-swooper-maps/src/recipes/demo.ts"],
      results: [
        {
          local_name: "domain_deep_import",
          check_id: "github.com/mateicanavra/civ7-modding-tools#different_pattern/js",
          path: "mods/mod-swooper-maps/src/recipes/demo.ts",
          start: { line: 1 },
          extra: { message: "conflicting identity" },
        },
      ],
    });

    expect(diagnosticResults.get(rule.id)?.exitCode).toBe(1);
    expect(diagnosticResults.get(rule.id)?.diagnostics[0]?.message).toContain(
      "GritUnexpectedDiagnosticIdentity"
    );
    expect(diagnosticResults.get(rule.id)?.diagnostics[0]?.message).toContain(
      "local_name=domain_deep_import"
    );
  });

  test("rejects empty scan roots before command execution", async () => {
    const rule = fakeGritRule("domain-deep-import", "domain_deep_import");
    const results = await runGritRules([rule], { scanRoots: [] });

    expect(results.get(rule.id)?.exitCode).toBe(1);
    expect(results.get(rule.id)?.diagnostics[0]?.message).toContain("GritEmptyScanRoots");
  });

  test("surfaces scan-root refusal as a diagnostic outcome", async () => {
    const rule = fakeGritRule("domain-deep-import", "domain_deep_import");
    const outcomes = await runGritDiagnosticOutcomes([rule], { scanRoots: [] });

    const outcome = outcomes.get(rule.id);
    expect(outcome?.kind).toBe("scan-root-refused");
    if (outcome?.kind !== "scan-root-refused") return;
    expect(outcome.decision).toEqual({ kind: "refused", reason: "empty" });
    expect(diagnosticConsumerResultFromOutcome(outcome)).toMatchObject({
      kind: "scan-root-refused",
      decision: { kind: "refused", reason: "empty" },
      detail: "Grit scan roots are empty.",
    });
  });

  test("validates missing, outside, generated, protected, and approved scan roots", () => {
    const options = {
      pathExists: fakeExistingScanRoots([
        ".git",
        "docs/PROCESS.md",
        "mods/mod-swooper-maps/src/maps/generated",
        "mods/mod-swooper-maps/test",
        "packages",
        "packages/mapgen-core/src",
      ]),
    };

    expect(validateScanRoots(["packages"], options)).toBeNull();
    expect(validateScanRoots(["packages/mapgen-core/src"], options)).toBeNull();
    expect(validateScanRoots(["mods/mod-swooper-maps/test"], options)).toBeNull();
    expect(validateScanRoots(["missing-root"], options)).toContain("does not exist");
    expect(validateScanRoots(["../outside"], options)).toContain("outside the repo");
    expect(validateScanRoots(["mods/mod-swooper-maps/src/maps/generated"], options)).toContain(
      "generated output"
    );
    expect(validateScanRoots([".git"], options)).toContain("protected");
    expect(validateScanRoots(["docs/PROCESS.md"], options)).toContain("not approved");
    expect(validateScanRoots(["docs/PROCESS.md"], { ...options, allowDocsRoot: true })).toBeNull();
  });

  test("keeps scan-root refusal reasons as closed decisions", () => {
    expect(decidePatternScanRoots([])).toEqual({ kind: "refused", reason: "empty" });
    expect(decidePatternScanRoots(["../outside"])).toEqual({
      kind: "refused",
      reason: "outside-repo",
      root: "../outside",
    });
    expect(decidePatternScanRoots(["missing-root"])).toEqual({
      kind: "refused",
      reason: "missing",
      root: "missing-root",
    });
    expect(decidePatternScanRoots(["packages"])).toEqual({
      kind: "accepted",
      roots: ["packages"],
      source: "rule-registry-facts",
    });
  });

  test("creates native diagnostic catalog entries without Grit pattern identity", () => {
    const entry = diagnosticCatalogEntryFromNativeRule({
      ruleId: "docs-local-checkout-paths",
      nativeDiagnosticIdentity: "docs-local-checkout-paths",
    });

    expect(entry.kind).toBe("native-diagnostic");
    expect(entry.diagnosticIdentity).toEqual({
      kind: "native-rule",
      nativeDiagnosticIdentity: "docs-local-checkout-paths",
      source: "native-habitat-rule",
    });
    expect(entry.matchContract).toEqual({
      kind: "native-rule-match",
      identity: entry.diagnosticIdentity,
    });
    expect("patternIdentity" in entry.diagnosticIdentity).toBe(false);
  });

  test("validates diagnostic catalog branches with TypeBox-specific contracts", () => {
    const gritEntry = diagnosticCatalogEntryFromRuleSourceFacts(
      fakeGritRule("domain-deep-import", "domain_deep_import")
    );
    const nativeEntry = diagnosticCatalogEntryFromNativeRule({
      ruleId: "docs-local-checkout-paths",
      nativeDiagnosticIdentity: "docs-local-checkout-paths",
    });

    expect(Value.Check(GritDiagnosticCatalogEntrySchema, gritEntry)).toBe(true);
    expect(Value.Check(NativeDiagnosticCatalogEntrySchema, nativeEntry)).toBe(true);
    expect(Value.Check(DiagnosticCatalogEntrySchema, gritEntry)).toBe(true);
    expect(Value.Check(DiagnosticCatalogEntrySchema, nativeEntry)).toBe(true);
    expect(
      Value.Check(GritDiagnosticCatalogEntrySchema, {
        ...gritEntry,
        scanContract: nativeEntry.scanContract,
      })
    ).toBe(false);
    expect(
      Value.Check(NativeDiagnosticCatalogEntrySchema, {
        ...nativeEntry,
        matchContract: gritEntry.matchContract,
      })
    ).toBe(false);
    expect(observedNativeDiagnosticIdentity("docs-local-checkout-paths")).toEqual({
      kind: "observed-native-rule",
      observedNativeDiagnosticIdentity: "docs-local-checkout-paths",
      source: "native-habitat-rule",
    });
  });

  test("runs selected Grit rules through one argument-array command request", async () => {
    const rule = fakeGritRule("adapter-base-standard-import", "adapter_base_standard_import");
    let observedRequest: HabitatProcessRequest | undefined;
    const fakeLayer = makeFakeGritProviderLayer((request) => {
      observedRequest = request;
      return makeHabitatCommandResult(request, {
        stderr: output(
          JSON.stringify({
            paths: ["packages/example/src/demo.ts"],
            results: [
              {
                local_name: "adapter_base_standard_import",
                path: "packages/example/src/demo.ts",
                start: { line: 1 },
                extra: { message: "adapter finding" },
              },
            ],
          })
        ),
      });
    });

    const results = await runGritRules([rule], {
      scanRoots: ["packages"],
      layer: fakeLayer,
    });

    expect(observedRequest).toMatchObject({
      executable: "grit",
      argv: ["--json", "check", "--level", "error", "packages"],
      cwd: repoRoot,
      scanRoots: ["packages"],
      timeoutMs: defaultGritCommandTimeoutMs,
      cachePolicy: {
        mode: "isolated",
        observableStatus: "unknown",
      },
    });
    expect(observedRequest?.cachePolicy?.cacheDir).toBe(`${repoRoot}/.habitat/cache/patterns`);
    expect(observedRequest?.env?.GRIT_CACHE_DIR).toBe(observedRequest?.cachePolicy?.cacheDir);
    expect(observedRequest?.env).toMatchObject({
      CLICOLOR: "0",
      FORCE_COLOR: "0",
      NO_COLOR: "1",
    });
    expect(results.get(rule.id)?.diagnostics[0]?.message).toBe("adapter finding");
  });

  test("runs broad source batches once through the Grit provider", async () => {
    const firstRule = fakeGritRule("source-one", "source_one", { scanRoots: ["packages"] });
    const secondRule = fakeGritRule("source-two", "source_two", { scanRoots: ["packages"] });
    const observedRequests: HabitatProcessRequest[] = [];
    const fakeLayer = makeFakeGritProviderLayer((request) => {
      observedRequests.push(request);
      return makeHabitatCommandResult(request, {
        stderr: output(
          JSON.stringify({
            paths: ["packages/example/src/demo.ts"],
            results: [
              {
                local_name: "source_one",
                path: "packages/example/src/demo.ts",
                start: { line: 1 },
                extra: { message: "source one finding" },
              },
              {
                local_name: "source_two",
                path: "packages/example/src/demo.ts",
                start: { line: 2 },
                extra: { message: "source two finding" },
              },
            ],
          })
        ),
      });
    });

    const results = await runGritRules([firstRule, secondRule], {
      scanRoots: ["packages"],
      layer: fakeLayer,
    });

    expect(observedRequests).toHaveLength(1);
    expect(observedRequests.map((request) => request.argv)).toEqual([
      ["--json", "check", "--level", "error", "packages"],
    ]);
    expect(results.get(firstRule.id)?.diagnostics[0]?.message).toBe("source one finding");
    expect(results.get(secondRule.id)?.diagnostics[0]?.message).toBe("source two finding");
  });

  test("splits source Grit execution by scan root and keeps rule findings isolated", async () => {
    const packagesRule = fakeGritRule("packages-rule", "packages_rule", {
      scanRoots: ["packages/sdk/src"],
    });
    const domainRule = fakeGritRule("domain-rule", "domain_rule", {
      scanRoots: ["mods/mod-swooper-maps/src/domain"],
    });
    const observedRequests: HabitatProcessRequest[] = [];
    const fakeLayer = makeFakeGritProviderLayer((request) => {
      observedRequests.push(request);
      return makeHabitatCommandResult(request, {
        stderr: output(
          JSON.stringify({
            paths: request.scanRoots,
            results: request.scanRoots.includes("packages/sdk/src")
              ? [
                  {
                    local_name: "packages_rule",
                    path: "packages/sdk/src/index.ts",
                    start: { line: 1 },
                    extra: { message: "packages finding" },
                  },
                ]
              : [
                  {
                    local_name: "domain_rule",
                    path: "mods/mod-swooper-maps/src/domain/ecology/index.ts",
                    start: { line: 2 },
                    extra: { message: "domain finding" },
                  },
                ],
          })
        ),
      });
    });

    const results = await runGritRules([packagesRule, domainRule], {
      layer: fakeLayer,
    });

    expect(observedRequests.map((request) => request.argv).sort()).toEqual(
      [
        ["--json", "check", "--level", "error", "mods/mod-swooper-maps/src/domain"],
        ["--json", "check", "--level", "error", "packages/sdk/src"],
      ].sort()
    );
    expect(results.get(packagesRule.id)?.diagnostics).toEqual([
      {
        ruleId: packagesRule.id,
        path: "packages/sdk/src/index.ts",
        line: 1,
        message: "packages finding",
        severity: "error",
        baselined: false,
      },
    ]);
    expect(results.get(domainRule.id)?.diagnostics).toEqual([
      {
        ruleId: domainRule.id,
        path: "mods/mod-swooper-maps/src/domain/ecology/index.ts",
        line: 2,
        message: "domain finding",
        severity: "error",
        baselined: false,
      },
    ]);
  });

  test("unions findings for a selected Grit rule that owns multiple scan roots", async () => {
    const rule = fakeGritRule("multi-root-rule", "multi_root_rule", {
      scanRoots: ["mods/mod-swooper-maps/src/recipes", "mods/mod-swooper-maps/src/domain"],
    });
    const fakeLayer = makeFakeGritProviderLayer((request) =>
      makeHabitatCommandResult(request, {
        stderr: output(
          JSON.stringify({
            paths: request.scanRoots,
            results: [
              {
                local_name: "multi_root_rule",
                path: `${request.scanRoots[0]}/demo.ts`,
                start: { line: request.scanRoots[0]?.includes("recipes") ? 3 : 4 },
                extra: { message: `${request.scanRoots[0]} finding` },
              },
            ],
          })
        ),
      })
    );

    const results = await runGritRules([rule], { layer: fakeLayer });

    expect(results.get(rule.id)?.diagnostics).toEqual([
      {
        ruleId: rule.id,
        path: "mods/mod-swooper-maps/src/recipes/demo.ts",
        line: 3,
        message: "mods/mod-swooper-maps/src/recipes finding",
        severity: "error",
        baselined: false,
      },
      {
        ruleId: rule.id,
        path: "mods/mod-swooper-maps/src/domain/demo.ts",
        line: 4,
        message: "mods/mod-swooper-maps/src/domain finding",
        severity: "error",
        baselined: false,
      },
    ]);
  });

  test("fresh cache mode uses a scoped isolated cache with observable freshness", async () => {
    const rule = fakeGritRule("adapter-base-standard-import", "adapter_base_standard_import");
    let observedRequest: HabitatProcessRequest | undefined;
    const fakeLayer = makeFakeGritProviderLayer((request) => {
      observedRequest = request;
      return makeHabitatCommandResult(request, {
        stderr: output(JSON.stringify({ paths: [], results: [] })),
      });
    });

    const results = await runGritRules([rule], {
      scanRoots: ["packages"],
      layer: fakeLayer,
      cacheMode: "fresh",
      requireObservableCacheStatus: true,
    });

    expect(observedRequest?.cachePolicy).toMatchObject({
      mode: "isolated",
      observableStatus: "fresh",
    });
    expect(observedRequest?.cachePolicy?.cacheDir).toContain("habitat-pattern-check-");
    expect(observedRequest?.env?.GRIT_CACHE_DIR).toBe(observedRequest?.cachePolicy?.cacheDir);
    expect(results.get(rule.id)).toEqual({ exitCode: 0, diagnostics: [] });
  });

  test("activates docs roots only for Grit rules that declare docs scan roots", () => {
    const sourceRule = fakeGritRule("domain-deep-import", "domain_deep_import", {
      scanRoots: ["mods/mod-swooper-maps/src/maps"],
    });
    const docsRule = fakeGritRule("docs-local-checkout-paths", "docs_local_checkout_paths", {
      lane: "advisory",
      scanRoots: ["docs"],
    });

    expect(discoverPatternScanRoots([sourceRule])).not.toContain("docs");
    const docsRoots = discoverPatternScanRoots([docsRule]);
    expect(docsRoots).toEqual(["docs"]);
    expect(discoverPatternScanRoots([sourceRule, docsRule])).toContain("docs");
    expect(discoverPatternScanRoots([sourceRule, docsRule])).toContain(
      "mods/mod-swooper-maps/src/maps"
    );
  });

  test("projects selected docs local-path findings from Grit rewrite dry-run output", async () => {
    const rule = fakeGritRule("docs-local-checkout-paths", "docs_local_checkout_paths", {
      lane: "advisory",
      scanRoots: ["docs"],
    });
    let observedRequest: HabitatProcessRequest | undefined;
    const fakeLayer = makeFakeGritProviderLayer((request) => {
      observedRequest = request;
      return makeHabitatCommandResult(request, {
        stdout: output(`docs/PROCESS.md
    -See \`/Users/alice/dev/repo/docs/PROCESS.md\`.
    +See \`docs/PROCESS.md\`.

docs/NOOP.md

Processed 1 files and found 1 matches
`),
      });
    });

    const results = await runGritRules([rule], { layer: fakeLayer });

    expect(observedRequest?.argv.slice(0, 2)).toEqual([
      "apply",
      ".habitat/patterns/apply/docs_local_checkout_paths_rewrite.md",
    ]);
    expect(observedRequest?.argv).toContain("docs");
    expect(observedRequest?.argv.slice(-4)).toEqual([
      "--dry-run",
      "--force",
      "--output",
      "standard",
    ]);
    expect(results.get(rule.id)?.diagnostics).toEqual([
      {
        ruleId: rule.id,
        path: "docs/PROCESS.md",
        message: rule.message,
        severity: "advisory",
        baselined: false,
      },
    ]);
  });

  test("projects docs local-path diagnostics as native diagnostic outcomes", async () => {
    const rule = fakeGritRule("docs-local-checkout-paths", "docs_local_checkout_paths", {
      lane: "advisory",
      scanRoots: ["docs"],
    });
    const fakeLayer = makeFakeGritProviderLayer((request) =>
      makeHabitatCommandResult(request, {
        stdout: output(`docs/PROCESS.md
    -See \`/Users/alice/dev/repo/docs/PROCESS.md\`.
    +See \`docs/PROCESS.md\`.

Processed 1 files and found 1 matches
`),
      })
    );

    const outcomes = await runGritDiagnosticOutcomes([rule], { layer: fakeLayer });

    const outcome = outcomes.get(rule.id);
    expect(outcome?.kind).toBe("findings");
    if (outcome?.kind !== "findings") return;
    expect(outcome.entry).toMatchObject({
      kind: "native-diagnostic",
      diagnosticIdentity: {
        kind: "native-rule",
        nativeDiagnosticIdentity: "docs-local-checkout-paths",
      },
    });
    expect(outcome.diagnostics).toEqual([
      {
        kind: "diagnostic-finding",
        ruleId: rule.id,
        path: "docs/PROCESS.md",
        message: rule.message,
        severity: "advisory",
        baselineState: "unbaselined",
      },
    ]);
    expect(diagnosticConsumerResultFromOutcome(outcome)).toMatchObject({
      kind: "findings",
      diagnosticIdentity: {
        kind: "native-rule",
        nativeDiagnosticIdentity: "docs-local-checkout-paths",
      },
      diagnostics: outcome.diagnostics,
    });
  });

  test("ignores docs dry-run files with host paths but no rewrite hunk", async () => {
    const rule = fakeGritRule("docs-local-checkout-paths", "docs_local_checkout_paths", {
      lane: "advisory",
      scanRoots: ["docs"],
    });
    const fakeLayer = makeFakeGritProviderLayer((request) =>
      makeHabitatCommandResult(request, {
        stdout: output(`docs/FALSE-POSITIVE.md

Processed 1 files and found 1 matches
`),
      })
    );

    const results = await runGritRules([rule], { layer: fakeLayer });

    expect(results.get(rule.id)).toEqual({ exitCode: 0, diagnostics: [] });
  });

  test("splits mixed source and docs Grit selections by output contract", async () => {
    const sourceRule = fakeGritRule("domain-deep-import", "domain_deep_import", {
      scanRoots: ["mods/mod-swooper-maps/src/maps"],
    });
    const docsRule = fakeGritRule("docs-local-checkout-paths", "docs_local_checkout_paths", {
      lane: "advisory",
      scanRoots: ["docs"],
    });
    const observedRequests: HabitatProcessRequest[] = [];
    const fakeLayer = makeFakeGritProviderLayer((request) => {
      observedRequests.push(request);
      if (request.argv[0] === "--json") {
        return makeHabitatCommandResult(request, {
          stderr: output(
            JSON.stringify({
              paths: ["mods/mod-swooper-maps/src/maps/demo.ts"],
              results: [
                {
                  local_name: "domain_deep_import",
                  path: "mods/mod-swooper-maps/src/maps/demo.ts",
                  start: { line: 4 },
                  extra: { message: "source finding" },
                },
              ],
            })
          ),
        });
      }
      return makeHabitatCommandResult(request, {
        stdout: output(`docs/PROCESS.md
    -See \`/Users/alice/dev/repo/docs/PROCESS.md\`.
    +See \`docs/PROCESS.md\`.

docs/NOOP.md

Processed 2 files and found 1 matches
`),
      });
    });

    const results = await runGritRules([sourceRule, docsRule], { layer: fakeLayer });

    expect(observedRequests[0]?.argv).toEqual([
      "--json",
      "check",
      "--level",
      "error",
      "mods/mod-swooper-maps/src/maps",
    ]);
    expect(observedRequests[1]?.argv.slice(0, 2)).toEqual([
      "apply",
      ".habitat/patterns/apply/docs_local_checkout_paths_rewrite.md",
    ]);
    expect(observedRequests[1]?.argv).toContain("docs");
    expect(observedRequests[1]?.argv.slice(-4)).toEqual([
      "--dry-run",
      "--force",
      "--output",
      "standard",
    ]);
    expect(results.get(sourceRule.id)?.diagnostics[0]).toMatchObject({
      ruleId: sourceRule.id,
      path: "mods/mod-swooper-maps/src/maps/demo.ts",
      message: "source finding",
    });
    expect(results.get(docsRule.id)?.diagnostics[0]).toMatchObject({
      ruleId: docsRule.id,
      path: "docs/PROCESS.md",
      severity: "advisory",
    });
  });

  test("splits diagnostic outcomes for mixed source and docs text selections", async () => {
    const sourceRule = fakeGritRule("domain-deep-import", "domain_deep_import", {
      scanRoots: ["packages"],
    });
    const docsRule = fakeGritRule("docs-policy", "docs_policy", {
      lane: "advisory",
      scanRoots: ["docs/PROCESS.md"],
    });
    const observedRequests: HabitatProcessRequest[] = [];
    const fakeLayer = makeFakeGritProviderLayer((request) => {
      observedRequests.push(request);
      if (request.argv[0] === "--json") {
        return makeHabitatCommandResult(request, {
          stderr: output(
            JSON.stringify({
              paths: ["packages/example/src/demo.ts"],
              results: [
                {
                  local_name: "domain_deep_import",
                  path: "packages/example/src/demo.ts",
                  start: { line: 4 },
                  extra: { message: "source finding" },
                },
              ],
            })
          ),
        });
      }
      return makeHabitatCommandResult(request, {
        stdout: output(`docs/PROCESS.md
  3:2    match    Docs finding.    docs_policy
`),
      });
    });

    const outcomes = await runGritDiagnosticOutcomes([sourceRule, docsRule], {
      layer: fakeLayer,
    });

    expect(observedRequests.map((request) => request.argv[0])).toEqual(["--json", "check"]);
    expect(observedRequests[0]?.scanRoots).toEqual(["packages"]);
    expect(observedRequests[1]?.scanRoots).toEqual(["docs/PROCESS.md"]);
    expect(outcomes.get(sourceRule.id)?.kind).toBe("findings");
    expect(outcomes.get(docsRule.id)?.kind).toBe("findings");
  });

  test("parses Grit text output by reported path, position, and pattern id", () => {
    const parsed = parseGritCheckTextOutput(
      commandResult({
        exitCode: 1,
        stdout: `docs/PROCESS.md
  3:2    match    Replace local absolute docs paths with durable repo-relative docs paths.    docs_local_checkout_paths
`,
      })
    );

    expect(parsed.kind).toBe("parsed");
    if (parsed.kind !== "parsed") return;
    expect(parsed.report.results).toEqual([
      {
        local_name: "docs_local_checkout_paths",
        path: "docs/PROCESS.md",
        start: { line: 3, col: 2 },
      },
    ]);
  });

  test("fails paths that require observable cache provenance when status is unknown", async () => {
    const rule = fakeGritRule("adapter-base-standard-import", "adapter_base_standard_import");
    const fakeLayer = makeFakeGritProviderLayer((request) =>
      makeHabitatCommandResult(request, {
        cachePolicy: {
          mode: request.cachePolicy?.mode ?? "isolated",
          cacheDir: request.cachePolicy?.cacheDir,
          observableStatus: "unknown",
        },
        stderr: output(JSON.stringify({ paths: [], results: [] })),
      })
    );

    const results = await runGritRules([rule], {
      scanRoots: ["packages"],
      layer: fakeLayer,
      requireObservableCacheStatus: true,
    });

    expect(results.get(rule.id)?.exitCode).toBe(1);
    expect(results.get(rule.id)?.diagnostics[0]?.message).toContain("GritCacheProvenanceMissing");
  });

  test("surfaces missing cache provenance as a diagnostic outcome", async () => {
    const rule = fakeGritRule("adapter-base-standard-import", "adapter_base_standard_import");
    const fakeLayer = makeFakeGritProviderLayer((request) =>
      makeHabitatCommandResult(request, {
        cachePolicy: {
          mode: request.cachePolicy?.mode ?? "isolated",
          cacheDir: request.cachePolicy?.cacheDir,
          observableStatus: "unknown",
        },
        stderr: output(JSON.stringify({ paths: [], results: [] })),
      })
    );

    const outcomes = await runGritDiagnosticOutcomes([rule], {
      scanRoots: ["packages"],
      layer: fakeLayer,
      requireObservableCacheStatus: true,
    });

    const outcome = outcomes.get(rule.id);
    expect(outcome?.kind).toBe("cache-observation-missing");
    if (outcome?.kind !== "cache-observation-missing") return;
    expect(outcome.cache).toMatchObject({
      kind: "missing-required-observation",
      failure: "GritCacheProvenanceMissing",
    });
    expect(diagnosticConsumerResultFromOutcome(outcome)).toMatchObject({
      kind: "cache-observation-missing",
      failure: "GritCacheProvenanceMissing",
      detail: "Grit cache/fresh status is not observable for this command result.",
    });
  });

  test("renders diagnostic provider failures", () => {
    for (const kind of diagnosticProviderFailureKinds) {
      expect(renderDiagnosticProviderFailure(kind, "provider failure test")).toBe(
        `--- grit provider failure (${kind}) ---\nprovider failure test`
      );
    }
  });
});

function commandResult(options: { stdout?: string; stderr?: string; exitCode?: number } = {}) {
  return makeHabitatCommandResult(
    {
      commandId: "parser-test",
      kind: "pattern-check",
      executable: "grit",
      argv: ["--json", "check"],
      cwd: repoRoot,
    },
    {
      exit: { code: options.exitCode ?? 0, signal: null, interrupted: false },
      stdout: output(options.stdout ?? ""),
      stderr: output(options.stderr ?? ""),
    }
  );
}

function output(text: string): OutputCapture {
  return {
    text,
    truncated: false,
    sha256: "test",
    bytes: Buffer.byteLength(text, "utf8"),
  };
}

function fakeExistingScanRoots(
  existingRoots: readonly string[]
): (absolutePath: string) => boolean {
  const roots = new Set(existingRoots.map(toRepoRelative));
  return (absolutePath) => roots.has(toRepoRelative(absolutePath));
}

function fakeGritRule(
  id: string,
  pattern: string,
  overrides: Partial<RuleSourceFacts> = {}
): RuleSourceFacts {
  return {
    id,
    patternName: pattern,
    lane: "enforced",
    message: "test rule",
    scanRoots: ["packages"],
    ...overrides,
  };
}
