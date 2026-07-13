import { FileSystem } from "@effect/platform";
import { RuleFacts, type RuleGritFacts } from "@habitat/cli/service/model/rules/index";
import { Effect, Layer } from "effect";
import { RuleDiagnostics } from "../../resource.js";
import { type GritCommandService, makeGritCommandService } from "./command.js";
import { runGritRulesEffect } from "./runner.js";
import { makeRuleDiagnosticsService } from "./service.js";

export type GritApplyDryRunService = Pick<GritCommandService, "applyDryRun" | "applyDryRunRequest">;

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

export function makeGritApplyDryRunService(repoRoot: string) {
  return makeGritCommandService(repoRoot).pipe(
    Effect.map(
      (grit): GritApplyDryRunService => ({
        applyDryRun: grit.applyDryRun,
        applyDryRunRequest: grit.applyDryRunRequest,
      })
    )
  );
}
