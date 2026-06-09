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
  Civ7TargetCandidatesInputSchema,
  Civ7TargetCandidatesResultSchema,
  getCiv7TargetCandidates,
  type Civ7TargetCandidatesInput,
  type Civ7TargetCandidatesResult,
  type TargetCandidatesDependencies,
} from "./target-candidates.js";

export const Civ7TargetCandidatesProcedureDescriptor = createCiv7ProcedureCoreDescriptor({
  procedureKey: "strategy.target.candidates",
  family: "strategy",
  risk: "read",
  atomOwner: "packages/civ7-direct-control/src/play/tactical/target-candidates.ts",
  atomFunction: "getCiv7TargetCandidates",
  schemaTechnology: "typebox",
  inputSchema: {
    owner: "packages/civ7-direct-control/src/play/tactical/target-candidates.ts",
    exportName: "Civ7TargetCandidatesInputSchema",
  },
  outputSchema: {
    owner: "packages/civ7-direct-control/src/play/tactical/target-candidates.ts",
    exportName: "Civ7TargetCandidatesResultSchema",
  },
  inputFields: [
    "playerId",
    "origins",
    "maxCandidates",
    "maxPlayers",
    "unitRadius",
  ],
  outputFields: [
    "localPlayerId",
    "playerId",
    "origins",
    "unitRadius",
    "hiddenInfoPolicy",
    "relationshipLabelPolicy",
    "candidates",
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

export const Civ7TargetCandidatesProcedureSchemaArtifacts = {
  [civ7ProcedureSchemaReferenceKey(Civ7TargetCandidatesProcedureDescriptor.inputSchema)]:
    Civ7TargetCandidatesInputSchema,
  [civ7ProcedureSchemaReferenceKey(Civ7TargetCandidatesProcedureDescriptor.outputSchema)]:
    Civ7TargetCandidatesResultSchema,
} satisfies Civ7ProcedureSchemaArtifactMap;

export type Civ7TargetCandidatesProcedureCallOptions = Readonly<{
  directControl?: Civ7DirectControlOptions;
  procedure?: Civ7ProcedureCoreCallOptions;
  dependencies?: TargetCandidatesDependencies;
}>;

export function callCiv7TargetCandidatesProcedure(
  input: Civ7TargetCandidatesInput = {},
  options: Civ7TargetCandidatesProcedureCallOptions = {},
): Promise<Civ7ProcedureCoreCallResult<Civ7TargetCandidatesResult>> {
  return callCiv7ProcedureCore<Civ7TargetCandidatesInput, Civ7TargetCandidatesResult>(
    Civ7TargetCandidatesProcedureDescriptor,
    Civ7TargetCandidatesProcedureSchemaArtifacts,
    input,
    (validInput) => getCiv7TargetCandidates(validInput, options.directControl, options.dependencies),
    options.procedure,
  );
}
