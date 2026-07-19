import { createStrategy } from "@swooper/mapgen-core/authoring";
import PedologyClassifyContract from "../contract.js";
import { classifyPedology } from "../rules/index.js";

export const defaultStrategy = createStrategy(PedologyClassifyContract, "default", {
  run: classifyPedology,
});
