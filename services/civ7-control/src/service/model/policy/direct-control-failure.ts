export {
  type Civ7DirectControlErrorShape,
  isCiv7DirectControlError,
} from "@civ7/direct-control/error";

import {
  type Civ7CommandDispatchStatus,
  isCiv7DirectControlError,
} from "@civ7/direct-control/error";

/**
 * Reads dispatch evidence only from the guarded direct-control error boundary.
 *
 * The public guard intentionally supports duplicated ESM/CJS package builds while
 * rejecting arbitrary thrown objects that happen to expose a dispatchStatus field.
 */
export function civ7DirectControlDispatchStatus(cause: unknown): Civ7CommandDispatchStatus {
  return isCiv7DirectControlError(cause)
    ? (cause.dispatchStatus ?? "indeterminate")
    : "indeterminate";
}
