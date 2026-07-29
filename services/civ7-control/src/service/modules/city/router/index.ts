import { populationPlaceRequest } from "./population-place-request";
import { productionChoice } from "./production-choice";
import { townFocus } from "./town-focus";
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
      check: townFocus.change.check,
      request: townFocus.change.request,
    },
    review: {
      check: townFocus.review.check,
      request: townFocus.review.request,
    },
  },
};
