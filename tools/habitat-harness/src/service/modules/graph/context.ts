import { habitatServiceImplementer } from "../../impl.js";

export type GraphServiceModuleContext = Record<never, never>;

export const implementer = habitatServiceImplementer.graph.use(({ next }) =>
  next({ context: {} satisfies GraphServiceModuleContext })
);
