import { habitatServiceImplementer } from "../../impl.js";

export type GraphServiceModuleContext = Record<never, never>;

export const graphModule = habitatServiceImplementer.graph.use(({ next }) =>
  next({ context: {} satisfies GraphServiceModuleContext })
);
