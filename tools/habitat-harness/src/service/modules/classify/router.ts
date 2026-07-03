import { module } from "./module.js";

export const classifyRouter = {
  target: module.target.effect(function* ({ context, input }) {
    return yield* context.classifyTargetResult(input.target);
  }),
};

export const router = classifyRouter;
