#!/usr/bin/env bun
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const repoRoot = execFileSync("git", ["rev-parse", "--show-toplevel"], {
  encoding: "utf8",
}).trim();
const daemonSource = readFileSync(join(repoRoot, "apps/mapgen-studio/src/server/daemon/daemon.ts"), "utf8");
const contextSource = readFileSync(join(repoRoot, "apps/mapgen-studio/src/server/studio/context.ts"), "utf8");
const failures: string[] = [];

if (!daemonSource.includes("createStudioRpcHandler(context")) {
  failures.push("daemon must mount createStudioRpcHandler(context)");
}
if (daemonSource.includes("createStudioEventHub")) failures.push("daemon must not create EventHub");
if (/eventHub\?:|createStudioRpcHandler\([^)]*\{[^}]*eventHub/.test(daemonSource)) {
  failures.push("daemon must not inject EventHub into createStudioRpcHandler");
}
if (daemonSource.includes("eventHub.shutdown();")) failures.push("daemon must not shut down EventHub directly");
if (contextSource.includes("eventHub")) failures.push("Studio server context source must not expose eventHub");

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exit(1);
}
