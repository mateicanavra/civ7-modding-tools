import { module as classifyModule } from "./module.js";
import { runClassifyService } from "./run.js";

export const classifyRouter = {
  run: classifyModule.run.effect(({ context, input }) =>
    runClassifyService(input, context.classify)
  ),
};

export const router = classifyRouter;
