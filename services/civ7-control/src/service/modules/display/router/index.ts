import { exploreRequest } from "./explore-request";
import { queue } from "./queue";
export const router = {
  queue: {
    current: queue.displayQueueCurrentProcedure,
    close: queue.displayQueueCloseProcedure,
  },
  explore: {
    request: exploreRequest,
  },
};
