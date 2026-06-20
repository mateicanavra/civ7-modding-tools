import { eoc } from "effect-orpc";
import { type CheckServiceContract, checkServiceContract } from "./modules/check/contract.js";
import { type GraphServiceContract, graphServiceContract } from "./modules/graph/contract.js";
import { type HookServiceContract, hookServiceContract } from "./modules/hook/contract.js";
import { type VerifyServiceContract, verifyServiceContract } from "./modules/verify/contract.js";

export type HabitatServiceContract = Readonly<{
  check: CheckServiceContract;
  graph: GraphServiceContract;
  hook: HookServiceContract;
  verify: VerifyServiceContract;
}>;

export const habitatServiceContract: HabitatServiceContract = eoc.router({
  check: checkServiceContract,
  graph: graphServiceContract,
  hook: hookServiceContract,
  verify: verifyServiceContract,
});
