import { eoc } from "effect-orpc";
import { type CheckServiceContract, checkServiceContract } from "./modules/check/contract.js";
import { type VerifyServiceContract, verifyServiceContract } from "./modules/verify/contract.js";

export type HabitatServiceContract = Readonly<{
  check: CheckServiceContract;
  verify: VerifyServiceContract;
}>;

export const habitatServiceContract: HabitatServiceContract = eoc.router({
  check: checkServiceContract,
  verify: verifyServiceContract,
});
