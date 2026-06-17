#!/usr/bin/env bun

import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { handle, run } from "@oclif/core";

const binDir = path.dirname(fileURLToPath(import.meta.url));
const harnessRoot = path.resolve(binDir, "../..");
const pjson = JSON.parse(readFileSync(path.join(harnessRoot, "package.json"), "utf8"));
const sourceCommands = binDir.endsWith(path.join("src", "bin"));

await run(process.argv.slice(2), {
  root: harnessRoot,
  pjson: {
    ...pjson,
    oclif: {
      ...pjson.oclif,
      commands: sourceCommands ? "./src/commands" : pjson.oclif?.commands,
    },
  },
  ignoreManifest: sourceCommands,
}).catch(handle);
