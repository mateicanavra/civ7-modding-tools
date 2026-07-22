import { createHash } from "node:crypto";
import path from "node:path";
import { type HabitatCommandGitState, unknownGitState } from "@habitat/cli/providers/git/state";
import { Effect, Match, Stream } from "effect";
import { commandObservationFromExit } from "./observation.js";
import type {
  HabitatCommandResult,
  HabitatProcessRequest,
  OutputCapture,
  RedactedEnvValue,
} from "./types.js";

/** Maximum stdout or stderr prefix retained by one command observation. */
const COMMAND_OUTPUT_CAPTURE_LIMIT_BYTES = 4 * 1024 * 1024;

const OUTPUT_CAPTURE_BLOCK_BYTES = 64 * 1024;
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
    readonly stdout: OutputCapture;
    readonly stderr: OutputCapture;
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
    stdout: observation.stdout,
    stderr: observation.stderr,
  });
}

export function captureOutput(text: string): OutputCapture {
  const accumulator = makeOutputCaptureAccumulator();
  accumulator.append(Buffer.from(text, "utf8"));
  return accumulator.finish();
}

/**
 * Drains a byte stream while retaining only its bounded prefix.
 *
 * Every byte contributes to the total and SHA-256 digest. UTF-8 decoding is
 * deferred until the stream completes so code points split across chunks remain
 * intact. Retained blocks grow on demand and never exceed the capture limit.
 */
export function collectOutputCapture<E, R>(stream: Stream.Stream<Uint8Array, E, R>) {
  return Effect.suspend(() =>
    Stream.runFold(stream, makeOutputCaptureAccumulator(), appendOutputChunk).pipe(
      Effect.map(finishOutputCapture)
    )
  );
}

function makeOutputCaptureAccumulator() {
  const hash = createHash("sha256");
  const retainedBlocks: Buffer[] = [];
  let bytes = 0;
  let retainedBytes = 0;

  return {
    append(chunk: Uint8Array): void {
      hash.update(chunk);
      bytes += chunk.byteLength;

      let chunkOffset = 0;
      const bytesToRetain = Math.min(
        chunk.byteLength,
        COMMAND_OUTPUT_CAPTURE_LIMIT_BYTES - retainedBytes
      );
      while (chunkOffset < bytesToRetain) {
        const blockIndex = Math.floor(retainedBytes / OUTPUT_CAPTURE_BLOCK_BYTES);
        const blockOffset = retainedBytes % OUTPUT_CAPTURE_BLOCK_BYTES;
        const block =
          retainedBlocks[blockIndex] ??
          allocateCaptureBlock(retainedBlocks, blockIndex * OUTPUT_CAPTURE_BLOCK_BYTES);
        const copyBytes = Math.min(bytesToRetain - chunkOffset, block.byteLength - blockOffset);
        block.set(chunk.subarray(chunkOffset, chunkOffset + copyBytes), blockOffset);
        chunkOffset += copyBytes;
        retainedBytes += copyBytes;
      }
    },
    finish(): OutputCapture {
      return {
        text: Buffer.concat(retainedBlocks, retainedBytes).toString("utf8"),
        truncated: bytes > retainedBytes,
        sha256: hash.digest("hex"),
        bytes,
      };
    },
  };
}

function allocateCaptureBlock(retainedBlocks: Buffer[], retainedBytes: number): Buffer {
  const block = Buffer.allocUnsafe(
    Math.min(OUTPUT_CAPTURE_BLOCK_BYTES, COMMAND_OUTPUT_CAPTURE_LIMIT_BYTES - retainedBytes)
  );
  retainedBlocks.push(block);
  return block;
}

function appendOutputChunk(
  accumulator: ReturnType<typeof makeOutputCaptureAccumulator>,
  chunk: Uint8Array
) {
  accumulator.append(chunk);
  return accumulator;
}

function finishOutputCapture(accumulator: ReturnType<typeof makeOutputCaptureAccumulator>) {
  return accumulator.finish();
}

export function redactEnvDelta(
  env: HabitatProcessRequest["env"]
): Record<string, RedactedEnvValue> {
  const delta: Record<string, RedactedEnvValue> = {};
  for (const [key, value] of Object.entries(env ?? {})) {
    if (value === undefined) continue;
    const redacted = SENSITIVE_ENV_KEY.test(key);
    const retainedValue = Match.value(redacted).pipe(
      Match.when(true, () => "<redacted>"),
      Match.orElse(() => value)
    );
    delta[key] = { value: retainedValue, redacted };
  }
  return delta;
}
