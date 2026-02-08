import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";

import { computeEcologyBaselineV1 } from "../support/ecology-fixtures.js";

type ArtifactsFixtureV1 = Readonly<{
  version: 1;
  case: Readonly<{ seed: number; width: number; height: number }>;
  artifacts: Record<string, string>;
}>;

function readLines(text: string): string[] {
  return text
    .split(/\r?\n/u)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

describe("M2 gate: ecology parity baseline (artifacts + viz keys)", () => {
  it("matches the committed v1 fixtures for seed=1337", () => {
    const baseline = computeEcologyBaselineV1();

    const artifactsFixture = JSON.parse(
      readFileSync(new URL("../fixtures/ecology-parity/ecology-artifacts-fingerprints.v1.json", import.meta.url), "utf8")
    ) as ArtifactsFixtureV1;

    const vizKeysFixtureText = readFileSync(
      new URL("../fixtures/viz-keys/ecology-vizkeys-v1.txt", import.meta.url),
      "utf8"
    );
    const vizKeysFixture = readLines(vizKeysFixtureText);

    expect(artifactsFixture.version).toBe(1);
    expect(artifactsFixture.case).toEqual(baseline.case);

    expect(baseline.artifacts).toEqual(artifactsFixture.artifacts);
    expect(baseline.vizKeys).toEqual(vizKeysFixture);
  });
});

