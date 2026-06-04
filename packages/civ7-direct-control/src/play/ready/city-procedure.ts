import {
  civ7ProcedureSchemaReferenceKey,
  createCiv7ProcedureCoreDescriptor,
  type Civ7ProcedureSchemaArtifactMap,
} from "../../procedure-core.js";
import {
  Civ7ReadyCityViewInputSchema,
  Civ7ReadyCityViewResultSchema,
} from "./city.js";

export const Civ7ReadyCityViewProcedureDescriptor = createCiv7ProcedureCoreDescriptor({
  procedureKey: "city.ready.view",
  family: "city",
  risk: "read",
  atomOwner: "packages/civ7-direct-control/src/play/ready/city.ts",
  atomFunction: "getCiv7ReadyCityView",
  inputSchema: {
    owner: "packages/civ7-direct-control/src/play/ready/city.ts",
    exportName: "Civ7ReadyCityViewInputSchema",
  },
  outputSchema: {
    owner: "packages/civ7-direct-control/src/play/ready/city.ts",
    exportName: "Civ7ReadyCityViewResultSchema",
  },
  inputFields: ["cityId", "maxOperations"],
  outputFields: [
    "cityId",
    "city",
    "legalOperations",
    "productionCandidates",
    "townFocusOptions",
    "populationPlacement",
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

export const Civ7ReadyCityViewProcedureSchemaArtifacts = {
  [civ7ProcedureSchemaReferenceKey(Civ7ReadyCityViewProcedureDescriptor.inputSchema)]: Civ7ReadyCityViewInputSchema,
  [civ7ProcedureSchemaReferenceKey(Civ7ReadyCityViewProcedureDescriptor.outputSchema)]: Civ7ReadyCityViewResultSchema,
} satisfies Civ7ProcedureSchemaArtifactMap;
