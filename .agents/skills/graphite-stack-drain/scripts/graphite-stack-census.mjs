#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

function parseArgs(argv) {
  const args = { repoRoot: process.cwd(), output: undefined };
  for (let index = 2; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--repo-root") args.repoRoot = argv[++index];
    else if (arg === "--output") args.output = argv[++index];
    else if (arg === "--help" || arg === "-h") {
      console.log("Usage: graphite-stack-census.mjs [--repo-root PATH] [--output PATH]");
      process.exit(0);
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }
  return args;
}

function run(command, args, cwd) {
  return execFileSync(command, args, {
    cwd,
    encoding: "utf8",
    env: { ...process.env, GIT_OPTIONAL_LOCKS: "0" },
    stdio: ["ignore", "pipe", "pipe"],
  });
}

function tryRun(command, args, cwd) {
  try {
    return run(command, args, cwd);
  } catch (error) {
    return "";
  }
}

function parseWorktrees(stdout) {
  const worktrees = [];
  let current;
  const flush = () => {
    if (current?.path) worktrees.push(current);
    current = undefined;
  };
  for (const line of stdout.split(/\r?\n/)) {
    if (!line) {
      flush();
      continue;
    }
    if (line.startsWith("worktree ")) {
      flush();
      current = { path: line.slice("worktree ".length), detached: false };
    } else if (current && line.startsWith("HEAD ")) {
      current.head = line.slice("HEAD ".length);
    } else if (current && line.startsWith("branch ")) {
      current.branch = line.slice("branch ".length).replace(/^refs\/heads\//, "");
    } else if (current && line === "detached") {
      current.detached = true;
    }
  }
  flush();
  return worktrees;
}

function parseStatus(stdout) {
  const entries = [];
  let branchLine;
  for (const line of stdout.split(/\r?\n/)) {
    if (!line) continue;
    if (line.startsWith("## ")) branchLine = line;
    else entries.push({ index: line.slice(0, 1), worktree: line.slice(1, 2), path: line.slice(3) });
  }
  return { branchLine, dirtyFileCount: entries.length, entries };
}

function parseRefs(stdout) {
  const refs = new Map();
  for (const line of stdout.split(/\r?\n/)) {
    if (!line) continue;
    const [name, object] = line.split("\t");
    if (name && object) refs.set(name, object);
  }
  return refs;
}

function parseNeedsRestack(stdout) {
  const branches = new Set();
  const ansiPattern = /\x1b\[[0-9;]*m/g;
  for (const rawLine of stdout.split(/\r?\n/)) {
    const line = rawLine.replace(ansiPattern, "");
    if (!line.includes("(needs restack)")) continue;
    const before = line.split("(needs restack)", 1)[0]?.trim();
    const branch = before?.split(/\s+/).at(-1);
    if (branch) branches.add(branch);
  }
  return [...branches].sort();
}

function parseGraphiteCache(commonDir) {
  const cachePath = resolve(commonDir, ".graphite_cache_persist");
  if (!existsSync(cachePath)) {
    throw new Error(`Graphite cache not found: ${cachePath}`);
  }
  const parsed = JSON.parse(readFileSync(cachePath, "utf8"));
  if (!Array.isArray(parsed.branches)) {
    throw new Error("Unsupported Graphite cache shape: missing branches array");
  }
  const branches = new Map();
  for (const entry of parsed.branches) {
    if (!Array.isArray(entry) || typeof entry[0] !== "string" || typeof entry[1] !== "object") {
      throw new Error("Unsupported Graphite cache branch entry shape");
    }
    branches.set(entry[0], entry[1] ?? {});
  }
  return { sha: typeof parsed.sha === "string" ? parsed.sha : undefined, branches };
}

function readPrInfo(commonDir) {
  const prPath = resolve(commonDir, ".graphite_pr_info");
  if (!existsSync(prPath)) return undefined;
  try {
    return JSON.parse(readFileSync(prPath, "utf8"));
  } catch {
    return { parseError: true };
  }
}

function buildChildren(branches) {
  const children = new Map();
  const parent = new Map();
  for (const [branch, meta] of branches) {
    if (!children.has(branch)) children.set(branch, new Set());
    if (typeof meta.parentBranchName === "string") {
      parent.set(branch, meta.parentBranchName);
      if (!children.has(meta.parentBranchName)) children.set(meta.parentBranchName, new Set());
      children.get(meta.parentBranchName).add(branch);
    }
  }
  return {
    parent,
    children: new Map([...children].map(([key, value]) => [key, [...value].sort()])),
  };
}

function traverse(root, children) {
  const nodes = [];
  const stack = [root];
  const seen = new Set();
  while (stack.length > 0) {
    const branch = stack.pop();
    if (!branch || seen.has(branch)) continue;
    seen.add(branch);
    nodes.push(branch);
    for (const child of [...(children.get(branch) ?? [])].reverse()) stack.push(child);
  }
  return nodes;
}

function summarizeRoot(root, children) {
  const nodes = traverse(root, children);
  const splits = nodes.filter((branch) => (children.get(branch) ?? []).length > 1);
  const leaves = nodes.filter((branch) => (children.get(branch) ?? []).length === 0);
  return {
    root,
    branchCount: nodes.length,
    splitCount: splits.length,
    leafCount: leaves.length,
    splits: splits.map((branch) => ({ branch, children: children.get(branch) ?? [] })),
    leaves,
    nodes,
  };
}

function main() {
  const args = parseArgs(process.argv);
  const repoRoot = resolve(args.repoRoot);
  const topLevel = run("git", ["rev-parse", "--show-toplevel"], repoRoot).trim();
  const commonDirRaw = run("git", ["rev-parse", "--git-common-dir"], topLevel).trim();
  const commonDir = resolve(topLevel, commonDirRaw);
  const head = run("git", ["rev-parse", "HEAD"], topLevel).trim();
  const currentBranch = run("git", ["branch", "--show-current"], topLevel).trim();
  const cache = parseGraphiteCache(commonDir);
  const prInfo = readPrInfo(commonDir);
  const graph = buildChildren(cache.branches);
  const localRefs = parseRefs(
    run(
      "git",
      ["for-each-ref", "refs/heads", "--format=%(refname:short)%09%(objectname)"],
      topLevel
    )
  );
  const remoteRefs = parseRefs(
    tryRun(
      "git",
      ["for-each-ref", "refs/remotes/origin", "--format=%(refname:short)%09%(objectname)"],
      topLevel
    )
  );
  const worktrees = parseWorktrees(run("git", ["worktree", "list", "--porcelain"], topLevel)).map(
    (worktree) => ({
      ...worktree,
      status: existsSync(worktree.path)
        ? parseStatus(
            tryRun("git", ["status", "--short", "--branch", "--porcelain=v1"], worktree.path)
          )
        : undefined,
    })
  );
  const worktreesByBranch = new Map();
  for (const worktree of worktrees) {
    if (!worktree.branch) continue;
    if (!worktreesByBranch.has(worktree.branch)) worktreesByBranch.set(worktree.branch, []);
    worktreesByBranch.get(worktree.branch).push(worktree.path);
  }
  const needsRestack = parseNeedsRestack(
    tryRun("gt", ["log", "short", "--no-interactive"], topLevel)
  );
  const needsRestackSet = new Set(needsRestack);
  const trunk = cache.branches.has("main") ? "main" : currentBranch;
  const rootNames = (graph.children.get(trunk) ?? []).filter((branch) =>
    cache.branches.has(branch)
  );
  const roots = rootNames.map((root) => summarizeRoot(root, graph.children));
  const covered = new Set([trunk]);
  for (const root of roots) for (const node of root.nodes) covered.add(node);
  const outsideRootModel = [...cache.branches.keys()]
    .filter((branch) => !covered.has(branch))
    .sort();
  const branches = [...cache.branches.entries()]
    .map(([branch, meta]) => ({
      branch,
      head: localRefs.get(branch) ?? meta.branchRevision,
      local: localRefs.has(branch),
      remote: remoteRefs.has(`origin/${branch}`),
      graphiteTracked: true,
      graphiteValidation: meta.validationResult,
      parent: graph.parent.get(branch),
      children: graph.children.get(branch) ?? [],
      needsRestack: needsRestackSet.has(branch),
      worktrees: worktreesByBranch.get(branch) ?? [],
    }))
    .sort((a, b) => a.branch.localeCompare(b.branch));

  const result = {
    schemaVersion: "graphite-stack-census/v1",
    generatedAt: new Date().toISOString(),
    repo: { topLevel, commonDir, head, currentBranch, graphiteCacheSha: cache.sha },
    totals: {
      graphiteBranches: cache.branches.size,
      localBranches: localRefs.size,
      remoteBranches: remoteRefs.size,
      worktrees: worktrees.length,
      dirtyWorktrees: worktrees.filter((worktree) => (worktree.status?.dirtyFileCount ?? 0) > 0)
        .length,
      rootStacks: roots.length,
      outsideRootModel: outsideRootModel.length,
      needsRestack: needsRestack.length,
    },
    roots,
    outsideRootModel,
    needsRestack,
    branches,
    worktrees,
    prInfo,
  };

  const json = `${JSON.stringify(result, null, 2)}\n`;
  if (args.output) {
    const output = resolve(args.output);
    writeFileSync(output, json);
    console.error(`Wrote ${output}`);
  } else {
    process.stdout.write(json);
  }
}

try {
  main();
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}
