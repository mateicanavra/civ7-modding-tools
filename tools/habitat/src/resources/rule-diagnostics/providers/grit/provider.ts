import { FileSystem } from "@effect/platform";
import { RuleFixPreview } from "@habitat/cli/resources/rule-fix-preview/index";
import { RuleFacts, type RuleGritFacts } from "@habitat/cli/service/model/rules/index";
import { Effect, Layer } from "effect";
import { RuleDiagnostics } from "../../resource.js";
import { makeGritCommandService } from "./command.js";
import { makeGritRuleFixPreviewRunner, makeGritRuleFixPreviewService } from "./fix-preview.js";
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

export function makeGritRuleFixPreviewLayer(repoRoot: string) {
  return Layer.effect(
    RuleFixPreview,
    Effect.gen(function* () {
      const facts = yield* RuleFacts;
      const grit = yield* makeGritCommandService(repoRoot);
      const fs = yield* FileSystem.FileSystem;
      return makeGritRuleFixPreviewService(
        facts,
        makeGritRuleFixPreviewRunner({ repoRoot, grit, fs })
      );
    })
  );
}
