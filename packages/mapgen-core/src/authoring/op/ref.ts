import type { TSchema } from "typebox";

import type { OpContract } from "./contract.js";

export type OpRef = Readonly<{
  id: string;
  config: TSchema;
}>;

/** Projects the canonical operation identity and already-derived configuration schema. */
export function opRef<const C extends OpContract<any, any, any, any, any>>(contract: C): OpRef {
  return { id: contract.id, config: contract.config };
}
