import type { GraphServiceModuleContext } from "../../context.js";
import { habitatServiceImplementer } from "../../impl.js";

export const implementer = habitatServiceImplementer.graph.use(({ next }) =>
  next({ context: {} satisfies GraphServiceModuleContext })
);
