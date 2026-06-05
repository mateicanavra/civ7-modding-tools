import {
  progressionCultureChoiceRequestProcedure,
  progressionTechnologyChoiceRequestProcedure,
} from "./procedures/choice-request";

export const progressionRouter = {
  technology: {
    choice: {
      request: progressionTechnologyChoiceRequestProcedure,
    },
  },
  culture: {
    choice: {
      request: progressionCultureChoiceRequestProcedure,
    },
  },
};
