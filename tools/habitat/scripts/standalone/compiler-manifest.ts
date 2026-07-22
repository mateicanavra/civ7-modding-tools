import { type Static, Type } from "typebox";
import { Value } from "typebox/value";
import compilerManifestSource from "./compiler-manifest.json";

const Sha256Schema = Type.String({ pattern: "^[0-9a-f]{64}$" });
const DistributionEvidenceAssetSchema = Type.Object(
  {
    githubAssetId: Type.Integer({ minimum: 1 }),
    filename: Type.String({ minLength: 1 }),
    sha256: Sha256Schema,
  },
  { additionalProperties: false }
);

const CompilerAssetSchema = Type.Object(
  {
    id: Type.Literal("darwin-arm64"),
    upstreamGithubAssetId: Type.Integer({ minimum: 1 }),
    distributionGithubAssetId: Type.Integer({ minimum: 1 }),
    distributionUrl: Type.String({ format: "uri" }),
    archiveFilename: Type.String({ minLength: 1 }),
    archiveSha256: Sha256Schema,
    executableRelativePath: Type.String({ minLength: 1 }),
    executableSha256: Sha256Schema,
  },
  { additionalProperties: false }
);

const CompilerManifestSchema = Type.Object(
  {
    schemaVersion: Type.Literal(2),
    name: Type.Literal("1.4.0-canary.1+5b98630ac"),
    version: Type.Literal("1.4.0"),
    revision: Type.Literal("5b98630ac045622ce9ddfe0b53a2c4f3a91f26c4"),
    upstream: Type.Object(
      {
        repository: Type.Literal("oven-sh/bun"),
        releaseId: Type.Literal(72594710),
        tag: Type.Literal("canary"),
        capturedAt: Type.Literal("2026-07-22T06:40:33Z"),
        observedReleaseName: Type.Literal("Canary (dbd320ccfa909053f95be9e1643d80d73286751f)"),
        observedReleaseNameTrustedForIdentity: Type.Literal(false),
      },
      { additionalProperties: false }
    ),
    distribution: Type.Object(
      {
        repository: Type.Literal("mateicanavra/civ7-modding-tools"),
        releaseId: Type.Literal(357818798),
        tag: Type.Literal("habitat-bun-compiler-5b98630ac045622ce9ddfe0b53a2c4f3a91f26c4"),
        releaseUrl: Type.Literal(
          "https://github.com/mateicanavra/civ7-modding-tools/releases/tag/habitat-bun-compiler-5b98630ac045622ce9ddfe0b53a2c4f3a91f26c4"
        ),
        immutable: Type.Literal(true),
        provenanceAsset: Type.Intersect([
          DistributionEvidenceAssetSchema,
          Type.Object({
            githubAssetId: Type.Literal(485_616_634),
            filename: Type.Literal("provenance.json"),
          }),
        ]),
        checksumsAsset: Type.Intersect([
          DistributionEvidenceAssetSchema,
          Type.Object({
            githubAssetId: Type.Literal(485_616_637),
            filename: Type.Literal("SHA256SUMS"),
          }),
        ]),
      },
      { additionalProperties: false }
    ),
    asset: CompilerAssetSchema,
  },
  { additionalProperties: false }
);

export type StandaloneCompilerAsset = Static<typeof CompilerAssetSchema>;

export const standaloneCompilerManifest = Value.Parse(
  CompilerManifestSchema,
  compilerManifestSource
);
