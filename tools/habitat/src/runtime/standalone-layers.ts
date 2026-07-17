import { makeGritRuleDiagnosticsLayer } from "@habitat/cli/resources/rule-diagnostics/providers/grit/provider";
import { RuleFacts, type RuleFactsCatalog } from "@habitat/cli/service/model/rules/index";
import { Layer } from "effect";

/** Check-only composition; destination rule facts remain explicit input. */
export function makeStandaloneRuleDiagnosticsLayer(repoRoot: string, facts: RuleFactsCatalog) {
  return makeGritRuleDiagnosticsLayer(repoRoot).pipe(
    Layer.provide(Layer.succeed(RuleFacts, facts))
  );
}
