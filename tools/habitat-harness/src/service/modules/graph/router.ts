import { module as graphModule } from "./module.js";
import { runGraphService } from "./run.js";

export const graphRouter = {
  run: graphModule.run.effect(({ input }) => runGraphService(input)),
};

export const router = graphRouter;
