import { firstMeetResponseRequestProcedure } from "./procedures/first-meet-response-request";
import { diplomacyResponseRequestProcedure } from "./procedures/response-request";

export const diplomacyRouter = {
  firstMeet: {
    response: {
      request: firstMeetResponseRequestProcedure,
    },
  },
  response: {
    request: diplomacyResponseRequestProcedure,
  },
};
