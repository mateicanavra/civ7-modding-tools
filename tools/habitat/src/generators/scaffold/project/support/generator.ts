import {
  decideProjectScaffold,
  throwScaffoldRefusal,
} from "@habitat/cli/generators/scaffold/model";
import { type Tree } from "@nx/devkit";
import { findPackageNameCollision } from "./package-scan.ts";
import { type HabitatProjectGeneratorOptions } from "./schema.ts";
import { writeProjectScaffold } from "./writer.ts";

export async function projectGenerator(
  tree: Tree,
  rawOptions: HabitatProjectGeneratorOptions
): Promise<void> {
  const decision = decideProjectScaffold(rawOptions, {
    rootHasChildren: (root) => tree.exists(root) && tree.children(root).length > 0,
    packageNameCollision: (packageName, root) => findPackageNameCollision(tree, packageName, root),
  });
  if (decision.kind === "refuse-scaffold") throwScaffoldRefusal(decision.refusal);
  writeProjectScaffold(tree, decision);
}

export { PROJECT_KIND_CONTRACTS } from "@habitat/cli/generators/scaffold/model";
export type { HabitatProjectGeneratorOptions } from "./schema.ts";
export { HabitatProjectGeneratorOptionsSchema } from "./schema.ts";
export default projectGenerator;
