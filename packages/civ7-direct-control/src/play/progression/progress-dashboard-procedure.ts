import {
  type Civ7ProcedureCoreCallOptions,
  type Civ7ProcedureCoreCallResult,
  type Civ7ProcedureSchemaArtifactMap,
  callCiv7ProcedureCore,
  civ7ProcedureSchemaReferenceKey,
  createCiv7ProcedureCoreDescriptor,
} from "../../procedure-core.js";
import type { Civ7DirectControlOptions } from "../../session/types.js";
import {
  type Civ7ProgressDashboardInput,
  Civ7ProgressDashboardInputSchema,
  type Civ7ProgressDashboardResult,
  Civ7ProgressDashboardResultSchema,
  getCiv7ProgressDashboard,
  type ProgressDashboardDependencies,
} from "./reads.js";

export const Civ7ProgressDashboardProcedureDescriptor = createCiv7ProcedureCoreDescriptor({
  procedureKey: "strategy.progress.dashboard",
  family: "strategy",
  risk: "read",
  atomOwner: "packages/civ7-direct-control/src/play/progression/reads.ts",
  atomFunction: "getCiv7ProgressDashboard",
  schemaTechnology: "typebox",
  inputSchema: {
    owner: "packages/civ7-direct-control/src/play/progression/reads.ts",
    exportName: "Civ7ProgressDashboardInputSchema",
  },
  outputSchema: {
    owner: "packages/civ7-direct-control/src/play/progression/reads.ts",
    exportName: "Civ7ProgressDashboardResultSchema",
  },
  inputFields: ["playerId"],
  outputFields: [
    "localPlayerId",
    "playerId",
    "turn",
    "turnDate",
    "age",
    "player",
    "legacyPaths",
    "victories",
    "triumphs",
    "proof",
    "hiddenInfoPolicy",
    "notes",
  ],
  playerScope: "local-player-scoped",
  consumerClasses: ["normal-cli-player-agent-view", "effect-orpc-procedure-core"],
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

export const Civ7ProgressDashboardProcedureSchemaArtifacts = {
  [civ7ProcedureSchemaReferenceKey(Civ7ProgressDashboardProcedureDescriptor.inputSchema)]:
    Civ7ProgressDashboardInputSchema,
  [civ7ProcedureSchemaReferenceKey(Civ7ProgressDashboardProcedureDescriptor.outputSchema)]:
    Civ7ProgressDashboardResultSchema,
} satisfies Civ7ProcedureSchemaArtifactMap;

export type Civ7ProgressDashboardProcedureCallOptions = Readonly<{
  directControl?: Civ7DirectControlOptions;
  procedure?: Civ7ProcedureCoreCallOptions;
  dependencies?: ProgressDashboardDependencies;
}>;

export function callCiv7ProgressDashboardProcedure(
  input: Civ7ProgressDashboardInput = {},
  options: Civ7ProgressDashboardProcedureCallOptions = {}
): Promise<Civ7ProcedureCoreCallResult<Civ7ProgressDashboardResult>> {
  return callCiv7ProcedureCore<Civ7ProgressDashboardInput, Civ7ProgressDashboardResult>(
    Civ7ProgressDashboardProcedureDescriptor,
    Civ7ProgressDashboardProcedureSchemaArtifacts,
    input,
    (validInput) =>
      getCiv7ProgressDashboard(validInput, options.directControl, options.dependencies),
    options.procedure
  );
}
