import { existsSync, mkdirSync, readdirSync } from "node:fs";
import path from "node:path";
import type { HarnessRule } from "../rules/architecture.js";
import type { HabitatDiagnostic } from "./diagnostics.js";
import { repoRoot, toRepoRelative } from "./paths.js";
import { run, type SpawnResult } from "./spawn.js";

interface GritPosition {
  line?: number;
}

interface GritResult {
  check_id?: string;
  local_name?: string;
  path?: string;
  start?: GritPosition;
  extra?: {
    message?: string | null;
    severity?: string;
  };
}

interface GritReport {
  results?: GritResult[];
}

const gritScanPaths = [
  "packages",
  "apps/mapgen-studio/src",
  "mods/mod-swooper-maps/src/recipes",
  "mods/mod-swooper-maps/src/maps",
  "mods/mod-swooper-maps/src/domain",
].filter((scanPath) => existsSync(path.join(repoRoot, scanPath)));
const gritApplyScanPaths = discoverApplySourceRoots();
const gritApplyPatterns = [".grit/patterns/habitat/apply/deep_import_to_public_surface.md"];
const gritBin = path.join(
  repoRoot,
  "node_modules",
  ".bin",
  process.platform === "win32" ? "grit.cmd" : "grit"
);

let cachedReport: { stdout: string; stderr: string; exitCode: number; parsed?: GritReport } | null =
  null;

export function resetGritCacheForTests(): void {
  cachedReport = null;
}

export function runGritRule(rule: HarnessRule): {
  exitCode: number;
  diagnostics: HabitatDiagnostic[];
} {
  // `grit check --json` reports findings but exits 0. Habitat therefore runs
  // one native Grit scan per check process, then projects the shared JSON
  // report into rule-pack diagnostics so baselines and Nx gates remain real.
  const pattern = rule.gritPattern ?? rule.id;
  const report = loadGritReport();
  if (!report.parsed) {
    return {
      exitCode: 1,
      diagnostics: [
        {
          ruleId: rule.id,
          path: ".",
          message: `${rule.message}\n--- grit output ---\n${tail(report.stdout + report.stderr)}`,
          severity: rule.lane === "advisory" ? "advisory" : "error",
          baselined: false,
        },
      ],
    };
  }

  const diagnostics =
    report.parsed.results
      ?.filter(
        (result) => result.local_name === pattern || result.check_id?.includes(`#${pattern}/`)
      )
      .map((result) => ({
        ruleId: rule.id,
        path: normalizeGritPath(result.path),
        line: result.start?.line,
        message: result.extra?.message ?? rule.message,
        severity: rule.lane === "advisory" ? ("advisory" as const) : ("error" as const),
        baselined: false,
      })) ?? [];

  return { exitCode: diagnostics.length > 0 ? 1 : 0, diagnostics };
}

export function runGritApplyPatterns(options: { dryRun?: boolean } = {}): SpawnResult {
  const cacheDir = path.join(repoRoot, ".grit", "cache");
  mkdirSync(cacheDir, { recursive: true });
  let stdout = "";
  let stderr = "";
  for (const pattern of gritApplyPatterns) {
    const result = run(
      [
        gritBin,
        "apply",
        pattern,
        ...gritApplyScanPaths,
        "--force",
        "--output",
        "compact",
        ...(options.dryRun ? ["--dry-run"] : []),
      ],
      {
        cwd: repoRoot,
        env: {
          GRIT_CACHE_DIR: cacheDir,
          GRIT_TELEMETRY_DISABLED: "true",
        },
      }
    );
    stdout += result.stdout;
    stderr += result.stderr;
    if (result.exitCode !== 0) return { exitCode: result.exitCode, stdout, stderr };
  }
  return { exitCode: 0, stdout, stderr };
}

function loadGritReport(): NonNullable<typeof cachedReport> {
  if (cachedReport) return cachedReport;
  const cacheDir = path.join(repoRoot, ".grit", "cache");
  mkdirSync(cacheDir, { recursive: true });
  const result = run([gritBin, "--json", "check", "--level", "error", ...gritScanPaths], {
    cwd: repoRoot,
    env: {
      GRIT_CACHE_DIR: cacheDir,
      GRIT_TELEMETRY_DISABLED: "true",
    },
  });
  cachedReport = {
    ...result,
    parsed: parseGritJson(result.stdout) ?? parseGritJson(result.stderr),
  };
  return cachedReport;
}

function discoverApplySourceRoots(): string[] {
  return discoverSourceRoots(["mods"]).flatMap((sourceRoot) =>
    ["recipes", "maps"]
      .map((child) => `${sourceRoot}/${child}`)
      .filter((candidate) => existsSync(path.join(repoRoot, candidate)))
  );
}

function discoverSourceRoots(workspaceRoots: string[]): string[] {
  return workspaceRoots.flatMap((workspaceRoot) => {
    const fullRoot = path.join(repoRoot, workspaceRoot);
    if (!existsSync(fullRoot)) return [];
    return readdirSync(fullRoot, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => `${workspaceRoot}/${entry.name}/src`)
      .filter((sourceRoot) => existsSync(path.join(repoRoot, sourceRoot)));
  });
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
      // Keep trying; bunx and alpha Grit builds can print wrapper noise around JSON.
    }
  }
  return undefined;
}

function normalizeGritPath(gritPath: string | undefined): string {
  if (!gritPath) return ".";
  return toRepoRelative(gritPath.replace(/^\.\//, ""));
}

function tail(output: string): string {
  return output.trim().split("\n").slice(-16).join("\n");
}
