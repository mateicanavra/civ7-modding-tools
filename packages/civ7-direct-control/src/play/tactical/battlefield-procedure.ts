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
  Civ7BattlefieldScanInputSchema,
  Civ7BattlefieldScanResultSchema,
  getCiv7BattlefieldScan,
  type BattlefieldScanDependencies,
  type Civ7BattlefieldScanInput,
  type Civ7BattlefieldScanResult,
} from "./battlefield.js";

export const Civ7BattlefieldScanProcedureDescriptor = createCiv7ProcedureCoreDescriptor({
  procedureKey: "strategy.battlefield.scan",
  family: "strategy",
  risk: "read",
  atomOwner: "packages/civ7-direct-control/src/play/tactical/battlefield.ts",
  atomFunction: "getCiv7BattlefieldScan",
  schemaTechnology: "typebox",
  inputSchema: {
    owner: "packages/civ7-direct-control/src/play/tactical/battlefield.ts",
    exportName: "Civ7BattlefieldScanInputSchema",
  },
  outputSchema: {
    owner: "packages/civ7-direct-control/src/play/tactical/battlefield.ts",
    exportName: "Civ7BattlefieldScanResultSchema",
  },
  inputFields: [
    "playerId",
    "origins",
    "radius",
    "maxPlayers",
    "maxUnits",
    "maxCities",
  ],
  outputFields: [
    "localPlayerId",
    "playerId",
    "origins",
    "radius",
    "hiddenInfoPolicy",
    "relationshipLabelPolicy",
    "units",
    "cities",
    "owners",
    "pointsOfInterest",
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

export const Civ7BattlefieldScanProcedureSchemaArtifacts = {
  [civ7ProcedureSchemaReferenceKey(Civ7BattlefieldScanProcedureDescriptor.inputSchema)]:
    Civ7BattlefieldScanInputSchema,
  [civ7ProcedureSchemaReferenceKey(Civ7BattlefieldScanProcedureDescriptor.outputSchema)]:
    Civ7BattlefieldScanResultSchema,
} satisfies Civ7ProcedureSchemaArtifactMap;

export type Civ7BattlefieldScanProcedureCallOptions = Readonly<{
  directControl?: Civ7DirectControlOptions;
  procedure?: Civ7ProcedureCoreCallOptions;
  dependencies?: BattlefieldScanDependencies;
}>;

export function callCiv7BattlefieldScanProcedure(
  input: Civ7BattlefieldScanInput = {},
  options: Civ7BattlefieldScanProcedureCallOptions = {},
): Promise<Civ7ProcedureCoreCallResult<Civ7BattlefieldScanResult>> {
  return callCiv7ProcedureCore<Civ7BattlefieldScanInput, Civ7BattlefieldScanResult>(
    Civ7BattlefieldScanProcedureDescriptor,
    Civ7BattlefieldScanProcedureSchemaArtifacts,
    input,
    (validInput) => getCiv7BattlefieldScan(validInput, options.directControl, options.dependencies),
    options.procedure,
  );
}
