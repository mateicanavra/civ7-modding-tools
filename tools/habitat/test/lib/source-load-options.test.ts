import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Config, type Interfaces } from "@oclif/core";
import { afterEach, describe, expect, test } from "vitest";
import { makeSourceLoadOptions } from "../../bin/source-load-options.js";

const fixtureRoots: string[] = [];
const habitatRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

afterEach(async () => {
  await Promise.all(
    fixtureRoots.splice(0).map((root) => rm(root, { force: true, recursive: true }))
  );
});

describe("Habitat source CLI loading", () => {
  test("discovers source commands instead of a readable stale release manifest", async () => {
    const root = await mkdtemp(path.join(habitatRoot, ".source-cli-test-"));
    fixtureRoots.push(root);
    const commandRoot = path.join(root, "src", "commands");
    await mkdir(commandRoot, { recursive: true });
    await writeFile(
      path.join(commandRoot, "current.js"),
      [
        'import { Command } from "@oclif/core";',
        "export default class CurrentCommand extends Command {",
        "  async run() {}",
        "}",
        "",
      ].join("\n")
    );
    await writeFile(
      path.join(root, "oclif.manifest.json"),
      JSON.stringify({ commands: {}, version: "0.0.0" })
    );

    const pjson = {
      name: "@habitat/source-runner-fixture",
      version: "0.0.0",
      type: "module",
      oclif: {
        bin: "habitat-fixture",
        commands: "./src/commands",
        topicSeparator: " ",
      },
    } satisfies Interfaces.PJSON;

    const config = await Config.load(await makeSourceLoadOptions(root, pjson));
    const rootPlugin = config.getPluginsList().find((plugin) => plugin.isRoot);

    expect(rootPlugin?.hasManifest).toBe(false);
    expect(config.commandIDs).toContain("current");
    expect(config.commandIDs).toContain("help");
  });
});
