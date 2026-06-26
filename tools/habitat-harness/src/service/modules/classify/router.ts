import { module } from "./module.js";

export const classifyRouter = {
  run: module.run.effect(function* ({ context, input }) {
    return yield* context.classifyTargetResult(input.target);
  }),
};

export const router = classifyRouter;
