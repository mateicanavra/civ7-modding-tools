import { type Static, Type } from "typebox";
import { Value } from "typebox/value";
import compilerManifestSource from "./compiler-manifest.json";

const Sha256Schema = Type.String({ pattern: "^[0-9a-f]{64}$" });

const CompilerAssetSchema = Type.Object(
  {
    id: Type.Union([Type.Literal("darwin-arm64"), Type.Literal("linux-x64-baseline")]),
    hostPlatform: Type.Union([Type.Literal("darwin"), Type.Literal("linux")]),
    hostArch: Type.Union([Type.Literal("arm64"), Type.Literal("x64")]),
    githubAssetId: Type.Integer({ minimum: 1 }),
    url: Type.String({ format: "uri" }),
    archiveFilename: Type.String({ minLength: 1 }),
    archiveSha256: Sha256Schema,
    executableRelativePath: Type.String({ minLength: 1 }),
    executableSha256: Sha256Schema,
  },
  { additionalProperties: false }
);

const CompilerManifestSchema = Type.Object(
  {
    schemaVersion: Type.Literal(1),
    name: Type.Literal("1.4.0-canary.1+a21528506"),
    version: Type.Literal("1.4.0"),
    revision: Type.Literal("a215285063c9b7b0d4b3f87bd298d4fecfd93897"),
    source: Type.Object(
      {
        repository: Type.Literal("oven-sh/bun"),
        releaseId: Type.Literal(72594710),
        tag: Type.Literal("canary"),
      },
      { additionalProperties: false }
    ),
    assets: Type.Tuple([
      Type.Intersect([
        CompilerAssetSchema,
        Type.Object({
          id: Type.Literal("darwin-arm64"),
          hostPlatform: Type.Literal("darwin"),
          hostArch: Type.Literal("arm64"),
        }),
      ]),
      Type.Intersect([
        CompilerAssetSchema,
        Type.Object({
          id: Type.Literal("linux-x64-baseline"),
          hostPlatform: Type.Literal("linux"),
          hostArch: Type.Literal("x64"),
        }),
      ]),
    ]),
  },
  { additionalProperties: false }
);

export type StandaloneCompilerAsset = Static<typeof CompilerAssetSchema>;
export type StandaloneCompilerManifest = Static<typeof CompilerManifestSchema>;

export const standaloneCompilerManifest = Value.Parse(
  CompilerManifestSchema,
  compilerManifestSource
);

export function standaloneCompilerAssetForHost(
  platform: NodeJS.Platform,
  architecture: string
): StandaloneCompilerAsset {
  const asset = standaloneCompilerManifest.assets.find(
    (candidate) => candidate.hostPlatform === platform && candidate.hostArch === architecture
  );
  if (!asset) {
    throw new Error(`No pinned Habitat standalone compiler for ${platform}-${architecture}.`);
  }
  return asset;
}
