import {
  Civ7PlayableStatusInputSchema,
  Civ7PlayableStatusResultSchema,
} from "@civ7/direct-control";
import type { ContractProcedure } from "@orpc/contract";

import { civ7ControlOrpcContractBase } from "../../contract-base";
import type { Civ7ControlOrpcErrorMap } from "../../errors";
import type { Civ7ControlOrpcProcedureMeta } from "../../metadata";
import { toStandardSchema } from "../../typebox-standard-schema";

export const Civ7RuntimePlayableStatusInputStandardSchema = toStandardSchema(
  Civ7PlayableStatusInputSchema,
);
export const Civ7RuntimePlayableStatusResultStandardSchema = toStandardSchema(
  Civ7PlayableStatusResultSchema,
);

export type Civ7RuntimePlayableStatusContract = ContractProcedure<
  typeof Civ7RuntimePlayableStatusInputStandardSchema,
  typeof Civ7RuntimePlayableStatusResultStandardSchema,
  Civ7ControlOrpcErrorMap,
  Civ7ControlOrpcProcedureMeta
>;

export const Civ7RuntimePlayableStatusContract: Civ7RuntimePlayableStatusContract =
  civ7ControlOrpcContractBase
    .input(Civ7RuntimePlayableStatusInputStandardSchema)
    .output(Civ7RuntimePlayableStatusResultStandardSchema)
    .meta({
      family: "runtime",
      procedureKey: "runtime.playable.status",
      proofBoundary: "local-package-test",
      risk: "runtime-support",
    });

export type Civ7RuntimeContract = Readonly<{
  playable: Readonly<{
    status: Civ7RuntimePlayableStatusContract;
  }>;
}>;

export const Civ7RuntimeContract: Civ7RuntimeContract = {
  playable: {
    status: Civ7RuntimePlayableStatusContract,
  },
};
