import type { ClassifyOptions } from "@internal/habitat-harness/service/modules/graph/workspace/index";
import { habitatServiceImplementer } from "../../impl.js";

export interface ClassifyServiceModuleContext {
  readonly options?: ClassifyOptions;
}

export const implementer = habitatServiceImplementer.classify.use(({ context, next }) =>
  next({ context: context.classify ?? {} })
);
