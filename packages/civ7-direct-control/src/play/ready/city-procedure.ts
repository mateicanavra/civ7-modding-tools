import {
  callCiv7ProcedureCore,
  civ7ProcedureSchemaReferenceKey,
  createCiv7ProcedureCoreDescriptor,
  type Civ7ProcedureCoreCallOptions,
  type Civ7ProcedureCoreCallResult,
  type Civ7ProcedureSchemaArtifactMap,
} from "../../procedure-core.js";
import {
  getCiv7ReadyCityView,
  Civ7ReadyCityViewInputSchema,
  Civ7ReadyCityViewResultSchema,
  type Civ7ReadyCityViewInput,
  type Civ7ReadyCityViewResult,
  type ReadyCityViewDependencies,
} from "./city.js";
import type { Civ7DirectControlOptions } from "../../session/types.js";

export const Civ7ReadyCityViewProcedureDescriptor = createCiv7ProcedureCoreDescriptor({
  procedureKey: "city.ready.view",
  family: "city",
  risk: "read",
  atomOwner: "packages/civ7-direct-control/src/play/ready/city.ts",
  atomFunction: "getCiv7ReadyCityView",
  schemaTechnology: "typebox",
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

export const Civ7ReadyCityViewProcedureSchemaArtifacts = {
  [civ7ProcedureSchemaReferenceKey(Civ7ReadyCityViewProcedureDescriptor.inputSchema)]:
    Civ7ReadyCityViewInputSchema,
  [civ7ProcedureSchemaReferenceKey(Civ7ReadyCityViewProcedureDescriptor.outputSchema)]:
    Civ7ReadyCityViewResultSchema,
} satisfies Civ7ProcedureSchemaArtifactMap;

export type Civ7ReadyCityViewProcedureCallOptions = Readonly<{
  directControl?: Civ7DirectControlOptions;
  procedure?: Civ7ProcedureCoreCallOptions;
  dependencies?: ReadyCityViewDependencies;
}>;

export function callCiv7ReadyCityViewProcedure(
  input: Civ7ReadyCityViewInput = {},
  options: Civ7ReadyCityViewProcedureCallOptions = {}
): Promise<Civ7ProcedureCoreCallResult<Civ7ReadyCityViewResult>> {
  return callCiv7ProcedureCore<Civ7ReadyCityViewInput, Civ7ReadyCityViewResult>(
    Civ7ReadyCityViewProcedureDescriptor,
    Civ7ReadyCityViewProcedureSchemaArtifacts,
    input,
    (validInput) => getCiv7ReadyCityView(validInput, options.directControl, options.dependencies),
    options.procedure
  );
}
