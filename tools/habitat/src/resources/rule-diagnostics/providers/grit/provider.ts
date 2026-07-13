import { FileSystem } from "@effect/platform";
import { RuleFixPlanning } from "@habitat/cli/resources/rule-fix-planning/index";
import { RuleFacts, type RuleGritFacts } from "@habitat/cli/service/model/rules/index";
import { Effect, Layer } from "effect";
import { RuleDiagnostics } from "../../resource.js";
import { makeGritCommandService } from "./command.js";
import { makeGritRuleFixPlanningService } from "./fix-planning.js";
import { runGritRulesEffect } from "./runner.js";
import { makeRuleDiagnosticsService } from "./service.js";

export function makeGritRuleDiagnosticsLayer(repoRoot: string) {
  return Layer.effect(
    RuleDiagnostics,
    Effect.gen(function* () {
      const facts = yield* RuleFacts;
      const grit = yield* makeGritCommandService(repoRoot);
      const fs = yield* FileSystem.FileSystem;
      const runGritRules = (
        selectedRules: readonly RuleGritFacts[],
        options: {
          readonly repoRoot: string;
          readonly scanRoots?: readonly string[];
        }
      ) =>
        runGritRulesEffect(selectedRules, { ...options, grit }).pipe(
          Effect.provideService(FileSystem.FileSystem, fs)
        );
      return makeRuleDiagnosticsService(repoRoot, facts, runGritRules);
    })
  );
}

export function makeGritRuleFixPlanningLayer(repoRoot: string) {
  return Layer.effect(
    RuleFixPlanning,
    Effect.gen(function* () {
      const facts = yield* RuleFacts;
      const grit = yield* makeGritCommandService(repoRoot);
      const fs = yield* FileSystem.FileSystem;
      const runGritRules = (selectedRules: readonly RuleGritFacts[]) =>
        runGritRulesEffect(selectedRules, { repoRoot, grit }).pipe(
          Effect.provideService(FileSystem.FileSystem, fs)
        );
      return makeGritRuleFixPlanningService(facts, runGritRules);
    })
  );
}
