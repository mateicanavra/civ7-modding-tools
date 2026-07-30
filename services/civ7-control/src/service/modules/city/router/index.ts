import { populationPlace } from "./population-placement";
import { productionChoice } from "./production-choice";
import { townFocus } from "./town-focus";
export const router = {
  population: {
    place: {
      check: populationPlace.check,
      request: populationPlace.request,
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
