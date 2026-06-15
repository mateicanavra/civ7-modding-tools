import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { mergeBase } from "./baseline.js";
import { repoRoot, toRepoRelative } from "./paths.js";
import { run, type SpawnResult } from "./spawn.js";

type HookName = "pre-commit" | "pre-push";

interface HookOptions {
  base?: string;
}

interface GritReport {
  results?: unknown[];
}

const prePushTargets = ["biome:ci", "boundaries", "grit:check", "habitat:check", "test"];

const biomeCandidateExtensions = new Set([
  ".cjs",
  ".css",
  ".cts",
  ".graphql",
  ".html",
  ".js",
  ".json",
  ".jsonc",
  ".jsx",
  ".mjs",
  ".mts",
  ".ts",
  ".tsx",
]);

const gritCandidateExtensions = new Set([
  ".cjs",
  ".cts",
  ".js",
  ".jsx",
  ".mjs",
  ".mts",
  ".ts",
  ".tsx",
]);

export function runHook(name: string | undefined, options: HookOptions = {}): SpawnResult {
  if (!isHookName(name)) {
    return {
      exitCode: 2,
      stdout: "",
      stderr: `Unknown Habitat hook '${name ?? "(missing)"}'. Expected pre-commit or pre-push.\n`,
    };
  }
  return name === "pre-commit" ? runPreCommit() : runPrePush(options);
}

function runPreCommit(): SpawnResult {
  let stdout = "habitat hook pre-commit\n";
  let stderr = "";

  const resources = run(["bash", "scripts/civ7-resources/publish-submodule.sh"], {
    cwd: repoRoot,
  });
  stdout += section("resources publish", resources.stdout);
  stderr += resources.stderr;
  if (resources.exitCode !== 0) return { exitCode: resources.exitCode, stdout, stderr };

  const staged = stagedPaths().filter((candidate) => existsSync(path.join(repoRoot, candidate)));

  const fileLayer = run(
    [
      "bun",
      "tools/habitat-harness/bin/dev.ts",
      "check",
      "--staged",
      "--tool",
      "file-layer",
      "--json",
    ],
    { cwd: repoRoot }
  );
  stdout += section("file-layer staged check", fileLayer.stdout);
  stderr += fileLayer.stderr;
  if (fileLayer.exitCode !== 0) return { exitCode: fileLayer.exitCode, stdout, stderr };

  const biomePaths = staged.filter((candidate) =>
    biomeCandidateExtensions.has(path.extname(candidate))
  );
  const partials = unstagedAmong(biomePaths);
  if (partials.length > 0) {
    return {
      exitCode: 1,
      stdout,
      stderr:
        stderr +
        [
          "habitat hook pre-commit: refusing to format partially staged files.",
          "Stage or unstage each whole file before committing; Habitat does not stash or rewrite unstaged hunks.",
          ...partials.map((file) => `- ${file}`),
          "",
        ].join("\n"),
    };
  }

  const beforeHashes = new Map(biomePaths.map((candidate) => [candidate, fileHash(candidate)]));
  if (biomePaths.length > 0) {
    const format = run(["biome", "format", "--write", "--no-errors-on-unmatched", ...biomePaths], {
      cwd: repoRoot,
    });
    stdout += section("biome format", format.stdout);
    stderr += format.stderr;
    if (format.exitCode !== 0) return { exitCode: format.exitCode, stdout, stderr };

    const touched = biomePaths.filter(
      (candidate) => beforeHashes.get(candidate) !== fileHash(candidate)
    );
    if (touched.length > 0) {
      const restage = gitAdd(touched);
      stdout += section("formatter restage", restage.stdout);
      stderr += restage.stderr;
      if (restage.exitCode !== 0) return { exitCode: restage.exitCode, stdout, stderr };
      stdout += `formatter restage: ${touched.length} path(s)\n`;
    } else {
      stdout += "formatter restage: 0 paths\n";
    }

    const check = run(["biome", "check", "--no-errors-on-unmatched", ...biomePaths], {
      cwd: repoRoot,
    });
    stdout += section("biome check", check.stdout);
    stderr += check.stderr;
    if (check.exitCode !== 0) return { exitCode: check.exitCode, stdout, stderr };
  } else {
    stdout += "biome: no staged supported files\n";
  }

  const gritPaths = staged.filter((candidate) =>
    gritCandidateExtensions.has(path.extname(candidate))
  );
  if (gritPaths.length > 0) {
    const grit = run(["grit", "--json", "check", "--level", "error", ...gritPaths], {
      cwd: repoRoot,
      env: {
        GRIT_CACHE_DIR: path.join(repoRoot, ".grit", "cache"),
        GRIT_TELEMETRY_DISABLED: "true",
      },
    });
    stdout += section("grit check", grit.stdout);
    stderr += grit.stderr;
    if (grit.exitCode !== 0) return { exitCode: grit.exitCode, stdout, stderr };
    const report = parseGritJson(grit.stdout) ?? parseGritJson(grit.stderr);
    if (!report) {
      return {
        exitCode: 1,
        stdout,
        stderr: `${stderr}habitat hook pre-commit: could not parse Grit JSON output.\n`,
      };
    }
    if ((report.results?.length ?? 0) > 0) return { exitCode: 1, stdout, stderr };
  } else {
    stdout += "grit: no staged TypeScript/JavaScript files\n";
  }

  stdout += "habitat hook pre-commit: PASS\n";
  return { exitCode: 0, stdout, stderr };
}

function runPrePush(options: HookOptions): SpawnResult {
  const base = options.base ?? resolvePrePushBase();
  const result = run(
    [
      "nx",
      "affected",
      "-t",
      prePushTargets.join(","),
      "--base",
      base,
      "--head",
      "HEAD",
      "--outputStyle=static",
      "--excludeTaskDependencies",
    ],
    { cwd: repoRoot }
  );
  return {
    exitCode: result.exitCode,
    stdout: `habitat hook pre-push: nx affected base=${base}\n${result.stdout}`,
    stderr: result.stderr,
  };
}

function resolvePrePushBase(): string {
  const parent = graphiteParent();
  if (parent) return parent;
  return mergeBase("main") ?? "main";
}

function graphiteParent(): string | null {
  const info = run(["gt", "branch", "info", "--no-interactive"], { cwd: repoRoot });
  if (info.exitCode !== 0) return null;
  return info.stdout.match(/Parent:\s*([^\s]+)/)?.[1] ?? null;
}

function stagedPaths(): string[] {
  const result = run(["git", "diff", "--cached", "--name-status", "-z"], { cwd: repoRoot });
  if (result.exitCode !== 0 || !result.stdout) return [];
  const tokens = result.stdout.split("\0").filter(Boolean);
  const out: string[] = [];
  for (let i = 0; i < tokens.length; ) {
    const status = tokens[i++] ?? "";
    if (status.startsWith("R") || status.startsWith("C")) {
      const oldPath = tokens[i++];
      const newPath = tokens[i++];
      if (oldPath) out.push(oldPath);
      if (newPath) out.push(newPath);
      continue;
    }
    const file = tokens[i++];
    if (!file || status.startsWith("D")) continue;
    out.push(file);
  }
  return [...new Set(out.map(toRepoRelative))];
}

function unstagedAmong(paths: string[]): string[] {
  if (paths.length === 0) return [];
  const result = run(["git", "diff", "--name-only", "-z", "--", ...paths], { cwd: repoRoot });
  if (result.exitCode !== 0 || !result.stdout) return [];
  return result.stdout.split("\0").filter(Boolean).map(toRepoRelative);
}

function gitAdd(paths: string[]): SpawnResult {
  if (paths.length === 0) return { exitCode: 0, stdout: "", stderr: "" };
  return run(["git", "add", "--", ...paths], { cwd: repoRoot });
}

function fileHash(repoRelativePath: string): string | null {
  const absolute = path.join(repoRoot, repoRelativePath);
  if (!existsSync(absolute)) return null;
  return createHash("sha256").update(readFileSync(absolute)).digest("hex");
}

function parseGritJson(output: string): GritReport | undefined {
  const trimmed = output.trim();
  if (!trimmed) return undefined;
  for (const candidate of [
    trimmed,
    trimmed.slice(trimmed.indexOf("{"), trimmed.lastIndexOf("}") + 1),
  ]) {
    if (!candidate.startsWith("{") || !candidate.endsWith("}")) continue;
    try {
      return JSON.parse(candidate) as GritReport;
    } catch {
      // Grit can emit wrapper text around JSON; try the next candidate.
    }
  }
  return undefined;
}

function section(label: string, output: string): string {
  return output ? `\n[${label}]\n${output}` : "";
}

function isHookName(name: string | undefined): name is HookName {
  return name === "pre-commit" || name === "pre-push";
}
