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
  Civ7MapSummaryInputSchema,
  Civ7MapSummaryResultSchema,
  type Civ7MapSummaryInput,
  type Civ7MapSummaryResult,
} from "./types.js";
import {
  getCiv7MapSummary,
  type MapSummaryReadDependencies,
} from "./reads.js";

export const Civ7MapSummaryProcedureDescriptor = createCiv7ProcedureCoreDescriptor({
  procedureKey: "map.summary.read",
  family: "map",
  risk: "read",
  atomOwner: "packages/civ7-direct-control/src/play/map/reads.ts",
  atomFunction: "getCiv7MapSummary",
  schemaTechnology: "typebox",
  inputSchema: {
    owner: "packages/civ7-direct-control/src/play/map/types.ts",
    exportName: "Civ7MapSummaryInputSchema",
  },
  outputSchema: {
    owner: "packages/civ7-direct-control/src/play/map/types.ts",
    exportName: "Civ7MapSummaryResultSchema",
  },
  inputFields: [
    "includeAreaRegionCounts",
    "maxIds",
  ],
  outputFields: [
    "host",
    "port",
    "state",
    "map",
    "game",
    "areas",
  ],
  playerScope: "global",
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

export const Civ7MapSummaryProcedureSchemaArtifacts = {
  [civ7ProcedureSchemaReferenceKey(Civ7MapSummaryProcedureDescriptor.inputSchema)]:
    Civ7MapSummaryInputSchema,
  [civ7ProcedureSchemaReferenceKey(Civ7MapSummaryProcedureDescriptor.outputSchema)]:
    Civ7MapSummaryResultSchema,
} satisfies Civ7ProcedureSchemaArtifactMap;

export type Civ7MapSummaryProcedureCallOptions = Readonly<{
  directControl?: Civ7DirectControlOptions;
  procedure?: Civ7ProcedureCoreCallOptions;
  dependencies?: MapSummaryReadDependencies;
}>;

export function callCiv7MapSummaryProcedure(
  input: Civ7MapSummaryInput = {},
  options: Civ7MapSummaryProcedureCallOptions = {},
): Promise<Civ7ProcedureCoreCallResult<Civ7MapSummaryResult>> {
  return callCiv7ProcedureCore<Civ7MapSummaryInput, Civ7MapSummaryResult>(
    Civ7MapSummaryProcedureDescriptor,
    Civ7MapSummaryProcedureSchemaArtifacts,
    input,
    (validInput) => getCiv7MapSummary({ ...options.directControl, ...validInput }, options.dependencies),
    options.procedure,
  );
}
