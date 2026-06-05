import { turnCompleteRequestProcedure } from "./procedures/complete-request";

export const turnRouter = {
  complete: {
    request: turnCompleteRequestProcedure,
  },
};
