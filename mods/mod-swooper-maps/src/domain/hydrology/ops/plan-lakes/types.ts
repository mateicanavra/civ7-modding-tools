import type { OpTypeBagOf } from "@swooper/mapgen-core/authoring/contracts";

type Contract = typeof import("./contract.js").default;

/**
 * Generated op type bag for plan-lakes consumers.
 * Keeping the alias op-local avoids a shared hydrology config/type dumping ground.
 */
export type PlanLakesTypes = OpTypeBagOf<Contract>;
