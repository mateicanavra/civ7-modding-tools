#!/usr/bin/env -S bun run

import path from "node:path";
import { fileURLToPath } from "node:url";
import { execute } from "@oclif/core";

const harnessRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

await execute({
  development: true,
  loadOptions: {
    root: harnessRoot,
    ignoreManifest: true,
  },
});
