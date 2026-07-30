import { createHash } from "node:crypto";
import { isAbsolute, relative, resolve, sep } from "node:path";

/** Process-relative default root for private Run in Game request workspaces. */
export const DEFAULT_RUN_IN_GAME_WORKSPACE_ROOT = resolve(".mapgen-studio/run-in-game");
/** Storage-key grammar preventing request identities from becoming path traversal input. */
export const SAFE_RUN_REQUEST_ID = /^[A-Za-z0-9._-]{1,191}$/;
/** Derived artifact identity grammar used by manifests and generated mod evidence. */
export const SAFE_RUN_ARTIFACT_ID = /^run-[a-f0-9]{20}$/;
/** Fixed manifest location relative to each request workspace. */
export const RUN_GENERATION_MANIFEST_FILE = "generation-manifest.json";
/** Stable generated mod identity installed for Studio-authored runs. */
export const STUDIO_RUN_MOD_ID = "mod-swooper-studio-run";
/** Stable database row identity selecting the generated Studio map entry. */
export const STUDIO_RUN_MAP_ROW_ID = "MAP_STUDIO_RUN";
/** Map script path embedded in the generated mod and launch configuration. */
export const STUDIO_RUN_MAP_SCRIPT_PATH = "maps/studio-run.js";

export type RunArtifactId = `run-${string}`;

export type StudioRunWorkspacePaths = Readonly<{
  workspaceRoot: string;
  requestRoot: string;
  generationManifestPath: string;
  generatedModRoot: string;
}>;

/**
 * Owns the private request workspace path model for Run in Game artifacts.
 *
 * Public status reports progress. Durable runtime evidence is rooted by
 * request id under this jailed workspace topology.
 */
export function studioRunWorkspacePaths(
  requestId: string,
  options: Readonly<{ workspaceRoot?: string }> = {}
): StudioRunWorkspacePaths {
  assertSafeRunRequestId(requestId);
  const workspaceRoot = resolveRunWorkspaceRoot(options.workspaceRoot);
  return {
    workspaceRoot,
    requestRoot: jailedRunWorkspacePath(workspaceRoot, requestId),
    generationManifestPath: jailedRunWorkspacePath(
      workspaceRoot,
      requestId,
      RUN_GENERATION_MANIFEST_FILE
    ),
    generatedModRoot: jailedRunWorkspacePath(workspaceRoot, requestId, "generated-mod"),
  };
}

/** Derives a filesystem-safe artifact identity deterministically from the request id. */
export function createRunArtifactId(requestId: string): RunArtifactId {
  assertSafeRunRequestId(requestId);
  return `run-${createHash("sha256").update(requestId).digest("hex").slice(0, 20)}`;
}

/** Returns the portable workspace path recorded in generation evidence. */
export function logicalRunRequestRoot(requestId: string): string {
  assertSafeRunRequestId(requestId);
  return `.mapgen-studio/run-in-game/${requestId}`;
}

/** Resolves an optional override to the absolute root used for all jailed paths. */
export function resolveRunWorkspaceRoot(root: string | undefined): string {
  return resolve(root ?? DEFAULT_RUN_IN_GAME_WORKSPACE_ROOT);
}

/** Rejects request identities that cannot safely name a workspace directory. */
export function assertSafeRunRequestId(requestId: string): void {
  assertSafeRunStorageId(requestId, "Run in Game request id");
}

/** Validates an arbitrary storage key against the shared request-id grammar. */
export function assertSafeRunStorageId(value: string, label: string): void {
  if (!SAFE_RUN_REQUEST_ID.test(value) || value === "." || value === "..") {
    throw new Error(`${label} is not a safe storage key.`);
  }
}

/** Resolves a descendant path and rejects empty-root or traversal escapes. */
export function jailedRunWorkspacePath(root: string, ...segments: string[]): string {
  const path = resolve(root, ...segments);
  const rootRelative = relative(root, path);
  if (
    rootRelative === "" ||
    rootRelative === ".." ||
    rootRelative.startsWith(`..${sep}`) ||
    isAbsolute(rootRelative)
  ) {
    throw new Error("Run in Game workspace path escaped workspace root.");
  }
  return path;
}
