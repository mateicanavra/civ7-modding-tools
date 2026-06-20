import { module as checkModule } from "./module.js";
import { expandCheckBaselinesService, runCheckService } from "./run.js";

export const checkRouter = {
  run: checkModule.run.effect(({ input }) => runCheckService(input)),
  expandBaseline: checkModule.expandBaseline.effect(({ input }) =>
    expandCheckBaselinesService(input)
  ),
};

export const router = checkRouter;
