import type { ClassifyOptions } from "@internal/habitat-harness/core/domains/workspace-graph-integration/index";

export interface ClassifyServiceContext {
  readonly classify?: ClassifyServiceOptions;
}

export interface ClassifyServiceOptions {
  readonly options?: ClassifyOptions;
}
