import { classifyTargetResult } from "@internal/habitat-harness/service/modules/graph/workspace/index"; // TODO: NO YOU FUCKWAD. THIS IS WRONG. NO SPELUNKING INTO OTHER MODULES. THIS MEANS YOU DO NOT HAVE CORRECT DOMAIN AND MODULE DESIGN. THIS SHOULD ALRADY BE ENFORCED AS NX MODULE BOUNDARIES.
import { Effect } from "effect";
import { module } from "./module.js";

export const classifyRouter = {
  run: module.run.effect(function* ({ context, input }) {
    return yield* Effect.promise(() => classifyTargetResult(input.target, context.options ?? {}));
  }),
};

export const router = classifyRouter;
