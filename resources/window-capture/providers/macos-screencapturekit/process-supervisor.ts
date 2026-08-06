import { spawn } from "node:child_process";
import type { Readable } from "node:stream";

import { Data, Effect } from "effect";

export type ProcessInvocation = Readonly<{
  command: string;
  args: readonly string[];
  cwd?: string;
  env?: NodeJS.ProcessEnv;
}>;

type ProcessSignalAttempt = Readonly<{
  signal: NodeJS.Signals;
  target: "process-group" | "child";
  delivered: boolean;
  error?: string;
}>;

export type ProcessOutputOverflow = Readonly<{
  stream: "stdout" | "stderr";
  limitBytes: number;
  observedBytes: number;
}>;

type ProcessCompletion =
  | Readonly<{ _tag: "closed" }>
  | Readonly<{ _tag: "termination-timed-out"; leaked: true }>;

export type ProcessResult = Readonly<{
  stdout: string;
  stderr: string;
  exitCode: number | null;
  signal: NodeJS.Signals | null;
  completion: ProcessCompletion;
  signalAttempts: readonly ProcessSignalAttempt[];
  spawnError?: Error;
  outputOverflow?: ProcessOutputOverflow;
  terminationTimedOut?: true;
}>;

export class ProcessSupervisorFailure extends Data.TaggedError("ProcessSupervisorFailure")<{
  readonly reason:
    | "provider-released"
    | "spawn-failed"
    | "output-overflow"
    | "termination-timed-out";
  readonly message: string;
  readonly cause?: unknown;
  readonly outputOverflow?: ProcessOutputOverflow;
  readonly processResult?: ProcessResult;
}> {}

interface SupervisedReadable extends Readable {
  unref?(): void;
}

export interface SupervisedChildProcess {
  readonly stdout: SupervisedReadable;
  readonly stderr: SupervisedReadable;
  readonly pid?: number;
  on(event: "error", listener: (error: Error) => void): this;
  on(event: "close", listener: (code: number | null, signal: NodeJS.Signals | null) => void): this;
  removeListener(event: "error", listener: (error: Error) => void): this;
  removeListener(
    event: "close",
    listener: (code: number | null, signal: NodeJS.Signals | null) => void
  ): this;
  kill(signal?: NodeJS.Signals): boolean;
  unref?(): void;
}

export type SpawnChild = (
  command: string,
  args: readonly string[],
  options: Readonly<{
    stdio: "pipe";
    detached: true;
    cwd?: string;
    env?: NodeJS.ProcessEnv;
  }>
) => SupervisedChildProcess;

type SendProcessGroupSignal = (processGroupId: number, signal: NodeJS.Signals) => boolean;

export type ProcessStopPolicy = Readonly<{
  terminateGraceMs: number;
  killGraceMs: number;
  outputLimitBytes?: number;
}>;

type ResolvedProcessStopPolicy = Readonly<{
  terminateGraceMs: number;
  killGraceMs: number;
  outputLimitBytes: number;
}>;

const DEFAULT_PROCESS_STOP_POLICY: ResolvedProcessStopPolicy = {
  terminateGraceMs: 500,
  killGraceMs: 500,
  outputLimitBytes: 64 * 1024,
};

export const spawnNativeChild: SpawnChild = (command, args, options) =>
  spawn(command, [...args], options);

const sendNativeProcessGroupSignal: SendProcessGroupSignal = (processGroupId, signal) =>
  process.kill(-processGroupId, signal);

/** Sole lifecycle owner of provider operations and their native child processes. */
export class ProcessSupervisor {
  readonly #active = new Set<ManagedProcess>();
  readonly #stopPolicy: ResolvedProcessStopPolicy;
  #activeOperations = 0;
  #drained = Promise.resolve();
  #resolveDrained: (() => void) | undefined;
  #releasePromise: Promise<void> | undefined;
  #released = false;

  constructor(
    private readonly spawnChild: SpawnChild = spawnNativeChild,
    stopPolicy: ProcessStopPolicy = DEFAULT_PROCESS_STOP_POLICY,
    private readonly sendProcessGroupSignal: SendProcessGroupSignal = sendNativeProcessGroupSignal
  ) {
    this.#stopPolicy = {
      terminateGraceMs: stopPolicy.terminateGraceMs,
      killGraceMs: stopPolicy.killGraceMs,
      outputLimitBytes: validOutputLimit(stopPolicy.outputLimitBytes),
    };
  }

  isReleased(): boolean {
    return this.#released;
  }

  /** Refuses new work before the enclosing scope drains admitted operations. */
  private closeAdmission(): void {
    this.#released = true;
  }

  /** Admits one complete provider operation and keeps release behind its cleanup. */
  superviseOperation<A, E, R>(
    operation: () => Effect.Effect<A, E, R>
  ): Effect.Effect<A, E | ProcessSupervisorFailure, R> {
    const admit = Effect.suspend(() => {
      if (this.#released) return Effect.fail(providerReleasedFailure());
      if (this.#activeOperations === 0) {
        this.#drained = new Promise<void>((resolveDrained) => {
          this.#resolveDrained = resolveDrained;
        });
      }
      this.#activeOperations += 1;
      return Effect.void;
    });

    return Effect.acquireUseRelease(admit, operation, () =>
      Effect.sync(() => {
        this.#activeOperations -= 1;
        if (this.#activeOperations !== 0) return;
        const resolveDrained = this.#resolveDrained;
        this.#resolveDrained = undefined;
        resolveDrained?.();
      })
    );
  }

  run(invocation: ProcessInvocation): Effect.Effect<ProcessResult, ProcessSupervisorFailure> {
    return Effect.async<ProcessResult, ProcessSupervisorFailure>((resume) => {
      if (this.#released) {
        resume(Effect.fail(providerReleasedFailure()));
        return;
      }

      let child: SupervisedChildProcess;
      try {
        child = this.spawnChild(invocation.command, invocation.args, {
          stdio: "pipe",
          detached: true,
          ...(invocation.cwd === undefined ? {} : { cwd: invocation.cwd }),
          ...(invocation.env === undefined ? {} : { env: invocation.env }),
        });
      } catch (cause) {
        resume(
          Effect.fail(
            new ProcessSupervisorFailure({
              reason: "spawn-failed",
              message: failureMessage(cause),
              cause,
            })
          )
        );
        return;
      }

      const managed = new ManagedProcess(child, this.#stopPolicy, this.sendProcessGroupSignal);
      this.#active.add(managed);
      void managed.result.then((result) => {
        this.#active.delete(managed);
        if (result.outputOverflow !== undefined) {
          resume(Effect.fail(outputOverflowFailure(result.outputOverflow, result)));
          return;
        }
        if (result.completion._tag === "termination-timed-out") {
          resume(Effect.fail(terminationTimedOutFailure(result)));
          return;
        }
        resume(Effect.succeed(result));
      });

      return Effect.promise(() => managed.stop());
    });
  }

  /** Flips availability and snapshots active children synchronously, then awaits every stop. */
  release(): Effect.Effect<void> {
    return Effect.suspend(() => {
      const existingRelease = this.#releasePromise;
      if (existingRelease !== undefined) return Effect.promise(() => existingRelease);

      this.closeAdmission();
      const active = [...this.#active];
      const stops = active.map((child) => child.stop());
      const drained = this.#drained;
      const release = Promise.all([...stops, drained]).then(() => {
        for (const child of active) this.#active.delete(child);
      });
      this.#releasePromise = release;
      return Effect.promise(() => release);
    });
  }
}

class ManagedProcess {
  readonly result: Promise<ProcessResult>;
  readonly #resolveResult: (result: ProcessResult) => void;
  readonly #stdoutChunks: Buffer[] = [];
  readonly #stderrChunks: Buffer[] = [];
  readonly #signalAttempts: ProcessSignalAttempt[] = [];
  #settled = false;
  #stopPromise: Promise<void> | undefined;
  #stdoutBytes = 0;
  #stderrBytes = 0;
  #stdoutOverflowed = false;
  #stderrOverflowed = false;
  #outputOverflow: ProcessOutputOverflow | undefined;
  #spawnError: Error | undefined;
  #stopStarted = false;
  #signalInFlight = false;
  #pendingClose:
    | Readonly<{
        exitCode: number | null;
        signal: NodeJS.Signals | null;
      }>
    | undefined;

  readonly #onStdoutData = (chunk: unknown): void => {
    this.captureOutput("stdout", chunk);
  };

  readonly #onStderrData = (chunk: unknown): void => {
    this.captureOutput("stderr", chunk);
  };

  readonly #onError = (error: Error): void => {
    this.#spawnError = error;
  };

  readonly #onClose = (exitCode: number | null, signal: NodeJS.Signals | null): void => {
    if (this.#signalInFlight) {
      this.#pendingClose = { exitCode, signal };
      return;
    }
    this.completeClosed(exitCode, signal);
  };

  constructor(
    private readonly child: SupervisedChildProcess,
    private readonly stopPolicy: ResolvedProcessStopPolicy,
    private readonly sendProcessGroupSignal: SendProcessGroupSignal
  ) {
    const result = deferred<ProcessResult>();
    this.result = result.promise;
    this.#resolveResult = result.resolve;
    child.stdout.on("data", this.#onStdoutData);
    child.stderr.on("data", this.#onStderrData);
    child.on("error", this.#onError);
    child.on("close", this.#onClose);
  }

  stop(): Promise<void> {
    if (this.#stopPromise !== undefined) return this.#stopPromise;
    this.#stopPromise = (async () => {
      if (this.#settled) return;
      this.#stopStarted = true;
      this.sendSignal("SIGTERM");
      if (await settlesWithin(this.result, this.stopPolicy.terminateGraceMs)) return;
      this.sendSignal("SIGKILL");
      if (await settlesWithin(this.result, this.stopPolicy.killGraceMs)) return;
      this.completeTerminationTimeout();
    })();
    return this.#stopPromise;
  }

  private captureOutput(stream: "stdout" | "stderr", chunk: unknown): void {
    if (this.#settled) return;
    if (stream === "stdout" ? this.#stdoutOverflowed : this.#stderrOverflowed) return;

    const bytes = outputBytes(chunk);
    const previousBytes = stream === "stdout" ? this.#stdoutBytes : this.#stderrBytes;
    const observedBytes = previousBytes + bytes.byteLength;
    const remaining = this.stopPolicy.outputLimitBytes - previousBytes;
    if (remaining > 0) {
      const admitted = Buffer.from(bytes.subarray(0, remaining));
      if (stream === "stdout") {
        this.#stdoutChunks.push(admitted);
        this.#stdoutBytes += admitted.byteLength;
      } else {
        this.#stderrChunks.push(admitted);
        this.#stderrBytes += admitted.byteLength;
      }
    }
    if (observedBytes <= this.stopPolicy.outputLimitBytes) return;

    if (stream === "stdout") this.#stdoutOverflowed = true;
    else this.#stderrOverflowed = true;
    if (this.#outputOverflow === undefined) {
      this.#outputOverflow = {
        stream,
        limitBytes: this.stopPolicy.outputLimitBytes,
        observedBytes,
      };
      void this.stop();
    }
  }

  private sendSignal(signal: NodeJS.Signals): void {
    this.#signalInFlight = true;
    try {
      const pid = this.child.pid;
      if (pid !== undefined && pid > 0) {
        const processGroupAttempt = this.attemptProcessGroupSignal(pid, signal);
        this.#signalAttempts.push(processGroupAttempt);
        if (processGroupAttempt.delivered) return;
      }

      try {
        this.#signalAttempts.push({
          signal,
          target: "child",
          delivered: this.child.kill(signal),
        });
      } catch (cause) {
        this.#signalAttempts.push({
          signal,
          target: "child",
          delivered: false,
          error: failureMessage(cause),
        });
      }
    } finally {
      this.#signalInFlight = false;
      const pendingClose = this.#pendingClose;
      this.#pendingClose = undefined;
      if (pendingClose !== undefined) {
        this.completeClosed(pendingClose.exitCode, pendingClose.signal);
      }
    }
  }

  private completeClosed(exitCode: number | null, signal: NodeJS.Signals | null): void {
    if (this.#settled) return;
    this.#settled = true;
    this.killRemainingProcessGroup();
    this.detach(false);
    this.#resolveResult(this.processResult(exitCode, signal, { _tag: "closed" }));
  }

  private completeTerminationTimeout(): void {
    if (this.#settled) return;
    this.#settled = true;
    this.detach(true);
    this.#resolveResult(
      this.processResult(null, null, { _tag: "termination-timed-out", leaked: true })
    );
  }

  private killRemainingProcessGroup(): void {
    const pid = this.child.pid;
    if (!this.#stopStarted || pid === undefined || pid < 1) return;
    if (
      this.#signalAttempts.some(
        (attempt) => attempt.target === "process-group" && attempt.signal === "SIGKILL"
      )
    ) {
      return;
    }
    this.#signalAttempts.push(this.attemptProcessGroupSignal(pid, "SIGKILL"));
  }

  private attemptProcessGroupSignal(
    processGroupId: number,
    signal: NodeJS.Signals
  ): ProcessSignalAttempt {
    try {
      return {
        signal,
        target: "process-group",
        delivered: this.sendProcessGroupSignal(processGroupId, signal),
      };
    } catch (cause) {
      return {
        signal,
        target: "process-group",
        delivered: false,
        error: failureMessage(cause),
      };
    }
  }

  private processResult(
    exitCode: number | null,
    signal: NodeJS.Signals | null,
    completion: ProcessCompletion
  ): ProcessResult {
    const result = {
      stdout: Buffer.concat(this.#stdoutChunks, this.#stdoutBytes).toString("utf8"),
      stderr: Buffer.concat(this.#stderrChunks, this.#stderrBytes).toString("utf8"),
      exitCode,
      signal,
      completion,
      signalAttempts: [...this.#signalAttempts],
      ...(this.#spawnError === undefined ? {} : { spawnError: this.#spawnError }),
      ...(this.#outputOverflow === undefined ? {} : { outputOverflow: this.#outputOverflow }),
    };
    if (completion._tag === "termination-timed-out") {
      return { ...result, terminationTimedOut: true };
    }
    return result;
  }

  private detach(leaked: boolean): void {
    this.child.stdout.removeListener("data", this.#onStdoutData);
    this.child.stderr.removeListener("data", this.#onStderrData);
    this.child.removeListener("error", this.#onError);
    this.child.removeListener("close", this.#onClose);
    if (!leaked) return;

    destroyAndUnref(this.child.stdout);
    destroyAndUnref(this.child.stderr);
    try {
      this.child.unref?.();
    } catch {
      // The timeout result already records the leaked child; cleanup remains best-effort.
    }
  }
}

function destroyAndUnref(stream: SupervisedReadable): void {
  try {
    stream.destroy();
  } catch {
    // Best-effort detachment must not make bounded release reject.
  }
  try {
    stream.unref?.();
  } catch {
    // Some platform stream handles can race native close while detaching.
  }
}

function outputBytes(chunk: unknown): Buffer {
  if (Buffer.isBuffer(chunk)) return chunk;
  return Buffer.from(typeof chunk === "string" ? chunk : String(chunk), "utf8");
}

function validOutputLimit(limit: number | undefined): number {
  if (limit === undefined || !Number.isSafeInteger(limit) || limit < 1) {
    return DEFAULT_PROCESS_STOP_POLICY.outputLimitBytes;
  }
  return limit;
}

function settlesWithin<T>(promise: Promise<T>, timeoutMs: number): Promise<boolean> {
  return new Promise((resolveSettled) => {
    let settled = false;
    const finish = (value: boolean) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      resolveSettled(value);
    };
    const timeout = setTimeout(() => finish(false), timeoutMs);
    timeout.unref();
    void promise.then(
      () => finish(true),
      () => finish(true)
    );
  });
}

function deferred<T>(): Readonly<{
  promise: Promise<T>;
  resolve: (value: T) => void;
}> {
  let resolveValue: ((value: T) => void) | undefined;
  const promise = new Promise<T>((resolve) => {
    resolveValue = resolve;
  });
  if (resolveValue === undefined)
    throw new Error("Promise executor did not initialize synchronously.");
  return { promise, resolve: resolveValue };
}

function failureMessage(cause: unknown): string {
  return cause instanceof Error ? cause.message : String(cause);
}

function providerReleasedFailure(): ProcessSupervisorFailure {
  return new ProcessSupervisorFailure({
    reason: "provider-released",
    message: "The window-capture provider has already been released.",
  });
}

function outputOverflowFailure(
  outputOverflow: ProcessOutputOverflow,
  processResult: ProcessResult
): ProcessSupervisorFailure {
  return new ProcessSupervisorFailure({
    reason: "output-overflow",
    message: `Child process ${outputOverflow.stream} exceeded its ${outputOverflow.limitBytes}-byte limit.`,
    outputOverflow,
    processResult,
  });
}

function terminationTimedOutFailure(processResult: ProcessResult): ProcessSupervisorFailure {
  return new ProcessSupervisorFailure({
    reason: "termination-timed-out",
    message:
      "Child process did not close after bounded termination and was detached as a leaked process.",
    processResult,
  });
}
