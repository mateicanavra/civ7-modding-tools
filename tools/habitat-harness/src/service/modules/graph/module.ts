import type { GraphServiceModuleContext } from "../../context.js";
import { service } from "../../impl.js";

export const module = service.graph.use(({ next }) =>
  next({ context: {} satisfies GraphServiceModuleContext })
);
