import { module } from "./module.js";

export const router = {
  target: module.target.effect(function* ({ context, input }) {
    return yield* context.classifyTargetResult(input.target);
  }),
};
