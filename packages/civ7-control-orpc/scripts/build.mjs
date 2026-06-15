import { spawnSync } from "node:child_process";
import { rm } from "node:fs/promises";

const run = (command, args) => {
  const result = spawnSync(command, args, { stdio: "inherit" });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
};

run("tsup", ["--config", "tsup.config.ts"]);
await rm(new URL("../tsconfig.tsbuildinfo", import.meta.url), { force: true });
run("tsc", ["-p", "tsconfig.json", "--emitDeclarationOnly", "--noEmit", "false"]);
