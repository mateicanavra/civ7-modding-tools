import { Civ7DirectControlError } from "../direct-control-error.js";
import {
  jsonPayloadFromCommandResult,
  throwUnexpectedCommandPayloadStatus,
} from "../session/command-result.js";
import type { Civ7CommandResult, Civ7DirectControlOptions } from "../session/types.js";
import { validateIdentifier } from "../validation.js";
import {
  assertPreparedSetupMatches,
  type Civ7SinglePlayerSetupValues,
  normalizeSinglePlayerSetupInput,
  setupExpectationScriptSource,
  setupSnapshotSelectionFromInput,
} from "./prepare.js";
import {
  type Civ7SetupSnapshot,
  type Civ7SetupSnapshotResult,
  defaultSetupReadDependencies,
  type SetupReadDependencies,
  setupSnapshotScriptSource,
} from "./reads.js";
export type Civ7SinglePlayerHostResult = Readonly<{
  command: Civ7CommandResult;
  before: Civ7SetupSnapshotResult;
  accepted: true;
}>;

type Civ7SinglePlayerHostPayload =
  | Readonly<{
      status: "performed";
      before: Civ7SetupSnapshot;
      accepted: boolean;
    }>
  | Readonly<{
      status: "refused";
      before: Civ7SetupSnapshot;
      mismatch: string;
    }>;

type SetupStartDependencies = SetupReadDependencies &
  Readonly<{
    parseStartPayload: (result: Civ7CommandResult, label: string) => Civ7SinglePlayerHostPayload;
    validateIdentifier: (value: string, label: string) => string;
  }>;

export async function hostPreparedCiv7SinglePlayerGame(
  expected: Civ7SinglePlayerSetupValues,
  options: Civ7DirectControlOptions = {},
  dependencies: SetupStartDependencies = defaultSetupStartDependencies
): Promise<Civ7SinglePlayerHostResult> {
  const normalized = normalizeSinglePlayerSetupInput(expected, dependencies);
  const command = await dependencies.executeAppUiCommand({
    ...options,
    command: buildStartPreparedSinglePlayerCommand(normalized, dependencies),
  });
  return hostResultFromCommand(command, normalized, dependencies);
}

export function buildStartPreparedSinglePlayerCommand(
  expected: Civ7SinglePlayerSetupValues,
  dependencies: SetupReadDependencies
): string {
  return `(() => {
    ${setupSnapshotScriptSource(dependencies, setupSnapshotSelectionFromInput(expected))}
    ${setupExpectationScriptSource()}
    const expected = ${dependencies.jsLiteral(expected)};
    const before = readSetupSnapshot();
    const mismatch = setupExpectationMismatch(expected, before);
    if (mismatch) {
      return JSON.stringify({ status: "refused", before, mismatch });
    }
    const serverType = typeof ServerType !== "undefined" && ServerType && ServerType.SERVER_TYPE_NONE !== undefined
      ? ServerType.SERVER_TYPE_NONE
      : 0;
    return JSON.stringify({
      status: "performed",
      before,
      accepted: Network.hostGame(serverType) === true,
    });
  })()`;
}

function hostResultFromCommand(
  command: Civ7CommandResult,
  expected: Civ7SinglePlayerSetupValues,
  dependencies: Pick<SetupStartDependencies, "parseStartPayload">
): Civ7SinglePlayerHostResult {
  const payload = dependencies.parseStartPayload(command, "Civ7 prepared single-player host");
  const status = payload.status;
  switch (status) {
    case "performed": {
      const before = setupSnapshotResult(command, payload.before);
      if (!payload.accepted) {
        throw new Civ7DirectControlError(
          "setup-host-rejected",
          "Civ7 Network.hostGame returned false",
          {
            details: { before, command },
          }
        );
      }
      assertPreparedSetupMatches(expected, before.snapshot);
      return { command, before, accepted: true };
    }
    case "refused": {
      const before = setupSnapshotResult(command, payload.before);
      const code =
        payload.mismatch === "phase"
          ? "setup-phase-refused"
          : payload.mismatch === "map-row"
            ? "setup-map-row-missing"
            : "setup-readback-mismatch";
      throw new Civ7DirectControlError(
        code,
        `Civ7 prepared setup changed before host: ${payload.mismatch}`,
        { details: { before, mismatch: payload.mismatch } }
      );
    }
    default:
      return throwUnexpectedCommandPayloadStatus(
        command,
        "Civ7 prepared single-player host",
        status
      );
  }
}

function setupSnapshotResult(
  command: Civ7CommandResult,
  snapshot: Civ7SetupSnapshot
): Civ7SetupSnapshotResult {
  return {
    host: command.host,
    port: command.port,
    state: command.state,
    snapshot,
  };
}

const defaultSetupStartDependencies: SetupStartDependencies = {
  ...defaultSetupReadDependencies,
  parseStartPayload: (result, label) =>
    jsonPayloadFromCommandResult<Civ7SinglePlayerHostPayload>(result, label),
  validateIdentifier,
};
