import type { RuleFileLayerFacts } from "../rules/registry/index.js";
import type { HabitatDiagnostic } from "./diagnostics.js";
import {
  hostSurfaceProjectionForGeneratedZone,
  hostSurfaceProjectionForPath,
  renderHostRecoveryInstruction,
} from "./host-policy.js";
import { repoRoot } from "./paths.js";
import { run } from "./spawn.js";

type ForbiddenFileNameRule = Extract<RuleFileLayerFacts, { forbiddenFileNames: readonly string[] }>;

export interface FileLayerContext {
  staged?: boolean;
}

export function runGeneratedZoneRule(
  rule: RuleFileLayerFacts,
  context: FileLayerContext = {}
): { exitCode: number; diagnostics: HabitatDiagnostic[] } {
  if ("forbiddenFileNames" in rule) return runForbiddenFileNameRule(rule);
  const zone = hostSurfaceProjectionForGeneratedZone(rule.generatedZone);
  if (zone.declarationState !== "declared" || !zone.recovery) {
    return {
      exitCode: 1,
      diagnostics: [
        {
          ruleId: rule.id,
          path: ".",
          message: `Unknown generated zone '${rule.generatedZone}'.`,
          severity: "error",
          baselined: false,
        },
      ],
    };
  }
  if (!context.staged) return { exitCode: 0, diagnostics: [] };

  const recovery = zone.recovery;
  const staged = stagedPaths().filter(
    (candidate) =>
      hostSurfaceProjectionForPath(candidate).declarationId === zone.declarationId
  );
  const diagnostics = staged.map((stagedPath) => ({
    ruleId: rule.id,
    path: stagedPath,
    message: `${rule.message} ${renderHostRecoveryInstruction(recovery)}`,
    severity: rule.lane === "advisory" ? ("advisory" as const) : ("error" as const),
    baselined: false,
  }));
  return { exitCode: diagnostics.length > 0 ? 1 : 0, diagnostics };
}

function runForbiddenFileNameRule(rule: ForbiddenFileNameRule): {
  exitCode: number;
  diagnostics: HabitatDiagnostic[];
} {
  const forbidden = new Set(rule.forbiddenFileNames);
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
