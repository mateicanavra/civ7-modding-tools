import { cityProductionChoiceRequestProcedure } from "./procedures/production-choice-request";
import { cityPopulationPlaceRequestProcedure } from "./procedures/population-place-request";

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
};
