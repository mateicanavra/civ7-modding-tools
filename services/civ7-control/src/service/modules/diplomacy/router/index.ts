import { firstMeetResponseRequest } from "./first-meet-response-request";
import { responseRequest } from "./response-request";
export const router = {
  firstMeet: {
    response: {
      request: firstMeetResponseRequest,
    },
  },
  response: {
    request: responseRequest,
  },
};
