import type { RuleDiagnosticExecutionResult } from "@habitat/cli/resources/rule-diagnostics/index";
import { makeGritRuleFixPlanningService } from "@habitat/cli/resources/rule-diagnostics/providers/grit/fix-planning";
import type { RuleFactsCatalog, RuleFixFacts } from "@habitat/cli/service/model/rules/index";
import { Effect, Match, Option } from "effect";
import { describe, expect, test, vi } from "vitest";
import { makeTestRuleFacts } from "../support/habitat-service-deps";

describe("RuleFixPlanning resource", () => {
  test("plans omitted, one, and first-seen unique multi-rule demands in order", async () => {
    const facts = factsWithFixIds(makeTestRuleFacts(), ["first", "second"]);
    const admittedIds = facts.fix.map(({ id }) => id);
    const calls: string[] = [];
    const service = makeGritRuleFixPlanningService(facts, (rules) =>
      recordExecutedRule(rules, calls)
    );

    const omitted = await Effect.runPromise(service.plan({}));
    const one = await Effect.runPromise(service.plan({ ruleIds: ["second"] }));
    const many = await Effect.runPromise(service.plan({ ruleIds: ["second", "first", "second"] }));

    expect(omitted).toMatchObject({
      kind: "completed",
      results: admittedIds.map((ruleId) => ({ kind: "observed", ruleId })),
    });
    expect(one).toMatchObject({
      kind: "completed",
      results: [{ kind: "observed", ruleId: "second" }],
    });
    expect(many).toMatchObject({
      kind: "completed",
      results: [
        { kind: "observed", ruleId: "second" },
        { kind: "observed", ruleId: "first" },
      ],
    });
    expect(calls).toEqual(["first", "second", "second", "second", "first"]);
  });

  test.each([
    ["unknown", ["unknown-rule"]],
    ["unadmitted", undefined],
    ["mixed", undefined],
  ])("refuses %s explicit selection atomically before provider execution", async (kind, ids) => {
    const facts = makeTestRuleFacts();
    const admitted = facts.fix[0];
    const unadmitted = facts.selector.find(({ id }) => !facts.fix.some((fix) => fix.id === id));
    if (!admitted || !unadmitted) throw new Error("expected admitted and unadmitted fixture rules");
    const ruleIds = selectionFixture(kind, ids, admitted.id, unadmitted.id);
    const run = vi.fn(() => Effect.succeed(new Map<string, RuleDiagnosticExecutionResult>()));
    const service = makeGritRuleFixPlanningService(facts, run);
    const [firstRuleId, ...remainingRuleIds] = ruleIds;
    if (!firstRuleId) throw new Error("expected a nonempty selection fixture");

    const result = await Effect.runPromise(
      service.plan({ ruleIds: [firstRuleId, ...remainingRuleIds] })
    );

    expect(result).toEqual({
      kind: "selection-refused",
      unknownRuleIds: expectedUnknownRuleIds(kind),
      unadmittedRuleIds: expectedUnadmittedRuleIds(kind, unadmitted.id),
    });
    expect(run).not.toHaveBeenCalled();
  });

  test("maps every provider terminal state and treats findings as successful observations", async () => {
    const base = makeTestRuleFacts();
    const facts = factsWithFixIds(base, ["findings", "not-applicable", "failed", "refused"]);
    const service = makeGritRuleFixPlanningService(facts, terminalResultForSelectedRule);

    const result = await Effect.runPromise(service.plan({}));

    expect(result).toEqual({
      kind: "completed",
      results: [
        { kind: "observed", ruleId: "findings", affectedPaths: ["a.ts", "z.ts"] },
        {
          kind: "not-applicable",
          ruleId: "not-applicable",
          reason: "no-matched-scan-roots",
        },
        {
          kind: "provider-failed",
          ruleId: "failed",
          failure: "DiagnosticProviderParseFailed",
          detail: "bad output",
        },
        {
          kind: "scope-refused",
          ruleId: "refused",
          decision: { kind: "refused", reason: "missing", root: "missing" },
          detail: "missing root",
        },
      ],
    });
  });

  test("fails closed when the provider omits a selected rule result", async () => {
    const facts = makeTestRuleFacts();
    const selected = facts.fix[0];
    if (!selected) throw new Error("expected an admitted fixture rule");
    const service = makeGritRuleFixPlanningService(facts, () => Effect.succeed(new Map()));

    const result = await Effect.runPromise(service.plan({ ruleIds: [selected.id] }));

    expect(result).toEqual({
      kind: "completed",
      results: [
        {
          kind: "provider-failed",
          ruleId: selected.id,
          failure: "DiagnosticProviderContractViolation",
          detail: `Fix planning provider returned no result for rule '${selected.id}'.`,
        },
      ],
    });
  });

  test("completes without provider execution when no rule admits planning", async () => {
    const base = makeTestRuleFacts();
    const facts = { ...base, fix: [] } satisfies RuleFactsCatalog;
    const run = vi.fn(() => Effect.succeed(new Map<string, RuleDiagnosticExecutionResult>()));

    const result = await Effect.runPromise(makeGritRuleFixPlanningService(facts, run).plan({}));

    expect(result).toEqual({ kind: "completed", results: [] });
    expect(run).not.toHaveBeenCalled();
  });
});

function selectionFixture(
  kind: string,
  ids: readonly string[] | undefined,
  admittedId: string,
  unadmittedId: string
): readonly string[] {
  return Match.value(ids).pipe(
    Match.when(undefined, () => defaultSelectionFixture(kind, admittedId, unadmittedId)),
    Match.orElse((selected) => selected)
  );
}

function defaultSelectionFixture(
  kind: string,
  admittedId: string,
  unadmittedId: string
): readonly string[] {
  return Match.value(kind).pipe(
    Match.when("unadmitted", () => [unadmittedId]),
    Match.orElse(() => [admittedId, "unknown-rule", unadmittedId, admittedId])
  );
}

function expectedUnknownRuleIds(kind: string): readonly string[] {
  return Match.value(kind).pipe(
    Match.when("unadmitted", () => []),
    Match.orElse(() => ["unknown-rule"])
  );
}

function expectedUnadmittedRuleIds(kind: string, unadmittedId: string): readonly string[] {
  return Match.value(kind).pipe(
    Match.when("unknown", () => []),
    Match.orElse(() => [unadmittedId])
  );
}

function recordExecutedRule(rules: readonly { readonly id: string }[], calls: string[]) {
  const rule = Option.getOrThrow(Option.fromNullable(rules[0]));
  calls.push(rule.id);
  return Effect.succeed(new Map([[rule.id, executed()]]));
}

function terminalResultForSelectedRule(rules: readonly { readonly id: string }[]) {
  const rule = Option.getOrThrow(Option.fromNullable(rules[0]));
  return Effect.succeed(new Map([[rule.id, terminalResult(rule.id)]]));
}

function factsWithFixIds(base: RuleFactsCatalog, ids: readonly string[]): RuleFactsCatalog {
  const fixTemplate = base.fix[0];
  const selectorTemplate = base.selector.find(({ id }) => id === fixTemplate?.id);
  if (!fixTemplate || !selectorTemplate) throw new Error("expected admitted fixture facts");
  const fix = ids.map(
    (id): RuleFixFacts => ({
      ...fixTemplate,
      id,
      scanRoots: [...fixTemplate.scanRoots],
      pathCoverage: fixTemplate.pathCoverage.map((coverage) => ({ ...coverage })),
      fix: { ...fixTemplate.fix },
    })
  );
  return {
    ...base,
    fix,
    selector: [
      ...base.selector.filter(({ id }) => !base.fix.some((candidate) => candidate.id === id)),
      ...ids.map((id) => ({ ...selectorTemplate, id })),
    ],
  };
}

function terminalResult(ruleId: string): RuleDiagnosticExecutionResult {
  return Match.value(ruleId).pipe(
    Match.when("findings", () => ({
      kind: "executed",
      result: {
        exitCode: 1,
        diagnostics: [
          diagnostic(ruleId, "z.ts"),
          diagnostic(ruleId, "a.ts"),
          diagnostic(ruleId, "z.ts"),
        ],
      },
      durationMs: 1,
    })),
    Match.when("not-applicable", () => ({
      kind: "not-applicable",
      reason: "no-matched-scan-roots",
      durationMs: 1,
    })),
    Match.when("failed", () => ({
      kind: "failed",
      failure: "DiagnosticProviderParseFailed",
      detail: "bad output",
      diagnostics: [diagnostic(ruleId, ".")],
      durationMs: 1,
    })),
    Match.orElse(() => ({
      kind: "refused",
      decision: { kind: "refused", reason: "missing", root: "missing" },
      detail: "missing root",
      durationMs: 1,
    }))
  );
}

function executed(): RuleDiagnosticExecutionResult {
  return { kind: "executed", result: { exitCode: 0, diagnostics: [] }, durationMs: 1 };
}

function diagnostic(ruleId: string, path: string) {
  return {
    ruleId,
    path,
    message: "fixture",
    severity: "error" as const,
    baselined: false,
  };
}
