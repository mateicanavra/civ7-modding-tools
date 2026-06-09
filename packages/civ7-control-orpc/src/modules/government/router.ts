import {
  governmentCelebrationChoiceRequestProcedure,
  governmentChoiceRequestProcedure,
} from "./procedures/choice-request";

export const governmentRouter = {
  choice: {
    request: governmentChoiceRequestProcedure,
  },
  celebration: {
    choice: {
      request: governmentCelebrationChoiceRequestProcedure,
    },
  },
};
