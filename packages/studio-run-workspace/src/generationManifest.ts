import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import type {
  LaunchEnvelope,
  LaunchEnvelopeDigest,
  LaunchSourceDigest,
} from "@civ7/studio-contract";
import {
  freezeSnapshot,
  isPortableJsonValue,
  launchEnvelope,
  launchSourceDigest,
  snapshotConfigSource,
  snapshotLaunchEnvelope,
} from "@civ7/studio-contract";
import { type Static, Type } from "typebox";
import { Value } from "typebox/value";
import { type RunCorrelation, runCorrelationForManifest } from "./correlation.js";
import {
  createRunArtifactId,
  logicalRunRequestRoot,
  RUN_GENERATION_MANIFEST_FILE,
  type RunArtifactId,
  SAFE_RUN_ARTIFACT_ID,
  SAFE_RUN_REQUEST_ID,
  studioRunWorkspacePaths,
} from "./paths.js";

const SHA256_HEX = /^[a-f0-9]{64}$/;

export const studioRunGenerationManifestPayloadSchema = Type.Object(
  {
    schemaVersion: Type.Literal(1),
    requestId: Type.String({ pattern: SAFE_RUN_REQUEST_ID.source }),
    runArtifactId: Type.String({ pattern: SAFE_RUN_ARTIFACT_ID.source }),
    workspace: Type.Object(
      {
        requestRoot: Type.String(),
        generationManifestPath: Type.Literal(RUN_GENERATION_MANIFEST_FILE),
        generatedModRoot: Type.Literal("generated-mod"),
      },
      { additionalProperties: false }
    ),
    launchEnvelope,
    launchSourceDigest,
    launchEnvelopeDigest: Type.String({ pattern: SHA256_HEX.source }),
  },
  { additionalProperties: false }
);

export const studioRunGenerationManifestSchema = Type.Object(
  {
    payload: studioRunGenerationManifestPayloadSchema,
    generationManifestDigest: Type.String({ pattern: SHA256_HEX.source }),
  },
  { additionalProperties: false }
);

export type StudioRunGenerationManifestInput = Readonly<{
  requestId: string;
  launchEnvelope: LaunchEnvelope;
}>;

export type StudioRunGenerationManifestPayload = Readonly<{
  schemaVersion: 1;
  requestId: string;
  readonly runArtifactId: RunArtifactId;
  readonly workspace: Readonly<{
    requestRoot: string;
    generationManifestPath: typeof RUN_GENERATION_MANIFEST_FILE;
    generatedModRoot: "generated-mod";
  }>;
  readonly launchEnvelope: LaunchEnvelope;
  readonly launchSourceDigest: LaunchSourceDigest;
  readonly launchEnvelopeDigest: LaunchEnvelopeDigest;
}>;

export type StudioRunGenerationManifest = Readonly<{
  readonly payload: StudioRunGenerationManifestPayload;
  readonly generationManifestDigest: string;
}>;

export type StudioRunGenerationManifestReference = Readonly<{
  path: string;
  generationManifestDigest: string;
  runArtifactId: RunArtifactId;
  correlation: RunCorrelation;
}>;

/**
 * Builds the unsigned generation payload whose canonical JSON is hashed.
 *
 * The persisted manifest wraps this payload with `/generationManifestDigest`;
 * that digest field is intentionally outside the hash input.
 */
export function buildStudioRunGenerationManifestPayload(
  input: StudioRunGenerationManifestInput
): StudioRunGenerationManifestPayload {
  const snapshot = snapshotManifestLaunchEnvelope(input.launchEnvelope);
  const launchEnvelopeDigest = valueDigest(snapshot);
  return freezeSnapshot({
    schemaVersion: 1,
    requestId: input.requestId,
    runArtifactId: createRunArtifactId(input.requestId),
    workspace: {
      requestRoot: logicalRunRequestRoot(input.requestId),
      generationManifestPath: RUN_GENERATION_MANIFEST_FILE,
      generatedModRoot: "generated-mod",
    },
    launchEnvelope: snapshot,
    launchSourceDigest: {
      canonicalConfigDigest: valueDigest(snapshot.source.canonicalConfig),
    },
    launchEnvelopeDigest,
  });
}

export function buildStudioRunGenerationManifest(
  payload: StudioRunGenerationManifestPayload
): StudioRunGenerationManifest {
  return freezeSnapshot({
    payload,
    generationManifestDigest: generationManifestDigest(payload),
  });
}

export function generationManifestDigest(payload: StudioRunGenerationManifestPayload): string {
  return sha256Hex(canonicalSortedJson(payload));
}

export function canonicalSortedJson(value: unknown): string {
  return JSON.stringify(canonicalize(value)) ?? "undefined";
}

export function parseStudioRunGenerationManifest(value: unknown): StudioRunGenerationManifest {
  if (!isPortableJsonValue(value) || !Value.Check(studioRunGenerationManifestSchema, value)) {
    throw new Error("Invalid StudioRunGenerationManifest.");
  }
  const parsed = Value.Parse(studioRunGenerationManifestSchema, value);
  if (parsed.payload.runArtifactId !== createRunArtifactId(parsed.payload.requestId)) {
    throw new Error("StudioRunGenerationManifest runArtifactId does not match requestId.");
  }
  if (
    parsed.payload.workspace.requestRoot !== logicalRunRequestRoot(parsed.payload.requestId)
  ) {
    throw new Error("StudioRunGenerationManifest requestRoot does not match requestId.");
  }
  const snapshot = snapshotManifestLaunchEnvelope(parsed.payload.launchEnvelope);
  if (
    parsed.payload.launchSourceDigest.canonicalConfigDigest !==
    valueDigest(snapshot.source.canonicalConfig)
  ) {
    throw new Error(
      "StudioRunGenerationManifest canonicalConfigDigest does not match canonical config."
    );
  }
  if (parsed.payload.launchEnvelopeDigest !== valueDigest(snapshot)) {
    throw new Error(
      "StudioRunGenerationManifest launchEnvelopeDigest does not match launch envelope."
    );
  }
  const manifest = buildStudioRunGenerationManifest(
    buildStudioRunGenerationManifestPayload({
      requestId: parsed.payload.requestId,
      launchEnvelope: snapshot,
    })
  );
  if (parsed.generationManifestDigest !== manifest.generationManifestDigest) {
    throw new Error("StudioRunGenerationManifest digest does not match payload.");
  }
  return manifest;
}

export async function readStudioRunGenerationManifest(
  path: string
): Promise<StudioRunGenerationManifest> {
  return parseStudioRunGenerationManifest(JSON.parse(await readFile(path, "utf8")));
}

export async function writeStudioRunGenerationManifest(
  args: Readonly<{
    manifestInput: StudioRunGenerationManifestInput;
    workspaceRoot?: string;
    signal?: AbortSignal;
  }>
): Promise<StudioRunGenerationManifestReference> {
  const paths = studioRunWorkspacePaths(args.manifestInput.requestId, {
    workspaceRoot: args.workspaceRoot,
  });
  const payload = buildStudioRunGenerationManifestPayload(args.manifestInput);
  const manifest = buildStudioRunGenerationManifest(payload);
  const serialized = `${JSON.stringify(manifest, null, 2)}\n`;
  await mkdir(dirname(paths.generationManifestPath), { recursive: true });
  await writeFile(paths.generationManifestPath, serialized, {
    encoding: "utf8",
    flag: "wx",
    signal: args.signal,
  });
  return {
    path: paths.generationManifestPath,
    generationManifestDigest: manifest.generationManifestDigest,
    runArtifactId: manifest.payload.runArtifactId,
    correlation: runCorrelationForManifest(manifest),
  };
}

function sha256Hex(input: string): string {
  return createHash("sha256").update(input, "utf8").digest("hex");
}

function valueDigest(value: unknown): string {
  return sha256Hex(canonicalSortedJson(value));
}

function canonicalize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const key of Object.keys(value).sort()) {
      const item = Object.getOwnPropertyDescriptor(value, key)?.value;
      if (item !== undefined) out[key] = canonicalize(item);
    }
    return out;
  }
  return value;
}

function snapshotManifestLaunchEnvelope(value: unknown): LaunchEnvelope {
  if (!isPortableJsonValue(value) || !Value.Check(launchEnvelope, value)) {
    throw new Error("StudioRunGenerationManifest launchEnvelope must be portable and complete.");
  }
  const parsed = Value.Parse(launchEnvelope, value);
  const source = snapshotConfigSource(parsed.source);
  if (source === undefined) {
    throw new Error("StudioRunGenerationManifest launchEnvelope source is invalid.");
  }
  return snapshotLaunchEnvelope({
    recipeSettings: {
      ...(parsed.recipeSettings.preset === undefined
        ? {}
        : { preset: parsed.recipeSettings.preset }),
      recipe: parsed.recipeSettings.recipe,
      seed: parsed.recipeSettings.seed,
    },
    worldSettings: {
      mapSize: parsed.worldSettings.mapSize,
      ...(parsed.worldSettings.playerCount === undefined
        ? {}
        : { playerCount: parsed.worldSettings.playerCount }),
      ...(parsed.worldSettings.resources === undefined
        ? {}
        : { resources: parsed.worldSettings.resources }),
    },
    setupConfig: parsed.setupConfig,
    source,
  });
}
