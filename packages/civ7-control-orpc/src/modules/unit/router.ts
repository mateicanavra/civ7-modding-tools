import { unitReadyViewProcedure } from "./procedures/ready-view";
import { unitSummaryReadProcedure } from "./procedures/summary-read";

export const unitRouter = {
  ready: {
    view: unitReadyViewProcedure,
  },
  summary: {
    read: unitSummaryReadProcedure,
  },
};
