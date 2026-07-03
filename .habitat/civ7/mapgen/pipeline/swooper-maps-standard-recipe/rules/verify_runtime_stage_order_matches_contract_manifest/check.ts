#!/usr/bin/env bun
import { execFileSync } from "node:child_process";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const repoRoot = execFileSync("git", ["rev-parse", "--show-toplevel"], {
  encoding: "utf8",
}).trim();
const modRoot = join(repoRoot, "mods/mod-swooper-maps");
const failures: string[] = [];

const { STANDARD_STAGES } = await import(
  pathToFileURL(join(modRoot, "src/recipes/standard/recipe.ts")).href
);
const { standardStageContractManifest } = await import(
  pathToFileURL(join(modRoot, "src/recipes/standard/contract-manifest.ts")).href
);

function stageStepIds(stage: { steps: readonly { contract: { id: string } }[] }): string[] {
  return stage.steps.map((step) => step.contract.id);
}

const runtimeStageIds = STANDARD_STAGES.map((stage: { id: string }) => stage.id);
const manifestStageIds = standardStageContractManifest.map((stage: { id: string }) => stage.id);
if (JSON.stringify(runtimeStageIds) !== JSON.stringify(manifestStageIds)) {
  failures.push(
    `stage order differs: ${JSON.stringify(runtimeStageIds)} !== ${JSON.stringify(manifestStageIds)}`
  );
}

for (const stage of STANDARD_STAGES) {
  const manifestStage = standardStageContractManifest.find(
    (candidate: { id: string }) => candidate.id === stage.id
  );
  if (!manifestStage) {
    failures.push(`${stage.id}: missing manifest stage`);
    continue;
  }
  const runtimeSteps = stageStepIds(stage);
  const manifestSteps = stageStepIds(manifestStage);
  if (JSON.stringify(runtimeSteps) !== JSON.stringify(manifestSteps)) {
    failures.push(
      `${stage.id}: step order differs ${JSON.stringify(runtimeSteps)} !== ${JSON.stringify(manifestSteps)}`
    );
  }
}

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exit(1);
}
