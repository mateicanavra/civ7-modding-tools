import { execFile as execFileCallback } from "node:child_process";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";
import { afterEach, describe, expect, test } from "vitest";
import { assertMaterializerTransactionSettled, replaceSnapshot } from "../../src/materialize.js";
import type { SourceIdentity } from "../../src/model.js";
import {
  assertSnapshotReceipt,
  buildSnapshot,
  inspectSnapshot,
  isAdmittedSourcePath,
} from "../../src/snapshot.js";

const roots: string[] = [];
const execFile = promisify(execFileCallback);
const identity: SourceIdentity = {
  application: {
    bundleIdentifier: "com.2k.civ7",
    version: "1.4.2",
    bundleVersion: "1282290",
    longVersion: "Civilization VII version 1.4.2.26 (1282290)",
  },
  steam: {
    appId: "1295660",
    buildId: "24410208",
    installDirectory: "Sid Meier's Civilization VII",
    lastUpdated: "1785653573",
    depots: [{ id: "1295663", manifest: "6586384430966026887" }],
    state: {
      flags: "4",
      updateResult: "0",
      targetBuildId: "24410208",
      download: { expectedBytes: "469309344", completedBytes: "469309344" },
      staging: {
        expectedBytes: "1699477353",
        completedBytes: "1699477353",
        remainingBytes: "0",
      },
    },
  },
};

async function tempRoot(): Promise<string> {
  const root = await mkdtemp(join(tmpdir(), "civ7-api-materializer-"));
  roots.push(root);
  return root;
}

async function git(root: string, args: readonly string[]): Promise<void> {
  await execFile("git", ["-C", root, ...args]);
}

async function configureGit(root: string): Promise<void> {
  await git(root, ["config", "user.name", "Civ7 Materializer Test"]);
  await git(root, ["config", "user.email", "materializer@example.invalid"]);
}

async function createSubmoduleFixture(parent: string): Promise<{
  readonly destination: string;
  readonly workspace: string;
}> {
  const source = join(parent, "resource-source");
  const workspace = join(parent, "workspace");
  const destination = join(workspace, "resources");
  await Promise.all([mkdir(source), mkdir(workspace)]);
  await git(source, ["init"]);
  await configureGit(source);
  await writeFile(join(source, "initial.txt"), "initial\n");
  await git(source, ["add", "initial.txt"]);
  await git(source, ["commit", "-m", "initial"]);
  await git(workspace, ["init"]);
  await configureGit(workspace);
  await execFile("git", [
    "-c",
    "protocol.file.allow=always",
    "-C",
    workspace,
    "submodule",
    "add",
    source,
    "resources",
  ]);
  await git(workspace, ["add", ".gitmodules", "resources"]);
  await git(workspace, ["commit", "-m", "register resources"]);
  return { destination, workspace };
}

afterEach(async () => {
  await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});

describe("official source profile", () => {
  test("admits source maps while excluding large and host-specific assets", () => {
    expect(isAdmittedSourcePath("Base/modules/core/ui/cohtml.js.map")).toBe(true);
    expect(
      isAdmittedSourcePath("Base/modules/base-standard/maps/EarthMaps/Earth_Huge.Civ7Map")
    ).toBe(true);
    expect(isAdmittedSourcePath("DLC/example/data/rules.xml")).toBe(true);
    expect(isAdmittedSourcePath("Base/Platforms/Mac/runtime.bin")).toBe(false);
    expect(isAdmittedSourcePath("Base/modules/core/data/icons/icon.png")).toBe(false);
    expect(isAdmittedSourcePath("Base/modules/core/movies/intro.webm")).toBe(false);
  });

  test("builds deterministic receipts and validates embedded source evidence", async () => {
    const source = await tempRoot();
    const firstOutput = await tempRoot();
    const secondOutput = await tempRoot();
    await mkdir(join(source, "Base/modules/core/ui"), { recursive: true });
    await mkdir(join(source, "DLC/example/data"), { recursive: true });
    await writeFile(join(source, "Base/modules/core/ui/cohtml.js"), "export {};\n");
    await writeFile(
      join(source, "Base/modules/core/ui/cohtml.js.map"),
      JSON.stringify({ version: 3, sources: ["cohtml.ts"], sourcesContent: ["export {};\n"] })
    );
    await writeFile(join(source, "DLC/example/data/rules.xml"), "<Rules />\n");

    const first = await buildSnapshot(source, firstOutput, identity);
    const second = await buildSnapshot(source, secondOutput, identity);
    expect(first.receiptText).toBe(second.receiptText);
    expect(first.receipt.sourceMaps).toEqual({
      fileCount: 1,
      sourceCount: 1,
      embeddedSourceCount: 1,
      missingSourceContentCount: 0,
    });
    assertSnapshotReceipt(await inspectSnapshot(firstOutput));
  });

  test("refuses malformed source-map evidence", async () => {
    const source = await tempRoot();
    const output = await tempRoot();
    await mkdir(join(source, "Base/modules/core/ui"), { recursive: true });
    await mkdir(join(source, "DLC"), { recursive: true });
    await writeFile(join(source, "Base/modules/core/ui/broken.js.map"), "not-json");
    await expect(buildSnapshot(source, output, identity)).rejects.toThrow(
      "Invalid source map JSON"
    );
  });

  test("refuses source maps whose embedded sources do not align by position", async () => {
    const source = await tempRoot();
    const output = await tempRoot();
    await mkdir(join(source, "Base/modules/core/ui"), { recursive: true });
    await mkdir(join(source, "DLC"), { recursive: true });
    await writeFile(
      join(source, "Base/modules/core/ui/broken.js.map"),
      JSON.stringify({ version: 3, sources: ["cohtml.ts"], sourcesContent: [null, "unrelated"] })
    );
    await expect(buildSnapshot(source, output, identity)).rejects.toThrow(
      "sourcesContent must align with sources"
    );
  });

  test("replaces the exact tree and preserves the submodule git pointer", async () => {
    const parent = await tempRoot();
    const { destination, workspace } = await createSubmoduleFixture(parent);
    const staged = join(workspace, "staged");
    await mkdir(staged);
    await writeFile(join(staged, "current.txt"), "current\n");

    await replaceSnapshot(staged, destination);
    expect(await readFile(join(destination, ".git"), "utf8")).toContain("gitdir:");
    expect(await readFile(join(destination, "current.txt"), "utf8")).toBe("current\n");
    await expect(readFile(join(destination, "initial.txt"), "utf8")).rejects.toThrow();
  });

  test("refuses to replace a dirty submodule checkout", async () => {
    const parent = await tempRoot();
    const { destination, workspace } = await createSubmoduleFixture(parent);
    const staged = join(workspace, "staged");
    await mkdir(staged);
    await writeFile(join(destination, "unpublished.txt"), "unpublished\n");
    await writeFile(join(staged, "current.txt"), "current\n");

    await expect(replaceSnapshot(staged, destination)).rejects.toThrow("dirty resources snapshot");
    expect(await readFile(join(destination, "unpublished.txt"), "utf8")).toBe("unpublished\n");
  });

  test("restores the prior checkout when replacement verification refuses the stage", async () => {
    const parent = await tempRoot();
    const { destination, workspace } = await createSubmoduleFixture(parent);
    const staged = join(workspace, "staged");
    await mkdir(staged);
    await writeFile(join(staged, "invalid.txt"), "invalid\n");

    await expect(
      replaceSnapshot(staged, destination, async () => {
        throw new Error("stage refused");
      })
    ).rejects.toThrow("stage refused");
    expect(await readFile(join(destination, "initial.txt"), "utf8")).toBe("initial\n");
    await expect(readFile(join(destination, "invalid.txt"), "utf8")).rejects.toThrow();
  });

  test("admits only one replacement transaction at a time", async () => {
    const parent = await tempRoot();
    const { destination, workspace } = await createSubmoduleFixture(parent);
    const firstStage = join(workspace, "first-stage");
    const secondStage = join(workspace, "second-stage");
    await Promise.all([mkdir(firstStage), mkdir(secondStage)]);
    await Promise.all([
      writeFile(join(firstStage, "first.txt"), "first\n"),
      writeFile(join(secondStage, "second.txt"), "second\n"),
    ]);

    let enterVerification: (() => void) | undefined;
    const verificationEntered = new Promise<void>((resolve) => {
      enterVerification = resolve;
    });
    let releaseVerification: (() => void) | undefined;
    const verificationReleased = new Promise<void>((resolve) => {
      releaseVerification = resolve;
    });
    const first = replaceSnapshot(firstStage, destination, async () => {
      enterVerification?.();
      await verificationReleased;
    });
    await verificationEntered;
    await expect(replaceSnapshot(secondStage, destination)).rejects.toThrow(
      "Another Civ7 API materializer owns"
    );
    releaseVerification?.();
    await first;
    expect(await readFile(join(destination, "first.txt"), "utf8")).toBe("first\n");
  });

  test("refuses stale lock takeover rather than weakening exclusivity", async () => {
    const parent = await tempRoot();
    const { destination, workspace } = await createSubmoduleFixture(parent);
    const staged = join(workspace, "staged");
    await mkdir(staged);
    await writeFile(join(staged, "current.txt"), "current\n");
    await writeFile(join(workspace, ".resources.materializer.lock"), "999999\n");

    await expect(replaceSnapshot(staged, destination)).rejects.toThrow(
      "Another Civ7 API materializer owns"
    );
    expect(await readFile(join(destination, "initial.txt"), "utf8")).toBe("initial\n");
  });

  test("read-only settlement proof refuses a writer lock without removing it", async () => {
    const parent = await tempRoot();
    const destination = join(parent, "resources");
    const apiDestination = join(parent, "api");
    const lock = join(parent, ".resources.materializer.lock");
    await Promise.all([mkdir(destination), mkdir(apiDestination)]);
    await writeFile(lock, "999999\n");

    await expect(assertMaterializerTransactionSettled(destination, apiDestination)).rejects.toThrow(
      "in progress or interrupted"
    );
    expect(await readFile(lock, "utf8")).toBe("999999\n");
  });

  test("refuses a linked checkout that is not the superproject's registered submodule", async () => {
    const parent = await tempRoot();
    const destination = join(parent, "resources");
    const staged = join(parent, "staged");
    await mkdir(staged);
    await execFile("git", [
      "init",
      `--separate-git-dir=${join(parent, "resources.git")}`,
      destination,
    ]);
    await writeFile(join(staged, "current.txt"), "current\n");

    await expect(replaceSnapshot(staged, destination)).rejects.toThrow(
      "not a registered submodule"
    );
  });
});
