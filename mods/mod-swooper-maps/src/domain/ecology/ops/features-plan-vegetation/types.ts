import type { OpTypeBagOf } from "@swooper/mapgen-core/authoring/contracts";

export type PlanVegetationTypes = OpTypeBagOf<typeof import("./contract.js").default>;
