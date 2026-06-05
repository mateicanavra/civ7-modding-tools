import { decisionsNarrativeChoiceRequestProcedure } from "./procedures/narrative-choice-request";

export const decisionsRouter = {
  narrative: {
    choice: {
      request: decisionsNarrativeChoiceRequestProcedure,
    },
  },
};
