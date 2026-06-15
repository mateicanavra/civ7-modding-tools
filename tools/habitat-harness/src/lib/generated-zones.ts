import type { HarnessRule } from "../rules/architecture.js";
import type { HabitatDiagnostic } from "./diagnostics.js";
import { repoRoot } from "./paths.js";
import { run } from "./spawn.js";

export interface FileLayerContext {
  staged?: boolean;
}

interface GeneratedZone {
  id: string;
  kind: "prefix" | "exact";
  path: string;
  remediation: string;
}

export const generatedZones: GeneratedZone[] = [
  {
    id: "swooper-map-generated",
    kind: "prefix",
    path: "mods/mod-swooper-maps/src/maps/generated/",
    remediation: "Run `nx run mod-swooper-maps:gen:maps` and commit the generated output.",
  },
  {
    id: "civ7-types-generated",
    kind: "prefix",
    path: "packages/civ7-types/generated/",
    remediation:
      "Regenerate through the external Civ7 resources workflow; this repo cannot regenerate those types in CI.",
  },
  {
    id: "civ7-map-policy-tables",
    kind: "exact",
    path: "packages/civ7-map-policy/src/civ7-tables.gen.ts",
    remediation: "Run `nx run @civ7/map-policy:verify -- --write` and commit the generated table.",
  },
];

export function runGeneratedZoneRule(
  rule: HarnessRule,
  context: FileLayerContext = {}
): { exitCode: number; diagnostics: HabitatDiagnostic[] } {
  if (!context.staged) return { exitCode: 0, diagnostics: [] };
  if (rule.forbiddenFileNames) return runForbiddenFileNameRule(rule);
  const zone = generatedZones.find((candidate) => candidate.id === rule.generatedZone);
  if (!zone) {
    return {
      exitCode: 1,
      diagnostics: [
        {
          ruleId: rule.id,
          path: ".",
          message: `Unknown generated zone '${rule.generatedZone ?? "(missing)"}'.`,
          severity: "error",
          baselined: false,
        },
      ],
    };
  }

  const staged = stagedPaths().filter((candidate) => matchesZone(zone, candidate));
  const diagnostics = staged.map((stagedPath) => ({
    ruleId: rule.id,
    path: stagedPath,
    message: `${rule.message} ${zone.remediation}`,
    severity: rule.lane === "advisory" ? ("advisory" as const) : ("error" as const),
    baselined: false,
  }));
  return { exitCode: diagnostics.length > 0 ? 1 : 0, diagnostics };
}

function runForbiddenFileNameRule(rule: HarnessRule): {
  exitCode: number;
  diagnostics: HabitatDiagnostic[];
} {
  const forbidden = new Set(rule.forbiddenFileNames ?? []);
  const staged = stagedPaths().filter((candidate) =>
    forbidden.has(candidate.split("/").at(-1) ?? "")
  );
  const diagnostics = staged.map((stagedPath) => ({
    ruleId: rule.id,
    path: stagedPath,
    message: rule.message,
    severity: rule.lane === "advisory" ? ("advisory" as const) : ("error" as const),
    baselined: false,
  }));
  return { exitCode: diagnostics.length > 0 ? 1 : 0, diagnostics };
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
    if (file) out.push(file);
  }
  return [...new Set(out)];
}

function matchesZone(zone: GeneratedZone, candidate: string): boolean {
  if (zone.kind === "exact") return candidate === zone.path;
  return candidate.startsWith(zone.path);
}
