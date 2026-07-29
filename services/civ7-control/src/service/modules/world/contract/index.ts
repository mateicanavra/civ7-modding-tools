import type { InferContractRouterInputs, InferContractRouterOutputs } from "@orpc/contract";
import { current } from "./current";
import { mapReads } from "./map-reads";
export const contract = {
  ...current,
  ...mapReads,
};
type Inputs = InferContractRouterInputs<typeof contract>;
type Outputs = InferContractRouterOutputs<typeof contract>;
export type Civ7WorldCurrentResult = Outputs["current"];
export type Civ7WorldPlotSnapshot = Outputs["plot"]["plot"];
export type Civ7WorldPlotReadResult = Outputs["plot"];
export type Civ7WorldGridReadResult = Outputs["grid"];
