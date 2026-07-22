#!/usr/bin/env -S bun run

import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Check from "@habitat/cli/cli/commands/check";
import Classify from "@habitat/cli/cli/commands/classify";
import Fix from "@habitat/cli/cli/commands/fix";
import Graph from "@habitat/cli/cli/commands/graph";
import Hook from "@habitat/cli/cli/commands/hook";
import Verify from "@habitat/cli/cli/commands/verify";
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
  check: Check,
  classify: Classify,
  fix: Fix,
  graph: Graph,
  hook: Hook,
  verify: Verify,
} as const;

const [commandName, ...commandArgs] = process.argv.slice(2);
if (commandName && commandName in sourceCommands) {
  const command = sourceCommands[commandName as keyof typeof sourceCommands];
  await command.run(commandArgs, sourceLoadOptions).catch(handle);
} else {
  await run(process.argv.slice(2), sourceLoadOptions).catch(handle);
}
