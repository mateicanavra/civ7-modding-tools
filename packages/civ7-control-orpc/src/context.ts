import type {
  Civ7ActionApproval,
  Civ7DirectControlOptions,
} from "@civ7/direct-control";

import type { Civ7ControlOrpcDirectControlFacade } from "./dependencies/direct-control";
import type { Civ7ControlOrpcCorrelationContext } from "./model/correlation";

export type Civ7ControlOrpcContext = Readonly<{
  directControl: Civ7ControlOrpcDirectControlFacade;
  endpointDefaults?: Civ7DirectControlOptions;
  approval?: Civ7ActionApproval;
  correlation?: Civ7ControlOrpcCorrelationContext;
}>;
