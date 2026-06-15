import type { OpTypeBagOf } from "@swooper/mapgen-core/authoring/contracts";

type Contract = typeof import("./contract.js").default;

export type PlanNaturalWondersTypes = OpTypeBagOf<Contract>;
