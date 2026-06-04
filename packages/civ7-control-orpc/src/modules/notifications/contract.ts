import {
  Civ7PlayNotificationViewInputSchema,
  Civ7PlayNotificationViewResultSchema,
} from "@civ7/direct-control";
import type { ContractProcedure } from "@orpc/contract";

import { civ7ControlOrpcContractBase } from "../../contract-base";
import type { Civ7ControlOrpcErrorMap } from "../../errors";
import type { Civ7ControlOrpcProcedureMeta } from "../../metadata";
import { toStandardSchema } from "../../typebox-standard-schema";

export const Civ7NotificationsViewInputStandardSchema = toStandardSchema(
  Civ7PlayNotificationViewInputSchema,
);
export const Civ7NotificationsViewResultStandardSchema = toStandardSchema(
  Civ7PlayNotificationViewResultSchema,
);

export type Civ7NotificationsViewContract = ContractProcedure<
  typeof Civ7NotificationsViewInputStandardSchema,
  typeof Civ7NotificationsViewResultStandardSchema,
  Civ7ControlOrpcErrorMap,
  Civ7ControlOrpcProcedureMeta
>;

export const Civ7NotificationsViewContract: Civ7NotificationsViewContract =
  civ7ControlOrpcContractBase
    .input(Civ7NotificationsViewInputStandardSchema)
    .output(Civ7NotificationsViewResultStandardSchema)
    .meta({
      family: "notifications",
      procedureKey: "notifications.view",
      proofBoundary: "local-package-test",
      risk: "read-only",
    });

export type Civ7NotificationsContract = Readonly<{
  view: Civ7NotificationsViewContract;
}>;

export const Civ7NotificationsContract: Civ7NotificationsContract = {
  view: Civ7NotificationsViewContract,
};
