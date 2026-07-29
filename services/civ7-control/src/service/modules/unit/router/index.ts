import { commandRequest } from "./command-request";
import { targetActionRequest } from "./target-action-request";
export const router = {
  resettle: {
    request: commandRequest.unitResettleRequestProcedure,
  },
  target: {
    action: {
      request: targetActionRequest,
    },
  },
  upgrade: {
    request: commandRequest.unitUpgradeRequestProcedure,
  },
};
