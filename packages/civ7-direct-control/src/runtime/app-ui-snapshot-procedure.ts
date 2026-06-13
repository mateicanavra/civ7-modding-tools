import {
  callCiv7ProcedureCore,
  civ7ProcedureSchemaReferenceKey,
  createCiv7ProcedureCoreDescriptor,
  type Civ7ProcedureCoreCallOptions,
  type Civ7ProcedureCoreCallResult,
  type Civ7ProcedureSchemaArtifactMap,
} from "../procedure-core.js";
import type { Civ7DirectControlOptions } from "../session/types.js";
import {
  Civ7AppUiSnapshotInputSchema,
  Civ7AppUiSnapshotResultSchema,
  getCiv7AppUiSnapshot,
  type AppUiSnapshotDependencies,
  type Civ7AppUiSnapshotInput,
  type Civ7AppUiSnapshotResult,
} from "./app-ui-snapshot.js";

export const Civ7AppUiSnapshotProcedureDescriptor = createCiv7ProcedureCoreDescriptor({
  procedureKey: "runtime.app.ui.snapshot",
  family: "runtime",
  risk: "runtime-support",
  atomOwner: "packages/civ7-direct-control/src/runtime/app-ui-snapshot.ts",
  atomFunction: "getCiv7AppUiSnapshot",
  schemaTechnology: "typebox",
  inputSchema: {
    owner: "packages/civ7-direct-control/src/runtime/app-ui-snapshot.ts",
    exportName: "Civ7AppUiSnapshotInputSchema",
  },
  outputSchema: {
    owner: "packages/civ7-direct-control/src/runtime/app-ui-snapshot.ts",
    exportName: "Civ7AppUiSnapshotResultSchema",
  },
  inputFields: [],
  outputFields: ["host", "port", "state", "snapshot"],
  playerScope: "debug-observer-only",
  consumerClasses: [
    "debug-internal-service-output",
    "effect-orpc-procedure-core",
    "runtime-proof-support",
  ],
  proofBoundary: "local-package-test",
  projection: {
    normalCli: "omitted",
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

export const Civ7AppUiSnapshotProcedureSchemaArtifacts = {
  [civ7ProcedureSchemaReferenceKey(Civ7AppUiSnapshotProcedureDescriptor.inputSchema)]:
    Civ7AppUiSnapshotInputSchema,
  [civ7ProcedureSchemaReferenceKey(Civ7AppUiSnapshotProcedureDescriptor.outputSchema)]:
    Civ7AppUiSnapshotResultSchema,
} satisfies Civ7ProcedureSchemaArtifactMap;

export type Civ7AppUiSnapshotProcedureCallOptions = Readonly<{
  directControl?: Civ7DirectControlOptions;
  procedure?: Civ7ProcedureCoreCallOptions;
  dependencies?: AppUiSnapshotDependencies;
}>;

export function callCiv7AppUiSnapshotProcedure(
  input: Civ7AppUiSnapshotInput = {},
  options: Civ7AppUiSnapshotProcedureCallOptions = {}
): Promise<Civ7ProcedureCoreCallResult<Civ7AppUiSnapshotResult>> {
  return callCiv7ProcedureCore<Civ7AppUiSnapshotInput, Civ7AppUiSnapshotResult>(
    Civ7AppUiSnapshotProcedureDescriptor,
    Civ7AppUiSnapshotProcedureSchemaArtifacts,
    input,
    () => getCiv7AppUiSnapshot(options.directControl, options.dependencies),
    options.procedure
  );
}
