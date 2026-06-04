import {
  civ7ProcedureSchemaReferenceKey,
  createCiv7ProcedureCoreDescriptor,
  type Civ7ProcedureSchemaArtifactMap,
} from "../procedure-core.js";
import {
  Civ7PlayableStatusInputSchema,
  Civ7PlayableStatusResultSchema,
} from "./playable-status.js";

export const Civ7PlayableStatusProcedureDescriptor = createCiv7ProcedureCoreDescriptor({
  procedureKey: "runtime.playable.status",
  family: "runtime",
  risk: "runtime-support",
  atomOwner: "packages/civ7-direct-control/src/runtime/playable-status.ts",
  atomFunction: "getCiv7PlayableStatus",
  inputSchema: {
    owner: "packages/civ7-direct-control/src/runtime/playable-status.ts",
    exportName: "Civ7PlayableStatusInputSchema",
  },
  outputSchema: {
    owner: "packages/civ7-direct-control/src/runtime/playable-status.ts",
    exportName: "Civ7PlayableStatusResultSchema",
  },
  inputFields: [],
  outputFields: ["host", "port", "playable", "readiness", "appUi", "tuner", "errors"],
  playerScope: "debug-observer-only",
  consumerClasses: [
    "debug-internal-service-output",
    "effect-orpc-procedure-core",
    "runtime-proof-support",
  ],
  proofBoundary: "local-package-test",
  projection: {
    normalCli: "summarized-state-machine-status",
    debugService: "raw-diagnostic-projection",
    aiIngestion: "omitted",
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

export const Civ7PlayableStatusProcedureSchemaArtifacts = {
  [civ7ProcedureSchemaReferenceKey(Civ7PlayableStatusProcedureDescriptor.inputSchema)]: Civ7PlayableStatusInputSchema,
  [civ7ProcedureSchemaReferenceKey(Civ7PlayableStatusProcedureDescriptor.outputSchema)]: Civ7PlayableStatusResultSchema,
} satisfies Civ7ProcedureSchemaArtifactMap;
