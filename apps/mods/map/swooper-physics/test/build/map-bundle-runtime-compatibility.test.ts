import { describe, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { expectCiv7MapScriptCompatibility } from "./fixtures/civ7-map-script-compatibility";

const repoRoot = join(import.meta.dir, "..", "..");
const mapOutputDir = join(repoRoot, "mod", "maps");
const modInfoPath = join(repoRoot, "mod", "swooper-maps.modinfo");

function listedModMapFiles(): string[] {
  const modInfo = readFileSync(modInfoPath, "utf8");
  return Array.from(
    modInfo.matchAll(/<Item>maps\/([^<]+\.js)<\/Item>/g),
    (match) => match[1]!
  ).sort();
}

describe("built map runtime compatibility", () => {
  test("emits every shipped map within Civ7's loader and syntax contract", async () => {
    const mapFiles = listedModMapFiles();

    for (const mapFile of mapFiles) {
      await expectCiv7MapScriptCompatibility(
        readFileSync(join(mapOutputDir, mapFile), "utf8"),
        mapFile
      );
    }
  }, 30_000);
});
