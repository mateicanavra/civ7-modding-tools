import type { OpTypeBagOf } from "@swooper/mapgen-core/authoring/contracts";

export type PlanIceTypes = OpTypeBagOf<typeof import("./contract.js").default>;
