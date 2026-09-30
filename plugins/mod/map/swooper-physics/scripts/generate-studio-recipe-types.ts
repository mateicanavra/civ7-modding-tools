import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { applyGeneratedFilePlan } from "@civ7/plugin-files/generated-file-plan";
import { authoringTargets } from "../authoring/index.js";

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const plan = await authoringTargets.recipeAuthoringMetadata.createPlan();
await applyGeneratedFilePlan(plan, { outputRoot: packageRoot });
