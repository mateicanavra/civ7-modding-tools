import { playerSummaryReadProcedure } from "./procedures/summary-read";

export const playerRouter = {
  summary: {
    read: playerSummaryReadProcedure,
  },
};
