#!/usr/bin/env -S bun run

import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { handle, run } from "@oclif/core";
import { makeSourceLoadOptions } from "./source-load-options.js";

const harnessRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const pjson = JSON.parse(readFileSync(path.join(harnessRoot, "package.json"), "utf8"));
const sourcePjson = {
  ...pjson,
  oclif: {
    ...pjson.oclif,
    commands: "./src/cli/commands",
  },
};
const sourceLoadOptions = await makeSourceLoadOptions(harnessRoot, sourcePjson);
const sourceCommands = {
  check: () => import("@habitat/cli/cli/commands/check"),
  classify: () => import("@habitat/cli/cli/commands/classify"),
  fix: () => import("@habitat/cli/cli/commands/fix"),
  graph: () => import("@habitat/cli/cli/commands/graph"),
  hook: () => import("@habitat/cli/cli/commands/hook"),
  verify: () => import("@habitat/cli/cli/commands/verify"),
} as const;

const [commandName, ...commandArgs] = process.argv.slice(2);
if (commandName && commandName in sourceCommands) {
  const command = await sourceCommands[commandName as keyof typeof sourceCommands]();
  await command.default.run(commandArgs, sourceLoadOptions).catch(handle);
} else {
  await run(process.argv.slice(2), sourceLoadOptions).catch(handle);
}
