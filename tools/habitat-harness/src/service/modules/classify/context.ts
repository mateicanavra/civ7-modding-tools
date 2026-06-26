import type { ClassifyOptions } from "@internal/habitat-harness/core/domains/workspace-graph-integration/index";
import { habitatServiceImplementer } from "../../impl.js";

export interface ClassifyServiceModuleContext {
  readonly options?: ClassifyOptions;
}

export const implementer = habitatServiceImplementer.classify.use(({ context, next }) =>
  next({ context: context.classify ?? {} })
);
