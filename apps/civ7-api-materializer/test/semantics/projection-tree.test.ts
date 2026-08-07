import { mkdir, mkdtemp, readFile, rename, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, test } from "vitest";
import {
  assertGeneratedApiReplacementSettled,
  fingerprintRenderedApiProjection,
  generatedApiBackupRoot,
  generatedApiReplacementMarkerPath,
  inspectApiProjection,
  recoverGeneratedApiReplacement,
  replaceGeneratedApiSource,
} from "../../src/projection.js";

const roots: string[] = [];

async function tempRoot(): Promise<string> {
  const root = await mkdtemp(join(tmpdir(), "civ7-api-projection-tree-"));
  roots.push(root);
  return root;
}

afterEach(async () => {
  await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});

describe("generated Civ7 API tree", () => {
  test("uses the same fingerprint for rendered bytes and their written tree", async () => {
    const root = await tempRoot();
    const files = [
      { path: "nested/value.d.ts", text: "export type Value = unknown;\n" },
      { path: "root.ts", text: "export {};\n" },
    ] as const;
    await mkdir(join(root, "nested"));
    await Promise.all(files.map((file) => writeFile(join(root, file.path), file.text)));

    expect(fingerprintRenderedApiProjection(files)).toEqual(await inspectApiProjection(root));
  });

  test("fingerprints identical bytes independently of creation order", async () => {
    const first = await tempRoot();
    const second = await tempRoot();
    await mkdir(join(first, "nested"));
    await writeFile(join(first, "root.ts"), "export {};\n");
    await writeFile(join(first, "nested/value.d.ts"), "export type Value = unknown;\n");
    await mkdir(join(second, "nested"));
    await writeFile(join(second, "nested/value.d.ts"), "export type Value = unknown;\n");
    await writeFile(join(second, "root.ts"), "export {};\n");

    expect(await inspectApiProjection(first)).toEqual(await inspectApiProjection(second));
  });

  test("replaces the complete tree and removes stale generated files", async () => {
    const parent = await tempRoot();
    const destination = join(parent, "destination");
    const staged = join(parent, "staged");
    await Promise.all([mkdir(destination), mkdir(staged)]);
    await writeFile(join(destination, "stale.ts"), "stale\n");
    await writeFile(join(staged, "current.ts"), "current\n");

    await replaceGeneratedApiSource(staged, destination);

    expect(await readFile(join(destination, "current.ts"), "utf8")).toBe("current\n");
    await expect(readFile(join(destination, "stale.ts"), "utf8")).rejects.toThrow();
  });

  test("restores the prior tree when replacement verification refuses the stage", async () => {
    const parent = await tempRoot();
    const destination = join(parent, "destination");
    const staged = join(parent, "staged");
    await Promise.all([mkdir(destination), mkdir(staged)]);
    await writeFile(join(destination, "prior.ts"), "prior\n");
    await writeFile(join(staged, "invalid.ts"), "invalid\n");

    await expect(
      replaceGeneratedApiSource(staged, destination, async () => {
        throw new Error("projection refused");
      })
    ).rejects.toThrow("projection refused");

    expect(await readFile(join(destination, "prior.ts"), "utf8")).toBe("prior\n");
    await expect(readFile(join(destination, "invalid.ts"), "utf8")).rejects.toThrow();
  });

  test("recovers an interrupted replacement from its stable backup", async () => {
    const parent = await tempRoot();
    const destination = join(parent, "destination");
    await mkdir(destination);
    await writeFile(join(destination, "prior.ts"), "prior\n");
    await rename(destination, generatedApiBackupRoot(destination));

    await recoverGeneratedApiReplacement(destination);

    expect(await readFile(join(destination, "prior.ts"), "utf8")).toBe("prior\n");
  });

  test("rolls back an uncommitted replacement instead of accepting its destination", async () => {
    const parent = await tempRoot();
    const destination = join(parent, "destination");
    const backup = generatedApiBackupRoot(destination);
    await Promise.all([mkdir(destination), mkdir(backup)]);
    await writeFile(join(destination, "unverified.ts"), "unverified\n");
    await writeFile(join(backup, "prior.ts"), "prior\n");
    await writeFile(
      generatedApiReplacementMarkerPath(destination),
      `${JSON.stringify({ schemaVersion: 1, destinationExisted: true })}\n`
    );

    await recoverGeneratedApiReplacement(destination);

    expect(await readFile(join(destination, "prior.ts"), "utf8")).toBe("prior\n");
    await expect(readFile(join(destination, "unverified.ts"), "utf8")).rejects.toThrow();
  });

  test("read-only settlement proof refuses transaction residue without repairing it", async () => {
    const parent = await tempRoot();
    const destination = join(parent, "destination");
    const marker = generatedApiReplacementMarkerPath(destination);
    await mkdir(destination);
    await writeFile(join(destination, "current.ts"), "current\n");
    await writeFile(marker, '{"schemaVersion":1,"destinationExisted":true}\n');

    await expect(assertGeneratedApiReplacementSettled(destination)).rejects.toThrow(
      "in progress or interrupted"
    );
    expect(await readFile(join(destination, "current.ts"), "utf8")).toBe("current\n");
    expect(await readFile(marker, "utf8")).toContain('"schemaVersion":1');

    await rm(marker);
    const backup = generatedApiBackupRoot(destination);
    await mkdir(backup);
    await writeFile(join(backup, "prior.ts"), "prior\n");
    await expect(assertGeneratedApiReplacementSettled(destination)).rejects.toThrow(
      "in progress or interrupted"
    );
    expect(await readFile(join(backup, "prior.ts"), "utf8")).toBe("prior\n");
  });

  test("refuses non-file entries instead of silently omitting them", async () => {
    const root = await tempRoot();
    await writeFile(join(root, "target.ts"), "export {};\n");
    await symlink("target.ts", join(root, "alias.ts"));

    await expect(inspectApiProjection(root)).rejects.toThrow(
      "Unsupported generated API filesystem entry"
    );
  });
});
