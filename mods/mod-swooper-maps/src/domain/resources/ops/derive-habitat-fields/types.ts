import type { OpTypeBagOf } from "@swooper/mapgen-core/authoring/contracts";

export type DeriveHabitatFieldsTypes = OpTypeBagOf<typeof import("./contract.js").default>;
