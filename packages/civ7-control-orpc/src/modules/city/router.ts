import { citySummaryReadProcedure } from "./procedures/summary-read";

export const cityRouter = {
  summary: {
    read: citySummaryReadProcedure,
  },
};
