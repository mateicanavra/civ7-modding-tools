import { createHash, randomUUID } from "node:crypto";
import type { Stats } from "node:fs";
import { mkdir, readdir, rename, rm, stat, writeFile } from "node:fs/promises";
import { basename, join } from "node:path";

import { WindowCaptureFailure } from "@civ7/window-capture";
import { Effect } from "effect";

import { ProcessSupervisor } from "./process-supervisor.js";
import { HELPER_PROBE_PROTOCOL, parseHelperProbeEnvelope } from "./protocol.js";

export const WINDOW_CAPTURE_HELPER_SOURCE = `import CoreGraphics
import CoreImage
import CoreMedia
import Foundation
import ImageIO
import ScreenCaptureKit
import UniformTypeIdentifiers

let screenCapturePermissionErrorCode = -3801
let minimumSelectableWindowDimension: CGFloat = 200
let streamFrameTimescale: Int32 = 10
let streamQueueDepth = 5
let streamWarmupSeconds = 0.8
let streamDeadlineSeconds = 3.0
let streamPollNanoseconds: UInt64 = 200_000_000
let minimumCompleteFrameCount = 3

func emit(_ object: [String: Any], code: Int32) -> Never {
  let data = try! JSONSerialization.data(withJSONObject: object)
  FileHandle.standardOutput.write(data)
  FileHandle.standardOutput.write(Data([0x0a]))
  exit(code)
}

func fail(_ kind: String, _ message: String) -> Never {
  emit(["ok": false, "error": kind, "message": message], code: 1)
}

let permissionMessage = "Screen Recording permission is not granted for the application running this command. Open System Settings -> Privacy & Security -> Screen & System Audio Recording, enable the host application, then retry."

var mode: String? = nil
var textNeedle: String? = nil
var windowId: UInt32? = nil
var outPath: String? = nil
var arguments = CommandLine.arguments.dropFirst().makeIterator()
while let argument = arguments.next() {
  switch argument {
  case "capture":
    mode = argument
  case "probe":
    mode = argument
  case "--text":
    guard let value = arguments.next(), !value.isEmpty else { fail("usage", "--text requires a non-empty value") }
    textNeedle = value.lowercased()
  case "--window-id":
    guard let value = arguments.next(), let parsed = UInt32(value) else { fail("usage", "--window-id requires an integer") }
    windowId = parsed
  case "--out":
    guard let value = arguments.next() else { fail("usage", "--out requires a path") }
    outPath = value
  default:
    fail("usage", "unknown argument: " + argument)
  }
}
if mode == "probe" {
  guard textNeedle == nil, windowId == nil, outPath == nil else {
    fail("usage", "probe does not accept capture arguments")
  }
  emit(["ok": true, "protocol": "${HELPER_PROBE_PROTOCOL}"], code: 0)
}
guard mode == "capture", let selectedOutPath = outPath else {
  fail("usage", "usage: window-capture-helper capture (--text substring | --window-id id) --out path.png")
}
guard (textNeedle == nil) != (windowId == nil) else {
  fail("usage", "capture requires exactly one of --text or --window-id")
}

if !CGPreflightScreenCaptureAccess() {
  CGRequestScreenCaptureAccess()
  fail("permission-required", permissionMessage)
}

@available(macOS 14.0, *)
func windowRow(_ window: SCWindow) -> [String: Any] {
  return [
    "windowId": Int(window.windowID),
    "applicationName": window.owningApplication?.applicationName ?? "",
    "bundleIdentifier": window.owningApplication?.bundleIdentifier ?? "",
    "title": window.title ?? "",
    "width": Int(window.frame.width),
    "height": Int(window.frame.height),
    "onScreen": window.isOnScreen,
  ]
}

@available(macOS 14.0, *)
func matches(_ window: SCWindow, needle: String) -> Bool {
  let haystack = [
    window.owningApplication?.applicationName ?? "",
    window.owningApplication?.bundleIdentifier ?? "",
    window.title ?? "",
  ].joined(separator: " ").lowercased()
  return haystack.contains(needle)
}

@available(macOS 14.0, *)
func shareableWindows() async -> [SCWindow] {
  do {
    let content = try await SCShareableContent.excludingDesktopWindows(false, onScreenWindowsOnly: false)
    return content.windows
  } catch {
    let nsError = error as NSError
    if nsError.code == screenCapturePermissionErrorCode { fail("permission-required", permissionMessage) }
    fail("capture-failed", "could not enumerate windows: " + nsError.localizedDescription)
  }
}

@available(macOS 14.0, *)
func pickWindow(from windows: [SCWindow], textNeedle: String?, windowId: UInt32?) -> SCWindow? {
  let candidates = windows.filter { window in
    if let windowId = windowId { return window.windowID == windowId }
    guard let textNeedle = textNeedle else { return false }
    return matches(window, needle: textNeedle) && window.frame.width >= minimumSelectableWindowDimension && window.frame.height >= minimumSelectableWindowDimension
  }
  return candidates.max(by: { left, right in
    left.frame.width * left.frame.height < right.frame.width * right.frame.height
  })
}

@available(macOS 14.0, *)
final class FrameSink: NSObject, SCStreamOutput {
  let ciContext = CIContext()
  var latest: CGImage? = nil
  var frameCount = 0
  func stream(_ stream: SCStream, didOutputSampleBuffer sampleBuffer: CMSampleBuffer, of type: SCStreamOutputType) {
    guard type == .screen, let pixelBuffer = sampleBuffer.imageBuffer else { return }
    guard let attachments = CMSampleBufferGetSampleAttachmentsArray(sampleBuffer, createIfNecessary: false) as? [[SCStreamFrameInfo: Any]],
          let statusRaw = attachments.first?[.status] as? Int,
          statusRaw == SCFrameStatus.complete.rawValue else { return }
    let ci = CIImage(cvPixelBuffer: pixelBuffer)
    guard let cg = ciContext.createCGImage(ci, from: ci.extent) else { return }
    latest = cg
    frameCount += 1
  }
}

@available(macOS 14.0, *)
func captureViaStream(filter: SCContentFilter, configuration: SCStreamConfiguration) async -> CGImage? {
  configuration.minimumFrameInterval = CMTime(value: 1, timescale: streamFrameTimescale)
  configuration.queueDepth = streamQueueDepth
  let sinkQueue = DispatchQueue(label: "window-capture-frame-sink")
  let sink = FrameSink()
  let stream = SCStream(filter: filter, configuration: configuration, delegate: nil)
  do {
    try stream.addStreamOutput(sink, type: .screen, sampleHandlerQueue: sinkQueue)
    try await stream.startCapture()
  } catch {
    let nsError = error as NSError
    if nsError.code == screenCapturePermissionErrorCode { fail("permission-required", permissionMessage) }
    return nil
  }
  var image: CGImage? = nil
  let warmedUpAt = Date().addingTimeInterval(streamWarmupSeconds)
  let deadline = Date().addingTimeInterval(streamDeadlineSeconds)
  while Date() < deadline {
    try? await Task.sleep(nanoseconds: streamPollNanoseconds)
    let snapshot: (CGImage?, Int) = await withCheckedContinuation { continuation in
      sinkQueue.async { continuation.resume(returning: (sink.latest, sink.frameCount)) }
    }
    if Date() >= warmedUpAt, snapshot.1 >= minimumCompleteFrameCount, let latest = snapshot.0 {
      image = latest
      break
    }
  }
  try? await stream.stopCapture()
  return image
}

@available(macOS 14.0, *)
func run(textNeedle: String?, windowId: UInt32?, outPath: String) async {
  let windows = await shareableWindows()
  guard let window = pickWindow(from: windows, textNeedle: textNeedle, windowId: windowId) else {
    fail("window-not-found", "no window matched the requested selection")
  }

  let filter = SCContentFilter(desktopIndependentWindow: window)
  let configuration = SCStreamConfiguration()
  let scale = CGFloat(filter.pointPixelScale)
  configuration.width = Int(filter.contentRect.width * scale)
  configuration.height = Int(filter.contentRect.height * scale)
  configuration.showsCursor = false
  configuration.ignoreShadowsSingleWindow = true
  configuration.captureResolution = .best

  var image: CGImage? = nil
  var frameSource = "screenshot"
  if !window.isOnScreen {
    guard let streamed = await captureViaStream(filter: filter, configuration: configuration) else {
      fail("capture-failed", "the selected window is off-screen and no fresh frame could be forced through its capture stream")
    }
    image = streamed
    frameSource = "stream"
  }
  if image == nil {
    do {
      image = try await SCScreenshotManager.captureImage(contentFilter: filter, configuration: configuration)
    } catch {
      let nsError = error as NSError
      if nsError.code == screenCapturePermissionErrorCode { fail("permission-required", permissionMessage) }
      fail("capture-failed", "ScreenCaptureKit capture failed: " + nsError.localizedDescription)
    }
  }
  guard let image = image else { fail("capture-failed", "no frame was produced") }

  let url = URL(fileURLWithPath: outPath) as CFURL
  guard let destination = CGImageDestinationCreateWithURL(url, UTType.png.identifier as CFString, 1, nil) else {
    fail("capture-failed", "could not open the temporary PNG destination")
  }
  CGImageDestinationAddImage(destination, image, nil)
  guard CGImageDestinationFinalize(destination) else {
    fail("capture-failed", "could not finalize the temporary PNG")
  }
  emit([
    "ok": true,
    "path": outPath,
    "pixelWidth": image.width,
    "pixelHeight": image.height,
    "frameSource": frameSource,
    "window": windowRow(window),
  ], code: 0)
}

if #available(macOS 14.0, *) {
  _ = CGMainDisplayID()
  Task.detached {
    await run(textNeedle: textNeedle, windowId: windowId, outPath: selectedOutPath)
    fail("capture-failed", "capture task ended without emitting a result")
  }
  RunLoop.main.run()
} else {
  fail("unsupported-platform", "window-scoped capture requires macOS 14 or newer")
}
`;

const HELPER_PREFIX = "window-capture-screencapturekit-";
const STABLE_HELPER_REVISION = /^window-capture-screencapturekit-[0-9a-f]{16}$/;

export type HelperFileSystem = Readonly<{
  mkdir: (path: string, options: Readonly<{ recursive: true }>) => Promise<string | undefined>;
  readdir: (path: string) => Promise<string[]>;
  rename: (oldPath: string, newPath: string) => Promise<void>;
  rm: (path: string, options: Readonly<{ force: true }>) => Promise<void>;
  stat: (path: string) => Promise<Stats>;
  writeFile: (path: string, contents: string, encoding: "utf8") => Promise<void>;
  uniqueId: () => string;
}>;

export const defaultHelperFileSystem: HelperFileSystem = {
  mkdir,
  readdir,
  rename,
  rm,
  stat,
  writeFile,
  uniqueId: randomUUID,
};

/** Ensures the content-addressed native helper is compiled and prunes stale revisions. */
export function prepareScreenCaptureKitHelper(
  cacheRoot: string,
  supervisor: ProcessSupervisor,
  fileSystem: HelperFileSystem = defaultHelperFileSystem
): Effect.Effect<string, WindowCaptureFailure> {
  return Effect.gen(function* () {
    if (supervisor.isReleased()) return yield* Effect.fail(providerReleased("acquire"));

    const sourceHash = createHash("sha256")
      .update(WINDOW_CAPTURE_HELPER_SOURCE)
      .digest("hex")
      .slice(0, 16);
    const binaryPath = join(cacheRoot, `${HELPER_PREFIX}${sourceHash}`);
    const cached = yield* fsEffect(
      () =>
        fileSystem.stat(binaryPath).then(
          (value) => value.isFile(),
          () => false
        ),
      "Could not inspect the ScreenCaptureKit helper cache."
    );

    if (!cached) {
      yield* fsEffect(
        () => fileSystem.mkdir(cacheRoot, { recursive: true }).then(() => undefined),
        "Could not create the ScreenCaptureKit helper cache."
      );
      const revision = fileSystem.uniqueId();
      const sourcePath = join(cacheRoot, `${HELPER_PREFIX}${sourceHash}-${revision}.swift`);
      const temporaryBinaryPath = join(cacheRoot, `${HELPER_PREFIX}${sourceHash}-${revision}.tmp`);
      const cleanup = Effect.forEach(
        [sourcePath, temporaryBinaryPath],
        (path) => ignoreHelperFs(() => fileSystem.rm(path, { force: true })),
        { discard: true }
      );
      const compile = Effect.gen(function* () {
        yield* fsEffect(
          () => fileSystem.writeFile(sourcePath, WINDOW_CAPTURE_HELPER_SOURCE, "utf8"),
          "Could not write the ScreenCaptureKit helper source."
        );
        const result = yield* supervisor
          .run({
            command: "/usr/bin/xcrun",
            args: ["swiftc", "-O", sourcePath, "-o", temporaryBinaryPath],
          })
          .pipe(
            Effect.mapError((failure) =>
              failure.reason === "provider-released"
                ? providerReleased("acquire")
                : helperUnavailable(`Could not start xcrun: ${failure.message}`, failure)
            )
          );
        if (result.spawnError !== undefined || result.exitCode !== 0) {
          const detail = result.stderr.trim() || result.spawnError?.message || "unknown error";
          return yield* Effect.fail(
            helperUnavailable(`Failed to compile the ScreenCaptureKit helper: ${detail}`, result)
          );
        }
        yield* fsEffect(
          () => fileSystem.rename(temporaryBinaryPath, binaryPath),
          "Could not publish the compiled ScreenCaptureKit helper."
        );
      }).pipe(Effect.ensuring(cleanup));
      yield* compile;
    }

    yield* probeScreenCaptureKitHelper(binaryPath, supervisor);
    yield* pruneStaleHelperRevisions(fileSystem, cacheRoot, basename(binaryPath));
    return binaryPath;
  });
}

function probeScreenCaptureKitHelper(
  binaryPath: string,
  supervisor: ProcessSupervisor
): Effect.Effect<void, WindowCaptureFailure> {
  return Effect.gen(function* () {
    const result = yield* supervisor
      .run({ command: binaryPath, args: ["probe"] })
      .pipe(
        Effect.mapError((failure) =>
          failure.reason === "provider-released"
            ? providerReleased("acquire")
            : helperUnavailable(
                `Could not execute the helper readiness probe: ${failure.message}`,
                failure
              )
        )
      );
    if (
      result.spawnError !== undefined ||
      result.exitCode !== 0 ||
      result.signal !== null ||
      result.stderr.trim() !== ""
    ) {
      return yield* Effect.fail(
        helperUnavailable(
          "The ScreenCaptureKit helper readiness probe did not exit cleanly.",
          result
        )
      );
    }
    yield* Effect.try({
      try: () => parseHelperProbeEnvelope(result.stdout),
      catch: (cause) =>
        helperUnavailable(
          `The ScreenCaptureKit helper readiness probe returned invalid output: ${failureMessage(cause)}`,
          { result, cause }
        ),
    });
  }).pipe(Effect.asVoid);
}

function pruneStaleHelperRevisions(
  fileSystem: HelperFileSystem,
  cacheRoot: string,
  keepBasename: string
): Effect.Effect<void> {
  return Effect.gen(function* () {
    const entries = yield* ignoreHelperFs(() => fileSystem.readdir(cacheRoot));
    if (entries === undefined) return;
    yield* Effect.forEach(
      entries.filter((name) => STABLE_HELPER_REVISION.test(name) && name !== keepBasename),
      (name) => ignoreHelperFs(() => fileSystem.rm(join(cacheRoot, name), { force: true })),
      { discard: true }
    );
  });
}

function fsEffect<A>(
  operation: () => Promise<A>,
  message: string
): Effect.Effect<A, WindowCaptureFailure> {
  return Effect.tryPromise({
    try: operation,
    catch: (cause) => helperUnavailable(`${message} ${failureMessage(cause)}`, cause),
  }).pipe(Effect.uninterruptible);
}

function ignoreHelperFs<A>(operation: () => Promise<A>): Effect.Effect<A | undefined> {
  return Effect.tryPromise({
    try: operation,
    catch: () => undefined,
  }).pipe(
    Effect.catchAll(() => Effect.succeed(undefined)),
    Effect.uninterruptible
  );
}

function helperUnavailable(message: string, cause?: unknown): WindowCaptureFailure {
  return new WindowCaptureFailure({
    operation: "acquire",
    reason: "toolchain-unavailable",
    message,
    ...(cause === undefined ? {} : { cause }),
  });
}

function providerReleased(operation: "acquire" | "capture"): WindowCaptureFailure {
  return new WindowCaptureFailure({
    operation,
    reason: "provider-released",
    message: "The window-capture provider has already been released.",
  });
}

function failureMessage(cause: unknown): string {
  return cause instanceof Error ? cause.message : String(cause);
}
