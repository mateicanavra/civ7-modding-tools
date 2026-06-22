import { checkServiceContract } from "./modules/check/contract.js";
import { classifyServiceContract } from "./modules/classify/contract.js";
import { fixServiceContract } from "./modules/fix/contract.js";
import { graphServiceContract } from "./modules/graph/contract.js";
import { hookServiceContract } from "./modules/hook/contract.js";
import { verifyServiceContract } from "./modules/verify/contract.js";

export const habitatServiceContract = {
  check: checkServiceContract,
  classify: classifyServiceContract,
  fix: fixServiceContract,
  graph: graphServiceContract,
  hook: hookServiceContract,
  verify: verifyServiceContract,
};

export type HabitatServiceContract = typeof habitatServiceContract;
