#!/usr/bin/env node
import path from "node:path";
import {
  assertEqual,
  assertNoFindings,
  read,
  srcRoot,
} from "../../../../../../_support/execution/command-check/mapgen-static-check-lib.mjs";

const morphologyConfig = path.join(srcRoot, "domain/morphology/config.ts");
const configExports = read(morphologyConfig)
  .split(/\r?\n/u)
  .map((line) => line.trim())
  .filter(Boolean)
  .sort();

const findings = assertEqual(
  configExports,
  ['export * from "./shared/knob-multipliers.js";', 'export * from "./shared/knobs.js";'].sort(),
  "morphology-config-facade",
  "morphology config exports"
);

assertNoFindings("require_morphology_config_facade_exports", findings);

