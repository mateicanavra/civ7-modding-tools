import {
  civ7ProcedureSchemaReferenceKey,
  createCiv7ProcedureCoreDescriptor,
  type Civ7ProcedureSchemaArtifactMap,
} from "../../procedure-core.js";
import {
  Civ7ReadyUnitViewInputSchema,
  Civ7ReadyUnitViewResultSchema,
} from "./unit.js";

export const Civ7ReadyUnitViewProcedureDescriptor = createCiv7ProcedureCoreDescriptor({
  procedureKey: "unit.ready.view",
  family: "unit",
  risk: "read",
  atomOwner: "packages/civ7-direct-control/src/play/ready/unit.ts",
  atomFunction: "getCiv7ReadyUnitView",
  inputSchema: {
    owner: "packages/civ7-direct-control/src/play/ready/unit.ts",
    exportName: "Civ7ReadyUnitViewInputSchema",
  },
  outputSchema: {
    owner: "packages/civ7-direct-control/src/play/ready/unit.ts",
    exportName: "Civ7ReadyUnitViewResultSchema",
  },
  inputFields: ["unitId", "radius", "maxOperations"],
  outputFields: ["unitId", "unit", "legalOperations", "promotionReadiness", "nearby"],
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

export const Civ7ReadyUnitViewProcedureSchemaArtifacts = {
  [civ7ProcedureSchemaReferenceKey(Civ7ReadyUnitViewProcedureDescriptor.inputSchema)]: Civ7ReadyUnitViewInputSchema,
  [civ7ProcedureSchemaReferenceKey(Civ7ReadyUnitViewProcedureDescriptor.outputSchema)]: Civ7ReadyUnitViewResultSchema,
} satisfies Civ7ProcedureSchemaArtifactMap;
