import { Value } from "typebox/value";
import { productAuthoringFields, productAuthoringRefusal, scaffoldRefusal } from "./refusals.ts";
import {
  type NormalizedPatternScaffoldOptions,
  NormalizedPatternScaffoldOptionsSchema,
  type ScaffoldRefusal,
} from "./schema.ts";

export interface PatternScaffoldOptions {
  readonly ruleId: string;
  readonly ownerProject?: string;
  readonly patternName?: string;
  readonly lifecycle?: "candidate" | "registered-advisory" | "registered-enforced";
  readonly openspecChangeId?: string;
  readonly manifestPath?: string;
}

export type PatternScaffoldDecision =
  | {
      readonly kind: "refuse-scaffold";
      readonly refusal: ScaffoldRefusal;
    }
  | {
      readonly kind: "write-pattern-candidate";
      readonly options: NormalizedPatternScaffoldOptions;
      readonly paths: PatternCandidateArtifactPaths;
      readonly writeSet: readonly string[];
    };

export interface PatternCandidateArtifactPaths {
  readonly patternPath: string;
  readonly manifestPath: string;
}

export interface PatternScaffoldHostFacts {
  readonly pathExists: (path: string) => boolean;
  readonly activePatternPath: (
    options: Pick<NormalizedPatternScaffoldOptions, "patternName">
  ) => string;
  readonly activeBaselinePath: (
    options: Pick<NormalizedPatternScaffoldOptions, "ruleId">
  ) => string;
  readonly registeredRulePath: (
    options: Pick<NormalizedPatternScaffoldOptions, "ruleId">
  ) => string;
  readonly candidateArtifactPaths: (
    options: Pick<NormalizedPatternScaffoldOptions, "ruleId" | "patternName">
  ) => PatternCandidateArtifactPaths;
}

export function decidePatternScaffold(
  rawOptions: PatternScaffoldOptions,
  facts: PatternScaffoldHostFacts
): PatternScaffoldDecision {
  const authoringFields = productAuthoringFields(rawOptions);
  if (authoringFields.length > 0) {
    return {
      kind: "refuse-scaffold",
      refusal: productAuthoringRefusal({ surface: "pattern", fields: authoringFields }),
    };
  }

  const options = normalizePatternScaffoldOptions(rawOptions);
  const activeCollision = firstActiveCollision(options, facts);
  if (activeCollision) return activeCollision;

  if (options.lifecycle !== "candidate") {
    return {
      kind: "refuse-scaffold",
      refusal: registeredPromotionRefusal({ ...options, lifecycle: options.lifecycle }),
    };
  }

  const paths = facts.candidateArtifactPaths(options);
  const candidateCollisionDecision = firstCandidateCollision(paths, facts);
  if (candidateCollisionDecision) return candidateCollisionDecision;

  return {
    kind: "write-pattern-candidate",
    options,
    paths,
    writeSet: [paths.patternPath, paths.manifestPath],
  };
}

export function normalizePatternScaffoldOptions(
  rawOptions: PatternScaffoldOptions
): NormalizedPatternScaffoldOptions {
  const ruleId = kebabLike(rawOptions.ruleId);
  const patternName = snakeLike(rawOptions.patternName ?? ruleId);
  return Value.Parse(NormalizedPatternScaffoldOptionsSchema, {
    ruleId,
    patternName,
    lifecycle: rawOptions.lifecycle ?? "candidate",
    identifier: identifierFor(patternName),
    ownerProject: rawOptions.ownerProject ?? "@habitat/cli",
    openspecChangeId: rawOptions.openspecChangeId ?? "habitat-pattern-generator-metadata-repair",
    ...(rawOptions.manifestPath ? { manifestPath: rawOptions.manifestPath } : {}),
  });
}

export function candidateManifest(
  options: NormalizedPatternScaffoldOptions,
  paths: PatternCandidateArtifactPaths
) {
  return {
    schemaVersion: 1,
    ruleId: options.ruleId,
    patternName: options.patternName,
    lifecycle: "candidate",
    openspecChangeId: options.openspecChangeId,
    ownerProject: options.ownerProject,
    ownerTool: "source-check",
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

export function candidatePatternMarkdown(options: NormalizedPatternScaffoldOptions): string {
  return `---\nlevel: info\ntags:\n  - habitat-candidate\n---\n# ${titleize(options.ruleId)} Candidate\n\nThis file is a non-enforcing Habitat candidate pattern draft. It is not loaded by the active Habitat pattern catalog, is not registered as a rule, and is not baselined.\n\n\`\`\`grit\nlanguage js(typescript)\n\n\`${options.identifier}($value)\`\n\`\`\`\n\n## Matches fixture draft\n\n\`\`\`typescript\n${options.identifier}(\"violation\");\n\`\`\`\n\n\`\`\`typescript\n${options.identifier}(\"violation\");\n\`\`\`\n\n## Ignores fixture draft\n\n\`\`\`typescript\nconst allowed = \"${options.identifier}\";\n\`\`\`\n`;
}

function firstActiveCollision(
  options: NormalizedPatternScaffoldOptions,
  facts: PatternScaffoldHostFacts
): PatternScaffoldDecision | null {
  const activePatternPath = facts.activePatternPath(options);
  const baselinePath = facts.activeBaselinePath(options);
  if (facts.pathExists(activePatternPath)) return refuseCandidateCollision(activePatternPath);
  if (options.lifecycle === "candidate" && facts.pathExists(baselinePath)) {
    return refuseCandidateCollision(baselinePath);
  }
  if (facts.pathExists(facts.registeredRulePath(options))) {
    return refuseCandidateCollision(`registered rule ${options.ruleId}`);
  }
  return null;
}

function firstCandidateCollision(
  paths: PatternCandidateArtifactPaths,
  facts: PatternScaffoldHostFacts
): PatternScaffoldDecision | null {
  if (facts.pathExists(paths.patternPath)) return refuseCandidateCollision(paths.patternPath);
  if (facts.pathExists(paths.manifestPath)) return refuseCandidateCollision(paths.manifestPath);
  return null;
}

function refuseCandidateCollision(pathOrRule: string): PatternScaffoldDecision {
  return {
    kind: "refuse-scaffold",
    refusal: scaffoldRefusal({
      blockedAction: `draft pattern candidate '${pathOrRule}'`,
      requestClass: "pattern-candidate-draft",
      reason: "candidate-collision",
      recovery: `Choose a rule id or pattern name that does not collide with ${pathOrRule}.`,
      retryCondition: "Retry after choosing a non-colliding candidate identity.",
    }),
  };
}

function registeredPromotionRefusal(
  options: NormalizedPatternScaffoldOptions & {
    lifecycle: "registered-advisory" | "registered-enforced";
  }
): ScaffoldRefusal {
  const hasManifest = Boolean(options.manifestPath);
  return scaffoldRefusal({
    blockedAction: `register pattern '${options.ruleId}'`,
    requestClass: "active-pattern-registration",
    reason: hasManifest ? "registered-manifest-rejected" : "registered-manifest-missing",
    recovery: hasManifest
      ? `Pattern registration for '${options.ruleId}' must run through pattern management, not the candidate generator.`
      : `Pattern registration for '${options.ruleId}' requires an accepted pattern manifest and a pattern management promotion surface.`,
    retryCondition:
      "Retry after pattern management accepts the required manifest and baseline inputs.",
  });
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
