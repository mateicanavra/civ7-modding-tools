import { createHash } from "node:crypto";
import type { Stats } from "node:fs";
import { open } from "node:fs/promises";
import { isAbsolute, relative, resolve } from "node:path";

import type { RunInGameFileContentEvidence, RunInGameFileIdentity } from "@civ7/studio-server";

export type RunInGameRequiredContentMarker = Readonly<{
  id: string;
  marker: string;
}>;

const AUTHORED_RIVER_MATERIALIZATION_CONTENT_MARKERS: readonly RunInGameRequiredContentMarker[] = [
  {
    id: "authored-river-materialization-trace",
    marker: "map.rivers.authoredTerrainMaterialization",
  },
  {
    id: "authored-river-materialization-checkpoint",
    marker: "POST-AUTHORED-RIVERS",
  },
] as const;

export async function fileIdentity(args: {
  repoRoot: string;
  path: string;
  exposeAs?: "relative-to-repo" | "absolute";
}): Promise<RunInGameFileIdentity> {
  const absolutePath = isAbsolute(args.path) ? args.path : resolve(args.repoRoot, args.path);
  const { bytes, metadata } = await readStableFile(absolutePath);
  return {
    path: args.exposeAs === "absolute" ? absolutePath : relative(args.repoRoot, absolutePath),
    sha256: createHash("sha256").update(bytes).digest("hex"),
    sizeBytes: bytes.byteLength,
    mtimeMs: metadata.mtimeMs,
    mtimeIso: metadata.mtime.toISOString(),
  };
}

export async function fileContentMarkerEvidence(args: {
  repoRoot: string;
  path: string;
  markers: ReadonlyArray<RunInGameRequiredContentMarker>;
  exposeAs?: "relative-to-repo" | "absolute";
}): Promise<RunInGameFileContentEvidence> {
  const absolutePath = isAbsolute(args.path) ? args.path : resolve(args.repoRoot, args.path);
  const { bytes } = await readStableFile(absolutePath);
  const text = bytes.toString("utf8");
  return {
    path: args.exposeAs === "absolute" ? absolutePath : relative(args.repoRoot, absolutePath),
    markers: args.markers.map((marker) => ({
      id: marker.id,
      marker: marker.marker,
      present: text.includes(marker.marker),
    })),
  };
}

export function runInGameRequiredMaterializationMarkers(args: {
  requestId: string;
  canonicalConfigDigest: string;
  launchEnvelopeDigest: string;
}): ReadonlyArray<RunInGameRequiredContentMarker> {
  return [
    {
      id: "run-request-id",
      marker: args.requestId,
    },
    {
      id: "run-canonical-config-digest",
      marker: args.canonicalConfigDigest,
    },
    {
      id: "run-launch-envelope-digest",
      marker: args.launchEnvelopeDigest,
    },
    ...AUTHORED_RIVER_MATERIALIZATION_CONTENT_MARKERS,
  ];
}

/**
 * The deployed map bundle must embed the run request id because the in-game
 * `[mapgen-evidence]` log line echoes that id and the evidence waiter matches it.
 * Checking the bundle before Civ7 startup turns an otherwise long evidence timeout
 * into an immediate artifact-generation/deployment diagnostic.
 */
export function mapScriptEmbedsRequestId(bundleText: string, requestId: string): boolean {
  return bundleText.includes(requestId);
}

const FILE_EVIDENCE_READ_ATTEMPTS = 3;

async function readStableFile(path: string): Promise<{
  bytes: Buffer;
  metadata: Stats;
}> {
  for (let attempt = 0; attempt < FILE_EVIDENCE_READ_ATTEMPTS; attempt += 1) {
    const handle = await open(path, "r");
    try {
      const before = await handle.stat({ bigint: false });
      const bytes = await handle.readFile();
      const after = await handle.stat({ bigint: false });
      if (sameFileSnapshot(before, after) && bytes.byteLength === after.size) {
        return { bytes, metadata: after };
      }
    } finally {
      await handle.close();
    }
  }
  throw new Error("File changed while Studio was capturing evidence.");
}

function sameFileSnapshot(before: Stats, after: Stats): boolean {
  return (
    before.dev === after.dev &&
    before.ino === after.ino &&
    before.size === after.size &&
    before.mtimeMs === after.mtimeMs &&
    before.ctimeMs === after.ctimeMs
  );
}
