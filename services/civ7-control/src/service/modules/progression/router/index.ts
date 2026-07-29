import { choiceRequest } from "./choice-request";
import { dashboardCurrent } from "./dashboard-current";
import { playerChoiceRequest } from "./player-choice-request";
import { targetRequest } from "./target-request";
import { traditionsCurrent } from "./traditions-current";
export const router = {
  dashboard: {
    current: dashboardCurrent,
  },
  traditions: {
    current: traditionsCurrent,
  },
  technology: {
    choice: {
      request: choiceRequest.progressionTechnologyChoiceRequestProcedure,
    },
    target: {
      request: targetRequest.progressionTechnologyTargetRequestProcedure,
    },
  },
  culture: {
    choice: {
      request: choiceRequest.progressionCultureChoiceRequestProcedure,
    },
    target: {
      request: targetRequest.progressionCultureTargetRequestProcedure,
    },
  },
  attribute: {
    purchase: {
      request: playerChoiceRequest.progressionAttributePurchaseRequestProcedure,
    },
    review: {
      request: playerChoiceRequest.progressionAttributeReviewRequestProcedure,
    },
  },
  tradition: {
    change: {
      request: playerChoiceRequest.progressionTraditionChangeRequestProcedure,
    },
    review: {
      request: playerChoiceRequest.progressionTraditionReviewRequestProcedure,
    },
  },
};
