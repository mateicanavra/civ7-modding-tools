import { createRequire } from "node:module";
import migrationsManifest from "../../migrations.json";
import { describe, expect, test } from "vitest";

const require = createRequire(import.meta.url);
const { baselineMetadataNoopMigration } = require("../../src/migrations/baseline-metadata-noop.cjs");

describe("Habitat migration boundary", () => {
  test("records the current migration as no-op wiring proof only", async () => {
    const migration = migrationsManifest.generators["0.1.0-baseline-metadata-noop"];

    expect(migration).toMatchObject({
      version: "0.1.0",
      implementation: "./src/migrations/baseline-metadata-noop.cjs#baselineMetadataNoopMigration",
    });
    expect(migration.description).toMatch(/No-op migration/);
    expect(migration.description).toMatch(/wiring/);
    expect(migration.description).not.toMatch(/convention change/i);

    await expect(baselineMetadataNoopMigration()).resolves.toEqual([]);
  });
});
