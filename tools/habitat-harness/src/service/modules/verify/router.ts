import { module as verifyModule } from "./module.js";
import { runVerifyService } from "./run.js";

export const verifyRouter = {
  run: verifyModule.run.effect(({ input }) => runVerifyService(input)),
};

export const router = verifyRouter;
