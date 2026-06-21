import type { ClassifyOptions } from "@internal/habitat-harness/core/domains/workspace-graph-integration/index";
import { habitatServiceImplementer } from "../../impl.js";

export interface ClassifyServiceModuleContext {
  readonly options?: ClassifyOptions;
}

// TODO: make all module implementer exports standard name -- just "module" -- always prioritize scale continuity and special case reduction. this should be an enforced habitat pattern
export const classifyModule = habitatServiceImplementer.classify.use(({ context, next }) =>
  next({ context: context.classify ?? {} })
);
