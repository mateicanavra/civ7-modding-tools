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
  Civ7GameInfoRowsInputSchema,
  Civ7GameInfoRowsResultSchema,
  getCiv7GameInfoRows,
  type Civ7GameInfoRowsInput,
  type Civ7GameInfoRowsResult,
  type GameInfoReadDependencies,
} from "./gameinfo.js";

export const Civ7GameInfoRowsProcedureDescriptor = createCiv7ProcedureCoreDescriptor({
  procedureKey: "runtime.gameinfo.rows",
  family: "runtime",
  risk: "read",
  atomOwner: "packages/civ7-direct-control/src/play/map/gameinfo.ts",
  atomFunction: "getCiv7GameInfoRows",
  schemaTechnology: "typebox",
  inputSchema: {
    owner: "packages/civ7-direct-control/src/play/map/gameinfo.ts",
    exportName: "Civ7GameInfoRowsInputSchema",
  },
  outputSchema: {
    owner: "packages/civ7-direct-control/src/play/map/gameinfo.ts",
    exportName: "Civ7GameInfoRowsResultSchema",
  },
  inputFields: [
    "table",
    "limit",
    "offset",
    "lookup",
    "filter",
    "includeSchema",
    "includePrimaryKeys",
  ],
  outputFields: [
    "host",
    "port",
    "state",
    "table",
    "source",
    "rows",
    "limit",
    "offset",
    "total",
    "omittedUnknown",
    "schema",
    "primaryKeys",
  ],
  playerScope: "debug-observer-only",
  consumerClasses: ["debug-internal-service-output", "effect-orpc-procedure-core"],
  proofBoundary: "local-package-test",
  projection: {
    normalCli: "omitted",
    debugService: "raw-diagnostic-projection",
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

export const Civ7GameInfoRowsProcedureSchemaArtifacts = {
  [civ7ProcedureSchemaReferenceKey(Civ7GameInfoRowsProcedureDescriptor.inputSchema)]:
    Civ7GameInfoRowsInputSchema,
  [civ7ProcedureSchemaReferenceKey(Civ7GameInfoRowsProcedureDescriptor.outputSchema)]:
    Civ7GameInfoRowsResultSchema,
} satisfies Civ7ProcedureSchemaArtifactMap;

export type Civ7GameInfoRowsProcedureCallOptions = Readonly<{
  directControl?: Civ7DirectControlOptions;
  procedure?: Civ7ProcedureCoreCallOptions;
  dependencies?: GameInfoReadDependencies;
}>;

export function callCiv7GameInfoRowsProcedure(
  input: Civ7GameInfoRowsInput,
  options: Civ7GameInfoRowsProcedureCallOptions = {}
): Promise<Civ7ProcedureCoreCallResult<Civ7GameInfoRowsResult>> {
  return callCiv7ProcedureCore<Civ7GameInfoRowsInput, Civ7GameInfoRowsResult>(
    Civ7GameInfoRowsProcedureDescriptor,
    Civ7GameInfoRowsProcedureSchemaArtifacts,
    input,
    (validInput) => getCiv7GameInfoRows(validInput, options.directControl, options.dependencies),
    options.procedure
  );
}
