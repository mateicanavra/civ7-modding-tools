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
  Civ7SettlementRecommendationInputSchema,
  Civ7SettlementRecommendationResultSchema,
  getCiv7SettlementRecommendations,
  type Civ7SettlementRecommendationInput,
  type Civ7SettlementRecommendationResult,
  type SettlementRecommendationDependencies,
} from "./settlement.js";

export const Civ7SettlementRecommendationsProcedureDescriptor = createCiv7ProcedureCoreDescriptor({
  procedureKey: "strategy.settlement.recommendations",
  family: "strategy",
  risk: "read",
  atomOwner: "packages/civ7-direct-control/src/play/tactical/settlement.ts",
  atomFunction: "getCiv7SettlementRecommendations",
  schemaTechnology: "typebox",
  inputSchema: {
    owner: "packages/civ7-direct-control/src/play/tactical/settlement.ts",
    exportName: "Civ7SettlementRecommendationInputSchema",
  },
  outputSchema: {
    owner: "packages/civ7-direct-control/src/play/tactical/settlement.ts",
    exportName: "Civ7SettlementRecommendationResultSchema",
  },
  inputFields: ["playerId", "locations", "count", "includeSettlers", "includeCities"],
  outputFields: [
    "localPlayerId",
    "playerId",
    "count",
    "requestedLocations",
    "origins",
    "recommendations",
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

export const Civ7SettlementRecommendationsProcedureSchemaArtifacts = {
  [civ7ProcedureSchemaReferenceKey(Civ7SettlementRecommendationsProcedureDescriptor.inputSchema)]:
    Civ7SettlementRecommendationInputSchema,
  [civ7ProcedureSchemaReferenceKey(Civ7SettlementRecommendationsProcedureDescriptor.outputSchema)]:
    Civ7SettlementRecommendationResultSchema,
} satisfies Civ7ProcedureSchemaArtifactMap;

export type Civ7SettlementRecommendationsProcedureCallOptions = Readonly<{
  directControl?: Civ7DirectControlOptions;
  procedure?: Civ7ProcedureCoreCallOptions;
  dependencies?: SettlementRecommendationDependencies;
}>;

export function callCiv7SettlementRecommendationsProcedure(
  input: Civ7SettlementRecommendationInput = {},
  options: Civ7SettlementRecommendationsProcedureCallOptions = {}
): Promise<Civ7ProcedureCoreCallResult<Civ7SettlementRecommendationResult>> {
  return callCiv7ProcedureCore<
    Civ7SettlementRecommendationInput,
    Civ7SettlementRecommendationResult
  >(
    Civ7SettlementRecommendationsProcedureDescriptor,
    Civ7SettlementRecommendationsProcedureSchemaArtifacts,
    input,
    (validInput) =>
      getCiv7SettlementRecommendations(validInput, options.directControl, options.dependencies),
    options.procedure
  );
}
