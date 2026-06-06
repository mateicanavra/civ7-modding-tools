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
  Civ7TraditionsViewInputSchema,
  Civ7TraditionsViewResultSchema,
  getCiv7TraditionsView,
  type Civ7TraditionsViewInput,
  type Civ7TraditionsViewResult,
  type TraditionsViewDependencies,
} from "./reads.js";

export const Civ7TraditionsViewProcedureDescriptor = createCiv7ProcedureCoreDescriptor({
  procedureKey: "strategy.traditions.view",
  family: "strategy",
  risk: "read",
  atomOwner: "packages/civ7-direct-control/src/play/progression/reads.ts",
  atomFunction: "getCiv7TraditionsView",
  schemaTechnology: "typebox",
  inputSchema: {
    owner: "packages/civ7-direct-control/src/play/progression/reads.ts",
    exportName: "Civ7TraditionsViewInputSchema",
  },
  outputSchema: {
    owner: "packages/civ7-direct-control/src/play/progression/reads.ts",
    exportName: "Civ7TraditionsViewResultSchema",
  },
  inputFields: [
    "playerId",
  ],
  outputFields: [
    "playerId",
    "turn",
    "turnDate",
    "governmentType",
    "government",
    "slots",
    "actions",
    "active",
    "available",
    "recentUnlocks",
    "traditions",
    "hiddenInfoPolicy",
    "notes",
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

export const Civ7TraditionsViewProcedureSchemaArtifacts = {
  [civ7ProcedureSchemaReferenceKey(Civ7TraditionsViewProcedureDescriptor.inputSchema)]:
    Civ7TraditionsViewInputSchema,
  [civ7ProcedureSchemaReferenceKey(Civ7TraditionsViewProcedureDescriptor.outputSchema)]:
    Civ7TraditionsViewResultSchema,
} satisfies Civ7ProcedureSchemaArtifactMap;

export type Civ7TraditionsViewProcedureCallOptions = Readonly<{
  directControl?: Civ7DirectControlOptions;
  procedure?: Civ7ProcedureCoreCallOptions;
  dependencies?: TraditionsViewDependencies;
}>;

export function callCiv7TraditionsViewProcedure(
  input: Civ7TraditionsViewInput = {},
  options: Civ7TraditionsViewProcedureCallOptions = {},
): Promise<Civ7ProcedureCoreCallResult<Civ7TraditionsViewResult>> {
  return callCiv7ProcedureCore<Civ7TraditionsViewInput, Civ7TraditionsViewResult>(
    Civ7TraditionsViewProcedureDescriptor,
    Civ7TraditionsViewProcedureSchemaArtifacts,
    input,
    (validInput) => getCiv7TraditionsView(validInput, options.directControl, options.dependencies),
    options.procedure,
  );
}
