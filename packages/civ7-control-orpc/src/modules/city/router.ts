import { cityProductionChoiceRequestProcedure } from "./procedures/production-choice-request";
import { cityPopulationPlaceRequestProcedure } from "./procedures/population-place-request";
import { cityReadyViewProcedure } from "./procedures/ready-view";
import { citySummaryReadProcedure } from "./procedures/summary-read";

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
  ready: {
    view: cityReadyViewProcedure,
  },
  summary: {
    read: citySummaryReadProcedure,
  },
};
