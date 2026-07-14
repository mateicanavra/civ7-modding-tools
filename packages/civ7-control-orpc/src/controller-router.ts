import { attentionRouter } from "./modules/attention/router";
import { cityRouter } from "./modules/city/router";
import { diplomacyRouter } from "./modules/diplomacy/router";
import { governmentRouter } from "./modules/government/router";
import { narrativeRouter } from "./modules/narrative/router";
import { notificationsRouter } from "./modules/notifications/router";
import { progressionRouter } from "./modules/progression/router";
import { readinessRouter } from "./modules/readiness/router";
import { strategyRouter } from "./modules/strategy/router";
import { turnRouter } from "./modules/turn/router";
import { unitRouter } from "./modules/unit/router";
import { worldRouter } from "./modules/world/router";

/**
 * The controller exposes the existing service procedures it can implement in
 * the game UI runtime. These are the canonical procedures, not copies of their
 * contracts or handlers.
 */
export const Civ7ControllerOrpcRouter = {
  readiness: {
    current: readinessRouter.current,
  },
  attention: {
    current: attentionRouter.current,
  },
  strategy: {
    frontSummary: strategyRouter.frontSummary,
  },
  world: {
    current: worldRouter.current,
    plot: worldRouter.plot,
    grid: worldRouter.grid,
  },
  notifications: {
    dismiss: {
      request: notificationsRouter.dismiss.request,
    },
  },
  turn: {
    complete: {
      request: turnRouter.complete.request,
    },
  },
  city: {
    production: {
      choice: {
        request: cityRouter.production.choice.request,
      },
    },
    population: {
      place: {
        request: cityRouter.population.place.request,
      },
    },
    townFocus: {
      change: {
        request: cityRouter.townFocus.change.request,
      },
      review: {
        request: cityRouter.townFocus.review.request,
      },
    },
  },
  narrative: {
    choice: {
      request: narrativeRouter.choice.request,
    },
  },
  diplomacy: {
    response: {
      request: diplomacyRouter.response.request,
    },
    firstMeet: {
      response: {
        request: diplomacyRouter.firstMeet.response.request,
      },
    },
  },
  government: {
    choice: {
      request: governmentRouter.choice.request,
    },
    celebration: {
      choice: {
        request: governmentRouter.celebration.choice.request,
      },
    },
  },
  unit: {
    target: {
      action: {
        request: unitRouter.target.action.request,
      },
    },
    upgrade: {
      request: unitRouter.upgrade.request,
    },
    resettle: {
      request: unitRouter.resettle.request,
    },
  },
  progression: {
    technology: {
      choice: {
        request: progressionRouter.technology.choice.request,
      },
      target: {
        request: progressionRouter.technology.target.request,
      },
    },
    culture: {
      choice: {
        request: progressionRouter.culture.choice.request,
      },
      target: {
        request: progressionRouter.culture.target.request,
      },
    },
    attribute: {
      purchase: {
        request: progressionRouter.attribute.purchase.request,
      },
      review: {
        request: progressionRouter.attribute.review.request,
      },
    },
    tradition: {
      change: {
        request: progressionRouter.tradition.change.request,
      },
      review: {
        request: progressionRouter.tradition.review.request,
      },
    },
  },
};
