import {
  progressionCultureChoiceRequestProcedure,
  progressionTechnologyChoiceRequestProcedure,
} from "./procedures/choice-request";
import { progressionDashboardCurrentProcedure } from "./procedures/dashboard-current";
import { progressionTraditionsCurrentProcedure } from "./procedures/traditions-current";
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
  dashboard: {
    current: progressionDashboardCurrentProcedure,
  },
  traditions: {
    current: progressionTraditionsCurrentProcedure,
  },
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
