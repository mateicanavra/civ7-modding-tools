import { open, readFile, stat } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";

import { Civ7DirectControlError } from "../direct-control-error";

export const DEFAULT_CIV7_SCRIPTING_LOG = join(
  homedir(),
  "Library",
  "Application Support",
  "Civilization VII",
  "Logs",
  "Scripting.log",
);

export type FileSnapshot = Readonly<{
  exists: boolean;
  size: number;
  mtimeMs: number;
  prefix: string;
  prefixBytes: number;
}>;

export type FreshLogMarkerProof = Readonly<{
  logPath: string;
  observedAt: string;
  startOffset: number;
  matched: ReadonlyArray<string>;
}>;

export async function snapshotFile(path: string): Promise<FileSnapshot> {
  const info = await stat(path).catch((err: unknown) => {
    if (isNodeNotFound(err)) return null;
    throw err;
  });
  return info
    ? {
        exists: true,
        size: info.size,
        mtimeMs: info.mtimeMs,
        ...(await filePrefixSnapshot(path, info.size)),
      }
    : { exists: false, size: 0, mtimeMs: 0, prefix: "", prefixBytes: 0 };
}

async function filePrefixSnapshot(path: string, size: number): Promise<Pick<FileSnapshot, "prefix" | "prefixBytes">> {
  const prefixBytes = Math.min(size, 4096);
  if (prefixBytes === 0) return { prefix: "", prefixBytes: 0 };
  const handle = await open(path, "r");
  try {
    const buffer = Buffer.alloc(prefixBytes);
    const { bytesRead } = await handle.read(buffer, 0, prefixBytes, 0);
    return {
      prefix: buffer.subarray(0, bytesRead).toString("utf8"),
      prefixBytes: bytesRead,
    };
  } finally {
    await handle.close();
  }
}

function logTextFromSnapshot(args: {
  fullText: string;
  snapshot: FileSnapshot;
  current: FileSnapshot;
}): { text: string; startOffset: number; rewritten: boolean } {
  const { fullText, snapshot, current } = args;
  if (!snapshot.exists) return { text: fullText, startOffset: 0, rewritten: true };

  const rewritten = snapshot.prefixBytes > 0 && !fullText.startsWith(snapshot.prefix);
  if (rewritten) return { text: fullText, startOffset: 0, rewritten };
  if (current.size > snapshot.size) {
    return { text: fullText.slice(snapshot.size), startOffset: snapshot.size, rewritten: false };
  }
  if (current.mtimeMs > snapshot.mtimeMs) return { text: fullText, startOffset: 0, rewritten: true };
  return { text: "", startOffset: snapshot.size, rewritten: false };
}

export async function waitForFreshLogMarkers(options: {
  logPath: string;
  snapshot: FileSnapshot;
  markers: ReadonlyArray<string>;
  timeoutMs?: number;
  pollIntervalMs?: number;
  rejectPattern?: RegExp;
}): Promise<FreshLogMarkerProof> {
  const timeoutMs = options.timeoutMs ?? 90_000;
  const pollIntervalMs = options.pollIntervalMs ?? 1_000;
  const startedAt = Date.now();
  const snapshotOffset = options.snapshot.size;
  let lastStartOffset = snapshotOffset;
  let lastError: string | undefined;

  while (Date.now() - startedAt <= timeoutMs) {
    const current = await snapshotFile(options.logPath);
    if (current.exists && (current.size > snapshotOffset || current.mtimeMs > options.snapshot.mtimeMs)) {
      const fullText = await readFile(options.logPath, "utf8");
      const freshLog = logTextFromSnapshot({ fullText, snapshot: options.snapshot, current });
      lastStartOffset = freshLog.startOffset;
      const proof = matchOrderedMarkers(freshLog.text, options.markers);
      const rejected = options.rejectPattern?.exec(freshLog.text);
      if (rejected) lastError = `Log contains ${rejected[0]}`;
      if (proof.ok && !rejected) {
        return {
          logPath: options.logPath,
          observedAt: new Date().toISOString(),
          startOffset: freshLog.startOffset,
          matched: proof.matched,
        };
      }
    }
    await sleep(pollIntervalMs);
  }

  throw new Civ7DirectControlError(
    "log-timeout",
    lastError ?? `Timed out waiting for fresh log markers in ${options.logPath}`,
    { details: { markers: options.markers, startOffset: lastStartOffset, snapshotOffset } },
  );
}

function isNodeNotFound(err: unknown): boolean {
  return (
    err !== null &&
    typeof err === "object" &&
    "code" in err &&
    (err as { code?: unknown }).code === "ENOENT"
  );
}

function matchOrderedMarkers(text: string, markers: ReadonlyArray<string>): { ok: boolean; matched: string[] } {
  const matched: string[] = [];
  let cursor = 0;
  for (const marker of markers) {
    const next = text.indexOf(marker, cursor);
    if (next < 0) return { ok: false, matched };
    matched.push(marker);
    cursor = next + marker.length;
  }
  return { ok: true, matched };
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
