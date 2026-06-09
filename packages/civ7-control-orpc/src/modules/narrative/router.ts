import { narrativeChoiceRequestProcedure } from "./procedures/choice-request";

export const narrativeRouter = {
  choice: {
    request: narrativeChoiceRequestProcedure,
  },
};
