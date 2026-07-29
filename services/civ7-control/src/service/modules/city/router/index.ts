import { populationPlaceRequest } from "./population-place-request";
import { productionChoice } from "./production-choice";
import { townFocusRequest } from "./town-focus-request";
export const router = {
  population: {
    place: {
      request: populationPlaceRequest,
    },
  },
  production: {
    choice: {
      check: productionChoice.check,
      request: productionChoice.request,
    },
  },
  townFocus: {
    change: {
      request: townFocusRequest.cityTownFocusChangeRequestProcedure,
    },
    review: {
      request: townFocusRequest.cityTownFocusReviewRequestProcedure,
    },
  },
};
