#!/usr/bin/env node
import path from "node:path";
import {
  assertEqual,
  assertNoFindings,
  read,
  srcRoot,
  walkFiles,
} from "../../../../../../_support/execution/command-check/mapgen-static-check-lib.mjs";

const hotspotPublishers = walkFiles(srcRoot, [".ts"])
  .filter((file) => {
    const text = read(file);
    return Array.from(text.matchAll(/publishStoryOverlay\s*\([\s\S]{0,200}\)/gu)).some((match) =>
      /HOTSPOTS|["']hotspots["']/.test(match[0])
    );
  })
  .map((file) => path.relative(srcRoot, file).split(path.sep).join("/"))
  .sort();

const findings = assertEqual(
  hotspotPublishers,
  ["domain/narrative/tagging/hotspots.ts"],
  "hotspot-overlay-owner",
  "HOTSPOTS publishers"
);

assertNoFindings("require_narrative_hotspot_overlay_owner", findings);

