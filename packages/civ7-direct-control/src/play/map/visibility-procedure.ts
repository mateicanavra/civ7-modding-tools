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
  Civ7VisibilitySummaryInputSchema,
  Civ7VisibilitySummaryResultSchema,
  getCiv7VisibilitySummary,
  type Civ7VisibilitySummaryInput,
  type Civ7VisibilitySummaryResult,
  type VisibilityReadDependencies,
} from "./visibility.js";

export const Civ7VisibilitySummaryProcedureDescriptor = createCiv7ProcedureCoreDescriptor({
  procedureKey: "map.visibility.read",
  family: "map",
  risk: "read",
  atomOwner: "packages/civ7-direct-control/src/play/map/visibility.ts",
  atomFunction: "getCiv7VisibilitySummary",
  schemaTechnology: "typebox",
  inputSchema: {
    owner: "packages/civ7-direct-control/src/play/map/visibility.ts",
    exportName: "Civ7VisibilitySummaryInputSchema",
  },
  outputSchema: {
    owner: "packages/civ7-direct-control/src/play/map/visibility.ts",
    exportName: "Civ7VisibilitySummaryResultSchema",
  },
  inputFields: ["playerId", "bounds", "includeGrid", "maxPlots"],
  outputFields: [
    "host",
    "port",
    "state",
    "playerId",
    "numPlotsRevealed",
    "numPlotsVisible",
    "mapPlotCount",
    "counts",
    "grid",
  ],
  playerScope: "local-player-scoped",
  consumerClasses: [
    "normal-cli-player-agent-view",
    "effect-orpc-procedure-core",
    "static-profile-shaping",
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

export const Civ7VisibilitySummaryProcedureSchemaArtifacts = {
  [civ7ProcedureSchemaReferenceKey(Civ7VisibilitySummaryProcedureDescriptor.inputSchema)]:
    Civ7VisibilitySummaryInputSchema,
  [civ7ProcedureSchemaReferenceKey(Civ7VisibilitySummaryProcedureDescriptor.outputSchema)]:
    Civ7VisibilitySummaryResultSchema,
} satisfies Civ7ProcedureSchemaArtifactMap;

export type Civ7VisibilitySummaryProcedureCallOptions = Readonly<{
  directControl?: Civ7DirectControlOptions;
  procedure?: Civ7ProcedureCoreCallOptions;
  dependencies?: VisibilityReadDependencies;
}>;

export function callCiv7VisibilitySummaryProcedure(
  input: Civ7VisibilitySummaryInput,
  options: Civ7VisibilitySummaryProcedureCallOptions = {}
): Promise<Civ7ProcedureCoreCallResult<Civ7VisibilitySummaryResult>> {
  return callCiv7ProcedureCore<Civ7VisibilitySummaryInput, Civ7VisibilitySummaryResult>(
    Civ7VisibilitySummaryProcedureDescriptor,
    Civ7VisibilitySummaryProcedureSchemaArtifacts,
    input,
    (validInput) =>
      getCiv7VisibilitySummary(validInput, options.directControl, options.dependencies),
    options.procedure
  );
}
