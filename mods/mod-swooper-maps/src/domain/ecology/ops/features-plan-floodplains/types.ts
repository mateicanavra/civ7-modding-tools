import type { OpTypeBagOf } from "@swooper/mapgen-core/authoring/contracts";
import PlanFloodplainsContract from "./contract.js";

type Contract = typeof PlanFloodplainsContract;
export type PlanFloodplainsTypes = OpTypeBagOf<Contract>;
