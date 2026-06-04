import {
  callCiv7ProcedureCore,
  civ7ProcedureSchemaReferenceKey,
  createCiv7ProcedureCoreDescriptor,
  type Civ7ProcedureCoreCallOptions,
  type Civ7ProcedureCoreCallResult,
  type Civ7ProcedureSchemaArtifactMap,
} from "../../procedure-core.js";
import {
  getCiv7ReadyUnitView,
  Civ7ReadyUnitViewInputSchema,
  Civ7ReadyUnitViewResultSchema,
  type Civ7ReadyUnitViewInput,
  type Civ7ReadyUnitViewResult,
  type ReadyUnitViewDependencies,
} from "./unit.js";
import type { Civ7DirectControlOptions } from "../../session/types.js";

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

export type Civ7ReadyUnitViewProcedureCallOptions = Readonly<{
  directControl?: Civ7DirectControlOptions;
  procedure?: Civ7ProcedureCoreCallOptions;
  dependencies?: ReadyUnitViewDependencies;
}>;

export function callCiv7ReadyUnitViewProcedure(
  input: Civ7ReadyUnitViewInput = {},
  options: Civ7ReadyUnitViewProcedureCallOptions = {},
): Promise<Civ7ProcedureCoreCallResult<Civ7ReadyUnitViewResult>> {
  return callCiv7ProcedureCore<Civ7ReadyUnitViewInput, Civ7ReadyUnitViewResult>(
    Civ7ReadyUnitViewProcedureDescriptor,
    Civ7ReadyUnitViewProcedureSchemaArtifacts,
    input,
    (validInput) => getCiv7ReadyUnitView(
      validInput,
      options.directControl,
      options.dependencies,
    ),
    options.procedure,
  );
}
