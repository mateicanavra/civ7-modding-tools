import {
  Civ7ReadyUnitViewInputSchema,
  Civ7ReadyUnitViewResultSchema,
} from "@civ7/direct-control";
import type { ContractProcedure } from "@orpc/contract";

import { civ7ControlOrpcContractBase } from "../../contract-base";
import type { Civ7ControlOrpcErrorMap } from "../../errors";
import type { Civ7ControlOrpcProcedureMeta } from "../../metadata";
import { toStandardSchema } from "../../typebox-standard-schema";

export const Civ7UnitReadyViewInputStandardSchema = toStandardSchema(
  Civ7ReadyUnitViewInputSchema,
);
export const Civ7UnitReadyViewResultStandardSchema = toStandardSchema(
  Civ7ReadyUnitViewResultSchema,
);

export type Civ7UnitReadyViewContract = ContractProcedure<
  typeof Civ7UnitReadyViewInputStandardSchema,
  typeof Civ7UnitReadyViewResultStandardSchema,
  Civ7ControlOrpcErrorMap,
  Civ7ControlOrpcProcedureMeta
>;

export const Civ7UnitReadyViewContract: Civ7UnitReadyViewContract =
  civ7ControlOrpcContractBase
    .input(Civ7UnitReadyViewInputStandardSchema)
    .output(Civ7UnitReadyViewResultStandardSchema)
    .meta({
      family: "unit",
      procedureKey: "unit.ready.view",
      proofBoundary: "local-package-test",
      risk: "read-only",
    });

export type Civ7UnitContract = Readonly<{
  ready: Readonly<{
    view: Civ7UnitReadyViewContract;
  }>;
}>;

export const Civ7UnitContract: Civ7UnitContract = {
  ready: {
    view: Civ7UnitReadyViewContract,
  },
};
