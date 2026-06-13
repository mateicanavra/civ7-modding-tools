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
  Civ7DestinationAnalysisInputSchema,
  Civ7DestinationAnalysisResultSchema,
  getCiv7DestinationAnalysis,
  type Civ7DestinationAnalysisInput,
  type Civ7DestinationAnalysisResult,
  type DestinationAnalysisDependencies,
} from "./destination.js";

export const Civ7DestinationAnalysisProcedureDescriptor = createCiv7ProcedureCoreDescriptor({
  procedureKey: "strategy.destination.analysis",
  family: "strategy",
  risk: "read",
  atomOwner: "packages/civ7-direct-control/src/play/tactical/destination.ts",
  atomFunction: "getCiv7DestinationAnalysis",
  schemaTechnology: "typebox",
  inputSchema: {
    owner: "packages/civ7-direct-control/src/play/tactical/destination.ts",
    exportName: "Civ7DestinationAnalysisInputSchema",
  },
  outputSchema: {
    owner: "packages/civ7-direct-control/src/play/tactical/destination.ts",
    exportName: "Civ7DestinationAnalysisResultSchema",
  },
  inputFields: [
    "playerId",
    "origin",
    "destination",
    "corridorRadius",
    "destinationRadius",
    "maxPlayers",
    "maxUnits",
    "maxCities",
  ],
  outputFields: [
    "localPlayerId",
    "playerId",
    "origin",
    "destination",
    "corridorRadius",
    "destinationRadius",
    "hiddenInfoPolicy",
    "relationshipLabelPolicy",
    "corridor",
    "destinationPressure",
    "pointsOfInterest",
    "notes",
  ],
  playerScope: "local-player-scoped",
  consumerClasses: ["normal-cli-player-agent-view", "effect-orpc-procedure-core"],
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

export const Civ7DestinationAnalysisProcedureSchemaArtifacts = {
  [civ7ProcedureSchemaReferenceKey(Civ7DestinationAnalysisProcedureDescriptor.inputSchema)]:
    Civ7DestinationAnalysisInputSchema,
  [civ7ProcedureSchemaReferenceKey(Civ7DestinationAnalysisProcedureDescriptor.outputSchema)]:
    Civ7DestinationAnalysisResultSchema,
} satisfies Civ7ProcedureSchemaArtifactMap;

export type Civ7DestinationAnalysisProcedureCallOptions = Readonly<{
  directControl?: Civ7DirectControlOptions;
  procedure?: Civ7ProcedureCoreCallOptions;
  dependencies?: DestinationAnalysisDependencies;
}>;

export function callCiv7DestinationAnalysisProcedure(
  input: Civ7DestinationAnalysisInput,
  options: Civ7DestinationAnalysisProcedureCallOptions = {}
): Promise<Civ7ProcedureCoreCallResult<Civ7DestinationAnalysisResult>> {
  return callCiv7ProcedureCore<Civ7DestinationAnalysisInput, Civ7DestinationAnalysisResult>(
    Civ7DestinationAnalysisProcedureDescriptor,
    Civ7DestinationAnalysisProcedureSchemaArtifacts,
    input,
    (validInput) =>
      getCiv7DestinationAnalysis(validInput, options.directControl, options.dependencies),
    options.procedure
  );
}
