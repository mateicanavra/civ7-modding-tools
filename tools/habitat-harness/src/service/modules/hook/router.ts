import { module } from "./module.js";

export const hookRouter = {
  execute: module.execute.effect(function* ({ context, input = {} }) {
    if (input.name === "pre-push") {
      return yield* context.prePush(input);
    }
    if (input.name === "pre-commit") {
      return yield* context.preCommit(input);
    }
    return context.unknownHookResult(input.name);
  }),
};

export const router = hookRouter;
