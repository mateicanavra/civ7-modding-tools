import { type Tree, writeJson } from "@nx/devkit";
import { Value } from "typebox/value";
import {
  baselineRepoPath,
  checkPatternRoot,
  ruleRegistryRepoPath,
} from "../../lib/artifact-paths.ts";
import { throwScaffoldRefusal } from "../scaffolding/refusal.ts";
import { type ScaffoldRefusal } from "../scaffolding/schema.ts";
import { candidateArtifactPaths } from "./paths.ts";
import {
  type NormalizedPatternGeneratorOptions,
  NormalizedPatternGeneratorOptionsSchema,
  type PatternGeneratorOptions,
  PatternGeneratorOptionsSchema,
} from "./schema.ts";

const rulesPath = ruleRegistryRepoPath;

export async function patternGenerator(
  tree: Tree,
  rawOptions: PatternGeneratorOptions
): Promise<void> {
  const options = normalizeOptions(rawOptions);
  validateNoActiveRegistrationCollision(tree, options);

  if (options.lifecycle !== "candidate") {
    throwScaffoldRefusal(registeredPromotionRefusal({ ...options, lifecycle: options.lifecycle }));
    return;
  }

  const candidatePaths = candidateArtifactPaths(options);
  if (tree.exists(candidatePaths.patternPath)) {
    throwScaffoldRefusal(candidateCollision(candidatePaths.patternPath));
  }
  if (tree.exists(candidatePaths.manifestPath)) {
    throwScaffoldRefusal(candidateCollision(candidatePaths.manifestPath));
  }

  tree.write(candidatePaths.patternPath, candidatePatternMarkdown(options));
  writeJson(tree, candidatePaths.manifestPath, candidateManifest(options, candidatePaths));
}

function normalizeOptions(rawOptions: PatternGeneratorOptions): NormalizedPatternGeneratorOptions {
  const parsed = Value.Parse(PatternGeneratorOptionsSchema, rawOptions);
  const ruleId = kebabLike(parsed.ruleId);
  const patternName = snakeLike(parsed.patternName ?? ruleId);
  return Value.Parse(NormalizedPatternGeneratorOptionsSchema, {
    ruleId,
    patternName,
    lifecycle: parsed.lifecycle ?? "candidate",
    identifier: identifierFor(patternName),
    ownerProject: parsed.ownerProject ?? "@internal/habitat-harness",
    openspecChangeId: parsed.openspecChangeId ?? "habitat-pattern-generator-metadata-repair",
    manifestPath: parsed.manifestPath,
  });
}

function validateNoActiveRegistrationCollision(
  tree: Tree,
  options: NormalizedPatternGeneratorOptions
): void {
  const activePatternPath = `${checkPatternRoot}/${options.patternName}.md`;
  const baselinePath = baselineRepoPath(options.ruleId);

  if (tree.exists(activePatternPath)) throwScaffoldRefusal(candidateCollision(activePatternPath));
  if (options.lifecycle === "candidate" && tree.exists(baselinePath)) {
    throwScaffoldRefusal(candidateCollision(baselinePath));
  }

  if (tree.exists(`${rulesPath}/${options.ruleId}/rule.json`)) {
    throwScaffoldRefusal(candidateCollision(`registered rule ${options.ruleId}`));
  }
}

export { candidateArtifactPaths } from "./paths.ts";

function candidateCollision(pathOrRule: string): Omit<ScaffoldRefusal, "kind" | "writeSet"> {
  return {
    blockedAction: `draft pattern candidate '${pathOrRule}'`,
    requestClass: "pattern-candidate-draft",
    reason: "candidate-collision",
    recovery: `Choose a rule id or pattern name that does not collide with ${pathOrRule}.`,
    retryCondition: "Retry after choosing a non-colliding candidate identity.",
  };
}

function registeredPromotionRefusal(
  options: NormalizedPatternGeneratorOptions & {
    lifecycle: "registered-advisory" | "registered-enforced";
  }
): Omit<ScaffoldRefusal, "kind" | "writeSet"> {
  const hasManifest = Boolean(options.manifestPath);
  return {
    blockedAction: `register pattern '${options.ruleId}'`,
    requestClass: "active-pattern-registration",
    reason: hasManifest ? "registered-manifest-rejected" : "registered-manifest-missing",
    recovery: hasManifest
      ? `Pattern registration for '${options.ruleId}' must run through pattern management, not the candidate generator.`
      : `Pattern registration for '${options.ruleId}' requires an accepted pattern manifest and a pattern management promotion surface.`,
    retryCondition:
      "Retry after pattern management accepts the required manifest and baseline inputs.",
  };
}

function candidateManifest(
  options: NormalizedPatternGeneratorOptions,
  paths: ReturnType<typeof candidateArtifactPaths>
) {
  return {
    schemaVersion: 1,
    ruleId: options.ruleId,
    patternName: options.patternName,
    lifecycle: "candidate",
    openspecChangeId: options.openspecChangeId,
    ownerProject: options.ownerProject,
    ownerTool: "pattern-check",
    candidateArtifacts: {
      patternPath: paths.patternPath,
      manifestPath: paths.manifestPath,
    },
    registration: {
      accepted: false,
      reason:
        "candidate-only generation: not a Habitat rule, not an active Grit check, and not baselined",
    },
    requiredForRegistration: [
      "accepted source",
      "concrete scan roots and exclusions",
      "fixture strategy",
      "false-positive model",
      "current-tree scan result",
      "baseline rule-introduction manifest",
      "apply-safety disposition",
    ],
  };
}

function candidatePatternMarkdown(options: NormalizedPatternGeneratorOptions): string {
  return `---\nlevel: info\ntags:\n  - habitat-candidate\n---\n# ${titleize(options.ruleId)} Candidate\n\nThis file is a non-enforcing Habitat candidate pattern draft. It is not loaded by the active Habitat pattern catalog, is not registered as a rule, and is not baselined.\n\n\`\`\`grit\nlanguage js(typescript)\n\n\`${options.identifier}($value)\`\n\`\`\`\n\n## Matches fixture draft\n\n\`\`\`typescript\n${options.identifier}(\"violation\");\n\`\`\`\n\n\`\`\`typescript\n${options.identifier}(\"violation\");\n\`\`\`\n\n## Ignores fixture draft\n\n\`\`\`typescript\nconst allowed = \"${options.identifier}\";\n\`\`\`\n`;
}

function kebabLike(value: unknown): string {
  const slug = String(value ?? "")
    .trim()
    .replace(/_/g, "-")
    .replace(/[^a-zA-Z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
  if (!slug) throw new Error("ruleId must contain at least one alphanumeric character.");
  return slug;
}

function snakeLike(value: unknown): string {
  return kebabLike(value).replace(/-/g, "_");
}

function identifierFor(value: unknown): string {
  return `__habitat_forbidden_${snakeLike(value)}`.replace(/[^a-zA-Z0-9_]/g, "_");
}

function titleize(value: unknown): string {
  return kebabLike(value)
    .split("-")
    .map((part) => part.slice(0, 1).toUpperCase() + part.slice(1))
    .join(" ");
}

export default patternGenerator;
