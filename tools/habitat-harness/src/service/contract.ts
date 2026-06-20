import { eoc } from "effect-orpc";
import { type VerifyServiceContract, verifyServiceContract } from "./modules/verify/contract.js";

export type HabitatServiceContract = Readonly<{
  verify: VerifyServiceContract;
}>;

export const habitatServiceContract: HabitatServiceContract = eoc.router({
  verify: verifyServiceContract,
});
