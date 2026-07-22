import assert from "node:assert/strict";
import { describe, it } from "vitest";
import { standaloneCompilerManifest } from "../../scripts/standalone/compiler-manifest.js";

describe("standalone compiler distribution", () => {
  it("pins verified source identity separately from rolling upstream evidence", () => {
    assert.deepStrictEqual(standaloneCompilerManifest.upstream, {
      repository: "oven-sh/bun",
      releaseId: 72594710,
      tag: "canary",
      capturedAt: "2026-07-22T06:40:33Z",
      observedReleaseName: "Canary (dbd320ccfa909053f95be9e1643d80d73286751f)",
      observedReleaseNameTrustedForIdentity: false,
    });
    assert.strictEqual(
      standaloneCompilerManifest.revision,
      "5b98630ac045622ce9ddfe0b53a2c4f3a91f26c4"
    );
  });

  it("provisions the temporary Darwin compiler from the immutable owner release", () => {
    assert.deepStrictEqual(standaloneCompilerManifest.distribution, {
      repository: "mateicanavra/civ7-modding-tools",
      releaseId: 357818798,
      tag: "habitat-bun-compiler-5b98630ac045622ce9ddfe0b53a2c4f3a91f26c4",
      releaseUrl:
        "https://github.com/mateicanavra/civ7-modding-tools/releases/tag/habitat-bun-compiler-5b98630ac045622ce9ddfe0b53a2c4f3a91f26c4",
      immutable: true,
      provenanceAsset: {
        githubAssetId: 485_616_634,
        filename: "provenance.json",
        sha256: "82cc6f2eaef90c8376e10892e38d4585a47b569d0bd782b140d053f9a6238a72",
      },
      checksumsAsset: {
        githubAssetId: 485_616_637,
        filename: "SHA256SUMS",
        sha256: "987b51d0a97207a210d04fc04e62832ff13b0940578b5c5330e2ddd344dfca1f",
      },
    });
    assert.deepStrictEqual(standaloneCompilerManifest.asset, {
      id: "darwin-arm64",
      upstreamGithubAssetId: 484_324_324,
      distributionGithubAssetId: 485_616_636,
      distributionUrl:
        "https://api.github.com/repos/mateicanavra/civ7-modding-tools/releases/assets/485616636",
      archiveFilename: "bun-darwin-aarch64.zip",
      archiveSha256: "c286d4eef8489733d0b8a1a5a541cfbc4e96a20e5a6b737fc4ae06cc001fd01a",
      executableRelativePath: "bun-darwin-aarch64/bun",
      executableSha256: "5ff2f453a0709556d1f050cb9263476259ef1fdc2682af3483d6c401727cad94",
    });
  });
});
