import { celebrationChoice } from "./celebration-choice";
import { choice } from "./choice";
export const router = {
  choice: {
    check: choice.check,
    request: choice.request,
  },
  celebration: {
    choice: {
      check: celebrationChoice.check,
      request: celebrationChoice.request,
    },
  },
};
