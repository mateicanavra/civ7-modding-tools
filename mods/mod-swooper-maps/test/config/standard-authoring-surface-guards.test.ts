import { describe, expect, it } from "bun:test";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { deriveRecipeConfigSchema } from "@swooper/mapgen-core/authoring";
import { loadSwooperMapConfigRegistry } from "../../scripts/generate-map-artifacts";
import { buildSwooperMapArtifactFilePlan } from "../../scripts/map-artifacts/file-plan";
import { buildCanonicalMapConfigSchema } from "../../src/maps/configs/canonical.js";
import { STANDARD_STAGES } from "../../src/recipes/standard/recipe";

function textContent(file: { content: { kind: "text"; text: string } | { kind: "bytes" } }) {
  if (file.content.kind !== "text") throw new Error(`Expected text artifact ${file.relativePath}`);
  return file.content.text;
}

describe("standard map config artifacts", () => {
  it("keeps generated SDK map entrypoints aligned with the package file plan", async () => {
    const generatedDir = join(import.meta.dir, "../../src/maps/generated");
    const configs = await loadSwooperMapConfigRegistry();
    const plan = buildSwooperMapArtifactFilePlan({
      configs,
      envelopeSchema: buildCanonicalMapConfigSchema(deriveRecipeConfigSchema(STANDARD_STAGES)),
    });
    const expectedEntries = plan.files
      .filter((file) => file.kind === "generated-map-entry")
      .map((file) => ({
        relativePath: file.relativePath,
        text: textContent(file),
      }))
      .sort((a, b) => a.relativePath.localeCompare(b.relativePath));
    const generatedIds = readdirSync(generatedDir)
      .filter((entry) => entry.endsWith(".ts"))
      .map((entry) => entry.replace(/\.ts$/, ""))
      .sort();
    const expectedIds = expectedEntries
      .map((entry) =>
        entry.relativePath.replace(/^src\/maps\/generated\//, "").replace(/\.ts$/, "")
      )
      .sort();

    expect(generatedIds).toEqual(expectedIds);

    for (const expected of expectedEntries) {
      const source = readFileSync(join(import.meta.dir, "../..", expected.relativePath), "utf8");
      expect(source, expected.relativePath).toBe(expected.text);
    }
  });

  it("keeps transient studio-current out of shipped map catalog artifacts", () => {
    const artifactPaths = [
      "../../mod/config/config.xml",
      "../../mod/swooper-maps.modinfo",
      "../../mod/text/en_us/MapText.xml",
    ];

    for (const artifactPath of artifactPaths) {
      const source = readFileSync(join(import.meta.dir, artifactPath), "utf8");
      expect(source, artifactPath).not.toContain("studio-current");
      expect(source, artifactPath).not.toContain("STUDIO_CURRENT");
    }
  });
});
