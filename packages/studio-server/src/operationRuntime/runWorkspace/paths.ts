import { createHash } from "node:crypto";
import { relative, resolve } from "node:path";

export const DEFAULT_RUN_IN_GAME_WORKSPACE_ROOT = resolve(".mapgen-studio/run-in-game");
export const SAFE_RUN_REQUEST_ID = /^[A-Za-z0-9._-]{1,191}$/;
export const SAFE_RUN_ARTIFACT_ID = /^run-[a-f0-9]{20}$/;
export const RUN_GENERATION_MANIFEST_FILE = "generation-manifest.json";

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
 * Public status only reports progress. Durable runtime evidence is rooted by
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

export function createRunArtifactId(requestId: string): RunArtifactId {
  assertSafeRunRequestId(requestId);
  return `run-${createHash("sha256").update(requestId).digest("hex").slice(0, 20)}`;
}

export function logicalRunRequestRoot(requestId: string): string {
  assertSafeRunRequestId(requestId);
  return `.mapgen-studio/run-in-game/${requestId}`;
}

export function resolveRunWorkspaceRoot(root: string | undefined): string {
  return resolve(root ?? DEFAULT_RUN_IN_GAME_WORKSPACE_ROOT);
}

export function assertSafeRunRequestId(requestId: string): void {
  assertSafeRunStorageId(requestId, "Run in Game request id");
}

export function assertSafeRunStorageId(value: string, label: string): void {
  if (!SAFE_RUN_REQUEST_ID.test(value) || value === "." || value === "..") {
    throw new Error(`${label} is not a safe storage key.`);
  }
}

export function jailedRunWorkspacePath(root: string, ...segments: string[]): string {
  const path = resolve(root, ...segments);
  const rootRelative = relative(root, path);
  if (rootRelative.startsWith("..") || rootRelative === "" || rootRelative.startsWith("/")) {
    throw new Error("Run in Game workspace path escaped workspace root.");
  }
  return path;
}
