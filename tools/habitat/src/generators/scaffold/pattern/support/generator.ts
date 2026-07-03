import {
  candidateManifest,
  candidatePatternMarkdown,
  decidePatternScaffold,
  throwScaffoldRefusal,
} from "@habitat/cli/generators/scaffold/model";
import { type Tree, writeJson } from "@nx/devkit";
import { Value } from "typebox/value";
import { activePatternPathFor, candidateAuthorityPaths } from "./paths.ts";
import { type PatternGeneratorOptions, PatternGeneratorOptionsSchema } from "./schema.ts";

export async function patternGenerator(
  tree: Tree,
  rawOptions: PatternGeneratorOptions
): Promise<void> {
  const options = Value.Parse(PatternGeneratorOptionsSchema, rawOptions);
  const decision = decidePatternScaffold(options, {
    activePatternPath: activePatternPathFor,
    candidateAuthorityPaths,
    ruleManifestIdCollisionPath: ({ ruleId }) => ruleManifestIdCollisionPathFor(tree, ruleId),
    pathExists: (path) => tree.exists(path),
  });

  if (decision.kind === "refuse-scaffold") {
    throwScaffoldRefusal(decision.refusal);
    return;
  }

  tree.write(decision.paths.patternPath, candidatePatternMarkdown(decision.options));
  writeJson(tree, decision.paths.manifestPath, candidateManifest(decision.options, decision.paths));
}

export { candidateAuthorityPaths } from "./paths.ts";

export default patternGenerator;

function ruleManifestIdCollisionPathFor(tree: Tree, ruleId: string): string | null {
  for (const manifestPath of candidateCollisionRuleManifestPaths(tree, ".habitat")) {
    const manifest = readJsonIfObject(tree, manifestPath);
    if (manifest && manifest.id === ruleId) return manifestPath;
  }
  return null;
}

function candidateCollisionRuleManifestPaths(tree: Tree, root: string): string[] {
  if (!tree.exists(root)) return [];
  return tree.children(root).flatMap((child) => {
    const childPath = `${root}/${child}`;
    if (child === "rule.json") return [childPath];
    if (tree.isFile(childPath)) return [];
    return candidateCollisionRuleManifestPaths(tree, childPath);
  });
}

function readJsonIfObject(tree: Tree, filePath: string): { readonly id?: unknown } | null {
  const raw = tree.read(filePath, "utf8");
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}
