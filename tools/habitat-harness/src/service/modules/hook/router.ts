import { module as hookModule } from "./module.js";
import { runHookService } from "./run.js";

export const hookRouter = {
  run: hookModule.run.effect(({ input }) => runHookService(input)),
};

export const router = hookRouter;
