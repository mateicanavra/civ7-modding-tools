import type { CheckServiceModuleContext } from "../../context.js";
import { habitatServiceImplementer } from "../../impl.js";

export const implementer = habitatServiceImplementer.check.use(({ next }) =>
  next({ context: {} satisfies CheckServiceModuleContext })
);
