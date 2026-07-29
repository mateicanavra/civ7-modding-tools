import { firstMeetResponse } from "./first-meet-response";
import { responseRequest } from "./response-request";
export const router = {
  firstMeet: {
    response: firstMeetResponse,
  },
  response: {
    request: responseRequest,
  },
};
