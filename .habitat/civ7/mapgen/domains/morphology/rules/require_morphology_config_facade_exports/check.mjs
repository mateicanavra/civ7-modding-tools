#!/usr/bin/env node
import path from "node:path";
import {
  assertNoFindings,
  pathExists,
  repoRel,
  srcRoot,
} from "../../../../../../_support/execution/command-check/mapgen-static-check-lib.mjs";

const retiredConfigSurfaces = [
  path.join(srcRoot, "domain/morphology/config.ts"),
  path.join(srcRoot, "domain/morphology/shared/knobs.ts"),
  path.join(srcRoot, "domain/morphology/shared/knob-multipliers.ts"),
];

const findings = retiredConfigSurfaces.flatMap((file) =>
  pathExists(file)
    ? [
        {
          file: repoRel(file),
          line: 1,
          rule: "retired-morphology-config-surface",
          detail:
            "morphology config facades are retired; move reusable domain policy to domain/morphology/model/policy and stage authoring knobs to the owning stage",
        },
      ]
    : []
);

assertNoFindings("require_morphology_config_facade_exports", findings);
