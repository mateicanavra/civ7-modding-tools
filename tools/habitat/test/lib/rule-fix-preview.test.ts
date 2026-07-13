import { makeGritRuleFixPreviewService } from "@habitat/cli/resources/rule-diagnostics/providers/grit/fix-preview";
import type { RuleFixPreviewRuleResult } from "@habitat/cli/resources/rule-fix-preview/index";
import type { RuleFactsCatalog, RuleFixFacts } from "@habitat/cli/service/model/rules/index";
import { Effect } from "effect";
import { describe, expect, test, vi } from "vitest";
import { makeTestRuleFacts } from "../support/habitat-service-deps";

describe("RuleFixPreview resource", () => {
  test("previews omitted, one, and first-seen unique selections in order", async () => {
    const facts = factsWithFixIds(makeTestRuleFacts(), ["first", "second"]);
    const calls: string[] = [];
    const service = makeGritRuleFixPreviewService(facts, (rule) => {
      calls.push(rule.id);
      return Effect.succeed(previewed(rule.id));
    });

    expect(await Effect.runPromise(service.preview({}))).toMatchObject({
      kind: "completed",
      results: [previewed("first"), previewed("second")],
    });
    expect(await Effect.runPromise(service.preview({ ruleIds: ["second"] }))).toMatchObject({
      kind: "completed",
      results: [previewed("second")],
    });
    expect(
      await Effect.runPromise(service.preview({ ruleIds: ["second", "first", "second"] }))
    ).toMatchObject({ kind: "completed", results: [previewed("second"), previewed("first")] });
    expect(calls).toEqual(["first", "second", "second", "second", "first"]);
  });

  test("refuses invalid explicit selection atomically", async () => {
    const facts = makeTestRuleFacts();
    const admitted = facts.fix[0];
    const unadmitted = facts.selector.find(({ id }) => !facts.fix.some((fix) => fix.id === id));
    if (!admitted || !unadmitted) throw new Error("expected selection fixtures");
    const run = vi.fn((rule: RuleFixFacts) => Effect.succeed(previewed(rule.id)));
    const service = makeGritRuleFixPreviewService(facts, run);

    expect(
      await Effect.runPromise(
        service.preview({ ruleIds: [admitted.id, "unknown", unadmitted.id, admitted.id] })
      )
    ).toEqual({
      kind: "selection-refused",
      refusals: [
        { ruleId: "unknown", reason: "unknown" },
        { ruleId: unadmitted.id, reason: "fix-not-admitted" },
      ],
    });
    expect(run).not.toHaveBeenCalled();
  });

  test("preserves every per-rule terminal row including authority refusal", async () => {
    const facts = factsWithFixIds(makeTestRuleFacts(), ["ok", "authority", "failed"]);
    const rows: Record<string, RuleFixPreviewRuleResult> = {
      ok: previewed("ok"),
      authority: {
        kind: "authority-refused",
        ruleId: "authority",
        undeclaredEffects: ["modify", "rename"],
      },
      failed: {
        kind: "provider-failed",
        ruleId: "failed",
        failure: "DiagnosticOutputIncomplete",
        detail: "bad output",
      },
    };
    const service = makeGritRuleFixPreviewService(facts, (rule) =>
      Effect.succeed(rows[rule.id] ?? previewed(rule.id))
    );

    expect(await Effect.runPromise(service.preview({}))).toEqual({
      kind: "completed",
      results: [rows.ok, rows.authority, rows.failed],
    });
  });

  test("completes without provider execution when no rule admits preview", async () => {
    const base = makeTestRuleFacts();
    const facts = { ...base, fix: [] } satisfies RuleFactsCatalog;
    const run = vi.fn((rule: RuleFixFacts) => Effect.succeed(previewed(rule.id)));
    expect(await Effect.runPromise(makeGritRuleFixPreviewService(facts, run).preview({}))).toEqual({
      kind: "completed",
      results: [],
    });
    expect(run).not.toHaveBeenCalled();
  });
});

function previewed(ruleId: string): RuleFixPreviewRuleResult {
  return { kind: "previewed", ruleId, impacts: [] };
}

function factsWithFixIds(base: RuleFactsCatalog, ids: readonly string[]): RuleFactsCatalog {
  const fixTemplate = base.fix[0];
  const selectorTemplate = base.selector.find(({ id }) => id === fixTemplate?.id);
  if (!fixTemplate || !selectorTemplate) throw new Error("expected admitted fixture facts");
  return {
    ...base,
    fix: ids.map((id) => ({
      ...fixTemplate,
      id,
      scanRoots: [...fixTemplate.scanRoots],
      pathCoverage: fixTemplate.pathCoverage.map((coverage) => ({ ...coverage })),
      fix: { ...fixTemplate.fix, effects: [...fixTemplate.fix.effects] },
    })),
    selector: [
      ...base.selector.filter(({ id }) => !base.fix.some((candidate) => candidate.id === id)),
      ...ids.map((id) => ({ ...selectorTemplate, id })),
    ],
  };
}
