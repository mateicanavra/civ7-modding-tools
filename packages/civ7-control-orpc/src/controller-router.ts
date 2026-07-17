import { attentionCurrentProcedure } from "./modules/attention/procedures/current";
import { cityPopulationPlaceRequestProcedure } from "./modules/city/procedures/population-place-request";
import { cityProductionChoiceRequestProcedure } from "./modules/city/procedures/production-choice-request";
import {
  cityTownFocusChangeRequestProcedure,
  cityTownFocusReviewRequestProcedure,
} from "./modules/city/procedures/town-focus-request";
import { firstMeetResponseRequestProcedure } from "./modules/diplomacy/procedures/first-meet-response-request";
import { diplomacyResponseRequestProcedure } from "./modules/diplomacy/procedures/response-request";
import {
  governmentCelebrationChoiceRequestProcedure,
  governmentChoiceRequestProcedure,
} from "./modules/government/procedures/choice-request";
import { narrativeChoiceRequestProcedure } from "./modules/narrative/procedures/choice-request";
import { notificationsDismissRequestProcedure } from "./modules/notifications/procedures/dismiss-request";
import {
  progressionCultureChoiceRequestProcedure,
  progressionTechnologyChoiceRequestProcedure,
} from "./modules/progression/procedures/choice-request";
import {
  progressionAttributePurchaseRequestProcedure,
  progressionAttributeReviewRequestProcedure,
  progressionTraditionChangeRequestProcedure,
  progressionTraditionReviewRequestProcedure,
} from "./modules/progression/procedures/player-choice-request";
import {
  progressionCultureTargetRequestProcedure,
  progressionTechnologyTargetRequestProcedure,
} from "./modules/progression/procedures/target-request";
import { readinessCurrentProcedure } from "./modules/readiness/procedures/current";
import { strategyFrontSummaryProcedure } from "./modules/strategy/procedures/front-summary";
import { turnCompleteRequestProcedure } from "./modules/turn/procedures/complete-request";
import {
  unitResettleRequestProcedure,
  unitUpgradeRequestProcedure,
} from "./modules/unit/procedures/command-request";
import { unitTargetActionRequestProcedure } from "./modules/unit/procedures/target-action-request";
import { worldCurrentProcedure } from "./modules/world/procedures/current";
import {
  worldGridReadProcedure,
  worldPlotReadProcedure,
} from "./modules/world/procedures/map-reads";

/**
 * The controller exposes the existing service procedures it can implement in
 * the game UI runtime. These are the canonical procedures, not copies of their
 * contracts or handlers.
 */
export const Civ7ControllerOrpcRouter = {
  readiness: {
    current: readinessCurrentProcedure,
  },
  attention: {
    current: attentionCurrentProcedure,
  },
  strategy: {
    frontSummary: strategyFrontSummaryProcedure,
  },
  world: {
    current: worldCurrentProcedure,
    plot: worldPlotReadProcedure,
    grid: worldGridReadProcedure,
  },
  notifications: {
    dismiss: {
      request: notificationsDismissRequestProcedure,
    },
  },
  turn: {
    complete: {
      request: turnCompleteRequestProcedure,
    },
  },
  city: {
    production: {
      choice: {
        request: cityProductionChoiceRequestProcedure,
      },
    },
    population: {
      place: {
        request: cityPopulationPlaceRequestProcedure,
      },
    },
    townFocus: {
      change: {
        request: cityTownFocusChangeRequestProcedure,
      },
      review: {
        request: cityTownFocusReviewRequestProcedure,
      },
    },
  },
  narrative: {
    choice: {
      request: narrativeChoiceRequestProcedure,
    },
  },
  diplomacy: {
    response: {
      request: diplomacyResponseRequestProcedure,
    },
    firstMeet: {
      response: {
        request: firstMeetResponseRequestProcedure,
      },
    },
  },
  government: {
    choice: {
      request: governmentChoiceRequestProcedure,
    },
    celebration: {
      choice: {
        request: governmentCelebrationChoiceRequestProcedure,
      },
    },
  },
  unit: {
    target: {
      action: {
        request: unitTargetActionRequestProcedure,
      },
    },
    upgrade: {
      request: unitUpgradeRequestProcedure,
    },
    resettle: {
      request: unitResettleRequestProcedure,
    },
  },
  progression: {
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
  },
};
