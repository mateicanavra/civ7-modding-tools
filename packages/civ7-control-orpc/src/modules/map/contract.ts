import {
  Civ7MapSummaryInputSchema,
  Civ7MapSummaryResultSchema,
} from "@civ7/direct-control";
import type { ContractProcedure } from "@orpc/contract";

import { civ7ControlOrpcContractBase } from "../../contract-base";
import type { Civ7ControlOrpcErrorMap } from "../../errors";
import type { Civ7ControlOrpcProcedureMeta } from "../../metadata";
import { toStandardSchema } from "../../typebox-standard-schema";

export const Civ7MapSummaryInputStandardSchema = toStandardSchema(
  Civ7MapSummaryInputSchema,
);
export const Civ7MapSummaryResultStandardSchema = toStandardSchema(
  Civ7MapSummaryResultSchema,
);

export type Civ7MapSummaryContract = ContractProcedure<
  typeof Civ7MapSummaryInputStandardSchema,
  typeof Civ7MapSummaryResultStandardSchema,
  Civ7ControlOrpcErrorMap,
  Civ7ControlOrpcProcedureMeta
>;

export const Civ7MapSummaryContract: Civ7MapSummaryContract =
  civ7ControlOrpcContractBase
    .input(Civ7MapSummaryInputStandardSchema)
    .output(Civ7MapSummaryResultStandardSchema)
    .meta({
      family: "map",
      procedureKey: "map.summary.read",
      proofBoundary: "local-package-test",
      risk: "read-only",
    });

export type Civ7MapContract = Readonly<{
  summary: Readonly<{
    read: Civ7MapSummaryContract;
  }>;
}>;

export const Civ7MapContract: Civ7MapContract = {
  summary: {
    read: Civ7MapSummaryContract,
  },
};
