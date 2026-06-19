import { createHash } from "node:crypto";
import path from "node:path";
import { Command } from "@effect/platform";
import type { CommandExecutor } from "@effect/platform/CommandExecutor";
import type { PlatformError } from "@effect/platform/Error";
import { Chunk, Context, Effect, Layer, Stream } from "effect";
import { type HabitatCommandGitState, readGitState, unknownGitState } from "./git-state.js";
import { type GritAdapterFailureTag, GritToolUnavailable } from "./grit-failures.js";
import { type HabitatToolExecutionPlane, materializeHabitatCommand } from "./workspace-tools.js";

export type HabitatCommandKind =
  | "grit-check"
  | "grit-apply"
  | "grit-pattern-test"
  | "biome-handoff"
  | "git-state"
  | "workspace-tool";

export type GritParseStatus =
  | "unparsed"
  | "parsed"
  | "no-json"
  | "malformed"
  | "schema-drift"
  | "unsupported-mode";

export interface HabitatProcessRequest {
  commandId: string;
  kind: HabitatCommandKind;
  executable: string;
  argv: readonly string[];
  cwd: string;
  env?: Readonly<Record<string, string | undefined>>;
  scanRoots?: readonly string[];
  cachePolicy?: CommandCachePolicy;
}

export interface CommandCachePolicy {
  mode: "default" | "disabled" | "isolated";
  cacheDir?: string;
  observableStatus?: "unknown" | "fresh" | "cache-hit" | "replay";
}

export interface HabitatCommandResult {
  commandId: string;
  kind: HabitatCommandKind;
  requestedExecutable: string;
  executable: string;
  argv: readonly string[];
  executionPlane: HabitatToolExecutionPlane;
  cwd: string;
  envDelta: Record<string, RedactedEnvValue>;
  gitState: HabitatCommandGitState;
  scanRoots: readonly string[];
  cachePolicy: CommandCachePolicy;
  timing: {
    startedAt: string;
    endedAt: string;
    durationMs: number;
    source: "Date.now";
  };
  exit: {
    code: number;
    signal: string | null;
    interrupted: boolean;
  };
  stdout: OutputCapture;
  stderr: OutputCapture;
  parseStatus: GritParseStatus;
  failureTag: GritAdapterFailureTag | null;
}

export interface RedactedEnvValue {
  value: string;
  redacted: boolean;
}

export interface OutputCapture {
  text: string;
  truncated: boolean;
  sha256: string;
  bytes: number;
}

export interface HabitatProcessService {
  run: (
    request: HabitatProcessRequest
  ) => Effect.Effect<HabitatCommandResult, GritToolUnavailable, CommandExecutor>;
}

export class HabitatProcess extends Context.Tag("@internal/habitat-harness/HabitatProcess")<
  HabitatProcess,
  HabitatProcessService
>() {}
export type { GritAdapterFailureTag };
export { GritToolUnavailable };

const CAPTURE_LIMIT_BYTES = 4 * 1024 * 1024;
const SENSITIVE_ENV_KEY = /(TOKEN|SECRET|PASSWORD|PASS|KEY|AUTH|CREDENTIAL|SESSION)/i;

export const HabitatProcessLive = Layer.succeed(HabitatProcess, {
  run: runLiveHabitatProcess,
});

export function makeFakeHabitatProcessLayer(
  handler: (request: HabitatProcessRequest) => HabitatCommandResult
) {
  return Layer.succeed(HabitatProcess, {
    run: (request: HabitatProcessRequest) => Effect.sync(() => handler(request)),
  });
}

export function makeHabitatCommandResult(
  request: HabitatProcessRequest,
  overrides: Partial<HabitatCommandResult> = {}
): HabitatCommandResult {
  const startedAt = overrides.timing?.startedAt ?? new Date(0).toISOString();
  const endedAt = overrides.timing?.endedAt ?? startedAt;
  const exit = overrides.exit ?? { code: 0, signal: null, interrupted: false };
  return {
    commandId: request.commandId,
    kind: request.kind,
    requestedExecutable: overrides.requestedExecutable ?? request.executable,
    executable: request.executable,
    argv: [...request.argv],
    executionPlane: overrides.executionPlane ?? "system",
    cwd: path.resolve(request.cwd),
    envDelta: redactEnvDelta(request.env),
    gitState: unknownGitState(),
    scanRoots: [...(request.scanRoots ?? [])],
    cachePolicy: request.cachePolicy ?? { mode: "default", observableStatus: "unknown" },
    timing: {
      startedAt,
      endedAt,
      durationMs: overrides.timing?.durationMs ?? 0,
      source: "Date.now",
    },
    exit,
    stdout: captureOutput(overrides.stdout?.text ?? ""),
    stderr: captureOutput(overrides.stderr?.text ?? ""),
    parseStatus: "unparsed",
    failureTag: exit.code === 0 && !exit.interrupted ? null : "GritCommandFailed",
    ...overrides,
  };
}

function runLiveHabitatProcess(
  request: HabitatProcessRequest
): Effect.Effect<HabitatCommandResult, GritToolUnavailable, CommandExecutor> {
  return Effect.scoped(
    Effect.gen(function* () {
      const commandRequest = materializeHabitatCommand(request.executable, request.argv);
      const effectiveRequest = {
        ...request,
        executable: commandRequest.executable,
        argv: commandRequest.argv,
        cwd: commandRequest.cwd ?? request.cwd,
      };
      const startedMs = Date.now();
      const startedAt = new Date(startedMs).toISOString();
      const beforeGitState = readGitState(effectiveRequest.cwd);
      const command = Command.make(commandRequest.executable, ...commandRequest.argv).pipe(
        Command.workingDirectory(path.resolve(effectiveRequest.cwd)),
        Command.env(commandEnv(request.env))
      );
      const process = yield* Command.start(command);
      const [stdout, stderr, exitCode] = yield* Effect.all(
        [collectStream(process.stdout), collectStream(process.stderr), process.exitCode],
        { concurrency: "unbounded" }
      );
      const endedMs = Date.now();
      const exit = Number(exitCode);
      const afterGitState = readGitState(effectiveRequest.cwd);
      return makeHabitatCommandResult(effectiveRequest, {
        requestedExecutable: request.executable,
        executionPlane: commandRequest.executionPlane,
        gitState: { before: beforeGitState, after: afterGitState },
        timing: {
          startedAt,
          endedAt: new Date(endedMs).toISOString(),
          durationMs: Math.max(0, endedMs - startedMs),
          source: "Date.now",
        },
        exit: {
          code: exit,
          signal: null,
          interrupted: false,
        },
        stdout: captureOutput(stdout),
        stderr: captureOutput(stderr),
        failureTag: exit === 0 ? null : "GritCommandFailed",
      });
    })
  ).pipe(
    Effect.catchAll((cause: PlatformError) =>
      Effect.fail(
        new GritToolUnavailable({
          commandId: request.commandId,
          executable: request.executable,
          argv: [...request.argv],
          cwd: path.resolve(request.cwd),
          cause: String(cause),
        })
      )
    )
  );
}

function collectStream(
  stream: Stream.Stream<Uint8Array, PlatformError>
): Effect.Effect<string, PlatformError> {
  return Stream.runCollect(stream).pipe(
    Effect.map((chunks) => Buffer.concat(Chunk.toReadonlyArray(chunks)).toString("utf8"))
  );
}

function commandEnv(env: HabitatProcessRequest["env"]): Record<string, string> {
  return {
    ...Object.fromEntries(
      Object.entries(env ?? {}).filter((entry): entry is [string, string] => entry[1] !== undefined)
    ),
  };
}

function redactEnvDelta(env: HabitatProcessRequest["env"]): Record<string, RedactedEnvValue> {
  const delta: Record<string, RedactedEnvValue> = {};
  for (const [key, value] of Object.entries(env ?? {})) {
    if (value === undefined) continue;
    const redacted = SENSITIVE_ENV_KEY.test(key);
    delta[key] = { value: redacted ? "<redacted>" : value, redacted };
  }
  return delta;
}

function captureOutput(text: string): OutputCapture {
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
