import { createHash, randomUUID } from "node:crypto";
import type { Stats } from "node:fs";
import { mkdir, readdir, readFile, rename, rm, stat } from "node:fs/promises";
import { release as kernelRelease, tmpdir } from "node:os";
import { basename, dirname, join, resolve } from "node:path";

import {
  type WindowCapture,
  WindowCaptureFailure,
  type WindowCaptureFailureReason,
  type WindowCaptureRequest,
  WindowCaptureRequestSchema,
  type WindowCaptureResult,
} from "@civ7/window-capture";
import { Effect } from "effect";
import { Value } from "typebox/value";

import {
  type MacosScreenCaptureKitWindowCaptureConfig,
  type MacosScreenCaptureKitWindowCaptureOptions,
  resolveMacosScreenCaptureKitWindowCaptureConfig,
} from "./config.js";
import {
  defaultHelperFileSystem,
  type HelperFileSystem,
  prepareScreenCaptureKitHelper,
} from "./helper.js";
import {
  type ProcessStopPolicy,
  ProcessSupervisor,
  type SpawnChild,
  spawnNativeChild,
} from "./process-supervisor.js";
import {
  type HelperCaptureFailure,
  parseHelperCaptureEnvelope,
  parsePngDimensions,
} from "./protocol.js";

const MINIMUM_SCREEN_CAPTURE_KIT_DARWIN_MAJOR = 23;
const MAXIMUM_SCREEN_CAPTURE_KIT_WINDOW_ID = 4_294_967_295;
const DECIMAL_WINDOW_ID = /^(?:0|[1-9]\d*)$/;

export type CaptureFileSystem = Readonly<{
  mkdir: (path: string, options: Readonly<{ recursive: true }>) => Promise<string | undefined>;
  readdir: (path: string) => Promise<string[]>;
  readFile: (path: string) => Promise<Buffer>;
  rename: (oldPath: string, newPath: string) => Promise<void>;
  rm: (path: string, options: Readonly<{ force: true }>) => Promise<void>;
  stat: (path: string) => Promise<Stats>;
  uniqueId: () => string;
}>;

export type WindowCaptureProviderDependencies = Readonly<{
  platform: NodeJS.Platform;
  darwinKernelRelease: () => string;
  tmpdir: () => string;
  now: () => Date;
  spawnChild: SpawnChild;
  processStopPolicy?: ProcessStopPolicy;
  helperFileSystem: HelperFileSystem;
  captureFileSystem: CaptureFileSystem;
}>;

export const defaultCaptureFileSystem: CaptureFileSystem = {
  mkdir,
  readdir,
  readFile,
  rename,
  rm,
  stat,
  uniqueId: randomUUID,
};

export const defaultWindowCaptureProviderDependencies: WindowCaptureProviderDependencies = {
  platform: process.platform,
  darwinKernelRelease: kernelRelease,
  tmpdir,
  now: () => new Date(),
  spawnChild: spawnNativeChild,
  helperFileSystem: defaultHelperFileSystem,
  captureFileSystem: defaultCaptureFileSystem,
};

/** Internal dependency-injected acquisition used by focused provider proofs. */
export function acquireMacosScreenCaptureKitWindowCaptureWithDependencies(
  options: MacosScreenCaptureKitWindowCaptureOptions,
  dependencies: WindowCaptureProviderDependencies
) {
  return Effect.acquireRelease(
    Effect.sync(
      () => new ProcessSupervisor(dependencies.spawnChild, dependencies.processStopPolicy)
    ),
    (supervisor) => supervisor.release()
  ).pipe(
    Effect.flatMap((supervisor) =>
      Effect.gen(function* () {
        const platformFailure = inspectPlatformSupport(dependencies);
        if (platformFailure !== undefined) {
          return yield* Effect.fail(platformFailure);
        }

        const defaultHelperCacheRoot = join(
          dependencies.tmpdir(),
          "window-capture",
          "macos-screencapturekit"
        );
        const config = yield* Effect.try({
          try: () =>
            resolveMacosScreenCaptureKitWindowCaptureConfig(options, defaultHelperCacheRoot),
          catch: (cause) =>
            isWindowCaptureFailure(cause)
              ? cause
              : new WindowCaptureFailure({
                  operation: "acquire",
                  reason: "invalid-configuration",
                  message: failureMessage(cause),
                  cause,
                }),
        });
        const helperPath = yield* prepareScreenCaptureKitHelper(
          config.helperCacheRoot,
          supervisor,
          dependencies.helperFileSystem
        );

        const capability: WindowCapture = {
          capture: (request) =>
            supervisor
              .superviseOperation(() =>
                captureWindow(
                  request,
                  config,
                  helperPath,
                  supervisor,
                  dependencies.now,
                  dependencies.captureFileSystem
                )
              )
              .pipe(
                Effect.mapError((failure) =>
                  failure._tag === "ProcessSupervisorFailure" ? providerReleased() : failure
                )
              ),
        };
        return capability;
      })
    )
  );
}

function captureWindow(
  request: WindowCaptureRequest,
  config: MacosScreenCaptureKitWindowCaptureConfig,
  helperPath: string,
  supervisor: ProcessSupervisor,
  now: () => Date,
  fileSystem: CaptureFileSystem = defaultCaptureFileSystem
): Effect.Effect<WindowCaptureResult, WindowCaptureFailure> {
  return Effect.suspend(() => {
    const timestamp = now();
    const decodedRequest = decodeRequest(request);
    if (isWindowCaptureFailure(decodedRequest)) return Effect.fail(decodedRequest);
    const requestFailure = validateRequest(decodedRequest);
    if (requestFailure !== undefined) return Effect.fail(requestFailure);
    const selectedWindowId =
      decodedRequest.selection._tag === "window-id"
        ? parseScreenCaptureKitWindowId(decodedRequest.selection.windowId)
        : undefined;
    if (isWindowCaptureFailure(selectedWindowId)) return Effect.fail(selectedWindowId);

    const managed = decodedRequest.destination === undefined;
    const destinationPath = managed
      ? join(
          config.managedDestination.root,
          `${config.managedDestination.filePrefix}${safeTimestamp(timestamp)}-${fileSystem.uniqueId()}.png`
        )
      : resolve(decodedRequest.destination.path);
    const destinationDirectory = dirname(destinationPath);
    const temporaryPath = join(
      destinationDirectory,
      `.${basename(destinationPath)}.${fileSystem.uniqueId()}.tmp`
    );

    const cleanupTemporary = ignoreCaptureFs(() =>
      fileSystem.rm(temporaryPath, { force: true })
    ).pipe(Effect.ignore);
    const program = Effect.gen(function* () {
      yield* captureFs(
        () => fileSystem.mkdir(destinationDirectory, { recursive: true }).then(() => undefined),
        "Could not create the capture destination directory."
      );
      if (managed) {
        yield* pruneManagedDestination(config, timestamp, fileSystem);
      }

      const processResult = yield* supervisor
        .run({
          command: helperPath,
          args: [
            "capture",
            "--out",
            temporaryPath,
            ...(decodedRequest.selection._tag === "window-id"
              ? ["--window-id", String(selectedWindowId)]
              : ["--text", decodedRequest.selection.text]),
          ],
        })
        .pipe(
          Effect.mapError((failure) =>
            failure.reason === "provider-released"
              ? providerReleased()
              : captureFailure(`Could not start the capture helper: ${failure.message}`, failure)
          )
        );

      const envelope = yield* Effect.try({
        try: () => parseHelperCaptureEnvelope(processResult.stdout),
        catch: (cause) =>
          captureFailure(`Capture helper emitted invalid output: ${failureMessage(cause)}`, {
            stdout: processResult.stdout.slice(0, 500),
            stderr: processResult.stderr.slice(0, 500),
            exitCode: processResult.exitCode,
            signal: processResult.signal,
            terminationTimedOut: processResult.terminationTimedOut === true,
            cause,
          }),
      });
      if (!envelope.ok) return yield* Effect.fail(helperFailure(envelope));
      if (
        processResult.spawnError !== undefined ||
        processResult.exitCode !== 0 ||
        envelope.path !== temporaryPath
      ) {
        return yield* Effect.fail(
          captureFailure("Capture helper did not complete the requested temporary-file write.", {
            processResult,
            helperPath: envelope.path,
            temporaryPath,
          })
        );
      }

      const bytes = yield* captureFs(
        () => fileSystem.readFile(temporaryPath),
        "Could not read the capture helper's temporary PNG."
      );
      const fileStat = yield* captureFs(
        () => fileSystem.stat(temporaryPath),
        "Could not inspect the capture helper's temporary PNG."
      );
      const dimensions = yield* Effect.try({
        try: () => parsePngDimensions(bytes),
        catch: (cause) => captureFailure(failureMessage(cause), cause),
      });
      if (
        !fileStat.isFile() ||
        fileStat.size !== bytes.byteLength ||
        dimensions.width !== envelope.pixelWidth ||
        dimensions.height !== envelope.pixelHeight
      ) {
        return yield* Effect.fail(
          captureFailure("Capture helper PNG facts did not agree with the committed bytes.", {
            byteSize: bytes.byteLength,
            statSize: fileStat.size,
            dimensions,
            helperDimensions: {
              width: envelope.pixelWidth,
              height: envelope.pixelHeight,
            },
          })
        );
      }

      const result = {
        requestedAt: timestamp.toISOString(),
        window: {
          windowId: String(envelope.window.windowId),
          applicationName: envelope.window.applicationName,
          ...(envelope.window.bundleIdentifier === ""
            ? {}
            : { applicationId: envelope.window.bundleIdentifier }),
          title: envelope.window.title,
          width: envelope.window.width,
          height: envelope.window.height,
          onScreen: envelope.window.onScreen,
        },
        file: {
          path: destinationPath,
          byteSize: bytes.byteLength,
          sha256: createHash("sha256").update(bytes).digest("hex"),
          mediaType: "image/png",
          dimensions,
        },
      } satisfies WindowCaptureResult;

      return yield* captureFs(
        () => fileSystem.rename(temporaryPath, destinationPath),
        "Could not atomically publish the capture PNG."
      ).pipe(Effect.as(result));
    });

    return program.pipe(Effect.ensuring(cleanupTemporary));
  });
}

function pruneManagedDestination(
  config: MacosScreenCaptureKitWindowCaptureConfig,
  now: Date,
  fileSystem: CaptureFileSystem
): Effect.Effect<void> {
  const { root, filePrefix, retentionMs } = config.managedDestination;
  const cutoff = now.getTime() - retentionMs;
  return Effect.gen(function* () {
    const entries = yield* ignoreCaptureFs(() => fileSystem.readdir(root));
    if (entries === undefined) return;

    yield* Effect.forEach(
      entries.filter((name) => name.startsWith(filePrefix) && name.endsWith(".png")),
      (name) =>
        Effect.gen(function* () {
          const path = join(root, name);
          const fileStat = yield* ignoreCaptureFs(() => fileSystem.stat(path));
          if (fileStat?.isFile() === true && fileStat.mtimeMs < cutoff) {
            yield* ignoreCaptureFs(() => fileSystem.rm(path, { force: true }));
          }
        }),
      { discard: true }
    );
  });
}

function decodeRequest(request: unknown): WindowCaptureRequest | WindowCaptureFailure {
  try {
    return Value.Parse(WindowCaptureRequestSchema, request);
  } catch (cause) {
    return invalidCaptureRequest(`Window-capture request is invalid. ${failureMessage(cause)}`);
  }
}

function validateRequest(request: WindowCaptureRequest): WindowCaptureFailure | undefined {
  if (request.selection._tag === "text-contains" && request.selection.text.trim().length === 0) {
    return invalidCaptureRequest("Text window selections must contain non-whitespace text.");
  }
  if (
    request.destination !== undefined &&
    (request.destination.path.trim().length === 0 || request.destination.path.includes("\0"))
  ) {
    return invalidCaptureRequest(
      "Explicit capture destinations must be non-empty filesystem paths."
    );
  }
  return undefined;
}

function parseScreenCaptureKitWindowId(windowId: string): number | WindowCaptureFailure {
  if (!DECIMAL_WINDOW_ID.test(windowId)) {
    return invalidCaptureRequest(
      "The ScreenCaptureKit provider requires a decimal UInt32 window identifier."
    );
  }
  const parsed = Number(windowId);
  if (!Number.isSafeInteger(parsed) || parsed > MAXIMUM_SCREEN_CAPTURE_KIT_WINDOW_ID) {
    return invalidCaptureRequest(
      "The ScreenCaptureKit provider requires a decimal UInt32 window identifier."
    );
  }
  return parsed;
}

function helperFailure(failure: HelperCaptureFailure): WindowCaptureFailure {
  const reasonByHelperError: Readonly<
    Record<HelperCaptureFailure["error"], WindowCaptureFailureReason>
  > = {
    usage: "capture-failed",
    "permission-required": "permission-required",
    "window-not-found": "window-not-found",
    "unsupported-platform": "unsupported-platform",
    "capture-failed": "capture-failed",
  };
  return new WindowCaptureFailure({
    operation: "capture",
    reason: reasonByHelperError[failure.error],
    message: failure.message,
    details: failure,
  });
}

function captureFs<A>(
  operation: () => Promise<A>,
  message: string
): Effect.Effect<A, WindowCaptureFailure> {
  return Effect.tryPromise({
    try: operation,
    catch: (cause) => captureFailure(`${message} ${failureMessage(cause)}`, cause),
  }).pipe(Effect.uninterruptible);
}

function ignoreCaptureFs<A>(operation: () => Promise<A>): Effect.Effect<A | undefined> {
  return Effect.tryPromise({
    try: operation,
    catch: () => undefined,
  }).pipe(
    Effect.catch(() => Effect.succeed(undefined)),
    Effect.uninterruptible
  );
}

function inspectPlatformSupport(
  dependencies: WindowCaptureProviderDependencies
): WindowCaptureFailure | undefined {
  if (dependencies.platform !== "darwin") {
    return new WindowCaptureFailure({
      operation: "acquire",
      reason: "unsupported-platform",
      message: "The ScreenCaptureKit provider requires macOS 14 or newer.",
      details: { platform: dependencies.platform },
    });
  }

  let release: string;
  try {
    release = dependencies.darwinKernelRelease();
  } catch (cause) {
    return new WindowCaptureFailure({
      operation: "acquire",
      reason: "unsupported-platform",
      message:
        "The provider could not determine whether this Darwin kernel supports ScreenCaptureKit.",
      cause,
    });
  }
  const darwinMajor = Number.parseInt(release.split(".")[0] ?? "", 10);
  if (!Number.isSafeInteger(darwinMajor) || darwinMajor < MINIMUM_SCREEN_CAPTURE_KIT_DARWIN_MAJOR) {
    return new WindowCaptureFailure({
      operation: "acquire",
      reason: "unsupported-platform",
      message: "The ScreenCaptureKit provider requires macOS 14 or newer.",
      details: { platform: dependencies.platform, darwinKernelRelease: release },
    });
  }
  return undefined;
}

function invalidCaptureRequest(message: string): WindowCaptureFailure {
  return new WindowCaptureFailure({
    operation: "capture",
    reason: "invalid-request",
    message,
  });
}

function providerReleased(): WindowCaptureFailure {
  return new WindowCaptureFailure({
    operation: "capture",
    reason: "provider-released",
    message: "The window-capture provider has already been released.",
  });
}

function captureFailure(message: string, cause?: unknown): WindowCaptureFailure {
  return new WindowCaptureFailure({
    operation: "capture",
    reason: "capture-failed",
    message,
    ...(cause === undefined ? {} : { cause }),
  });
}

function isWindowCaptureFailure(cause: unknown): cause is WindowCaptureFailure {
  return (
    typeof cause === "object" &&
    cause !== null &&
    "_tag" in cause &&
    cause._tag === "WindowCaptureFailure"
  );
}

function safeTimestamp(date: Date): string {
  return date.toISOString().replace(/[:.]/g, "-");
}

function failureMessage(cause: unknown): string {
  return cause instanceof Error ? cause.message : String(cause);
}
