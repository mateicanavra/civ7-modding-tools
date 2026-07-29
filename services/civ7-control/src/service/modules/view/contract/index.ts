import type { InferContractRouterInputs, InferContractRouterOutputs } from "@orpc/contract";
import { appshotCapture } from "./appshot-capture";
import { cameraFocus } from "./camera-focus";
export const contract = {
  ...appshotCapture,
  ...cameraFocus,
};
type Inputs = InferContractRouterInputs<typeof contract>;
type Outputs = InferContractRouterOutputs<typeof contract>;
export type Civ7ViewCamera = Outputs["camera"]["focus"];
export type Civ7ViewAppshotCaptureResult = Outputs["appshot"]["capture"];
