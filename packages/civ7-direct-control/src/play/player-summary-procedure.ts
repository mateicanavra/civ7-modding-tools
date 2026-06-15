import {
  type Civ7ProcedureCoreCallOptions,
  type Civ7ProcedureCoreCallResult,
  type Civ7ProcedureSchemaArtifactMap,
  callCiv7ProcedureCore,
  civ7ProcedureSchemaReferenceKey,
  createCiv7ProcedureCoreDescriptor,
} from "../procedure-core";
import type { Civ7DirectControlOptions } from "../session/types";
import {
  type Civ7PlayerSummaryDependencies,
  type Civ7PlayerSummaryInput,
  Civ7PlayerSummaryInputSchema,
  type Civ7PlayerSummaryResult,
  Civ7PlayerSummaryResultSchema,
  getCiv7PlayerSummary,
} from "./summaries";

export const Civ7PlayerSummaryProcedureDescriptor = createCiv7ProcedureCoreDescriptor({
  procedureKey: "player.summary.read",
  family: "player",
  risk: "read",
  atomOwner: "packages/civ7-direct-control/src/play/summaries.ts",
  atomFunction: "getCiv7PlayerSummary",
  schemaTechnology: "typebox",
  inputSchema: {
    owner: "packages/civ7-direct-control/src/play/summaries.ts",
    exportName: "Civ7PlayerSummaryInputSchema",
  },
  outputSchema: {
    owner: "packages/civ7-direct-control/src/play/summaries.ts",
    exportName: "Civ7PlayerSummaryResultSchema",
  },
  inputFields: ["playerIds", "includeUnits", "includeCities", "maxItems"],
  outputFields: ["host", "port", "state", "players", "omitted"],
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

export const Civ7PlayerSummaryProcedureSchemaArtifacts = {
  [civ7ProcedureSchemaReferenceKey(Civ7PlayerSummaryProcedureDescriptor.inputSchema)]:
    Civ7PlayerSummaryInputSchema,
  [civ7ProcedureSchemaReferenceKey(Civ7PlayerSummaryProcedureDescriptor.outputSchema)]:
    Civ7PlayerSummaryResultSchema,
} satisfies Civ7ProcedureSchemaArtifactMap;

export type Civ7PlayerSummaryProcedureCallOptions = Readonly<{
  directControl?: Civ7DirectControlOptions;
  procedure?: Civ7ProcedureCoreCallOptions;
  dependencies?: Civ7PlayerSummaryDependencies;
}>;

export function callCiv7PlayerSummaryProcedure(
  input: Civ7PlayerSummaryInput = {},
  options: Civ7PlayerSummaryProcedureCallOptions = {}
): Promise<Civ7ProcedureCoreCallResult<Civ7PlayerSummaryResult>> {
  return callCiv7ProcedureCore<Civ7PlayerSummaryInput, Civ7PlayerSummaryResult>(
    Civ7PlayerSummaryProcedureDescriptor,
    Civ7PlayerSummaryProcedureSchemaArtifacts,
    input,
    (validInput) => getCiv7PlayerSummary(validInput, options.directControl, options.dependencies),
    options.procedure
  );
}
