import type { OpTypeBagOf } from "@swooper/mapgen-core/authoring/contracts";

export type PlanCultivatedResourcesTypes = OpTypeBagOf<typeof import("./contract.js").default>;
