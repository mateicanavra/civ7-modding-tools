import { mapSummaryReadProcedure } from "./procedures/summary-read";

export const mapRouter = {
  summary: {
    read: mapSummaryReadProcedure,
  },
};
