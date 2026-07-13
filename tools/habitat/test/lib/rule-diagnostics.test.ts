import { repoRoot } from "@habitat/cli/resources/paths";
import {
  type RuleDiagnosticExecutionResult,
  RuleDiagnostics,
} from "@habitat/cli/resources/rule-diagnostics/index";
import { makeRuleDiagnosticsService } from "@habitat/cli/resources/rule-diagnostics/providers/grit/service";
import {
  type RuleDiagnosticFacts,
  type RuleFactsCatalog,
} from "@habitat/cli/service/model/rules/index";
import { Effect, Layer } from "effect";
import { describe, expect, test } from "vitest";
import { makeTestRuleFacts } from "../support/habitat-service-deps";

describe("RuleDiagnostics resource selection", () => {
  test("translates capability scope without exposing provider-shaped demand", async () => {
    const facts = makeTestRuleFacts();
    const selected = facts.grit[0];
    if (!selected) throw new Error("expected at least one registered diagnostic rule");
    const observed: Array<{
      readonly ids: string[];
      readonly scanRoots: readonly string[] | undefined;
    }> = [];
    const layer = selectorLayer(facts, (rules, options) => {
      observed.push({
        ids: rules.map(({ id }) => id),
        scanRoots: options.scanRoots,
      });
      return Effect.succeed(
        new Map(rules.map((rule) => [rule.id, successfulExecution()] as const))
      );
    });

    const results = await Effect.runPromise(
      RuleDiagnostics.pipe(
        Effect.flatMap((diagnostics) =>
          Effect.all([
            diagnostics.runRules({ ruleIds: [selected.id], scope: { kind: "authored" } }),
            diagnostics.runRules({ ruleIds: [selected.id], scope: { kind: "paths", paths: [] } }),
            diagnostics.runRules({
              ruleIds: [selected.id],
              scope: { kind: "paths", paths: ["tools/habitat/src/index.ts"] },
            }),
          ])
        ),
        Effect.provide(layer)
      )
    );

    expect(observed).toEqual([
      { ids: [selected.id], scanRoots: undefined },
      { ids: [selected.id], scanRoots: [] },
      { ids: [selected.id], scanRoots: ["tools/habitat/src/index.ts"] },
    ]);
    expect(results.map((result) => [...result.keys()])).toEqual([
      [selected.id],
      [selected.id],
      [selected.id],
    ]);
  });

  test("snapshots selected rule ids and paths before effect execution", async () => {
    const facts = makeTestRuleFacts();
    const [selected, replacement] = facts.grit;
    if (!selected || !replacement)
      throw new Error("expected at least two registered diagnostic rules");
    const observed: Array<{
      readonly ids: string[];
      readonly scanRoots: readonly string[] | undefined;
    }> = [];
    const service = makeRuleDiagnosticsService(repoRoot, facts, (rules, options) => {
      observed.push({
        ids: rules.map(({ id }) => id),
        scanRoots: options.scanRoots,
      });
      return Effect.succeed(
        new Map(rules.map((rule) => [rule.id, successfulExecution()] as const))
      );
    });
    const ruleIds: [string, ...string[]] = [selected.id];
    const paths = ["tools/habitat/src/index.ts"];
    const execution = service.runRules({
      ruleIds,
      scope: { kind: "paths", paths },
    });

    ruleIds[0] = replacement.id;
    ruleIds.push(replacement.id);
    paths[0] = "tools/habitat/src/runtime/layers.ts";

    const results = await Effect.runPromise(execution);

    expect(observed).toEqual([{ ids: [selected.id], scanRoots: ["tools/habitat/src/index.ts"] }]);
    expect([...results.keys()]).toEqual([selected.id]);
  });

  test("deduplicates demand and fails closed for every unfulfilled rule id", async () => {
    const baseFacts = makeTestRuleFacts();
    const bound = baseFacts.grit[0];
    if (!bound) throw new Error("expected at least one registered diagnostic rule");
    const unbound = {
      id: "unbound-diagnostic-rule",
      lane: "advisory",
      message: "The diagnostic rule must have one provider binding.",
      pathCoverage: [{ kind: "project-owner" }],
      scanRoots: ["tools/habitat"],
    } satisfies RuleDiagnosticFacts;
    const facts = {
      ...baseFacts,
      diagnostic: [...baseFacts.diagnostic, unbound],
    } satisfies RuleFactsCatalog;
    const selectedIds: string[][] = [];
    const layer = selectorLayer(facts, (rules) => {
      selectedIds.push(rules.map(({ id }) => id));
      return Effect.succeed(new Map([[unbound.id, successfulExecution()]]));
    });

    const results = await Effect.runPromise(
      RuleDiagnostics.pipe(
        Effect.flatMap((diagnostics) =>
          diagnostics.runRules({
            ruleIds: [bound.id, bound.id, unbound.id],
            scope: { kind: "authored" },
          })
        ),
        Effect.provide(layer)
      )
    );

    expect(selectedIds).toEqual([[bound.id]]);
    expect([...results.keys()]).toEqual([bound.id, unbound.id]);
    expect(results.get(bound.id)).toMatchObject({
      kind: "failed",
      failure: "DiagnosticProviderContractViolation",
      detail: `Diagnostic provider returned no result for rule '${bound.id}'.`,
      diagnostics: [{ ruleId: bound.id }],
    });
    expect(results.get(unbound.id)).toMatchObject({
      kind: "failed",
      failure: "DiagnosticProviderContractViolation",
      detail: `Diagnostic rule '${unbound.id}' has no provider binding.`,
      diagnostics: [{ ruleId: unbound.id, severity: "advisory" }],
    });
  });
});

function selectorLayer(
  facts: RuleFactsCatalog,
  runRules: Parameters<typeof makeRuleDiagnosticsService>[2]
) {
  return Layer.succeed(RuleDiagnostics, makeRuleDiagnosticsService(repoRoot, facts, runRules));
}

function successfulExecution(): RuleDiagnosticExecutionResult {
  return {
    kind: "executed",
    result: { exitCode: 0, diagnostics: [] },
    durationMs: 1,
  };
}
