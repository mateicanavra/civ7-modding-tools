import {
  callCiv7ProcedureCore,
  civ7ProcedureSchemaReferenceKey,
  createCiv7ProcedureCoreDescriptor,
  type Civ7ProcedureCoreCallOptions,
  type Civ7ProcedureCoreCallResult,
  type Civ7ProcedureSchemaArtifactMap,
} from "../../procedure-core.js";
import type { Civ7DirectControlOptions } from "../../session/types.js";
import {
  Civ7UnitTargetActionRequestInputSchema,
  Civ7UnitTargetActionResultSchema,
  requestCiv7UnitTargetAction,
  type Civ7UnitTargetActionRequestInput,
  type Civ7UnitTargetActionResult,
} from "./unit-target-action.js";

export const Civ7UnitTargetActionRequestProcedureDescriptor = createCiv7ProcedureCoreDescriptor({
  procedureKey: "unit.target.action.request",
  family: "unit",
  risk: "mutation",
  atomOwner: "packages/civ7-direct-control/src/play/operations/unit-target-action.ts",
  atomFunction: "requestCiv7UnitTargetAction",
  schemaTechnology: "typebox",
  inputSchema: {
    owner: "packages/civ7-direct-control/src/play/operations/unit-target-action.ts",
    exportName: "Civ7UnitTargetActionRequestInputSchema",
  },
  outputSchema: {
    owner: "packages/civ7-direct-control/src/play/operations/unit-target-action.ts",
    exportName: "Civ7UnitTargetActionResultSchema",
  },
  inputFields: [
    "unitId",
    "x",
    "y",
  ],
  outputFields: [
    "host",
    "port",
    "state",
    "unitId",
    "target",
    "beforeUnit",
    "beforeTargetUnits",
    "candidates",
    "selected",
    "sent",
    "sendResult",
    "afterUnit",
    "afterTargetUnits",
    "verified",
    "verification",
    "notes",
  ],
  playerScope: "agent-slot-scoped",
  consumerClasses: [
    "normal-cli-player-agent-view",
    "effect-orpc-procedure-core",
    "runtime-proof-support",
  ],
  proofBoundary: "local-package-test",
  projection: {
    normalCli: "semantic-projection",
    debugService: "proof-diagnostic-projection",
    aiIngestion: "blocked-until-ingestion-contract",
    telemetry: "effect-orpc-middleware-hook",
    procedureCore: "typed-procedure-core",
  },
  correlation: {
    idSource: "caller-provided-and-validated",
    normalCli: "omitted-by-default",
    debugService: "included-in-diagnostics",
    telemetry: "attached-when-procedure-telemetry-enabled",
  },
  context: [
    "direct-control-facade",
    "endpoint-defaults",
    "state-selection",
    "logger",
    "evidence-sink",
    "live-session-policy",
  ],
  validatorFirst: true,
  postconditionRequired: true,
  noRepeatAfterUnverified: true,
});

export const Civ7UnitTargetActionRequestProcedureSchemaArtifacts = {
  [civ7ProcedureSchemaReferenceKey(Civ7UnitTargetActionRequestProcedureDescriptor.inputSchema)]:
    Civ7UnitTargetActionRequestInputSchema,
  [civ7ProcedureSchemaReferenceKey(Civ7UnitTargetActionRequestProcedureDescriptor.outputSchema)]:
    Civ7UnitTargetActionResultSchema,
} satisfies Civ7ProcedureSchemaArtifactMap;

export type Civ7UnitTargetActionRequestProcedureCallOptions = Readonly<{
  directControl?: Civ7DirectControlOptions;
  procedure?: Civ7ProcedureCoreCallOptions;
  request?: typeof requestCiv7UnitTargetAction;
}>;

export function callCiv7UnitTargetActionRequestProcedure(
  input: Civ7UnitTargetActionRequestInput,
  options: Civ7UnitTargetActionRequestProcedureCallOptions = {},
): Promise<Civ7ProcedureCoreCallResult<Civ7UnitTargetActionResult>> {
  return callCiv7ProcedureCore<Civ7UnitTargetActionRequestInput, Civ7UnitTargetActionResult>(
    Civ7UnitTargetActionRequestProcedureDescriptor,
    Civ7UnitTargetActionRequestProcedureSchemaArtifacts,
    input,
    (validInput) => {
      return (options.request ?? requestCiv7UnitTargetAction)(
        {
          unitId: validInput.unitId,
          x: validInput.x,
          y: validInput.y,
        },
        options.directControl,
      );
    },
    options.procedure,
  );
}
