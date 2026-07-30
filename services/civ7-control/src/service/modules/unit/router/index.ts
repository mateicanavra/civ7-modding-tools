import { command } from "./command";
import { targetActionRequest } from "./target-action-request";
export const router = {
  resettle: {
    check: command.unitResettleCheckProcedure,
    request: command.unitResettleRequestProcedure,
  },
  target: {
    action: {
      request: targetActionRequest,
    },
  },
  upgrade: {
    check: command.unitUpgradeCheckProcedure,
    request: command.unitUpgradeRequestProcedure,
  },
};
