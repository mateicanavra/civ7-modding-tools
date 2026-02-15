import { describe, expect, it } from "bun:test";

import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  computeEcologyBaselineV1,
  type EcologyFixtureBaselineV1,
} from "../support/ecology-fixtures.js";

type ArtifactsFixtureV1 = Readonly<{
  version: 1;
  case: Readonly<{ seed: number; width: number; height: number }>;
  artifacts: Readonly<Record<string, string>>;
}>;

const TEST_DIR = path.dirname(fileURLToPath(import.meta.url));
const FIXTURES_DIR = path.join(TEST_DIR, "..", "fixtures");
const ARTIFACTS_FIXTURE_PATH = path.join(
  FIXTURES_DIR,
  "ecology-parity",
  "ecology-artifacts-fingerprints.v1.json"
);
const VIZ_KEYS_FIXTURE_PATH = path.join(
  FIXTURES_DIR,
  "viz-keys",
  "ecology-vizkeys-v1.txt"
);

let cachedBaseline: EcologyFixtureBaselineV1 | null = null;
function getBaseline(): EcologyFixtureBaselineV1 {
  if (cachedBaseline) return cachedBaseline;
  cachedBaseline = computeEcologyBaselineV1();
  return cachedBaseline;
}

function readVizKeysFixture(pathname: string): string[] {
  return readFileSync(pathname, "utf8")
    .split(/\r?\n/u)
    .map((line) => line.trim())
    .filter(Boolean);
}

describe("Ecology baseline fixtures (M3 no-fudging)", () => {
  it(
    "artifact fingerprints fixture matches computed baseline",
    { timeout: 20_000 },
    () => {
      const expected = JSON.parse(readFileSync(ARTIFACTS_FIXTURE_PATH, "utf8")) as ArtifactsFixtureV1;
      const baseline = getBaseline();

      expect(baseline.version).toBe(expected.version);
      expect(baseline.case).toEqual(expected.case);
      expect(baseline.artifacts).toEqual(expected.artifacts);
    }
  );

  it("viz keys fixture matches computed baseline", { timeout: 20_000 }, () => {
    const baseline = getBaseline();
    const expected = readVizKeysFixture(VIZ_KEYS_FIXTURE_PATH);
    expect(baseline.vizKeys).toEqual(expected);
  });
});

