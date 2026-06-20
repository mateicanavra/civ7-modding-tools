import type { ClassifyOptions } from "../../../domains/workspace-graph-integration/index.js";

export interface ClassifyServiceContext {
  readonly classify?: ClassifyServiceOptions;
}

export interface ClassifyServiceOptions {
  readonly options?: ClassifyOptions;
}
