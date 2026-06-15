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
  type Civ7TunerHealthInput,
  Civ7TunerHealthInputSchema,
  type Civ7TunerHealthResult,
  Civ7TunerHealthResultSchema,
  checkCiv7TunerHealth,
  type TunerHealthDependencies,
} from "./tuner-health.js";

export const Civ7TunerHealthProcedureDescriptor = createCiv7ProcedureCoreDescriptor({
  procedureKey: "runtime.tuner.health",
  family: "runtime",
  risk: "runtime-support",
  atomOwner: "packages/civ7-direct-control/src/runtime/tuner-health.ts",
  atomFunction: "checkCiv7TunerHealth",
  schemaTechnology: "typebox",
  inputSchema: {
    owner: "packages/civ7-direct-control/src/runtime/tuner-health.ts",
    exportName: "Civ7TunerHealthInputSchema",
  },
  outputSchema: {
    owner: "packages/civ7-direct-control/src/runtime/tuner-health.ts",
    exportName: "Civ7TunerHealthResultSchema",
  },
  inputFields: [],
  outputFields: ["host", "port", "state", "ready", "snapshot"],
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

export const Civ7TunerHealthProcedureSchemaArtifacts = {
  [civ7ProcedureSchemaReferenceKey(Civ7TunerHealthProcedureDescriptor.inputSchema)]:
    Civ7TunerHealthInputSchema,
  [civ7ProcedureSchemaReferenceKey(Civ7TunerHealthProcedureDescriptor.outputSchema)]:
    Civ7TunerHealthResultSchema,
} satisfies Civ7ProcedureSchemaArtifactMap;

export type Civ7TunerHealthProcedureCallOptions = Readonly<{
  directControl?: Civ7DirectControlOptions;
  procedure?: Civ7ProcedureCoreCallOptions;
  dependencies?: TunerHealthDependencies;
}>;

export function callCiv7TunerHealthProcedure(
  input: Civ7TunerHealthInput = {},
  options: Civ7TunerHealthProcedureCallOptions = {}
): Promise<Civ7ProcedureCoreCallResult<Civ7TunerHealthResult>> {
  return callCiv7ProcedureCore<Civ7TunerHealthInput, Civ7TunerHealthResult>(
    Civ7TunerHealthProcedureDescriptor,
    Civ7TunerHealthProcedureSchemaArtifacts,
    input,
    () => checkCiv7TunerHealth(options.directControl, options.dependencies),
    options.procedure
  );
}
