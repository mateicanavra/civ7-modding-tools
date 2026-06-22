import { module } from "./module.js";

export const hookRouter = {
  execute: module.execute.effect(function* ({ context, input = {} }) {
    return yield* context.runHook(input);
  }),
};

export const router = hookRouter;
