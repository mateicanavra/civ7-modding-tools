import { describe, expect, test } from "bun:test";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const repoRoot = join(import.meta.dir, "..", "..");
const mapOutputDir = join(repoRoot, "mod", "maps");
const modInfoPath = join(repoRoot, "mod", "swooper-maps.modinfo");
const bareWorkspaceImportPattern =
  /\b(?:import|export)\s+(?:[^"']*?\s+from\s+)?["'](@(?:swooper|civ7|mateicanavra)\/[^"']+)["']/g;

function listedModMapFiles(): string[] {
  const modInfo = readFileSync(modInfoPath, "utf8");
  return Array.from(modInfo.matchAll(/<Item>maps\/([^<]+\.js)<\/Item>/g), (match) => match[1]!)
    .sort();
}

describe("built map runtime imports", () => {
  test("builds every map script registered in the Civ7 mod manifest", () => {
    const mapFiles = readdirSync(mapOutputDir)
      .filter((entry) => entry.endsWith(".js"))
      .sort();

    expect(mapFiles).toEqual(expect.arrayContaining(listedModMapFiles()));
  });

  /**
   * Civ7's MapGeneration loader can resolve engine virtual imports such as
   * `/base-standard/...`, but it cannot resolve monorepo package specifiers. These guards
   * check the generated mod script boundary because TypeScript and tsup can both pass
   * while still emitting a script that the game rejects before map generation starts.
   */
  test("bundles repo-owned workspace packages into each Civ7 map script", () => {
    const mapFiles = readdirSync(mapOutputDir)
      .filter((entry) => entry.endsWith(".js"))
      .sort();

    expect(mapFiles.length).toBeGreaterThan(0);

    for (const mapFile of mapFiles) {
      const source = readFileSync(join(mapOutputDir, mapFile), "utf8");
      const bareImports = Array.from(source.matchAll(bareWorkspaceImportPattern), (match) => match[1]);

      expect(bareImports, `${mapFile} contains Civ7-unresolvable workspace imports`).toEqual([]);
    }
  });

  test("bootstraps TextEncoder before bundled modules create one", () => {
    const mapFiles = readdirSync(mapOutputDir)
      .filter((entry) => entry.endsWith(".js"))
      .sort();

    expect(mapFiles.length).toBeGreaterThan(0);

    for (const mapFile of mapFiles) {
      const source = readFileSync(join(mapOutputDir, mapFile), "utf8");
      const bootstrapIndex = source.indexOf("globalThis.TextEncoder = class TextEncoder");
      const firstUseIndex = source.indexOf("new TextEncoder");

      expect(bootstrapIndex, `${mapFile} is missing the Civ7 TextEncoder bootstrap`).toBeGreaterThanOrEqual(0);
      if (firstUseIndex >= 0) {
        expect(
          bootstrapIndex,
          `${mapFile} creates TextEncoder before installing the Civ7 bootstrap`
        ).toBeLessThan(firstUseIndex);
      }
    }
  });
});
