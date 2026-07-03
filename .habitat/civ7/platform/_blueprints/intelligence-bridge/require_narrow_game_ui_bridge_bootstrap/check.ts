#!/usr/bin/env bun
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const repoRoot = execFileSync("git", ["rev-parse", "--show-toplevel"], {
  encoding: "utf8",
}).trim();
const source = readFileSync(
  join(repoRoot, "mods/mod-civ7-intelligence-bridge/src/ui/civ7-intelligence-bridge.ts"),
  "utf8"
);
const failures: string[] = [];

if (!source.includes("@civ7/control-orpc/game-ui")) {
  failures.push("UI bootstrap must import @civ7/control-orpc/game-ui");
}
if (!source.includes("installCiv7GameUiIntelligenceBridge")) {
  failures.push("UI bootstrap must install through installCiv7GameUiIntelligenceBridge");
}
for (const forbidden of ['@civ7/control-orpc";', "RPCHandler", "RPCLink"]) {
  if (source.includes(forbidden))
    failures.push(`UI bootstrap contains forbidden token ${forbidden}`);
}

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exit(1);
}
