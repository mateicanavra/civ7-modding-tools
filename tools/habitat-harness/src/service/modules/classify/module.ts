import type { ClassifyServiceModuleContext } from "../../context.js";
import { service } from "../../impl.js";

export const module = service.classify.use(({ context, next }) =>
  next({ context: context.classify ?? {} })
);
