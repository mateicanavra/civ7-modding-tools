import type { Civ7DirectControlOptions } from "@civ7/direct-control";
import type { Effect } from "effect/Effect";

import type { Civ7ControlOrpcDirectControlFacade } from "./dependencies/direct-control";
import type { Civ7ControlOrpcDirectLifecycleFacade } from "./dependencies/lifecycle";
import type { Civ7ControllerMutationProof } from "./model/controller-proof";
import type { Civ7ControlOrpcCorrelationContext } from "./model/correlation";

/** Host-owned whole-procedure admission around one control-oRPC invocation. */
export interface Civ7ControlOrpcProcedureAdmission {
  <A, E>(procedure: Effect<A, E>): Effect<A, E | Civ7ControlOrpcAdmissionRefusal>;
}

/** Host-owned publication hooks for lifecycle facts proved before final readback completes. */
export type Civ7ControlOrpcLifecycleProgress = Readonly<{
  singlePlayerStarted: Effect<void, unknown>;
}>;

/** A host refused procedure admission before any control behavior began. */
export class Civ7ControlOrpcAdmissionRefusal extends Error {
  override readonly name = "Civ7ControlOrpcAdmissionRefusal";

  constructor(readonly retryAtMs?: number) {
    super("Civ7 control procedure admission is temporarily unavailable");
  }
}

export type Civ7ControlOrpcContext = Readonly<{
  directControl: Civ7ControlOrpcDirectControlFacade;
  directLifecycle?: Civ7ControlOrpcDirectLifecycleFacade;
  endpointDefaults?: Civ7DirectControlOptions;
  procedureAdmission?: Civ7ControlOrpcProcedureAdmission;
  lifecycleProgress?: Civ7ControlOrpcLifecycleProgress;
  correlation?: Civ7ControlOrpcCorrelationContext;
  controller?: Readonly<{
    supportedReadProcedures?: readonly string[];
    supportedMutationProcedures?: readonly string[];
  }>;
  controllerProof?: Civ7ControllerMutationProof;
}>;
