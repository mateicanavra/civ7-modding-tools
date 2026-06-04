import { operationsUnitTargetActionRequestProcedure } from "./procedures/unit-target-action-request";

export const operationsRouter = {
  unit: {
    target: {
      action: {
        request: operationsUnitTargetActionRequestProcedure,
      },
    },
  },
};
