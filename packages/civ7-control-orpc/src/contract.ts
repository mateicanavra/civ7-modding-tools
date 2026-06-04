import { civ7ControlOrpcContractBase } from "./contract-base";
import {
  Civ7RuntimeContract,
  type Civ7RuntimeContract as Civ7RuntimeContractType,
} from "./modules/runtime/contract";

export type Civ7ControlOrpcContract = Readonly<{
  runtime: Civ7RuntimeContractType;
}>;

export const Civ7ControlOrpcContract: Civ7ControlOrpcContract =
  civ7ControlOrpcContractBase.router({
    runtime: Civ7RuntimeContract,
  });
