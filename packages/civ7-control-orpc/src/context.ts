import type { Civ7DirectControlOptions } from "@civ7/direct-control";

import type { Civ7ControlOrpcDirectControlFacade } from "./dependencies/direct-control";

export type Civ7ControlOrpcContext = Readonly<{
  directControl: Civ7ControlOrpcDirectControlFacade;
  endpointDefaults?: Civ7DirectControlOptions;
}>;
