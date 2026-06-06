import { cityProductionChoiceRequestProcedure } from "./procedures/production-choice-request";
import { cityPopulationPlaceRequestProcedure } from "./procedures/population-place-request";
import {
  cityTownFocusChangeRequestProcedure,
  cityTownFocusReviewRequestProcedure,
} from "./procedures/town-focus-request";

export const cityRouter = {
  population: {
    place: {
      request: cityPopulationPlaceRequestProcedure,
    },
  },
  production: {
    choice: {
      request: cityProductionChoiceRequestProcedure,
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
};
