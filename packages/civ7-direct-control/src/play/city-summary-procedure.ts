import {
  callCiv7ProcedureCore,
  civ7ProcedureSchemaReferenceKey,
  createCiv7ProcedureCoreDescriptor,
  type Civ7ProcedureCoreCallOptions,
  type Civ7ProcedureCoreCallResult,
  type Civ7ProcedureSchemaArtifactMap,
} from "../procedure-core";
import type { Civ7DirectControlOptions } from "../session/types";
import {
  Civ7CitySummaryInputSchema,
  Civ7CitySummaryResultSchema,
  getCiv7CitySummary,
  type Civ7CitySummaryDependencies,
  type Civ7CitySummaryInput,
  type Civ7CitySummaryResult,
} from "./summaries";

export const Civ7CitySummaryProcedureDescriptor = createCiv7ProcedureCoreDescriptor({
  procedureKey: "city.summary.read",
  family: "city",
  risk: "read",
  atomOwner: "packages/civ7-direct-control/src/play/summaries.ts",
  atomFunction: "getCiv7CitySummary",
  schemaTechnology: "typebox",
  inputSchema: {
    owner: "packages/civ7-direct-control/src/play/summaries.ts",
    exportName: "Civ7CitySummaryInputSchema",
  },
  outputSchema: {
    owner: "packages/civ7-direct-control/src/play/summaries.ts",
    exportName: "Civ7CitySummaryResultSchema",
  },
  inputFields: [
    "playerIds",
    "cityIds",
    "playerId",
    "maxItems",
    "includeHidden",
  ],
  outputFields: [
    "host",
    "port",
    "state",
    "cities",
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

export const Civ7CitySummaryProcedureSchemaArtifacts = {
  [civ7ProcedureSchemaReferenceKey(Civ7CitySummaryProcedureDescriptor.inputSchema)]:
    Civ7CitySummaryInputSchema,
  [civ7ProcedureSchemaReferenceKey(Civ7CitySummaryProcedureDescriptor.outputSchema)]:
    Civ7CitySummaryResultSchema,
} satisfies Civ7ProcedureSchemaArtifactMap;

export type Civ7CitySummaryProcedureCallOptions = Readonly<{
  directControl?: Civ7DirectControlOptions;
  procedure?: Civ7ProcedureCoreCallOptions;
  dependencies?: Civ7CitySummaryDependencies;
}>;

export function callCiv7CitySummaryProcedure(
  input: Civ7CitySummaryInput = {},
  options: Civ7CitySummaryProcedureCallOptions = {},
): Promise<Civ7ProcedureCoreCallResult<Civ7CitySummaryResult>> {
  return callCiv7ProcedureCore<Civ7CitySummaryInput, Civ7CitySummaryResult>(
    Civ7CitySummaryProcedureDescriptor,
    Civ7CitySummaryProcedureSchemaArtifacts,
    input,
    (validInput) => getCiv7CitySummary(validInput, options.directControl, options.dependencies),
    options.procedure,
  );
}
