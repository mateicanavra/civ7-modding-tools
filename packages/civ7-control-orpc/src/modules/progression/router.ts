import {
  progressionCultureChoiceRequestProcedure,
  progressionTechnologyChoiceRequestProcedure,
} from "./procedures/choice-request";
import {
  progressionAttributePurchaseRequestProcedure,
  progressionAttributeReviewRequestProcedure,
  progressionTraditionChangeRequestProcedure,
  progressionTraditionReviewRequestProcedure,
} from "./procedures/player-choice-request";
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
  attribute: {
    purchase: {
      request: progressionAttributePurchaseRequestProcedure,
    },
    review: {
      request: progressionAttributeReviewRequestProcedure,
    },
  },
  tradition: {
    change: {
      request: progressionTraditionChangeRequestProcedure,
    },
    review: {
      request: progressionTraditionReviewRequestProcedure,
    },
  },
};
