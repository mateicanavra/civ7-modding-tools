import { writeJson, type Tree } from "@nx/devkit";
import { Effect } from "effect";
import { type Static, Type } from "typebox";
import { Value } from "typebox/value";
import { runHabitatEffect } from "../../lib/effect-runtime.js";
import { parseRuleRegistryText } from "../../rules/registry/load.js";
import {
  makeNxTreePatternPromotionStoreLayer,
  registeredPatternPromotionProgram,
} from "./registration.js";

const PatternLifecycleSchema = Type.Union([
  Type.Literal("candidate"),
  Type.Literal("registered-advisory"),
  Type.Literal("registered-enforced"),
]);
type PatternLifecycle = Static<typeof PatternLifecycleSchema>;

const PatternGeneratorOptionsSchema = Type.Object(
  {
    ruleId: Type.String({ minLength: 1 }),
    ownerProject: Type.Optional(Type.String({ minLength: 1 })),
    patternName: Type.Optional(Type.String({ minLength: 1 })),
    lifecycle: Type.Optional(PatternLifecycleSchema),
    openspecChangeId: Type.Optional(Type.String({ minLength: 1 })),
    manifestPath: Type.Optional(Type.String({ minLength: 1 })),
  },
  { additionalProperties: true }
);
type PatternGeneratorOptions = Static<typeof PatternGeneratorOptionsSchema>;

interface NormalizedPatternGeneratorOptions {
  ruleId: string;
  patternName: string;
  lifecycle: PatternLifecycle;
  identifier: string;
  ownerProject: string;
  openspecChangeId: string;
  manifestPath?: string;
}

export async function patternGenerator(
  tree: Tree,
  rawOptions: PatternGeneratorOptions
): Promise<void> {
  const options = normalizeOptions(rawOptions);
  validateNoActiveRegistrationCollision(tree, options);

  if (options.lifecycle !== "candidate") {
    const registeredOptions: NormalizedPatternGeneratorOptions & {
      lifecycle: "registered-advisory" | "registered-enforced";
    } = { ...options, lifecycle: options.lifecycle };
    await promoteRegisteredPattern(tree, registeredOptions);
    return;
  }

  const candidatePaths = candidateArtifactPaths(options);
  if (tree.exists(candidatePaths.patternPath)) {
    throw new Error(`Pattern candidate already exists: ${candidatePaths.patternPath}`);
  }
  if (tree.exists(candidatePaths.manifestPath)) {
    throw new Error(
      `Pattern Authority Manifest candidate already exists: ${candidatePaths.manifestPath}`
    );
  }

  tree.write(candidatePaths.patternPath, candidatePatternMarkdown(options));
  writeJson(tree, candidatePaths.manifestPath, candidateManifest(options, candidatePaths));
}

function normalizeOptions(
  rawOptions: PatternGeneratorOptions
): NormalizedPatternGeneratorOptions {
  const parsed = Value.Parse(PatternGeneratorOptionsSchema, rawOptions);
  const ruleId = kebabLike(parsed.ruleId);
  const patternName = snakeLike(parsed.patternName ?? ruleId.replace(/^grit-/, ""));
  return {
    ruleId,
    patternName,
    lifecycle: parsed.lifecycle ?? "candidate",
    identifier: identifierFor(patternName),
    ownerProject: parsed.ownerProject ?? "@internal/habitat-harness",
    openspecChangeId: parsed.openspecChangeId ?? "habitat-pattern-generator-metadata-repair",
    manifestPath: parsed.manifestPath,
  };
}

async function promoteRegisteredPattern(
  tree: Tree,
  options: NormalizedPatternGeneratorOptions & {
    lifecycle: "registered-advisory" | "registered-enforced";
  }
): Promise<void> {
  const program = registeredPatternPromotionProgram(options).pipe(
    Effect.provide(makeNxTreePatternPromotionStoreLayer(tree))
  );
  try {
    await runHabitatEffect(program);
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : String(error));
  }
}

function validateNoActiveRegistrationCollision(
  tree: Tree,
  options: NormalizedPatternGeneratorOptions
): void {
  const activePatternPath = `.grit/patterns/habitat/checks/${options.patternName}.md`;
  const baselinePath = `tools/habitat-harness/baselines/${options.ruleId}.json`;
  const rulesPath = "tools/habitat-harness/src/rules/rules.json";

  if (tree.exists(activePatternPath))
    throw new Error(`Grit pattern already exists: ${activePatternPath}`);
  if (options.lifecycle === "candidate" && tree.exists(baselinePath))
    throw new Error(`Baseline already exists: ${baselinePath}`);

  const rulesText = tree.read(rulesPath, "utf8");
  if (rulesText === null) throw new Error(`Habitat rule registry is missing: ${rulesPath}`);
  const rulesParse = parseRuleRegistryText(rulesText, rulesPath);
  if (!rulesParse.ok) {
    throw new Error(
      `Habitat rule registry is invalid:\n${rulesParse.issues
        .map((issue) => `- ${issue.path}: ${issue.message}`)
        .join("\n")}`
    );
  }
  const rulesJson = rulesParse.document;
  if (rulesJson.rules.some((rule) => rule.id === options.ruleId)) {
    throw new Error(`Habitat rule already exists: ${options.ruleId}`);
  }
}

export function candidateArtifactPaths(
  options: Pick<NormalizedPatternGeneratorOptions, "ruleId" | "patternName">
) {
  const root = "tools/habitat-harness/src/rules/pattern-authority/candidates";
  return {
    patternPath: `${root}/${options.patternName}.md`,
    manifestPath: `${root}/${options.ruleId}.json`,
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
    ownerTool: "grit-check",
    candidateArtifacts: {
      patternPath: paths.patternPath,
      manifestPath: paths.manifestPath,
    },
    registration: {
      accepted: false,
      reason:
        "candidate-only generation: not a Habitat rule, not an active Grit check, not hook-scoped, and not baselined",
    },
    requiredForRegistration: [
      "accepted authority source",
      "concrete scan roots and exclusions",
      "fixture strategy",
      "false-positive model",
      "current-tree scan result",
      "baseline rule-introduction manifest",
      "apply-safety disposition",
      "hook-scope decision",
    ],
  };
}

function candidatePatternMarkdown(options: NormalizedPatternGeneratorOptions): string {
  return `---\nlevel: info\ntags:\n  - habitat-candidate\n---\n# ${titleize(options.ruleId)} Candidate\n\nThis file is a non-enforcing Habitat candidate pattern draft. It is not loaded by the active Habitat Grit check catalog, is not registered in \`rules.json\`, and has no baseline or hook scope.\n\n\`\`\`grit\nlanguage js(typescript)\n\n\`${options.identifier}($value)\`\n\`\`\`\n\n## Matches fixture draft\n\n\`\`\`typescript\n${options.identifier}(\"violation\");\n\`\`\`\n\n\`\`\`typescript\n${options.identifier}(\"violation\");\n\`\`\`\n\n## Ignores fixture draft\n\n\`\`\`typescript\nconst allowed = \"${options.identifier}\";\n\`\`\`\n`;
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
