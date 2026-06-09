import { attentionCurrentProcedure } from "./procedures/current";
import { attentionPrioritiesProcedure } from "./procedures/priorities";

export const attentionRouter = {
  current: attentionCurrentProcedure,
  priorities: attentionPrioritiesProcedure,
};
