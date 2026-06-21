import {
  candidateManifest,
  candidatePatternMarkdown,
  decidePatternScaffold,
  throwScaffoldRefusal,
} from "@internal/habitat-harness/service/modules/scaffold/index";
import { type Tree, writeJson } from "@nx/devkit";
import { Value } from "typebox/value";
import {
  activeBaselinePathFor,
  activePatternPathFor,
  candidateArtifactPaths,
  registeredRulePathFor,
} from "./paths.ts";
import { type PatternGeneratorOptions, PatternGeneratorOptionsSchema } from "./schema.ts";

export async function patternGenerator(
  tree: Tree,
  rawOptions: PatternGeneratorOptions
): Promise<void> {
  const options = Value.Parse(PatternGeneratorOptionsSchema, rawOptions);
  const decision = decidePatternScaffold(options, {
    activeBaselinePath: activeBaselinePathFor,
    activePatternPath: activePatternPathFor,
    candidateArtifactPaths,
    pathExists: (path) => tree.exists(path),
    registeredRulePath: registeredRulePathFor,
  });

  if (decision.kind === "refuse-scaffold") {
    throwScaffoldRefusal(decision.refusal);
    return;
  }

  tree.write(decision.paths.patternPath, candidatePatternMarkdown(decision.options));
  writeJson(tree, decision.paths.manifestPath, candidateManifest(decision.options, decision.paths));
}

export { candidateArtifactPaths } from "./paths.ts";

export default patternGenerator;
