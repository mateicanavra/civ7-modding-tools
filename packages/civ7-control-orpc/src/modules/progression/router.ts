import {
  progressionCultureChoiceRequestProcedure,
  progressionTechnologyChoiceRequestProcedure,
} from "./procedures/choice-request";
import {
  progressionCultureTargetRequestProcedure,
  progressionTechnologyTargetRequestProcedure,
} from "./procedures/target-request";

export const progressionRouter = {
  technology: {
    choice: {
      request: progressionTechnologyChoiceRequestProcedure,
    },
    target: {
      request: progressionTechnologyTargetRequestProcedure,
    },
  },
  culture: {
    choice: {
      request: progressionCultureChoiceRequestProcedure,
    },
    target: {
      request: progressionCultureTargetRequestProcedure,
    },
  },
};
