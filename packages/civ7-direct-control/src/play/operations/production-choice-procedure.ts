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
  Civ7ProductionChoiceRequestInputSchema,
  Civ7ProductionChoiceResultSchema,
  requestCiv7ProductionChoice,
  type Civ7ProductionChoiceRequestInput,
  type Civ7ProductionChoiceResult,
} from "./production-choice.js";

export const Civ7ProductionChoiceRequestProcedureDescriptor = createCiv7ProcedureCoreDescriptor({
  procedureKey: "city.production.choice.request",
  family: "city",
  risk: "mutation",
  atomOwner: "packages/civ7-direct-control/src/play/operations/production-choice.ts",
  atomFunction: "requestCiv7ProductionChoice",
  schemaTechnology: "typebox",
  inputSchema: {
    owner: "packages/civ7-direct-control/src/play/operations/production-choice.ts",
    exportName: "Civ7ProductionChoiceRequestInputSchema",
  },
  outputSchema: {
    owner: "packages/civ7-direct-control/src/play/operations/production-choice.ts",
    exportName: "Civ7ProductionChoiceResultSchema",
  },
  inputFields: [
    "cityId",
    "args",
  ],
  outputFields: [
    "before",
    "after",
    "sent",
    "verified",
    "productionPostcondition",
    "payload",
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

export const Civ7ProductionChoiceRequestProcedureSchemaArtifacts = {
  [civ7ProcedureSchemaReferenceKey(Civ7ProductionChoiceRequestProcedureDescriptor.inputSchema)]:
    Civ7ProductionChoiceRequestInputSchema,
  [civ7ProcedureSchemaReferenceKey(Civ7ProductionChoiceRequestProcedureDescriptor.outputSchema)]:
    Civ7ProductionChoiceResultSchema,
} satisfies Civ7ProcedureSchemaArtifactMap;

export type Civ7ProductionChoiceRequestProcedureCallOptions = Readonly<{
  directControl?: Civ7DirectControlOptions;
  procedure?: Civ7ProcedureCoreCallOptions;
  request?: typeof requestCiv7ProductionChoice;
}>;

export function callCiv7ProductionChoiceRequestProcedure(
  input: Civ7ProductionChoiceRequestInput,
  options: Civ7ProductionChoiceRequestProcedureCallOptions = {},
): Promise<Civ7ProcedureCoreCallResult<Civ7ProductionChoiceResult>> {
  return callCiv7ProcedureCore<Civ7ProductionChoiceRequestInput, Civ7ProductionChoiceResult>(
    Civ7ProductionChoiceRequestProcedureDescriptor,
    Civ7ProductionChoiceRequestProcedureSchemaArtifacts,
    input,
    async (validInput) => {
      const result = await (options.request ?? requestCiv7ProductionChoice)(
        {
          cityId: validInput.cityId,
          args: validInput.args,
        },
        options.directControl,
      );
      return {
        before: result.before,
        after: result.after,
        sent: result.sent,
        verified: result.verified,
        ...(result.productionPostcondition ? { productionPostcondition: result.productionPostcondition } : {}),
        ...(result.payload ? { payload: result.payload } : {}),
      };
    },
    options.procedure,
  );
}
