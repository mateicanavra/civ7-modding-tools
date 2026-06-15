import {
  type Civ7ProcedureCoreCallOptions,
  type Civ7ProcedureCoreCallResult,
  type Civ7ProcedureSchemaArtifactMap,
  callCiv7ProcedureCore,
  civ7ProcedureSchemaReferenceKey,
  createCiv7ProcedureCoreDescriptor,
} from "../procedure-core.js";
import type { Civ7DirectControlOptions } from "../session/types.js";
import {
  type Civ7PlayableStatusInput,
  Civ7PlayableStatusInputSchema,
  type Civ7PlayableStatusResult,
  Civ7PlayableStatusResultSchema,
  getCiv7PlayableStatus,
  type PlayableStatusDependencies,
} from "./playable-status.js";

export const Civ7PlayableStatusProcedureDescriptor = createCiv7ProcedureCoreDescriptor({
  procedureKey: "runtime.playable.status",
  family: "runtime",
  risk: "runtime-support",
  atomOwner: "packages/civ7-direct-control/src/runtime/playable-status.ts",
  atomFunction: "getCiv7PlayableStatus",
  schemaTechnology: "typebox",
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
  context: [
    "direct-control-facade",
    "endpoint-defaults",
    "state-selection",
    "logger",
    "evidence-sink",
    "live-session-policy",
  ],
});

export const Civ7PlayableStatusProcedureSchemaArtifacts = {
  [civ7ProcedureSchemaReferenceKey(Civ7PlayableStatusProcedureDescriptor.inputSchema)]:
    Civ7PlayableStatusInputSchema,
  [civ7ProcedureSchemaReferenceKey(Civ7PlayableStatusProcedureDescriptor.outputSchema)]:
    Civ7PlayableStatusResultSchema,
} satisfies Civ7ProcedureSchemaArtifactMap;

export type Civ7PlayableStatusProcedureCallOptions = Readonly<{
  directControl?: Civ7DirectControlOptions;
  procedure?: Civ7ProcedureCoreCallOptions;
  dependencies?: PlayableStatusDependencies;
}>;

export function callCiv7PlayableStatusProcedure(
  input: Civ7PlayableStatusInput = {},
  options: Civ7PlayableStatusProcedureCallOptions = {}
): Promise<Civ7ProcedureCoreCallResult<Civ7PlayableStatusResult>> {
  return callCiv7ProcedureCore<Civ7PlayableStatusInput, Civ7PlayableStatusResult>(
    Civ7PlayableStatusProcedureDescriptor,
    Civ7PlayableStatusProcedureSchemaArtifacts,
    input,
    () => getCiv7PlayableStatus(options.directControl, options.dependencies),
    options.procedure
  );
}
