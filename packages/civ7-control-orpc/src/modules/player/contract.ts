import {
  Civ7PlayerSummaryInputSchema,
  Civ7PlayerSummaryResultSchema,
} from "@civ7/direct-control";
import type { ContractProcedure } from "@orpc/contract";

import { civ7ControlOrpcContractBase } from "../../contract-base";
import type { Civ7ControlOrpcErrorMap } from "../../errors";
import type { Civ7ControlOrpcProcedureMeta } from "../../metadata";
import { toStandardSchema } from "../../typebox-standard-schema";

export const Civ7PlayerSummaryInputStandardSchema = toStandardSchema(
  Civ7PlayerSummaryInputSchema,
);
export const Civ7PlayerSummaryResultStandardSchema = toStandardSchema(
  Civ7PlayerSummaryResultSchema,
);

export type Civ7PlayerSummaryContract = ContractProcedure<
  typeof Civ7PlayerSummaryInputStandardSchema,
  typeof Civ7PlayerSummaryResultStandardSchema,
  Civ7ControlOrpcErrorMap,
  Civ7ControlOrpcProcedureMeta
>;

export const Civ7PlayerSummaryContract: Civ7PlayerSummaryContract =
  civ7ControlOrpcContractBase
    .input(Civ7PlayerSummaryInputStandardSchema)
    .output(Civ7PlayerSummaryResultStandardSchema)
    .meta({
      family: "player",
      procedureKey: "player.summary.read",
      proofBoundary: "local-package-test",
      risk: "read-only",
    });

export type Civ7PlayerContract = Readonly<{
  summary: Readonly<{
    read: Civ7PlayerSummaryContract;
  }>;
}>;

export const Civ7PlayerContract: Civ7PlayerContract = {
  summary: {
    read: Civ7PlayerSummaryContract,
  },
};
