import type { AdmittedOperationInput } from "@swooper/mapgen-core/authoring";
import type { OpTypeBagOf } from "@swooper/mapgen-core/authoring/contracts";

type ResourcePlanBasinsContract = typeof import("./contract.js").default;

export type ResourcePlanBasinsTypes = OpTypeBagOf<ResourcePlanBasinsContract>;
export type ResourcePlanBasinsInput = ResourcePlanBasinsTypes["input"];

/** Strategy-only input view produced after Core admits the resource-basin operation contract. */
export type ResourcePlanBasinsAdmittedInput = AdmittedOperationInput<
  ResourcePlanBasinsContract["input"]
>;

export type ResourcePlanBasinsOutput = ResourcePlanBasinsTypes["output"];
export type ResourcePlanBasinsConfig = ResourcePlanBasinsTypes["config"]["default"];
