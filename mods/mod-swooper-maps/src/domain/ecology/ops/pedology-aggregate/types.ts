import type { OpTypeBagOf } from "@swooper/mapgen-core/authoring/contracts";

export type AggregatePedologyTypes = OpTypeBagOf<typeof import("./contract.js").default>;
