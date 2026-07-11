import { cp, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { snapshotMapConfigEnvelope } from "@civ7/studio-contract";
import { describe, expect, test } from "vitest";

import { createSwooperRunInGameCanonicalConfigAdmission } from "../../src/server/studio/engines";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../../..");

describe("Swooper Run in Game source admission", () => {
  test("resolves only indexed catalog sources and delegates Standard semantics", async () => {
    const admission = createSwooperRunInGameCanonicalConfigAdmission(repoRoot);
    const sourcePath = "mods/mod-swooper-maps/src/maps/configs/swooper-earthlike.config.json";
    const snapshot = await admission.resolveCatalogSource(sourcePath);

    expect(snapshot).toBeDefined();
    if (snapshot === undefined || snapshot === null || typeof snapshot !== "object") return;
    expect(snapshot).toMatchObject({ id: "swooper-earthlike" });
    expect(Object.isFrozen(snapshot)).toBe(true);
    await expect(
      admission.resolveCatalogSource(
        "mods/mod-swooper-maps/src/maps/configs/not-indexed.config.json"
      )
    ).resolves.toBeUndefined();
  });

  test("validates Studio's immutable editor snapshot without re-admitting it", async () => {
    const admission = createSwooperRunInGameCanonicalConfigAdmission(repoRoot);
    const sourcePath = "mods/mod-swooper-maps/src/maps/configs/swooper-earthlike.config.json";
    const raw = JSON.parse(await readFile(resolve(repoRoot, sourcePath), "utf8")) as Record<
      string,
      unknown
    >;

    const snapshot = snapshotMapConfigEnvelope(raw);
    expect(snapshot).toBeDefined();
    if (snapshot === undefined) return;

    const admitted = await admission.admit(snapshot);

    expect(admitted).toEqual(raw);
    expect(admitted).toBe(snapshot);
    expect(Object.isFrozen(admitted)).toBe(true);
    raw.name = "Mutated editor alias";
    expect(admitted.name).not.toBe(raw.name);
  });

  test("rejects an indexed catalog envelope whose id disagrees with its source path", async () => {
    const fixtureRoot = await mkdtemp(resolve(tmpdir(), "swooper-source-admission-"));
    const sourcePath = "mods/mod-swooper-maps/src/maps/configs/swooper-earthlike.config.json";
    try {
      const sourceConfigRoot = resolve(repoRoot, "mods/mod-swooper-maps/src/maps/configs");
      const fixtureConfigRoot = resolve(fixtureRoot, "mods/mod-swooper-maps/src/maps/configs");
      await cp(sourceConfigRoot, fixtureConfigRoot, { recursive: true });
      const fixturePath = resolve(fixtureRoot, sourcePath);
      const raw = JSON.parse(await readFile(fixturePath, "utf8")) as Record<string, unknown>;
      raw.id = "not-swooper-earthlike";
      await writeFile(fixturePath, `${JSON.stringify(raw, null, 2)}\n`);

      const admission = createSwooperRunInGameCanonicalConfigAdmission(fixtureRoot);
      await expect(admission.resolveCatalogSource(sourcePath)).rejects.toMatchObject({
        message: expect.stringContaining('must match file stem "swooper-earthlike"'),
      });
    } finally {
      await rm(fixtureRoot, { recursive: true, force: true });
    }
  });
});
