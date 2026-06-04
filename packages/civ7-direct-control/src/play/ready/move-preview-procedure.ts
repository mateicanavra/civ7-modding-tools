import {
  callCiv7ProcedureCore,
  civ7ProcedureSchemaReferenceKey,
  createCiv7ProcedureCoreDescriptor,
  type Civ7ProcedureCoreCallOptions,
  type Civ7ProcedureCoreCallResult,
  type Civ7ProcedureSchemaArtifactMap,
} from "../../procedure-core.js";
import {
  getCiv7UnitMovePreview,
  Civ7UnitMovePreviewInputSchema,
  Civ7UnitMovePreviewResultSchema,
  type Civ7UnitMovePreviewInput,
  type Civ7UnitMovePreviewResult,
  type UnitMovePreviewDependencies,
} from "./move-preview.js";
import type { Civ7DirectControlOptions } from "../../session/types.js";

export const Civ7UnitMovePreviewProcedureDescriptor = createCiv7ProcedureCoreDescriptor({
  procedureKey: "unit.move.preview",
  family: "unit",
  risk: "read",
  atomOwner: "packages/civ7-direct-control/src/play/ready/move-preview.ts",
  atomFunction: "getCiv7UnitMovePreview",
  schemaTechnology: "typebox",
  inputSchema: {
    owner: "packages/civ7-direct-control/src/play/ready/move-preview.ts",
    exportName: "Civ7UnitMovePreviewInputSchema",
  },
  outputSchema: {
    owner: "packages/civ7-direct-control/src/play/ready/move-preview.ts",
    exportName: "Civ7UnitMovePreviewResultSchema",
  },
  inputFields: ["unitId", "destination", "maxPlots", "maxPathPlots"],
  outputFields: [
    "unitId",
    "reachableMovement",
    "reachableZonesOfControl",
    "reachableTargets",
    "queuedDestination",
    "requestedDestination",
    "requestedPath",
    "relationshipPolicy",
  ],
  playerScope: "local-player-scoped",
  consumerClasses: [
    "normal-cli-player-agent-view",
    "effect-orpc-procedure-core",
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

export const Civ7UnitMovePreviewProcedureSchemaArtifacts = {
  [civ7ProcedureSchemaReferenceKey(Civ7UnitMovePreviewProcedureDescriptor.inputSchema)]: Civ7UnitMovePreviewInputSchema,
  [civ7ProcedureSchemaReferenceKey(Civ7UnitMovePreviewProcedureDescriptor.outputSchema)]: Civ7UnitMovePreviewResultSchema,
} satisfies Civ7ProcedureSchemaArtifactMap;

export type Civ7UnitMovePreviewProcedureCallOptions = Readonly<{
  directControl?: Civ7DirectControlOptions;
  procedure?: Civ7ProcedureCoreCallOptions;
  dependencies?: UnitMovePreviewDependencies;
}>;

export function callCiv7UnitMovePreviewProcedure(
  input: Civ7UnitMovePreviewInput = {},
  options: Civ7UnitMovePreviewProcedureCallOptions = {},
): Promise<Civ7ProcedureCoreCallResult<Civ7UnitMovePreviewResult>> {
  return callCiv7ProcedureCore<Civ7UnitMovePreviewInput, Civ7UnitMovePreviewResult>(
    Civ7UnitMovePreviewProcedureDescriptor,
    Civ7UnitMovePreviewProcedureSchemaArtifacts,
    input,
    (validInput) => getCiv7UnitMovePreview(
      validInput,
      options.directControl,
      options.dependencies,
    ),
    options.procedure,
  );
}
