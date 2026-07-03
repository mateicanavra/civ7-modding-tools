import { module } from "./module.js";

export const hookRouter = {
  run: module.run.effect(function* ({ context, input = {} }) {
    return yield* context.runHook(input);
  }),
};

export const router = hookRouter;
