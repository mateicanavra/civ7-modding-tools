#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";

function parseArgs(argv) {
  const args = { repoRoot: process.cwd(), output: undefined, left: undefined, right: undefined };
  for (let index = 2; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--repo-root") args.repoRoot = argv[++index];
    else if (arg === "--left") args.left = argv[++index];
    else if (arg === "--right") args.right = argv[++index];
    else if (arg === "--output") args.output = argv[++index];
    else if (arg === "--help" || arg === "-h") {
      console.log(
        "Usage: patch-overlap.mjs --left BRANCH --right BRANCH [--repo-root PATH] [--output PATH]"
      );
      process.exit(0);
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }
  if (!args.left || !args.right) throw new Error("--left and --right are required");
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

function lines(stdout) {
  return stdout.split(/\r?\n/).filter(Boolean);
}

function cherry(upstream, head, cwd) {
  return lines(run("git", ["cherry", "-v", upstream, head], cwd)).map((line) => ({
    equivalent: line.startsWith("-"),
    sha: line.slice(2, 42),
    subject: line.slice(43),
  }));
}

function changedFiles(base, branch, cwd) {
  return new Set(lines(run("git", ["diff", "--name-only", `${base}..${branch}`], cwd)));
}

function main() {
  const args = parseArgs(process.argv);
  const repoRoot = resolve(args.repoRoot);
  const mergeBase = run("git", ["merge-base", args.left, args.right], repoRoot).trim();
  const [leftAhead, rightAhead] = run(
    "git",
    ["rev-list", "--left-right", "--count", `${args.left}...${args.right}`],
    repoRoot
  )
    .trim()
    .split(/\s+/)
    .map((value) => Number.parseInt(value, 10));
  const leftFiles = changedFiles(mergeBase, args.left, repoRoot);
  const rightFiles = changedFiles(mergeBase, args.right, repoRoot);
  const overlappingFiles = [...leftFiles].filter((file) => rightFiles.has(file)).sort();
  const leftCherry = cherry(args.right, args.left, repoRoot);
  const rightCherry = cherry(args.left, args.right, repoRoot);
  const result = {
    schemaVersion: "graphite-stack-patch-overlap/v1",
    generatedAt: new Date().toISOString(),
    repoRoot,
    left: args.left,
    right: args.right,
    mergeBase,
    aheadBehind: { leftAhead, rightAhead },
    patchEquivalent: {
      leftEquivalentToRight: leftCherry.filter((commit) => commit.equivalent).length,
      rightEquivalentToLeft: rightCherry.filter((commit) => commit.equivalent).length,
    },
    commits: {
      leftOnly: leftCherry,
      rightOnly: rightCherry,
    },
    files: {
      leftChanged: leftFiles.size,
      rightChanged: rightFiles.size,
      overlapCount: overlappingFiles.length,
      overlappingFiles,
    },
  };
  const json = `${JSON.stringify(result, null, 2)}\n`;
  if (args.output) {
    writeFileSync(resolve(args.output), json);
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
