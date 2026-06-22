import { module } from "./module.js";

export const graphRouter = {
  workspaceGraph: module.workspaceGraph.effect(function* ({ context, errors, input = {} }) {
    return yield* context.runGraph(input, errors.BAD_REQUEST);
  }),
};

export const router = graphRouter;
