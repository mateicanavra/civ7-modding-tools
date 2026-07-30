import { choiceRequest } from "./choice-request";
export const router = {
  choice: {
    request: choiceRequest.governmentChoiceRequestProcedure,
  },
  celebration: {
    choice: {
      request: choiceRequest.governmentCelebrationChoiceRequestProcedure,
    },
  },
};
