import { Effect } from "effect";
import { classifyTargetResult } from "../../../lib/classify-core/index.js";
import type { ClassifyServiceOptions } from "./context.js";
import type { ClassifyServiceRunInput } from "./contract.js";

export function runClassifyService(
  input: ClassifyServiceRunInput,
  serviceOptions: ClassifyServiceOptions = {}
) {
  return Effect.promise(() => classifyTargetResult(input.target, serviceOptions.options));
}
