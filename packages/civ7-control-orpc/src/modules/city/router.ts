import { cityProductionChoiceRequestProcedure } from "./procedures/production-choice-request";
import { cityReadyViewProcedure } from "./procedures/ready-view";
import { citySummaryReadProcedure } from "./procedures/summary-read";

export const cityRouter = {
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
