import { mkdirSync, realpathSync } from "node:fs";
import { basename, dirname, join, resolve } from "node:path";
import { writeFileAtomically } from "./internal/atomic-file.js";

/** One path-backed JSON evidence publication request. */
export type PublishJsonEvidenceOptions = Readonly<{
  /** Absolute path, or a path resolved from the caller's current working directory. */
  path: string;
  /** Evidence serialized with the package's stable two-space JSON representation. */
  evidence: unknown;
}>;

/** Confirmation of one completed JSON evidence publication. */
export type PublishJsonEvidenceResult = Readonly<{
  /** Canonical absolute path of the published evidence file. */
  path: string;
  /** UTF-8 byte length of the serialized evidence. */
  byteLength: number;
}>;

function serializeJsonEvidence(evidence: unknown): string {
  const serialized = JSON.stringify(evidence, null, 2);
  if (serialized === undefined) {
    throw new TypeError("JSON evidence must serialize to a JSON value.");
  }
  return serialized;
}

function admitJsonEvidencePath(path: string): string {
  const requestedPath = resolve(path);
  const requestedDirectory = dirname(requestedPath);
  mkdirSync(requestedDirectory, { recursive: true });
  return join(realpathSync(requestedDirectory), basename(requestedPath));
}

/**
 * Publishes one JSON evidence document through an adjacent temporary file and atomic rename.
 * Missing parent directories are created, existing files are replaced atomically, and a failed
 * publication removes its temporary file while preserving the original error.
 */
export function publishJsonEvidence(
  options: PublishJsonEvidenceOptions
): PublishJsonEvidenceResult {
  const serialized = serializeJsonEvidence(options.evidence);
  const path = admitJsonEvidencePath(options.path);
  writeFileAtomically(path, serialized);
  return { path, byteLength: Buffer.byteLength(serialized) };
}
