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
  Civ7MapGridInputSchema,
  Civ7MapGridResultSchema,
  type Civ7MapGridInput,
  type Civ7MapGridResult,
} from "./types.js";
import { getCiv7MapGrid, type MapGridReadDependencies } from "./reads.js";

export const Civ7MapGridProcedureDescriptor = createCiv7ProcedureCoreDescriptor({
  procedureKey: "map.grid.read",
  family: "map",
  risk: "read",
  atomOwner: "packages/civ7-direct-control/src/play/map/reads.ts",
  atomFunction: "getCiv7MapGrid",
  schemaTechnology: "typebox",
  inputSchema: {
    owner: "packages/civ7-direct-control/src/play/map/types.ts",
    exportName: "Civ7MapGridInputSchema",
  },
  outputSchema: {
    owner: "packages/civ7-direct-control/src/play/map/types.ts",
    exportName: "Civ7MapGridResultSchema",
  },
  inputFields: ["bounds", "locations", "fields", "playerId", "includeHidden", "maxPlots"],
  outputFields: [
    "host",
    "port",
    "state",
    "bounds",
    "fields",
    "plotCount",
    "omitted",
    "hiddenInfoPolicy",
    "map",
    "plots",
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

export const Civ7MapGridProcedureSchemaArtifacts = {
  [civ7ProcedureSchemaReferenceKey(Civ7MapGridProcedureDescriptor.inputSchema)]:
    Civ7MapGridInputSchema,
  [civ7ProcedureSchemaReferenceKey(Civ7MapGridProcedureDescriptor.outputSchema)]:
    Civ7MapGridResultSchema,
} satisfies Civ7ProcedureSchemaArtifactMap;

export type Civ7MapGridProcedureCallOptions = Readonly<{
  directControl?: Civ7DirectControlOptions;
  procedure?: Civ7ProcedureCoreCallOptions;
  dependencies?: MapGridReadDependencies;
}>;

export function callCiv7MapGridProcedure(
  input: Civ7MapGridInput,
  options: Civ7MapGridProcedureCallOptions = {}
): Promise<Civ7ProcedureCoreCallResult<Civ7MapGridResult>> {
  return callCiv7ProcedureCore<Civ7MapGridInput, Civ7MapGridResult>(
    Civ7MapGridProcedureDescriptor,
    Civ7MapGridProcedureSchemaArtifacts,
    input,
    (validInput) => getCiv7MapGrid(validInput, options.directControl, options.dependencies),
    options.procedure
  );
}
