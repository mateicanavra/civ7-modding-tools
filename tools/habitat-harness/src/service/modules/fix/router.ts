import { module as fixModule } from "./module.js";
import { runFixService } from "./run.js";

export const fixRouter = {
  run: fixModule.run.effect(({ context, input }) => runFixService(input, context.fix)),
};

export const router = fixRouter;
