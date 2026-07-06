import { describe, expect, it } from "bun:test";
import { createHash } from "node:crypto";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { deriveRecipeConfigSchema } from "@swooper/mapgen-core/authoring";
import {
  type ValidatedMapConfig,
  validateCanonicalMapConfig,
} from "../../src/maps/configs/canonical.js";
import { STANDARD_STAGES } from "../../src/recipes/standard/recipe";

const TRANSIENT_STUDIO_CONFIGS = new Set(["studio-current.config.json"]);

function canonicalize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const key of Object.keys(value as Record<string, unknown>).sort()) {
      out[key] = canonicalize((value as Record<string, unknown>)[key]);
    }
    return out;
  }
  return value;
}

function stableHash(value: unknown): string {
  return createHash("sha256")
    .update(JSON.stringify(canonicalize(value)))
    .digest("hex");
}

function configHashFor(config: ValidatedMapConfig): string {
  return stableHash(config.config);
}

function envelopeHashFor(config: ValidatedMapConfig, configHash: string): string {
  return stableHash({
    id: config.id,
    recipe: config.recipe,
    latitudeBounds: config.latitudeBounds ?? null,
    configHash,
  });
}

function createMapConfigExpression(source: string, id: string): string {
  const match = source.match(/\n\s+config:\s*([^,\n]+),?\n\}\);/);
  if (!match?.[1]) {
    throw new Error(`${id} generated map is missing a terminal createMap config property`);
  }
  return match[1].trim();
}

describe("standard map config artifacts", () => {
  it("keeps generated SDK map entrypoints bound to canonical source config envelopes", () => {
    const configsDir = join(import.meta.dir, "../../src/maps/configs");
    const generatedDir = join(import.meta.dir, "../../src/maps/generated");
    const configIds = readdirSync(configsDir)
      .filter((entry) => entry.endsWith(".config.json"))
      .filter((entry) => !TRANSIENT_STUDIO_CONFIGS.has(entry))
      .map((entry) => entry.replace(/\.config\.json$/, ""))
      .sort();
    const generatedIds = readdirSync(generatedDir)
      .filter((entry) => entry.endsWith(".ts"))
      .filter((entry) => !TRANSIENT_STUDIO_CONFIGS.has(entry.replace(/\.ts$/, ".config.json")))
      .map((entry) => entry.replace(/\.ts$/, ""))
      .sort();

    expect(generatedIds).toEqual(configIds);

    for (const id of configIds) {
      const rawConfig = JSON.parse(
        readFileSync(join(configsDir, `${id}.config.json`), "utf8")
      ) as unknown;
      const mapConfig = validateCanonicalMapConfig({
        fileName: `${id}.config.json`,
        raw: rawConfig,
        recipeSchema: deriveRecipeConfigSchema(STANDARD_STAGES),
        stages: STANDARD_STAGES,
      });
      const expectedConfigHash = configHashFor(mapConfig);
      const expectedEnvelopeHash = envelopeHashFor(mapConfig, expectedConfigHash);
      const source = readFileSync(join(generatedDir, `${id}.ts`), "utf8");

      expect(source, `${id} imports canonical source config`).toContain(
        `../configs/${id}.config.json`
      );
      expect(source, `${id} uses canonical config envelope`).toContain(
        "canonicalRecipeConfig<StandardRecipeConfig>(mapConfig)"
      );
      expect(source, `${id} records sourceConfigId`).toContain(
        `sourceConfigId: ${JSON.stringify(id)}`
      );
      expect(source, `${id} records configHash`).toContain(
        `configHash: ${JSON.stringify(expectedConfigHash)}`
      );
      expect(source, `${id} records envelopeHash`).toContain(
        `envelopeHash: ${JSON.stringify(expectedEnvelopeHash)}`
      );
      expect(createMapConfigExpression(source, id), `${id} createMap config source`).toBe(
        "canonicalRecipeConfig<StandardRecipeConfig>(mapConfig)"
      );
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
