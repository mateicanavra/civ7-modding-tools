import { unitTargetActionRequestProcedure } from "./procedures/target-action-request";

export const unitRouter = {
  target: {
    action: {
      request: unitTargetActionRequestProcedure,
    },
  },
};
