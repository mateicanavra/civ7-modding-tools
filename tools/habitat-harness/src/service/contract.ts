import { eoc } from "effect-orpc";
import { type CheckServiceContract, checkServiceContract } from "./modules/check/contract.js";
import {
  type ClassifyServiceContract,
  classifyServiceContract,
} from "./modules/classify/contract.js";
import { type FixServiceContract, fixServiceContract } from "./modules/fix/contract.js";
import { type GraphServiceContract, graphServiceContract } from "./modules/graph/contract.js";
import { type HookServiceContract, hookServiceContract } from "./modules/hook/contract.js";
import {
  type TransactionsServiceContract,
  transactionsServiceContract,
} from "./modules/transactions/contract.js";
import { type VerifyServiceContract, verifyServiceContract } from "./modules/verify/contract.js";

export type HabitatServiceContract = Readonly<{
  check: CheckServiceContract;
  classify: ClassifyServiceContract;
  fix: FixServiceContract;
  graph: GraphServiceContract;
  hook: HookServiceContract;
  transactions: TransactionsServiceContract;
  verify: VerifyServiceContract;
}>;

export const habitatServiceContract: HabitatServiceContract = eoc.router({
  check: checkServiceContract,
  classify: classifyServiceContract,
  fix: fixServiceContract,
  graph: graphServiceContract,
  hook: hookServiceContract,
  transactions: transactionsServiceContract,
  verify: verifyServiceContract,
});
