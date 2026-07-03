import { module as hookModule } from "./module.js";
import { runHookService } from "./run.js";

export const hookRouter = {
  run: hookModule.run.effect(({ context, input }) => runHookService(input, context.hook)),
};

export const router = hookRouter;
