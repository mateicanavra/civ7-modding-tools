import { displayExploreRequestProcedure } from "./procedures/explore-request";
import { displayQueueCloseProcedure, displayQueueCurrentProcedure } from "./procedures/queue";

export const displayRouter = {
  queue: {
    current: displayQueueCurrentProcedure,
    close: displayQueueCloseProcedure,
  },
  explore: {
    request: displayExploreRequestProcedure,
  },
};
