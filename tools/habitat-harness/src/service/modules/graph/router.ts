import { module } from "./module.js";

export const graphRouter = {
  run: module.run.effect(function* ({ context, errors, input = {} }) {
    return yield* context.runGraph(input, errors.BAD_REQUEST);
  }),
};

export const router = graphRouter;
