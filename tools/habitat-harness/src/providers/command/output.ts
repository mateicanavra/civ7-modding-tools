import { createHash } from "node:crypto";
import path from "node:path";
import { type HabitatCommandGitState, unknownGitState } from "../git/state.js";
import { commandObservationFromExit } from "./observation.js";
import type {
  HabitatCommandResult,
  HabitatProcessRequest,
  OutputCapture,
  RedactedEnvValue,
} from "./types.js";

const CAPTURE_LIMIT_BYTES = 4 * 1024 * 1024;
const SENSITIVE_ENV_KEY = /(TOKEN|SECRET|PASSWORD|PASS|KEY|AUTH|CREDENTIAL|SESSION)/i;

export function makeHabitatCommandResult(
  request: HabitatProcessRequest,
  overrides: Partial<HabitatCommandResult> = {}
): HabitatCommandResult {
  const startedAt = overrides.timing?.startedAt ?? new Date(0).toISOString();
  const endedAt = overrides.timing?.endedAt ?? startedAt;
  const exit = overrides.exit ?? { code: 0, signal: null, interrupted: false };
  const cachePolicy = request.cachePolicy ?? { mode: "default", observableStatus: "unknown" };
  return {
    commandId: request.commandId,
    kind: request.kind,
    requestedExecutable: overrides.requestedExecutable ?? request.executable,
    executable: request.executable,
    argv: [...request.argv],
    executionPlane: overrides.executionPlane ?? "system",
    cwd: path.resolve(request.cwd),
    envDelta: redactEnvDelta(request.env),
    gitState: overrides.gitState ?? unknownGitState(),
    scanRoots: [...(request.scanRoots ?? [])],
    cachePolicy,
    timing: {
      startedAt,
      endedAt,
      durationMs: overrides.timing?.durationMs ?? 0,
      source: "Date.now",
    },
    exit,
    stdout: overrides.stdout ?? captureOutput(""),
    stderr: overrides.stderr ?? captureOutput(""),
    observation:
      overrides.observation ??
      commandObservationFromExit({
        exitCode: exit.code,
        signal: exit.signal,
        interrupted: exit.interrupted,
        cachePolicy,
      }),
  };
}

export function makeCommandResultFromObservation(
  request: HabitatProcessRequest,
  observation: {
    readonly requestedExecutable: string;
    readonly executionPlane: HabitatCommandResult["executionPlane"];
    readonly gitState: HabitatCommandGitState;
    readonly startedAt: string;
    readonly endedAt: string;
    readonly durationMs: number;
    readonly exitCode: number;
    readonly signal?: string | null;
    readonly interrupted?: boolean;
    readonly stdout: string;
    readonly stderr: string;
  }
): HabitatCommandResult {
  return makeHabitatCommandResult(request, {
    requestedExecutable: observation.requestedExecutable,
    executionPlane: observation.executionPlane,
    gitState: observation.gitState,
    timing: {
      startedAt: observation.startedAt,
      endedAt: observation.endedAt,
      durationMs: observation.durationMs,
      source: "Date.now",
    },
    exit: {
      code: observation.exitCode,
      signal: observation.signal ?? null,
      interrupted: observation.interrupted ?? false,
    },
    stdout: captureOutput(observation.stdout),
    stderr: captureOutput(observation.stderr),
  });
}

export function captureOutput(text: string): OutputCapture {
  const bytes = Buffer.byteLength(text, "utf8");
  const buffer = Buffer.from(text, "utf8");
  const captured =
    buffer.length > CAPTURE_LIMIT_BYTES
      ? buffer.subarray(0, CAPTURE_LIMIT_BYTES).toString("utf8")
      : text;
  return {
    text: captured,
    truncated: buffer.length > CAPTURE_LIMIT_BYTES,
    sha256: createHash("sha256").update(text).digest("hex"),
    bytes,
  };
}

export function redactEnvDelta(
  env: HabitatProcessRequest["env"]
): Record<string, RedactedEnvValue> {
  const delta: Record<string, RedactedEnvValue> = {};
  for (const [key, value] of Object.entries(env ?? {})) {
    if (value === undefined) continue;
    const redacted = SENSITIVE_ENV_KEY.test(key);
    delta[key] = { value: redacted ? "<redacted>" : value, redacted };
  }
  return delta;
}
