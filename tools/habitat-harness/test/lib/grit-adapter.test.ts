import { Value } from "typebox/value";
import { describe, expect, test } from "vitest";
import {
  parseGritCheckOutput,
  parseGritCheckTextOutput,
} from "../../src/adapters/grit/output/index.js";
import { projectGritResults } from "../../src/adapters/grit/projection.js";
import { decideGritScanRoots } from "../../src/adapters/grit/scan-roots/index.js";
import {
  DiagnosticCatalogEntrySchema,
  diagnosticAdapterFailureKinds,
  diagnosticCacheRequirementForGritCheck,
  diagnosticCatalogEntryFromNativeRule,
  diagnosticCatalogEntryFromRuleGritFacts,
  diagnosticConsumerProjectionFromOutcome,
  GritDiagnosticCatalogEntrySchema,
  NativeDiagnosticCatalogEntrySchema,
  observedNativeDiagnosticIdentity,
  renderDiagnosticAdapterFailure,
} from "../../src/lib/diagnostic-catalog/index.js";
import {
  decideEffectiveGritScanRoots,
  discoverGritScanRoots,
  effectiveGritScanRoots,
  runGritDiagnosticOutcomes,
  runGritRules,
  validateScanRoots,
} from "../../src/lib/grit.js";
import {
  type HabitatProcessRequest,
  makeFakeHabitatProcessLayer,
  makeHabitatCommandResult,
  type OutputCapture,
} from "../../src/lib/habitat-process.js";
import { repoRoot } from "../../src/lib/paths.js";
import type { RuleGritFacts } from "../../src/rules/registry/index.js";

describe("Grit check adapter parser and projection", () => {
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
      limitations: ["workspace-cache-not-fresh-observation"],
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
    expect(parsed.request.limitations).toEqual([]);
  });

  test("fails closed for no JSON, malformed JSON, and wrapper text", () => {
    const noJson = parseGritCheckOutput(commandResult());
    expect(noJson.kind).toBe("adapter-failed");
    expect(noJson.kind === "adapter-failed" ? noJson.failure : "unexpected").toBe("GritNoJson");

    const malformed = parseGritCheckOutput(commandResult({ stderr: '{"results":' }));
    expect(malformed.kind).toBe("adapter-failed");
    expect(malformed.kind === "adapter-failed" ? malformed.failure : "unexpected").toBe(
      "GritMalformedJson"
    );

    const wrapped = parseGritCheckOutput(commandResult({ stderr: 'prefix {"results":[]} suffix' }));
    expect(wrapped.kind).toBe("adapter-failed");
    expect(wrapped.kind === "adapter-failed" ? wrapped.failure : "unexpected").toBe(
      "GritMalformedJson"
    );
  });

  test("treats nonzero Grit exits as command failures before projection", () => {
    const failed = parseGritCheckOutput(
      commandResult({
        stderr: '{"paths":[],"results":[]}',
        exitCode: 2,
      })
    );

    expect(failed.kind).toBe("adapter-failed");
    expect(failed.kind === "adapter-failed" ? failed.failure : "unexpected").toBe(
      "GritCommandFailed"
    );
    expect(failed.parseStatus).toBe("unparsed");
  });

  test("treats truncated parser input as an adapter contract failure", () => {
    const truncated = parseGritCheckOutput(
      makeHabitatCommandResult(
        {
          commandId: "grit-parser-truncated",
          kind: "grit-check",
          executable: "grit",
          argv: ["--json", "check"],
          cwd: repoRoot,
        },
        {
          stderr: { text: '{"paths":[', truncated: true, sha256: "test", bytes: 10 },
        }
      )
    );

    expect(truncated.kind).toBe("adapter-failed");
    expect(truncated.kind === "adapter-failed" ? truncated.failure : "unexpected").toBe(
      "GritAdapterInternalContractViolation"
    );
  });

  test("distinguishes missing results from unexpected result shape", () => {
    const missingResults = parseGritCheckOutput(commandResult({ stderr: '{"paths":[]}' }));
    expect(missingResults.kind).toBe("adapter-failed");
    expect(missingResults.kind === "adapter-failed" ? missingResults.failure : "unexpected").toBe(
      "GritSchemaDrift"
    );

    const wrongShape = parseGritCheckOutput(
      commandResult({ stderr: '{"paths":[],"results":[{"local_name":5}]}' })
    );
    expect(wrongShape.kind).toBe("adapter-failed");
    expect(wrongShape.kind === "adapter-failed" ? wrongShape.failure : "unexpected").toBe(
      "GritUnexpectedResultShape"
    );
  });

  test("projects exact Grit pattern identities to Habitat rule ids", () => {
    const rule = fakeGritRule("grit-adapter-base-standard-import", "adapter_base_standard_import");
    const projected = projectGritResults([rule], {
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

    const result = projected.get(rule.id);
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
    const requested = fakeGritRule("grit-domain-deep-import", "domain_deep_import");
    const other = fakeGritRule("grit-adapter-base-standard-import", "adapter_base_standard_import");
    const projected = projectGritResults([requested, other], {
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
      projected.get(requested.id)?.diagnostics.map((diagnostic) => diagnostic.message)
    ).toEqual(["first domain finding", "duplicate domain finding"]);
    expect(projected.get(other.id)).toEqual({ exitCode: 0, diagnostics: [] });
  });

  test("keeps valid zero findings distinct from adapter failure", () => {
    const rule = fakeGritRule("grit-domain-deep-import", "domain_deep_import");
    const result = projectGritResults([rule], { paths: [], results: [] }).get(rule.id);

    expect(result).toEqual({ exitCode: 0, diagnostics: [] });
  });

  test("strict projection distinguishes missing and unexpected pattern identities", () => {
    const requested = fakeGritRule("grit-domain-deep-import", "domain_deep_import");
    const other = fakeGritRule("grit-adapter-base-standard-import", "adapter_base_standard_import");

    const missing = projectGritResults(
      [requested],
      { paths: [], results: [] },
      { requirePatternFinding: true }
    ).get(requested.id);
    expect(missing?.diagnostics[0]?.message).toContain("GritPatternProjectionMiss");

    const unexpected = projectGritResults(
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
    const rule = fakeGritRule("grit-domain-deep-import", "domain_deep_import");
    const projected = projectGritResults([rule], {
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

    expect(projected.get(rule.id)?.exitCode).toBe(1);
    expect(projected.get(rule.id)?.diagnostics[0]?.message).toContain(
      "GritUnexpectedDiagnosticIdentity"
    );
    expect(projected.get(rule.id)?.diagnostics[0]?.message).toContain(
      "local_name=domain_deep_import"
    );
  });

  test("rejects empty scan roots before command execution", async () => {
    const rule = fakeGritRule("grit-domain-deep-import", "domain_deep_import");
    const results = await runGritRules([rule], { scanRoots: [] });

    expect(results.get(rule.id)?.exitCode).toBe(1);
    expect(results.get(rule.id)?.diagnostics[0]?.message).toContain("GritEmptyScanRoots");
  });

  test("surfaces scan-root refusal as a diagnostic outcome", async () => {
    const rule = fakeGritRule("grit-domain-deep-import", "domain_deep_import");
    const outcomes = await runGritDiagnosticOutcomes([rule], { scanRoots: [] });

    const outcome = outcomes.get(rule.id);
    expect(outcome?.kind).toBe("scan-root-refused");
    if (outcome?.kind !== "scan-root-refused") return;
    expect(outcome.decision).toEqual({ kind: "refused", reason: "empty" });
    expect(diagnosticConsumerProjectionFromOutcome(outcome)).toMatchObject({
      kind: "scan-root-refused",
      decision: { kind: "refused", reason: "empty" },
      detail: "Grit scan roots are empty.",
    });
  });

  test("validates missing, outside, generated, protected, and approved scan roots", () => {
    expect(validateScanRoots(["packages"])).toBeNull();
    expect(validateScanRoots(["packages/mapgen-core/src"])).toBeNull();
    expect(validateScanRoots(["mods/mod-swooper-maps/test"])).toBeNull();
    expect(validateScanRoots(["missing-root"])).toContain("does not exist");
    expect(validateScanRoots(["../outside"])).toContain("outside the repo");
    expect(validateScanRoots(["mods/mod-swooper-maps/src/maps/generated"])).toContain(
      "generated output"
    );
    expect(validateScanRoots([".git"])).toContain("protected");
    expect(validateScanRoots(["docs/PROCESS.md"])).toContain("not approved");
    expect(validateScanRoots(["docs/PROCESS.md"], { allowDocsRoot: true })).toBeNull();
  });

  test("keeps scan-root refusal reasons as closed decisions", () => {
    expect(decideGritScanRoots([])).toEqual({ kind: "refused", reason: "empty" });
    expect(decideGritScanRoots(["../outside"])).toEqual({
      kind: "refused",
      reason: "outside-repo",
      root: "../outside",
    });
    expect(decideGritScanRoots(["missing-root"])).toEqual({
      kind: "refused",
      reason: "missing",
      root: "missing-root",
    });
    expect(decideGritScanRoots(["packages"])).toEqual({
      kind: "accepted",
      roots: ["packages"],
      source: "d2-rule-grit-facts",
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
    expect(entry.projectionContract).toEqual({
      kind: "native-rule-projection",
      identity: entry.diagnosticIdentity,
    });
    expect("patternIdentity" in entry.diagnosticIdentity).toBe(false);
  });

  test("validates diagnostic catalog branches with TypeBox-specific contracts", () => {
    const gritEntry = diagnosticCatalogEntryFromRuleGritFacts(
      fakeGritRule("grit-domain-deep-import", "domain_deep_import")
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
        projectionContract: gritEntry.projectionContract,
      })
    ).toBe(false);
    expect(observedNativeDiagnosticIdentity("docs-local-checkout-paths")).toEqual({
      kind: "observed-native-rule",
      observedNativeDiagnosticIdentity: "docs-local-checkout-paths",
      source: "native-habitat-rule",
    });
  });

  test("runs selected Grit rules through one argument-array command request", async () => {
    const rule = fakeGritRule("grit-adapter-base-standard-import", "adapter_base_standard_import");
    let observedRequest: HabitatProcessRequest | undefined;
    const fakeLayer = makeFakeHabitatProcessLayer((request) => {
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
      processLayer: fakeLayer,
    });

    expect(observedRequest).toMatchObject({
      executable: "grit",
      argv: ["--json", "check", "--level", "error", "packages"],
      cwd: repoRoot,
      scanRoots: ["packages"],
      cachePolicy: {
        mode: "isolated",
        observableStatus: "unknown",
      },
    });
    expect(observedRequest?.cachePolicy?.cacheDir).toBe(`${repoRoot}/.grit/cache`);
    expect(observedRequest?.env?.GRIT_CACHE_DIR).toBe(observedRequest?.cachePolicy?.cacheDir);
    expect(observedRequest?.env).toMatchObject({
      CLICOLOR: "0",
      FORCE_COLOR: "0",
      NO_COLOR: "1",
    });
    expect(results.get(rule.id)?.diagnostics[0]?.message).toBe("adapter finding");
  });

  test("fresh cache mode uses a scoped isolated cache with observable freshness", async () => {
    const rule = fakeGritRule("grit-adapter-base-standard-import", "adapter_base_standard_import");
    let observedRequest: HabitatProcessRequest | undefined;
    const fakeLayer = makeFakeHabitatProcessLayer((request) => {
      observedRequest = request;
      return makeHabitatCommandResult(request, {
        stderr: output(JSON.stringify({ paths: [], results: [] })),
      });
    });

    const results = await runGritRules([rule], {
      scanRoots: ["packages"],
      processLayer: fakeLayer,
      cacheMode: "fresh",
      requireObservableCacheStatus: true,
    });

    expect(observedRequest?.cachePolicy).toMatchObject({
      mode: "isolated",
      observableStatus: "fresh",
    });
    expect(observedRequest?.cachePolicy?.cacheDir).toContain("habitat-grit-check-");
    expect(observedRequest?.env?.GRIT_CACHE_DIR).toBe(observedRequest?.cachePolicy?.cacheDir);
    expect(results.get(rule.id)).toEqual({ exitCode: 0, diagnostics: [] });
  });

  test("activates docs roots only for Grit rules that declare docs scan roots", () => {
    const sourceRule = fakeGritRule("grit-domain-deep-import", "domain_deep_import", {
      scanRoots: ["mods/mod-swooper-maps/src/maps"],
    });
    const docsRule = fakeGritRule("docs-local-checkout-paths", "docs_local_checkout_paths", {
      lane: "advisory",
      scanRoots: ["docs"],
    });

    expect(discoverGritScanRoots([sourceRule])).not.toContain("docs");
    const docsRoots = discoverGritScanRoots([docsRule]);
    expect(docsRoots.length).toBeGreaterThan(0);
    expect(docsRoots.every((root) => root.startsWith("docs/") && root.endsWith(".md"))).toBe(true);
    expect(docsRoots).toContain("docs/PROCESS.md");
    expect(discoverGritScanRoots([sourceRule, docsRule])).toContain("docs/PROCESS.md");
    expect(discoverGritScanRoots([sourceRule, docsRule])).toContain(
      "mods/mod-swooper-maps/src/maps"
    );
  });

  test("projects selected docs local-path findings from Grit rewrite dry-run output", async () => {
    const rule = fakeGritRule("docs-local-checkout-paths", "docs_local_checkout_paths", {
      lane: "advisory",
      scanRoots: ["docs"],
    });
    let observedRequest: HabitatProcessRequest | undefined;
    const fakeLayer = makeFakeHabitatProcessLayer((request) => {
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

    const results = await runGritRules([rule], { processLayer: fakeLayer });

    expect(observedRequest?.argv.slice(0, 2)).toEqual([
      "apply",
      ".grit/patterns/habitat/apply/docs_local_checkout_paths_rewrite.md",
    ]);
    expect(observedRequest?.argv).toContain("docs/PROCESS.md");
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
    const fakeLayer = makeFakeHabitatProcessLayer((request) =>
      makeHabitatCommandResult(request, {
        stdout: output(`docs/PROCESS.md
    -See \`/Users/alice/dev/repo/docs/PROCESS.md\`.
    +See \`docs/PROCESS.md\`.

Processed 1 files and found 1 matches
`),
      })
    );

    const outcomes = await runGritDiagnosticOutcomes([rule], { processLayer: fakeLayer });

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
    expect(diagnosticConsumerProjectionFromOutcome(outcome)).toMatchObject({
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
    const fakeLayer = makeFakeHabitatProcessLayer((request) =>
      makeHabitatCommandResult(request, {
        stdout: output(`docs/FALSE-POSITIVE.md

Processed 1 files and found 1 matches
`),
      })
    );

    const results = await runGritRules([rule], { processLayer: fakeLayer });

    expect(results.get(rule.id)).toEqual({ exitCode: 0, diagnostics: [] });
  });

  test("splits mixed source and docs Grit selections by output contract", async () => {
    const sourceRule = fakeGritRule("grit-domain-deep-import", "domain_deep_import", {
      scanRoots: [
        "packages",
        "apps/mapgen-studio/src",
        "mods/mod-swooper-maps/src/recipes",
        "mods/mod-swooper-maps/src/maps",
        "mods/mod-swooper-maps/src/domain",
      ],
    });
    const docsRule = fakeGritRule("docs-local-checkout-paths", "docs_local_checkout_paths", {
      lane: "advisory",
      scanRoots: ["docs"],
    });
    const observedRequests: HabitatProcessRequest[] = [];
    const fakeLayer = makeFakeHabitatProcessLayer((request) => {
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

    const results = await runGritRules([sourceRule, docsRule], { processLayer: fakeLayer });

    expect(observedRequests[0]?.argv).toEqual([
      "--json",
      "check",
      "--level",
      "error",
      "packages",
      "apps/mapgen-studio/src",
      "mods/mod-swooper-maps/src/recipes",
      "mods/mod-swooper-maps/src/maps",
      "mods/mod-swooper-maps/src/domain",
    ]);
    expect(observedRequests[1]?.argv.slice(0, 2)).toEqual([
      "apply",
      ".grit/patterns/habitat/apply/docs_local_checkout_paths_rewrite.md",
    ]);
    expect(observedRequests[1]?.argv).toContain("docs/PROCESS.md");
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
    const sourceRule = fakeGritRule("grit-domain-deep-import", "domain_deep_import", {
      scanRoots: ["packages"],
    });
    const docsRule = fakeGritRule("docs-policy", "docs_policy", {
      lane: "advisory",
      scanRoots: ["docs/PROCESS.md"],
    });
    const observedRequests: HabitatProcessRequest[] = [];
    const fakeLayer = makeFakeHabitatProcessLayer((request) => {
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
      processLayer: fakeLayer,
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
    const rule = fakeGritRule("grit-adapter-base-standard-import", "adapter_base_standard_import");
    const fakeLayer = makeFakeHabitatProcessLayer((request) =>
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
      processLayer: fakeLayer,
      requireObservableCacheStatus: true,
    });

    expect(results.get(rule.id)?.exitCode).toBe(1);
    expect(results.get(rule.id)?.diagnostics[0]?.message).toContain("GritCacheProvenanceMissing");
  });

  test("surfaces missing cache provenance as a diagnostic outcome", async () => {
    const rule = fakeGritRule("grit-adapter-base-standard-import", "adapter_base_standard_import");
    const fakeLayer = makeFakeHabitatProcessLayer((request) =>
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
      processLayer: fakeLayer,
      requireObservableCacheStatus: true,
    });

    const outcome = outcomes.get(rule.id);
    expect(outcome?.kind).toBe("cache-observation-missing");
    if (outcome?.kind !== "cache-observation-missing") return;
    expect(outcome.cache).toMatchObject({
      kind: "missing-required-observation",
      failure: "GritCacheProvenanceMissing",
    });
    expect(diagnosticConsumerProjectionFromOutcome(outcome)).toMatchObject({
      kind: "cache-observation-missing",
      failure: "GritCacheProvenanceMissing",
      detail: "Grit cache/fresh status is not observable for this command result.",
    });
  });

  test("activates ignored test roots only for rules that declare test expansion", async () => {
    const sourceRule = fakeGritRule("grit-domain-deep-import", "domain_deep_import", {
      scanRoots: ["mods/mod-swooper-maps/src/recipes"],
    });
    const testRule = fakeGritRule("grit-domain-deep-import-tests", "domain_deep_import_tests", {
      scanRoots: ["packages", "mods/mod-swooper-maps/src/recipes", "mods/mod-swooper-maps/test"],
      expandIgnoredTestDirectories: true,
    });

    expect(discoverGritScanRoots([sourceRule])).not.toContain("mods/mod-swooper-maps/test");
    expect(discoverGritScanRoots([testRule])).toContain("mods/mod-swooper-maps/test");

    const effectiveRoots = effectiveGritScanRoots(
      [testRule],
      ["packages", "mods/mod-swooper-maps/src/recipes", "mods/mod-swooper-maps/test"]
    );
    const decision = decideEffectiveGritScanRoots(
      [testRule],
      ["packages", "mods/mod-swooper-maps/src/recipes", "mods/mod-swooper-maps/test"]
    );
    expect(effectiveRoots).toContain("packages");
    expect(effectiveRoots).toContain("mods/mod-swooper-maps/src/recipes");
    expect(effectiveRoots).toContain("mods/mod-swooper-maps/test/hydrology-ocean-geometry.test.ts");
    expect(effectiveRoots).toContain("packages/civ7-map-policy/test/map-policy.test.ts");
    expect(effectiveRoots).not.toContain("mods/mod-swooper-maps/test");
    expect(decision).toMatchObject({
      kind: "expanded-test-files",
      requestedRoots: [
        "packages",
        "mods/mod-swooper-maps/src/recipes",
        "mods/mod-swooper-maps/test",
      ],
    });
    expect(decision.kind === "expanded-test-files" && decision.effectiveRoots).toEqual(
      effectiveRoots
    );

    let observedRequest: HabitatProcessRequest | undefined;
    const fakeLayer = makeFakeHabitatProcessLayer((request) => {
      observedRequest = request;
      return makeHabitatCommandResult(request, {
        stderr: output(
          JSON.stringify({
            paths: ["mods/mod-swooper-maps/test/domain/public-surface.test.ts"],
            results: [
              {
                local_name: "domain_deep_import_tests",
                path: "mods/mod-swooper-maps/test/domain/public-surface.test.ts",
                start: { line: 1 },
                extra: { message: "test deep import" },
              },
            ],
          })
        ),
      });
    });

    const results = await runGritRules([sourceRule, testRule], {
      scanRoots: ["packages", "mods/mod-swooper-maps/src/recipes", "mods/mod-swooper-maps/test"],
      processLayer: fakeLayer,
    });

    expect(observedRequest?.scanRoots).toEqual(effectiveRoots);
    expect(observedRequest?.argv).toEqual([
      "--json",
      "check",
      "--level",
      "error",
      ...effectiveRoots,
    ]);
    expect(results.get(testRule.id)?.diagnostics).toEqual([
      {
        ruleId: testRule.id,
        path: "mods/mod-swooper-maps/test/domain/public-surface.test.ts",
        line: 1,
        message: "test deep import",
        severity: "error",
        baselined: false,
      },
    ]);
  });

  test("renders diagnostic adapter failures", () => {
    for (const kind of diagnosticAdapterFailureKinds) {
      expect(renderDiagnosticAdapterFailure(kind, "adapter failure test")).toBe(
        `--- grit adapter failure (${kind}) ---\nadapter failure test`
      );
    }
  });
});

function commandResult(options: { stdout?: string; stderr?: string; exitCode?: number } = {}) {
  return makeHabitatCommandResult(
    {
      commandId: "grit-parser-test",
      kind: "grit-check",
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

function fakeGritRule(
  id: string,
  pattern: string,
  overrides: Partial<RuleGritFacts> = {}
): RuleGritFacts {
  return {
    id,
    gritPattern: pattern,
    lane: "enforced",
    message: "test rule",
    scanRoots: ["packages"],
    ...overrides,
  };
}
