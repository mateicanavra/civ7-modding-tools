import type { ClassifyOptions } from "../../../lib/classify-core/index.js";

export interface ClassifyServiceContext {
  readonly classify?: ClassifyServiceOptions;
}

export interface ClassifyServiceOptions {
  readonly options?: ClassifyOptions;
}
