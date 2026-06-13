import {
  type Civ7ProcedureCoreCallOptions,
  type Civ7ProcedureCoreCallResult,
  type Civ7ProcedureSchemaArtifactMap,
  callCiv7ProcedureCore,
  civ7ProcedureSchemaReferenceKey,
  createCiv7ProcedureCoreDescriptor,
} from "../../procedure-core.js";
import type { Civ7DirectControlOptions } from "../../session/types.js";
import { getCiv7PlotSnapshot, type PlotSnapshotReadDependencies } from "./reads.js";
import {
  type Civ7PlotSnapshotInput,
  Civ7PlotSnapshotInputSchema,
  type Civ7PlotSnapshotResult,
  Civ7PlotSnapshotResultSchema,
} from "./types.js";

export const Civ7PlotSnapshotProcedureDescriptor = createCiv7ProcedureCoreDescriptor({
  procedureKey: "map.plot.snapshot",
  family: "map",
  risk: "read",
  atomOwner: "packages/civ7-direct-control/src/play/map/reads.ts",
  atomFunction: "getCiv7PlotSnapshot",
  schemaTechnology: "typebox",
  inputSchema: {
    owner: "packages/civ7-direct-control/src/play/map/types.ts",
    exportName: "Civ7PlotSnapshotInputSchema",
  },
  outputSchema: {
    owner: "packages/civ7-direct-control/src/play/map/types.ts",
    exportName: "Civ7PlotSnapshotResultSchema",
  },
  inputFields: ["x", "y", "playerId", "fields", "includeHidden"],
  outputFields: [
    "host",
    "port",
    "state",
    "location",
    "revealedState",
    "visible",
    "hiddenInfoPolicy",
    "facts",
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

export const Civ7PlotSnapshotProcedureSchemaArtifacts = {
  [civ7ProcedureSchemaReferenceKey(Civ7PlotSnapshotProcedureDescriptor.inputSchema)]:
    Civ7PlotSnapshotInputSchema,
  [civ7ProcedureSchemaReferenceKey(Civ7PlotSnapshotProcedureDescriptor.outputSchema)]:
    Civ7PlotSnapshotResultSchema,
} satisfies Civ7ProcedureSchemaArtifactMap;

export type Civ7PlotSnapshotProcedureCallOptions = Readonly<{
  directControl?: Civ7DirectControlOptions;
  procedure?: Civ7ProcedureCoreCallOptions;
  dependencies?: PlotSnapshotReadDependencies;
}>;

export function callCiv7PlotSnapshotProcedure(
  input: Civ7PlotSnapshotInput,
  options: Civ7PlotSnapshotProcedureCallOptions = {}
): Promise<Civ7ProcedureCoreCallResult<Civ7PlotSnapshotResult>> {
  return callCiv7ProcedureCore<Civ7PlotSnapshotInput, Civ7PlotSnapshotResult>(
    Civ7PlotSnapshotProcedureDescriptor,
    Civ7PlotSnapshotProcedureSchemaArtifacts,
    input,
    (validInput) => getCiv7PlotSnapshot(validInput, options.directControl, options.dependencies),
    options.procedure
  );
}
