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
  Civ7UnitSummaryInputSchema,
  Civ7UnitSummaryResultSchema,
  getCiv7UnitSummary,
  type Civ7UnitSummaryDependencies,
  type Civ7UnitSummaryInput,
  type Civ7UnitSummaryResult,
} from "./summaries.js";

export const Civ7UnitSummaryProcedureDescriptor = createCiv7ProcedureCoreDescriptor({
  procedureKey: "unit.summary.read",
  family: "unit",
  risk: "read",
  atomOwner: "packages/civ7-direct-control/src/play/summaries.ts",
  atomFunction: "getCiv7UnitSummary",
  schemaTechnology: "typebox",
  inputSchema: {
    owner: "packages/civ7-direct-control/src/play/summaries.ts",
    exportName: "Civ7UnitSummaryInputSchema",
  },
  outputSchema: {
    owner: "packages/civ7-direct-control/src/play/summaries.ts",
    exportName: "Civ7UnitSummaryResultSchema",
  },
  inputFields: [
    "playerIds",
    "unitIds",
    "playerId",
    "maxItems",
    "includeHidden",
  ],
  outputFields: [
    "host",
    "port",
    "state",
    "units",
    "omitted",
  ],
  playerScope: "local-player-scoped",
  consumerClasses: [
    "normal-cli-player-agent-view",
    "effect-orpc-procedure-core",
    "runtime-proof-support",
  ],
  proofBoundary: "local-package-test",
  projection: {
    normalCli: "semantic-projection",
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

export const Civ7UnitSummaryProcedureSchemaArtifacts = {
  [civ7ProcedureSchemaReferenceKey(Civ7UnitSummaryProcedureDescriptor.inputSchema)]:
    Civ7UnitSummaryInputSchema,
  [civ7ProcedureSchemaReferenceKey(Civ7UnitSummaryProcedureDescriptor.outputSchema)]:
    Civ7UnitSummaryResultSchema,
} satisfies Civ7ProcedureSchemaArtifactMap;

export type Civ7UnitSummaryProcedureCallOptions = Readonly<{
  directControl?: Civ7DirectControlOptions;
  procedure?: Civ7ProcedureCoreCallOptions;
  dependencies?: Civ7UnitSummaryDependencies;
}>;

export function callCiv7UnitSummaryProcedure(
  input: Civ7UnitSummaryInput = {},
  options: Civ7UnitSummaryProcedureCallOptions = {},
): Promise<Civ7ProcedureCoreCallResult<Civ7UnitSummaryResult>> {
  return callCiv7ProcedureCore<Civ7UnitSummaryInput, Civ7UnitSummaryResult>(
    Civ7UnitSummaryProcedureDescriptor,
    Civ7UnitSummaryProcedureSchemaArtifacts,
    input,
    (validInput) => getCiv7UnitSummary(validInput, options.directControl, options.dependencies),
    options.procedure,
  );
}
