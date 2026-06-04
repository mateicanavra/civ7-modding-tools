import {
  civ7ProcedureSchemaReferenceKey,
  createCiv7ProcedureCoreDescriptor,
  type Civ7ProcedureSchemaArtifactMap,
} from "../../procedure-core.js";
import {
  Civ7UnitMovePreviewInputSchema,
  Civ7UnitMovePreviewResultSchema,
} from "./move-preview.js";

export const Civ7UnitMovePreviewProcedureDescriptor = createCiv7ProcedureCoreDescriptor({
  procedureKey: "unit.move.preview",
  family: "unit",
  risk: "read",
  atomOwner: "packages/civ7-direct-control/src/play/ready/move-preview.ts",
  atomFunction: "getCiv7UnitMovePreview",
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
});

export const Civ7UnitMovePreviewProcedureSchemaArtifacts = {
  [civ7ProcedureSchemaReferenceKey(Civ7UnitMovePreviewProcedureDescriptor.inputSchema)]: Civ7UnitMovePreviewInputSchema,
  [civ7ProcedureSchemaReferenceKey(Civ7UnitMovePreviewProcedureDescriptor.outputSchema)]: Civ7UnitMovePreviewResultSchema,
} satisfies Civ7ProcedureSchemaArtifactMap;
