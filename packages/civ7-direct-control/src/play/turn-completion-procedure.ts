import {
  callCiv7ProcedureCore,
  civ7ProcedureSchemaReferenceKey,
  createCiv7ProcedureCoreDescriptor,
  type Civ7ProcedureCoreCallOptions,
  type Civ7ProcedureCoreCallResult,
  type Civ7ProcedureSchemaArtifactMap,
} from "../procedure-core.js";
import type { Civ7DirectControlOptions } from "../session/types.js";
import {
  Civ7TurnCompletionStatusInputSchema,
  Civ7TurnCompletionStatusResultSchema,
  getCiv7TurnCompletionStatus,
  type Civ7TurnCompletionStatusDependencies,
  type Civ7TurnCompletionStatusInput,
  type Civ7TurnCompletionStatusResult,
} from "./turn-completion.js";

export const Civ7TurnCompletionStatusProcedureDescriptor = createCiv7ProcedureCoreDescriptor({
  procedureKey: "runtime.turn.completion.status",
  family: "runtime",
  risk: "read",
  atomOwner: "packages/civ7-direct-control/src/play/turn-completion.ts",
  atomFunction: "getCiv7TurnCompletionStatus",
  schemaTechnology: "typebox",
  inputSchema: {
    owner: "packages/civ7-direct-control/src/play/turn-completion.ts",
    exportName: "Civ7TurnCompletionStatusInputSchema",
  },
  outputSchema: {
    owner: "packages/civ7-direct-control/src/play/turn-completion.ts",
    exportName: "Civ7TurnCompletionStatusResultSchema",
  },
  inputFields: [],
  outputFields: [
    "host",
    "port",
    "state",
    "localPlayerId",
    "turn",
    "turnDate",
    "hasSentTurnComplete",
    "canEndTurn",
    "blocker",
    "firstReadyUnitId",
  ],
  playerScope: "local-player-scoped",
  consumerClasses: [
    "normal-cli-player-agent-view",
    "effect-orpc-procedure-core",
    "runtime-proof-support",
  ],
  proofBoundary: "local-package-test",
  projection: {
    normalCli: "summarized-state-machine-status",
    debugService: "omitted",
    aiIngestion: "blocked-until-ingestion-contract",
    telemetry: "blocked-until-procedure-middleware",
    procedureCore: "typed-procedure-core",
  },
  correlation: {
    idSource: "generated-per-call",
    normalCli: "omitted-by-default",
    debugService: "included-in-diagnostics",
    telemetry: "omitted",
  },
  context: [
    "direct-control-facade",
    "endpoint-defaults",
    "state-selection",
    "logger",
    "evidence-sink",
  ],
});

export const Civ7TurnCompletionStatusProcedureSchemaArtifacts = {
  [civ7ProcedureSchemaReferenceKey(Civ7TurnCompletionStatusProcedureDescriptor.inputSchema)]:
    Civ7TurnCompletionStatusInputSchema,
  [civ7ProcedureSchemaReferenceKey(Civ7TurnCompletionStatusProcedureDescriptor.outputSchema)]:
    Civ7TurnCompletionStatusResultSchema,
} satisfies Civ7ProcedureSchemaArtifactMap;

export type Civ7TurnCompletionStatusProcedureCallOptions = Readonly<{
  directControl?: Civ7DirectControlOptions;
  procedure?: Civ7ProcedureCoreCallOptions;
  dependencies?: Civ7TurnCompletionStatusDependencies;
}>;

export function callCiv7TurnCompletionStatusProcedure(
  input: Civ7TurnCompletionStatusInput = {},
  options: Civ7TurnCompletionStatusProcedureCallOptions = {}
): Promise<Civ7ProcedureCoreCallResult<Civ7TurnCompletionStatusResult>> {
  return callCiv7ProcedureCore<Civ7TurnCompletionStatusInput, Civ7TurnCompletionStatusResult>(
    Civ7TurnCompletionStatusProcedureDescriptor,
    Civ7TurnCompletionStatusProcedureSchemaArtifacts,
    input,
    () => getCiv7TurnCompletionStatus(options.directControl, options.dependencies),
    options.procedure
  );
}
