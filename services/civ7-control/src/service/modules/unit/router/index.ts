import { command } from "./command";
import { targetAction } from "./target-action";
export const router = {
  resettle: {
    check: command.unitResettleCheckProcedure,
    request: command.unitResettleRequestProcedure,
  },
  target: {
    action: targetAction,
  },
  upgrade: {
    check: command.unitUpgradeCheckProcedure,
    request: command.unitUpgradeRequestProcedure,
  },
};
