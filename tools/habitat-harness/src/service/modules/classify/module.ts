import type { ClassifyServiceModuleContext } from "../../context.js";
import { habitatServiceImplementer } from "../../impl.js";

export const implementer = habitatServiceImplementer.classify.use(({ context, next }) =>
  next({ context: context.classify ?? {} })
);
