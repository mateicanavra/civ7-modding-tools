import {
  unitResettleRequestProcedure,
  unitUpgradeRequestProcedure,
} from "./procedures/command-request";
import { unitTargetActionRequestProcedure } from "./procedures/target-action-request";

export const unitRouter = {
  resettle: {
    request: unitResettleRequestProcedure,
  },
  target: {
    action: {
      request: unitTargetActionRequestProcedure,
    },
  },
  upgrade: {
    request: unitUpgradeRequestProcedure,
  },
};
