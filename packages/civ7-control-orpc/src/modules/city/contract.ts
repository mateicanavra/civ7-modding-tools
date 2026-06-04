import {
  Civ7CitySummaryInputSchema,
  Civ7CitySummaryResultSchema,
} from "@civ7/direct-control";
import type { ContractProcedure } from "@orpc/contract";

import { civ7ControlOrpcContractBase } from "../../contract-base";
import type { Civ7ControlOrpcErrorMap } from "../../errors";
import type { Civ7ControlOrpcProcedureMeta } from "../../metadata";
import { toStandardSchema } from "../../typebox-standard-schema";

export const Civ7CitySummaryInputStandardSchema = toStandardSchema(
  Civ7CitySummaryInputSchema,
);
export const Civ7CitySummaryResultStandardSchema = toStandardSchema(
  Civ7CitySummaryResultSchema,
);

export type Civ7CitySummaryContract = ContractProcedure<
  typeof Civ7CitySummaryInputStandardSchema,
  typeof Civ7CitySummaryResultStandardSchema,
  Civ7ControlOrpcErrorMap,
  Civ7ControlOrpcProcedureMeta
>;

export const Civ7CitySummaryContract: Civ7CitySummaryContract =
  civ7ControlOrpcContractBase
    .input(Civ7CitySummaryInputStandardSchema)
    .output(Civ7CitySummaryResultStandardSchema)
    .meta({
      family: "city",
      procedureKey: "city.summary.read",
      proofBoundary: "local-package-test",
      risk: "read-only",
    });

export type Civ7CityContract = Readonly<{
  summary: Readonly<{
    read: Civ7CitySummaryContract;
  }>;
}>;

export const Civ7CityContract: Civ7CityContract = {
  summary: {
    read: Civ7CitySummaryContract,
  },
};
