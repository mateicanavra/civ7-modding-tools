import { diplomacyResponseRequestProcedure } from "./procedures/response-request";

export const diplomacyRouter = {
  response: {
    request: diplomacyResponseRequestProcedure,
  },
};
