import { cityReadyViewProcedure } from "./procedures/ready-view";
import { citySummaryReadProcedure } from "./procedures/summary-read";

export const cityRouter = {
  ready: {
    view: cityReadyViewProcedure,
  },
  summary: {
    read: citySummaryReadProcedure,
  },
};
