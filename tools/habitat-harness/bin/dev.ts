#!/usr/bin/env -S bun run

import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { handle, run } from "@oclif/core";

const harnessRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const pjson = JSON.parse(readFileSync(path.join(harnessRoot, "package.json"), "utf8"));
const sourcePjson = {
  ...pjson,
  oclif: {
    ...pjson.oclif,
    commands: "./src/cli/commands",
  },
};
const sourceCommands = {
  check: () => import("@internal/habitat-harness/cli/commands/check"),
  classify: () => import("@internal/habitat-harness/cli/commands/classify"),
  fix: () => import("@internal/habitat-harness/cli/commands/fix"),
  graph: () => import("@internal/habitat-harness/cli/commands/graph"),
  hook: () => import("@internal/habitat-harness/cli/commands/hook"),
  verify: () => import("@internal/habitat-harness/cli/commands/verify"),
} as const;

const [commandName, ...commandArgs] = process.argv.slice(2);
if (commandName && commandName in sourceCommands) {
  const command = await sourceCommands[commandName as keyof typeof sourceCommands]();
  await command.default
    .run(commandArgs, {
      root: harnessRoot,
      pjson: sourcePjson,
    })
    .catch(handle);
} else {
  await run(process.argv.slice(2), {
    root: harnessRoot,
    pjson: sourcePjson,
  }).catch(handle);
}
