import type { Civ7DirectControlOptions } from "@civ7/direct-control";

import type { Civ7ControlOrpcDirectControlFacade } from "./dependencies/direct-control";
import type { Civ7ControlOrpcDirectLifecycleFacade } from "./dependencies/lifecycle";
import type { Civ7ControllerMutationProof } from "./model/controller-proof";
import type { Civ7ControlOrpcCorrelationContext } from "./model/correlation";

export type Civ7ControlOrpcContext = Readonly<{
  directControl: Civ7ControlOrpcDirectControlFacade;
  directLifecycle?: Civ7ControlOrpcDirectLifecycleFacade;
  endpointDefaults?: Civ7DirectControlOptions;
  correlation?: Civ7ControlOrpcCorrelationContext;
  controller?: Readonly<{
    supportedReadProcedures?: readonly string[];
    supportedMutationProcedures?: readonly string[];
  }>;
  controllerProof?: Civ7ControllerMutationProof;
}>;
