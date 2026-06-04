import {
  Civ7CitySummaryInputSchema,
  Civ7CitySummaryResultSchema,
  Civ7ReadyCityViewInputSchema,
  Civ7ReadyCityViewResultSchema,
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
export const Civ7CityReadyViewInputStandardSchema = toStandardSchema(
  Civ7ReadyCityViewInputSchema,
);
export const Civ7CityReadyViewResultStandardSchema = toStandardSchema(
  Civ7ReadyCityViewResultSchema,
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

export type Civ7CityReadyViewContract = ContractProcedure<
  typeof Civ7CityReadyViewInputStandardSchema,
  typeof Civ7CityReadyViewResultStandardSchema,
  Civ7ControlOrpcErrorMap,
  Civ7ControlOrpcProcedureMeta
>;

export const Civ7CityReadyViewContract: Civ7CityReadyViewContract =
  civ7ControlOrpcContractBase
    .input(Civ7CityReadyViewInputStandardSchema)
    .output(Civ7CityReadyViewResultStandardSchema)
    .meta({
      family: "city",
      procedureKey: "city.ready.view",
      proofBoundary: "local-package-test",
      risk: "read-only",
    });

export type Civ7CityContract = Readonly<{
  ready: Readonly<{
    view: Civ7CityReadyViewContract;
  }>;
  summary: Readonly<{
    read: Civ7CitySummaryContract;
  }>;
}>;

export const Civ7CityContract: Civ7CityContract = {
  ready: {
    view: Civ7CityReadyViewContract,
  },
  summary: {
    read: Civ7CitySummaryContract,
  },
};
