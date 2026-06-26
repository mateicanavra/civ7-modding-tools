import { type Tree } from "@nx/devkit";
import { throwScaffoldRefusal } from "../scaffolding/refusal.ts";
import { decideProjectScaffold } from "./decision.ts";
import { type HabitatProjectGeneratorOptions } from "./schema.ts";
import { writeProjectScaffold } from "./writer.ts";

export async function projectGenerator(
  tree: Tree,
  rawOptions: HabitatProjectGeneratorOptions
): Promise<void> {
  const decision = decideProjectScaffold(tree, rawOptions);
  if (decision.kind === "refuse-scaffold") throwScaffoldRefusal(decision.refusal);
  writeProjectScaffold(tree, decision);
}

export { PROJECT_KIND_CONTRACTS } from "./decision.ts";
export type { HabitatProjectGeneratorOptions } from "./schema.ts";
export { HabitatProjectGeneratorOptionsSchema } from "./schema.ts";
export default projectGenerator;
