import { populationPlaceRequest } from "./population-place-request";
import { productionChoiceRequest } from "./production-choice-request";
import { townFocusRequest } from "./town-focus-request";
export const router = {
  population: {
    place: {
      request: populationPlaceRequest,
    },
  },
  production: {
    choice: {
      request: productionChoiceRequest,
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
