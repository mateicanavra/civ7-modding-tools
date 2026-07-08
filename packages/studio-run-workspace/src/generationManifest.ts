import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import type {
  LaunchEnvelope,
  LaunchEnvelopeDigest,
  LaunchSourceDigest,
  ResolvedLaunchSource,
  RunInGameSetupConfig,
} from "@civ7/studio-contract";
import {
  launchEnvelope,
  launchSourceDigest,
  resolvedLaunchSource,
  setupConfig,
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
    request: Type.Object(
      {
        recipeId: Type.String(),
        seed: Type.Number(),
        mapSize: Type.String(),
        playerCount: Type.Optional(Type.Number()),
        resources: Type.Optional(Type.String()),
        selectedConfigId: Type.String(),
        setupConfig,
        materializationMode: Type.Union([Type.Literal("durable"), Type.Literal("disposable")]),
        restartCivProcess: Type.Optional(Type.Boolean()),
      },
      { additionalProperties: false }
    ),
    resolvedLaunchSource,
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

type StudioRunGenerationManifestPayloadSchemaStatic = Static<
  typeof studioRunGenerationManifestPayloadSchema
>;

export type StudioRunGenerationManifestInput = Readonly<{
  requestId: string;
  request: Omit<StudioRunGenerationManifestPayloadSchemaStatic["request"], "setupConfig"> & {
    readonly setupConfig: RunInGameSetupConfig;
  };
  resolvedLaunchSource: ResolvedLaunchSource;
  launchEnvelope: LaunchEnvelope;
  launchSourceDigest: LaunchSourceDigest;
  launchEnvelopeDigest: LaunchEnvelopeDigest;
}>;

type StudioRunGenerationManifestRequest = StudioRunGenerationManifestInput["request"];

export type StudioRunGenerationManifestPayload = Omit<
  StudioRunGenerationManifestPayloadSchemaStatic,
  | "runArtifactId"
  | "request"
  | "resolvedLaunchSource"
  | "launchEnvelope"
  | "launchSourceDigest"
  | "launchEnvelopeDigest"
> & {
  readonly runArtifactId: RunArtifactId;
  readonly request: StudioRunGenerationManifestRequest;
  readonly resolvedLaunchSource: ResolvedLaunchSource;
  readonly launchEnvelope: LaunchEnvelope;
  readonly launchSourceDigest: LaunchSourceDigest;
  readonly launchEnvelopeDigest: LaunchEnvelopeDigest;
};

export type StudioRunGenerationManifest = Static<typeof studioRunGenerationManifestSchema> & {
  readonly payload: StudioRunGenerationManifestPayload;
};

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
  return {
    schemaVersion: 1,
    requestId: input.requestId,
    runArtifactId: createRunArtifactId(input.requestId),
    workspace: {
      requestRoot: logicalRunRequestRoot(input.requestId),
      generationManifestPath: RUN_GENERATION_MANIFEST_FILE,
      generatedModRoot: "generated-mod",
    },
    request: input.request,
    resolvedLaunchSource: input.resolvedLaunchSource,
    launchEnvelope: input.launchEnvelope,
    launchSourceDigest: input.launchSourceDigest,
    launchEnvelopeDigest: input.launchEnvelopeDigest,
  };
}

export function buildStudioRunGenerationManifest(
  payload: StudioRunGenerationManifestPayload
): StudioRunGenerationManifest {
  return {
    payload,
    generationManifestDigest: generationManifestDigest(payload),
  };
}

export function generationManifestDigest(payload: StudioRunGenerationManifestPayload): string {
  return sha256Hex(canonicalSortedJson(payload));
}

export function canonicalSortedJson(value: unknown): string {
  return JSON.stringify(canonicalize(value)) ?? "undefined";
}

export function parseStudioRunGenerationManifest(value: unknown): StudioRunGenerationManifest {
  if (!Value.Check(studioRunGenerationManifestSchema, value)) {
    throw new Error("Invalid StudioRunGenerationManifest.");
  }
  const manifest = value as StudioRunGenerationManifest;
  const expectedDigest = generationManifestDigest(manifest.payload);
  if (manifest.generationManifestDigest !== expectedDigest) {
    throw new Error("StudioRunGenerationManifest digest does not match payload.");
  }
  if (manifest.payload.runArtifactId !== createRunArtifactId(manifest.payload.requestId)) {
    throw new Error("StudioRunGenerationManifest runArtifactId does not match requestId.");
  }
  if (
    manifest.payload.workspace.requestRoot !== logicalRunRequestRoot(manifest.payload.requestId)
  ) {
    throw new Error("StudioRunGenerationManifest requestRoot does not match requestId.");
  }
  if (
    manifest.payload.launchSourceDigest.launchEnvelopeDigest !==
    manifest.payload.launchEnvelopeDigest
  ) {
    throw new Error("StudioRunGenerationManifest launchEnvelopeDigest is inconsistent.");
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
  await mkdir(dirname(paths.generationManifestPath), { recursive: true });
  await writeFile(paths.generationManifestPath, `${JSON.stringify(manifest, null, 2)}\n`, {
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

function canonicalize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const key of Object.keys(value as Record<string, unknown>).sort()) {
      const item = (value as Record<string, unknown>)[key];
      if (item !== undefined) out[key] = canonicalize(item);
    }
    return out;
  }
  return value;
}
