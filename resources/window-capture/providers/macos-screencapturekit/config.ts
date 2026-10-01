import { resolve } from "node:path";

import { WindowCaptureFailure } from "@civ7/window-capture";

/** Caller-supplied destination managed by this provider acquisition. */
type ManagedWindowCaptureDestination = Readonly<{
  root: string;
  filePrefix: string;
  retentionMs: number;
}>;

/** Concrete configuration accepted by the macOS ScreenCaptureKit provider. */
export type MacosScreenCaptureKitWindowCaptureOptions = Readonly<{
  managedDestination: ManagedWindowCaptureDestination;
  helperCacheRoot?: string;
}>;

/** Validated immutable configuration for one provider acquisition. */
export type MacosScreenCaptureKitWindowCaptureConfig = Readonly<{
  managedDestination: Readonly<{
    root: string;
    filePrefix: string;
    retentionMs: number;
  }>;
  helperCacheRoot: string;
}>;

/** Resolves paths and rejects unsafe retention or filename policy before acquisition work. */
export function resolveMacosScreenCaptureKitWindowCaptureConfig(
  options: MacosScreenCaptureKitWindowCaptureOptions,
  defaultHelperCacheRoot: string
): MacosScreenCaptureKitWindowCaptureConfig {
  const root = requiredPath(options.managedDestination.root, "managedDestination.root");
  const filePrefix = options.managedDestination.filePrefix.trim();
  const retentionMs = options.managedDestination.retentionMs;

  if (
    filePrefix.length === 0 ||
    filePrefix === "." ||
    filePrefix === ".." ||
    filePrefix.includes("/") ||
    filePrefix.includes("\\") ||
    filePrefix.includes("\0")
  ) {
    throw invalidConfiguration(
      "managedDestination.filePrefix must be a non-empty filename prefix without path separators."
    );
  }
  if (!Number.isSafeInteger(retentionMs) || retentionMs < 0) {
    throw invalidConfiguration(
      "managedDestination.retentionMs must be a non-negative safe integer."
    );
  }

  return {
    managedDestination: {
      root,
      filePrefix,
      retentionMs,
    },
    helperCacheRoot: requiredPath(
      options.helperCacheRoot ?? defaultHelperCacheRoot,
      "helperCacheRoot"
    ),
  };
}

function requiredPath(value: string, name: string): string {
  if (value.trim().length === 0 || value.includes("\0")) {
    throw invalidConfiguration(`${name} must be a non-empty filesystem path.`);
  }
  return resolve(value);
}

function invalidConfiguration(message: string): WindowCaptureFailure {
  return new WindowCaptureFailure({
    operation: "acquire",
    reason: "invalid-configuration",
    message,
  });
}
