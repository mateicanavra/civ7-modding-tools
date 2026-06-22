import { module } from "./module.js";

export const hookRouter = {
  preCommit: module.preCommit.effect(function* ({ context, input = {} }) {
    return yield* context.preCommit(input);
  }),
  prePush: module.prePush.effect(function* ({ context, input = {} }) {
    return yield* context.prePush(input);
  }),
};

export const router = hookRouter;
