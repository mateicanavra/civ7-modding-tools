import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Check from "../src/commands/check.js";
import Classify from "../src/commands/classify.js";
import Fix from "../src/commands/fix.js";
import Graph from "../src/commands/graph.js";
import Hook from "../src/commands/hook.js";
import Verify from "../src/commands/verify.js";

const harnessRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const pjson = JSON.parse(readFileSync(path.join(harnessRoot, "package.json"), "utf8"));
const commands = {
  check: Check,
  classify: Classify,
  fix: Fix,
  graph: Graph,
  hook: Hook,
  verify: Verify,
} as const;
const [commandName, ...commandArgs] = process.argv.slice(2);
const command = commands[commandName as keyof typeof commands];

if (!command) {
  console.error(`Unknown habitat command: ${commandName ?? "(missing)"}`);
  console.error(`Available commands: ${Object.keys(commands).join(", ")}`);
  process.exit(2);
}

try {
  await command.run(commandArgs, {
    root: harnessRoot,
    pjson: {
      ...pjson,
      oclif: {
        ...pjson.oclif,
        commands: "./src/commands",
      },
    },
    ignoreManifest: true,
  });
} catch (error) {
  const exitCode = error instanceof Error && "oclif" in error ? error.oclif?.exit : undefined;
  if (typeof exitCode === "number") process.exit(exitCode);
  throw error;
}
