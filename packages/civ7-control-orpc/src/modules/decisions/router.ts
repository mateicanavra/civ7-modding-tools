import { decisionsDiplomacyResponseRequestProcedure } from "./procedures/diplomacy-response-request";
import { decisionsNarrativeChoiceRequestProcedure } from "./procedures/narrative-choice-request";
import { decisionsProgressionChoiceRequestProcedure } from "./procedures/progression-choice-request";

export const decisionsRouter = {
  diplomacy: {
    response: {
      request: decisionsDiplomacyResponseRequestProcedure,
    },
  },
  narrative: {
    choice: {
      request: decisionsNarrativeChoiceRequestProcedure,
    },
  },
  progression: {
    choice: {
      request: decisionsProgressionChoiceRequestProcedure,
    },
  },
};
