#!/usr/bin/env -S bun run

import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { handle, run } from "@oclif/core";

const harnessRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const pjson = JSON.parse(readFileSync(path.join(harnessRoot, "package.json"), "utf8"));

await run(process.argv.slice(2), {
  root: harnessRoot,
  pjson: {
    ...pjson,
    oclif: {
      ...pjson.oclif,
      commands: "./src/commands",
    },
  },
  ignoreManifest: true,
}).catch(handle);
