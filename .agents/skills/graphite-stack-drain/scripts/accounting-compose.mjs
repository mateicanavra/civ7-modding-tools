#!/usr/bin/env node
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const moveStates = new Set(["planned", "done"]);
const moveKinds = new Set(["adopt", "supersede", "exclude", "reference"]);
const methods = new Set(["as-is", "merge", "cherry-pick", "semantic", "drop"]);
const endpointKinds = new Set(["branch", "stack-slice", "main", "pr", "external"]);

function parseArgs(argv) {
  const args = { census: undefined, ledger: undefined, output: undefined };
  for (let index = 2; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--census") args.census = argv[++index];
    else if (arg === "--ledger") args.ledger = argv[++index];
    else if (arg === "--output") args.output = argv[++index];
    else if (arg === "--help" || arg === "-h") {
      console.log(
        "Usage: accounting-compose.mjs --census census.json --ledger ledger.json [--output PATH]"
      );
      process.exit(0);
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }
  if (!args.census || !args.ledger) throw new Error("--census and --ledger are required");
  return args;
}

function readJson(path) {
  return JSON.parse(readFileSync(resolve(path), "utf8"));
}

function assertEndpoint(endpoint, label) {
  if (!endpoint || typeof endpoint !== "object") throw new Error(`${label} endpoint is missing`);
  if (!endpointKinds.has(endpoint.kind))
    throw new Error(`${label} endpoint has invalid kind: ${endpoint.kind}`);
  if (endpoint.kind === "branch" && typeof endpoint.branch !== "string") {
    throw new Error(`${label} branch endpoint requires branch`);
  }
  if (endpoint.kind === "stack-slice") {
    if (typeof endpoint.root !== "string") throw new Error(`${label} stack-slice requires root`);
    if (endpoint.branches !== undefined && !Array.isArray(endpoint.branches)) {
      throw new Error(`${label} stack-slice branches must be an array`);
    }
  }
  if (endpoint.kind === "pr" && typeof endpoint.number !== "number") {
    throw new Error(`${label} pr endpoint requires numeric number`);
  }
}

function validateMove(move, index) {
  const label = `moves[${index}]`;
  if (!move || typeof move !== "object") throw new Error(`${label} is not an object`);
  if (typeof move.id !== "string") throw new Error(`${label}.id is required`);
  if (!moveStates.has(move.state)) throw new Error(`${label}.state is invalid: ${move.state}`);
  if (!moveKinds.has(move.kind)) throw new Error(`${label}.kind is invalid: ${move.kind}`);
  if (move.method !== undefined && !methods.has(move.method))
    throw new Error(`${label}.method is invalid: ${move.method}`);
  assertEndpoint(move.source, `${label}.source`);
  if (move.sink !== undefined) assertEndpoint(move.sink, `${label}.sink`);
  if (move.kind === "adopt" && !move.sink) throw new Error(`${label} adopt move requires a sink`);
  return move;
}

function endpointBranches(endpoint) {
  if (endpoint.kind === "branch") return [endpoint.branch];
  if (endpoint.kind === "stack-slice")
    return Array.isArray(endpoint.branches) ? endpoint.branches : [endpoint.root];
  if (endpoint.kind === "main") return ["main"];
  return [];
}

function labelFor(move, role) {
  if (role === "sink")
    return `${move.state}:sink:${move.kind}${move.method ? `:${move.method}` : ""}`;
  return `${move.state}:source:${move.kind}${move.method ? `:${move.method}` : ""}`;
}

function main() {
  const args = parseArgs(process.argv);
  const census = readJson(args.census);
  const ledger = readJson(args.ledger);
  if (!Array.isArray(ledger.moves)) throw new Error("ledger.moves must be an array");
  const moves = ledger.moves.map(validateMove);
  const labelsByBranch = new Map();
  const add = (branch, entry) => {
    if (!labelsByBranch.has(branch)) labelsByBranch.set(branch, []);
    labelsByBranch.get(branch).push(entry);
  };
  for (const move of moves) {
    for (const branch of endpointBranches(move.source))
      add(branch, { role: "source", moveId: move.id, label: labelFor(move, "source") });
    if (move.sink) {
      for (const branch of endpointBranches(move.sink))
        add(branch, { role: "sink", moveId: move.id, label: labelFor(move, "sink") });
    }
  }
  const branches = Array.isArray(census.branches)
    ? census.branches.map((branch) => ({
        ...branch,
        accounting: labelsByBranch.get(branch.branch) ?? [],
      }))
    : [];
  const result = {
    schemaVersion: "graphite-stack-accounting-composed/v1",
    generatedAt: new Date().toISOString(),
    censusSchemaVersion: census.schemaVersion,
    ledgerSchemaVersion: ledger.schemaVersion,
    totals: {
      moves: moves.length,
      branchesWithAccounting: [...labelsByBranch.keys()].length,
    },
    moves,
    branches,
  };
  const json = `${JSON.stringify(result, null, 2)}\n`;
  if (args.output) writeFileSync(resolve(args.output), json);
  else process.stdout.write(json);
}

try {
  main();
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}
