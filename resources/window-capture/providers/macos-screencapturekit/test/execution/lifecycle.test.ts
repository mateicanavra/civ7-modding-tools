import { createHash } from "node:crypto";
import { EventEmitter } from "node:events";
import { writeFileSync } from "node:fs";
import { access, mkdir, mkdtemp, readdir, rename, rm, utimes, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, dirname, join } from "node:path";
import { PassThrough } from "node:stream";
import { crc32, deflateSync } from "node:zlib";

import { Effect, Exit, Fiber, Scope } from "effect";
import { afterEach, describe, expect, test } from "vitest";

import {
  acquireMacosScreenCaptureKitWindowCaptureWithDependencies,
  defaultCaptureFileSystem,
  type WindowCaptureProviderDependencies,
} from "../../capture.js";
import { defaultHelperFileSystem, WINDOW_CAPTURE_HELPER_SOURCE } from "../../helper.js";
import {
  ProcessSupervisor,
  type SpawnChild,
  type SupervisedChildProcess,
} from "../../process-supervisor.js";
import { HELPER_PROBE_PROTOCOL } from "../../protocol.js";

const roots: string[] = [];
const outputStreams: readonly ["stdout", "stderr"] = ["stdout", "stderr"];

afterEach(async () => {
  await Promise.all(roots.splice(0).map((root) => rm(root, { force: true, recursive: true })));
});

describe("macOS ScreenCaptureKit provider execution", () => {
  test("prunes only the generic managed destination and atomically renames a proven PNG", async () => {
    const root = await temporaryRoot();
    const cacheRoot = join(root, "helper-cache");
    const managedRoot = join(root, "managed");
    await Promise.all([seedCachedHelper(cacheRoot), mkdir(managedRoot, { recursive: true })]);
    const staleManaged = join(managedRoot, "frame-stale.png");
    const unrelated = join(managedRoot, "other-stale.png");
    await Promise.all([writeFile(staleManaged, "old"), writeFile(unrelated, "old")]);
    const oldDate = new Date("2026-08-01T00:00:00.000Z");
    await Promise.all([
      utimes(staleManaged, oldDate, oldDate),
      utimes(unrelated, oldDate, oldDate),
    ]);

    const renames: Readonly<{ from: string; to: string }>[] = [];
    const dependencies = providerDependencies(root, successfulCaptureSpawn(), {
      ...defaultCaptureFileSystem,
      uniqueId: sequentialIds("managed"),
      rename: async (from, to) => {
        expect(dirname(from)).toBe(dirname(to));
        expect(basename(from)).toMatch(/^\..+\.tmp$/);
        expect(await exists(to)).toBe(false);
        renames.push({ from, to });
        await rename(from, to);
      },
    });
    const result = await Effect.runPromise(
      Effect.scoped(
        Effect.gen(function* () {
          const capture = yield* acquireMacosScreenCaptureKitWindowCaptureWithDependencies(
            {
              managedDestination: {
                root: managedRoot,
                filePrefix: "frame-",
                retentionMs: 60_000,
              },
              helperCacheRoot: cacheRoot,
            },
            dependencies
          );
          return yield* capture.capture({
            selection: { _tag: "text-contains", text: "Editor" },
          });
        })
      )
    );

    expect(result.requestedAt).toBe("2026-08-06T12:00:00.000Z");
    expect(result.window).toEqual({
      windowId: "42",
      applicationName: "Editor",
      applicationId: "example.editor",
      title: "Document",
      width: 300,
      height: 200,
      onScreen: true,
    });
    expect(result).not.toHaveProperty("frameSource");
    expect(result.file.path).toBe(renames[0]?.to);
    expect(result.file.dimensions).toEqual({ width: 3, height: 2 });
    expect(await exists(staleManaged)).toBe(false);
    expect(await exists(unrelated)).toBe(true);
    expect(await exists(result.file.path)).toBe(true);
    expect(await temporaryFiles(managedRoot)).toEqual([]);
  });

  test("an explicit destination never invokes configured-root retention", async () => {
    const root = await temporaryRoot();
    const cacheRoot = join(root, "helper-cache");
    const managedRoot = join(root, "managed");
    const explicitPath = join(root, "caller-owned", "chosen.png");
    await Promise.all([seedCachedHelper(cacheRoot), mkdir(managedRoot, { recursive: true })]);
    const staleManaged = join(managedRoot, "frame-stale.png");
    await writeFile(staleManaged, "keep me");
    let retentionReads = 0;
    const dependencies = providerDependencies(root, successfulCaptureSpawn(), {
      ...defaultCaptureFileSystem,
      uniqueId: sequentialIds("explicit"),
      readdir: async (path) => {
        if (path === managedRoot) retentionReads += 1;
        return readdir(path);
      },
    });
    const result = await Effect.runPromise(
      Effect.scoped(
        Effect.gen(function* () {
          const capture = yield* acquireMacosScreenCaptureKitWindowCaptureWithDependencies(
            {
              managedDestination: {
                root: managedRoot,
                filePrefix: "frame-",
                retentionMs: 0,
              },
              helperCacheRoot: cacheRoot,
            },
            dependencies
          );
          return yield* capture.capture({
            selection: { _tag: "window-id", windowId: "42" },
            destination: { path: explicitPath },
          });
        })
      )
    );

    expect(result.file.path).toBe(explicitPath);
    expect(retentionReads).toBe(0);
    expect(await exists(staleManaged)).toBe(true);
  });

  test("invalid PNG proof leaves neither a partial destination nor a temporary file", async () => {
    const root = await temporaryRoot();
    const cacheRoot = join(root, "helper-cache");
    const destination = join(root, "out", "frame.png");
    await seedCachedHelper(cacheRoot);
    const spawnChild: SpawnChild = (_command, args) => {
      const child = new TestChild();
      const outputPath = argumentValue(args, "--out");
      writeFileSync(outputPath, "not a png");
      child.stdout.write(JSON.stringify(helperSuccess(outputPath)));
      queueMicrotask(() => child.complete(0, null));
      return child;
    };
    const failure = await Effect.runPromise(
      Effect.scoped(
        Effect.gen(function* () {
          const capture = yield* acquireMacosScreenCaptureKitWindowCaptureWithDependencies(
            providerOptions(root, cacheRoot),
            providerDependencies(root, spawnChild)
          );
          return yield* Effect.flip(
            capture.capture({
              selection: { _tag: "window-id", windowId: "42" },
              destination: { path: destination },
            })
          );
        })
      )
    );

    expect(failure).toMatchObject({ reason: "capture-failed" });
    expect(await exists(destination)).toBe(false);
    expect(await temporaryFiles(dirname(destination))).toEqual([]);
  });

  test("operation interruption kills and awaits a never-ending capture exactly once", async () => {
    const root = await temporaryRoot();
    const cacheRoot = join(root, "helper-cache");
    const destination = join(root, "interrupted", "frame.png");
    await seedCachedHelper(cacheRoot);
    const child = new NeverEndingChild();
    let spawns = 0;
    const dependencies = providerDependencies(root, (_command, args) => {
      spawns += 1;
      writeFileSync(argumentValue(args, "--out"), pngBytes(3, 2));
      return child;
    });

    await Effect.runPromise(
      Effect.scoped(
        Effect.gen(function* () {
          const capture = yield* acquireMacosScreenCaptureKitWindowCaptureWithDependencies(
            providerOptions(root, cacheRoot),
            dependencies
          );
          const fiber = yield* Effect.forkChild(
            capture.capture({
              selection: { _tag: "text-contains", text: "Editor" },
              destination: { path: destination },
            })
          );
          yield* Effect.promise(() => waitUntil(() => spawns === 1));
          yield* Fiber.interrupt(fiber);
          expect(child.killCalls).toBe(1);
          expect(child.closeEmitted).toBe(true);
        })
      )
    );

    expect(child.killCalls).toBe(1);
    expect(spawns).toBe(1);
    expect(await exists(destination)).toBe(false);
    expect(await temporaryFiles(dirname(destination))).toEqual([]);
  });

  test.each(
    outputStreams
  )("caps %s bytes, stops the child, and returns typed overflow evidence", async (stream) => {
    const child = new SignaledChild();
    let detached = false;
    const supervisor = new ProcessSupervisor(
      (_command, _args, options) => {
        detached = options.detached;
        queueMicrotask(() => child[stream].write("0123456789"));
        return child;
      },
      { terminateGraceMs: 5, killGraceMs: 5, outputLimitBytes: 8 }
    );

    const failure = await Effect.runPromise(
      Effect.flip(supervisor.run({ command: "capture-helper", args: [] }))
    );
    await Effect.runPromise(supervisor.release());

    expect(detached).toBe(true);
    expect(child.signals).toEqual(["SIGTERM"]);
    expect(failure).toMatchObject({
      _tag: "ProcessSupervisorFailure",
      reason: "output-overflow",
      outputOverflow: { stream, limitBytes: 8, observedBytes: 10 },
      processResult: {
        completion: { _tag: "closed" },
        signalAttempts: [{ signal: "SIGTERM", target: "child", delivered: true }],
      },
    });
    expect(failure.processResult?.[stream]).toBe("01234567");
  });

  test("sweeps a detached process group after its leader closes during termination", async () => {
    const child = new ProcessGroupChild(4242);
    const groupSignals: Readonly<{ processGroupId: number; signal: NodeJS.Signals }>[] = [];
    let spawned = false;
    const supervisor = new ProcessSupervisor(
      () => {
        spawned = true;
        return child;
      },
      { terminateGraceMs: 5, killGraceMs: 5 },
      (processGroupId, signal) => {
        groupSignals.push({ processGroupId, signal });
        if (signal === "SIGTERM") child.complete(null, "SIGTERM");
        return true;
      }
    );
    const fiber = Effect.runFork(supervisor.run({ command: "capture-helper", args: [] }));
    await waitUntil(() => spawned);

    await Effect.runPromise(supervisor.release());
    const result = await Effect.runPromise(Fiber.join(fiber));

    expect(groupSignals).toEqual([
      { processGroupId: 4242, signal: "SIGTERM" },
      { processGroupId: 4242, signal: "SIGKILL" },
    ]);
    expect(child.signals).toEqual([]);
    expect(result).toMatchObject({
      completion: { _tag: "closed" },
      signalAttempts: [
        { signal: "SIGTERM", target: "process-group", delivered: true },
        { signal: "SIGKILL", target: "process-group", delivered: true },
      ],
    });
  });

  test("interruption cannot race the atomic publication commit", async () => {
    const root = await temporaryRoot();
    const cacheRoot = join(root, "helper-cache");
    const destination = join(root, "commit", "frame.png");
    await seedCachedHelper(cacheRoot);
    const renameStarted = deferred<void>();
    const continueRename = deferred<void>();
    const dependencies = providerDependencies(root, successfulCaptureSpawn(), {
      ...defaultCaptureFileSystem,
      uniqueId: sequentialIds("commit"),
      rename: async (from, to) => {
        renameStarted.resolve();
        await continueRename.promise;
        await rename(from, to);
      },
    });
    const scope = await Effect.runPromise(Scope.make());
    const capture = await Effect.runPromise(
      acquireMacosScreenCaptureKitWindowCaptureWithDependencies(
        providerOptions(root, cacheRoot),
        dependencies
      ).pipe(Effect.provideService(Scope.Scope, scope))
    );
    const captureFiber = Effect.runFork(
      capture.capture({
        selection: { _tag: "window-id", windowId: "42" },
        destination: { path: destination },
      })
    );
    await renameStarted.promise;

    let interruptSettled = false;
    const interrupted = Effect.runPromise(Fiber.interrupt(captureFiber)).then((exit) => {
      interruptSettled = true;
      return exit;
    });
    await delay(20);
    expect(interruptSettled).toBe(false);
    continueRename.resolve();
    await interrupted;

    expect(await exists(destination)).toBe(true);
    expect(await temporaryFiles(dirname(destination))).toEqual([]);
    await Effect.runPromise(Scope.close(scope, Exit.succeed(undefined)));
  });

  test("interruption and release wait for an admitted filesystem syscall to settle", async () => {
    const root = await temporaryRoot();
    const cacheRoot = join(root, "helper-cache");
    const destination = join(root, "admitted", "frame.png");
    await seedCachedHelper(cacheRoot);
    const mkdirStarted = deferred<void>();
    const continueMkdir = deferred<void>();
    let spawns = 0;
    const dependencies = providerDependencies(
      root,
      () => {
        spawns += 1;
        return new TestChild();
      },
      {
        ...defaultCaptureFileSystem,
        uniqueId: sequentialIds("admitted"),
        mkdir: async (path, options) => {
          mkdirStarted.resolve();
          await continueMkdir.promise;
          return mkdir(path, options);
        },
      }
    );
    const scope = await Effect.runPromise(Scope.make());
    const capture = await Effect.runPromise(
      acquireMacosScreenCaptureKitWindowCaptureWithDependencies(
        providerOptions(root, cacheRoot),
        dependencies
      ).pipe(Effect.provideService(Scope.Scope, scope))
    );
    const captureFiber = Effect.runFork(
      capture.capture({
        selection: { _tag: "window-id", windowId: "42" },
        destination: { path: destination },
      })
    );
    await mkdirStarted.promise;

    let interruptSettled = false;
    const interrupted = Effect.runPromise(Fiber.interrupt(captureFiber)).then(() => {
      interruptSettled = true;
    });
    let releaseSettled = false;
    const released = Effect.runPromise(Scope.close(scope, Exit.succeed(undefined))).then(() => {
      releaseSettled = true;
    });
    await delay(20);
    expect(interruptSettled).toBe(false);
    expect(releaseSettled).toBe(false);
    continueMkdir.resolve();
    await Promise.all([interrupted, released]);

    expect(spawns).toBe(0);
    expect(await exists(destination)).toBe(false);
    expect(await temporaryFiles(dirname(destination))).toEqual([]);
  });

  test("provider release kills and awaits an active capture, then the escaped capability refuses work", async () => {
    const root = await temporaryRoot();
    const cacheRoot = join(root, "helper-cache");
    await seedCachedHelper(cacheRoot);
    const child = new NeverEndingChild();
    let spawns = 0;
    let captureFileSystemCalls = 0;
    const dependencies = providerDependencies(
      root,
      () => {
        spawns += 1;
        return child;
      },
      {
        ...defaultCaptureFileSystem,
        uniqueId: sequentialIds("released"),
        mkdir: async (path, options) => {
          captureFileSystemCalls += 1;
          return mkdir(path, options);
        },
      }
    );
    const scope = await Effect.runPromise(Scope.make());
    const capture = await Effect.runPromise(
      acquireMacosScreenCaptureKitWindowCaptureWithDependencies(
        providerOptions(root, cacheRoot),
        dependencies
      ).pipe(Effect.provideService(Scope.Scope, scope))
    );
    const captureFiber = Effect.runFork(
      capture.capture({ selection: { _tag: "text-contains", text: "Editor" } })
    );
    await waitUntil(() => spawns === 1);
    await Effect.runPromise(Scope.close(scope, Exit.succeed(undefined)));

    expect(child.killCalls).toBe(1);
    expect(child.closeEmitted).toBe(true);
    await Effect.runPromise(Fiber.await(captureFiber));
    const callsBeforeRefusal = captureFileSystemCalls;
    const failure = await Effect.runPromise(
      Effect.flip(capture.capture({ selection: { _tag: "window-id", windowId: "42" } }))
    );
    expect(failure).toMatchObject({ reason: "provider-released" });
    expect(spawns).toBe(1);
    expect(captureFileSystemCalls).toBe(callsBeforeRefusal);
  });

  test("release escalates and remains bounded when a child ignores both signals", async () => {
    const root = await temporaryRoot();
    const cacheRoot = join(root, "helper-cache");
    const destination = join(root, "uncooperative", "frame.png");
    await seedCachedHelper(cacheRoot);
    const child = new UncooperativeChild();
    let spawns = 0;
    const dependencies: WindowCaptureProviderDependencies = {
      ...providerDependencies(root, () => {
        spawns += 1;
        return child;
      }),
      processStopPolicy: { terminateGraceMs: 5, killGraceMs: 5 },
    };
    const scope = await Effect.runPromise(Scope.make());
    const capture = await Effect.runPromise(
      acquireMacosScreenCaptureKitWindowCaptureWithDependencies(
        providerOptions(root, cacheRoot),
        dependencies
      ).pipe(Effect.provideService(Scope.Scope, scope))
    );
    const captureFiber = Effect.runFork(
      capture.capture({
        selection: { _tag: "window-id", windowId: "42" },
        destination: { path: destination },
      })
    );
    await waitUntil(() => spawns === 1);

    await Promise.race([
      Effect.runPromise(Scope.close(scope, Exit.succeed(undefined))),
      delay(500).then(() => {
        throw new Error("Provider release exceeded its bounded child-stop policy.");
      }),
    ]);
    const failure = await Effect.runPromise(Fiber.join(captureFiber).pipe(Effect.flip));

    expect(child.signals).toEqual(["SIGTERM", "SIGKILL"]);
    expect(child.closeEmitted).toBe(false);
    expect(child.stdout.destroyed).toBe(true);
    expect(child.stderr.destroyed).toBe(true);
    expect(child.listenerCount("error")).toBe(0);
    expect(child.listenerCount("close")).toBe(0);
    expect(child.unrefCalls).toBe(1);
    expect(failure).toMatchObject({
      reason: "capture-failed",
      cause: {
        _tag: "ProcessSupervisorFailure",
        reason: "termination-timed-out",
        processResult: {
          completion: { _tag: "termination-timed-out", leaked: true },
          terminationTimedOut: true,
          signalAttempts: [
            { signal: "SIGTERM", target: "child", delivered: true },
            { signal: "SIGKILL", target: "child", delivered: false },
          ],
        },
      },
    });
    expect(await exists(destination)).toBe(false);
    expect(await temporaryFiles(dirname(destination))).toEqual([]);
  });

  test("acquisition interruption kills and awaits a never-ending compile exactly once", async () => {
    const root = await temporaryRoot();
    const child = new NeverEndingChild();
    let spawns = 0;
    const acquisition = acquireMacosScreenCaptureKitWindowCaptureWithDependencies(
      providerOptions(root, join(root, "uncached-helper")),
      providerDependencies(root, () => {
        spawns += 1;
        return child;
      })
    );
    const fiber = Effect.runFork(Effect.scoped(acquisition));
    await waitUntil(() => spawns === 1);
    await Effect.runPromise(Fiber.interrupt(fiber));

    expect(child.killCalls).toBe(1);
    expect(child.closeEmitted).toBe(true);
  });
});

class TestChild extends EventEmitter implements SupervisedChildProcess {
  readonly stdout = new PassThrough();
  readonly stderr = new PassThrough();
  kill(): boolean {
    this.complete(null, "SIGTERM");
    return true;
  }
  complete(code: number | null, signal: NodeJS.Signals | null): void {
    this.stdout.end();
    this.stderr.end();
    this.emit("close", code, signal);
  }
}

class NeverEndingChild extends TestChild {
  killCalls = 0;
  closeEmitted = false;
  override kill(): boolean {
    this.killCalls += 1;
    setTimeout(() => {
      this.closeEmitted = true;
      this.complete(null, "SIGTERM");
    }, 10);
    return true;
  }
}

class SignaledChild extends TestChild {
  readonly signals: NodeJS.Signals[] = [];
  override kill(signal: NodeJS.Signals = "SIGTERM"): boolean {
    this.signals.push(signal);
    return super.kill();
  }
}

class ProcessGroupChild extends TestChild {
  readonly signals: NodeJS.Signals[] = [];
  constructor(readonly pid: number) {
    super();
  }
  override kill(signal: NodeJS.Signals = "SIGTERM"): boolean {
    this.signals.push(signal);
    return false;
  }
}

class UncooperativeChild extends TestChild {
  readonly signals: NodeJS.Signals[] = [];
  closeEmitted = false;
  unrefCalls = 0;
  override kill(signal: NodeJS.Signals = "SIGTERM"): boolean {
    this.signals.push(signal);
    return signal !== "SIGKILL";
  }
  unref(): void {
    this.unrefCalls += 1;
  }
}

function successfulCaptureSpawn(): SpawnChild {
  return (_command, args) => {
    const child = new TestChild();
    const outputPath = argumentValue(args, "--out");
    writeFileSync(outputPath, pngBytes(3, 2));
    child.stdout.write(JSON.stringify(helperSuccess(outputPath)));
    queueMicrotask(() => child.complete(0, null));
    return child;
  };
}

function providerDependencies(
  root: string,
  spawnChild: SpawnChild,
  captureFileSystem = defaultCaptureFileSystem
): WindowCaptureProviderDependencies {
  return {
    platform: "darwin",
    darwinKernelRelease: () => "23.0.0",
    tmpdir: () => root,
    now: () => new Date("2026-08-06T12:00:00.000Z"),
    spawnChild: (command, args, options) =>
      args.length === 1 && args[0] === "probe"
        ? successfulProbeChild()
        : spawnChild(command, args, options),
    helperFileSystem: defaultHelperFileSystem,
    captureFileSystem,
  };
}

function successfulProbeChild(): TestChild {
  const child = new TestChild();
  child.stdout.write(JSON.stringify({ ok: true, protocol: HELPER_PROBE_PROTOCOL }));
  queueMicrotask(() => child.complete(0, null));
  return child;
}

function providerOptions(root: string, helperCacheRoot: string) {
  return {
    managedDestination: {
      root: join(root, "managed"),
      filePrefix: "frame-",
      retentionMs: 60_000,
    },
    helperCacheRoot,
  } as const;
}

async function temporaryRoot(): Promise<string> {
  const root = await mkdtemp(join(tmpdir(), "window-capture-lifecycle-"));
  roots.push(root);
  return root;
}

async function seedCachedHelper(cacheRoot: string): Promise<string> {
  await mkdir(cacheRoot, { recursive: true });
  const hash = createHash("sha256").update(WINDOW_CAPTURE_HELPER_SOURCE).digest("hex").slice(0, 16);
  const path = join(cacheRoot, `window-capture-screencapturekit-${hash}`);
  await writeFile(path, "cached helper");
  return path;
}

function helperSuccess(path: string) {
  return {
    ok: true,
    path,
    pixelWidth: 3,
    pixelHeight: 2,
    frameSource: "screenshot",
    window: {
      windowId: 42,
      applicationName: "Editor",
      bundleIdentifier: "example.editor",
      title: "Document",
      width: 300,
      height: 200,
      onScreen: true,
    },
  } as const;
}

function pngBytes(width: number, height: number): Buffer {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  const imageData = Buffer.alloc(height * (1 + width * 4));
  return Buffer.concat([
    Buffer.from("89504e470d0a1a0a", "hex"),
    pngChunk("IHDR", ihdr),
    pngChunk("IDAT", deflateSync(imageData)),
    pngChunk("IEND", Buffer.alloc(0)),
  ]);
}

function pngChunk(type: string, data: Buffer): Buffer {
  const typeBytes = Buffer.from(type, "ascii");
  const chunk = Buffer.alloc(12 + data.length);
  chunk.writeUInt32BE(data.length, 0);
  typeBytes.copy(chunk, 4);
  data.copy(chunk, 8);
  chunk.writeUInt32BE(crc32(Buffer.concat([typeBytes, data])), 8 + data.length);
  return chunk;
}

function argumentValue(args: readonly string[], flag: string): string {
  const index = args.indexOf(flag);
  const value = args[index + 1];
  if (index < 0 || value === undefined) throw new Error(`Missing ${flag} argument.`);
  return value;
}

function sequentialIds(prefix: string): () => string {
  let next = 0;
  return () => `${prefix}-${next++}`;
}

async function exists(path: string): Promise<boolean> {
  return access(path).then(
    () => true,
    () => false
  );
}

async function temporaryFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory);
  return entries.filter((name) => name.endsWith(".tmp"));
}

async function waitUntil(predicate: () => boolean): Promise<void> {
  const deadline = Date.now() + 2_000;
  while (!predicate()) {
    if (Date.now() >= deadline) throw new Error("Timed out waiting for lifecycle event.");
    await new Promise((resolveWait) => setTimeout(resolveWait, 2));
  }
}

function delay(milliseconds: number): Promise<void> {
  return new Promise((resolveDelay) => setTimeout(resolveDelay, milliseconds));
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
