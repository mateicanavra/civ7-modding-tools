#!/usr/bin/env node
import path from "node:path";
import {
  renderPublicSurfaceGuardFailures,
  runPublicSurfaceGuard,
} from "../../tools/habitat-harness/src/domains/public-surface-guards/guard.js";

const repoRoot = path.resolve(new URL("../..", import.meta.url).pathname);
const result = runPublicSurfaceGuard({
  repoRoot,
  injectedRoot: process.env.HABITAT_PUBLIC_SURFACE_GUARD_INJECTED_ROOT,
});

if (!result.ok) {
  console.error(renderPublicSurfaceGuardFailures(result).trimEnd());
  process.exit(1);
}

console.log("Habitat public surface guards passed.");
