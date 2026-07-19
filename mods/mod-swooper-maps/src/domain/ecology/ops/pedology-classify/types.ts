import type { AdmittedOperationInput } from "@swooper/mapgen-core/authoring";
import type { OpTypeBagOf } from "@swooper/mapgen-core/authoring/contracts";

type PedologyClassifyContract = typeof import("./contract.js").default;

export type PedologyClassifyTypes = OpTypeBagOf<PedologyClassifyContract>;
export type PedologyClassifyInput = PedologyClassifyTypes["input"];

/** Strategy-only input view produced after Core admits the pedology operation contract. */
export type PedologyClassifyAdmittedInput = AdmittedOperationInput<
  PedologyClassifyContract["input"]
>;

export type PedologyClassifyOutput = PedologyClassifyTypes["output"];
export type PedologyClassifyConfig = PedologyClassifyTypes["config"]["default"];
