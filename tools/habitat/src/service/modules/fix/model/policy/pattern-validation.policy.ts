import { Value } from "typebox/value";
import {
  type PatternLifecycle,
  type PatternManifest,
  PatternManifestSchema,
  type PatternRuleReferenceInput,
  type PatternValidationFailureReason,
  type PatternValidationIssue,
} from "../dto/pattern-management.schema.js";
import { patternCandidateRoot, patternManifestPath } from "./pattern-artifact-paths.policy.js";

export interface PatternRulePackReferenceInput {
  id: string;
  patternName?: string;
  manifestPath?: string;
  ownerTool?: string;
  lane?: "advisory" | "enforced";
}

export interface PatternValidationOptions {
  manifestPath?: string;
  ruleReferences?: readonly PatternRuleReferenceInput[];
  requireRuleReference?: boolean;
}

export type PatternValidationResult =
  | {
      ok: true;
      manifest: PatternManifest;
      state: PatternLifecycle;
      registrationAccepted: boolean;
    }
  | {
      ok: false;
      issues: PatternValidationIssue[];
    };

const placeholderFragments = [
  "candidate-draft",
  "generated scaffold",
  "generated rule scaffold",
  "generated scaffold scope",
  "generated scaffold forbidden shape",
  "replace with",
  "source scope",
  "forbidden shape",
  "architectural rationale",
  "diagnostic message",
  "todo",
  "tbd",
  "placeholder",
];

export function validatePatternManifest(
  value: unknown,
  options: PatternValidationOptions = {}
): PatternValidationResult {
  if (value == null) {
    return {
      ok: false,
      issues: [
        issue(
          "missing-manifest",
          options.manifestPath ?? "<manifest>",
          "pattern manifest is required before pattern management can evaluate admission."
        ),
      ],
    };
  }

  const issues = preSchemaIssues(value);
  for (const error of Value.Errors(PatternManifestSchema, value)) {
    issues.push(
      issue(
        "malformed-manifest",
        error.instancePath || "<manifest>",
        error.message || "pattern manifest does not match the schema."
      )
    );
  }
  if (issues.length > 0) return { ok: false, issues };

  const manifest = Value.Parse(PatternManifestSchema, value);
  issues.push(...semanticIssues(manifest, options));
  if (issues.length > 0) return { ok: false, issues };

  return {
    ok: true,
    manifest,
    state: manifest.lifecycle,
    registrationAccepted: false,
  };
}

function preSchemaIssues(value: unknown): PatternValidationIssue[] {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return [issue("malformed-manifest", "<manifest>", "pattern manifest must be a JSON object.")];
  }

  const record = value as Record<string, unknown>;
  const issues: PatternValidationIssue[] = [];
  if (looksLikeGritOnlyAuthority(record)) {
    issues.push(
      issue(
        "metadata-only",
        "<manifest>",
        "Grit frontmatter or prose is not Habitat pattern metadata."
      )
    );
  }
  if (looksLikeNxOptionsOnlyAuthority(record)) {
    issues.push(
      issue(
        "nx-options-only",
        "<manifest>",
        "Nx generator options are command input only and are not accepted Habitat pattern metadata."
      )
    );
  }
  return issues;
}

function semanticIssues(
  manifest: PatternManifest,
  options: PatternValidationOptions
): PatternValidationIssue[] {
  const issues: PatternValidationIssue[] = [];
  checkManifestStorage(manifest, options, issues);
  checkPlaceholderContent(manifest, issues);

  if (manifest.lifecycle === "candidate") return issues;

  checkRegisteredContradictions(manifest, issues);
  checkRuleReference(manifest, options, issues);
  return issues;
}

function checkManifestStorage(
  manifest: PatternManifest,
  options: PatternValidationOptions,
  issues: PatternValidationIssue[]
) {
  if (!options.manifestPath) return;
  if (manifest.lifecycle === "candidate") {
    if (!options.manifestPath.startsWith(`${patternCandidateRoot}/`)) {
      issues.push(
        issue(
          "contradicted-manifest",
          "manifestPath",
          "Candidate pattern manifests must be stored under the candidate artifact root."
        )
      );
    }
    return;
  }

  const expectedPath = patternManifestPath(manifest.ruleId);
  if (options.manifestPath !== expectedPath) {
    issues.push(
      issue(
        "contradicted-manifest",
        "manifestPath",
        `Registered pattern manifest must be stored at '${expectedPath}'.`
      )
    );
  }
}

function checkRegisteredContradictions(
  manifest: Extract<PatternManifest, { lifecycle: "registered-advisory" | "registered-enforced" }>,
  issues: PatternValidationIssue[]
) {
  if (manifest.currentTreeScan.resultClass === "findings-block-registration") {
    issues.push(
      issue(
        "contradicted-manifest",
        "currentTreeScan.resultClass",
        "A current-tree scan that blocks registration cannot be accepted as a registered manifest."
      )
    );
  }
  if (manifest.baselineContract.baselineAction === "blocked") {
    issues.push(
      issue(
        "baseline-contract-rejected",
        "baselineContract.baselineAction",
        "A blocked baseline action cannot be accepted as a registered manifest."
      )
    );
  }
  if (manifest.ownerTool === "source-check" && manifest.applySafety.kind === "apply") {
    issues.push(
      issue(
        "apply-safety-contradicted",
        "applySafety.kind",
        "source-check manifests must not request apply admission."
      )
    );
  }
  if (manifest.ownerTool === "pattern-apply" && manifest.applySafety.kind === "not-apply") {
    issues.push(
      issue(
        "apply-safety-missing",
        "applySafety.kind",
        "pattern-apply manifests must include apply admission inputs."
      )
    );
  }
}

function checkRuleReference(
  manifest: Extract<PatternManifest, { lifecycle: "registered-advisory" | "registered-enforced" }>,
  options: PatternValidationOptions,
  issues: PatternValidationIssue[]
) {
  if (!options.requireRuleReference) return;
  const reference = options.ruleReferences?.find(
    (candidate) => candidate.ruleId === manifest.ruleId
  );
  if (!reference) {
    issues.push(
      issue(
        "orphan-manifest",
        "ruleId",
        `Registered manifest '${manifest.ruleId}' has no matching rule-pack reference.`
      )
    );
    return;
  }

  for (const field of ["patternName", "manifestPath", "ownerTool", "lifecycle"] as const) {
    if (!reference[field]) {
      issues.push(
        issue(
          "orphan-manifest",
          `ruleReferences.${field}`,
          `Registered rule-pack reference for '${manifest.ruleId}' must include a ${field}.`
        )
      );
    }
  }

  if (reference.patternName && reference.patternName !== manifest.patternName) {
    issues.push(
      issue(
        "contradicted-manifest",
        "patternName",
        `Manifest pattern '${manifest.patternName}' does not match rule-pack pattern '${reference.patternName}'.`
      )
    );
  }
  if (
    options.manifestPath &&
    reference.manifestPath &&
    reference.manifestPath !== options.manifestPath
  ) {
    issues.push(
      issue(
        "contradicted-manifest",
        "manifestPath",
        `Manifest path '${options.manifestPath}' does not match rule-pack reference '${reference.manifestPath}'.`
      )
    );
  }
  const expectedPath = patternManifestPath(manifest.ruleId);
  if (reference.manifestPath && reference.manifestPath !== expectedPath) {
    issues.push(
      issue(
        "contradicted-manifest",
        "ruleReferences.manifestPath",
        `Rule-pack reference for '${manifest.ruleId}' must point at '${expectedPath}'.`
      )
    );
  }
  if (reference.ownerTool && reference.ownerTool !== manifest.ownerTool) {
    issues.push(
      issue(
        "contradicted-manifest",
        "ownerTool",
        `Manifest ownerTool '${manifest.ownerTool}' does not match rule-pack ownerTool '${reference.ownerTool}'.`
      )
    );
  }
  if (
    (manifest.lifecycle === "registered-advisory" && reference.lifecycle !== "advisory") ||
    (manifest.lifecycle === "registered-enforced" && reference.lifecycle !== "enforced")
  ) {
    issues.push(
      issue(
        "contradicted-manifest",
        "lifecycle",
        `Manifest lifecycle '${manifest.lifecycle}' does not match rule-pack lane '${reference.lifecycle}'.`
      )
    );
  }
}

function checkPlaceholderContent(
  value: unknown,
  issues: PatternValidationIssue[],
  path = "<manifest>"
) {
  if (typeof value === "string") {
    if (isPlaceholderText(value)) {
      issues.push(
        issue("placeholder-manifest", path, `${path} contains placeholder manifest text.`)
      );
    }
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((entry, index) => checkPlaceholderContent(entry, issues, `${path}.${index}`));
    return;
  }
  if (typeof value === "object" && value !== null) {
    for (const [key, entry] of Object.entries(value)) {
      checkPlaceholderContent(entry, issues, path === "<manifest>" ? key : `${path}.${key}`);
    }
  }
}

function issue(
  reason: PatternValidationFailureReason,
  path: string,
  message: string
): PatternValidationIssue {
  return { reason, path, message };
}

function isPlaceholderText(value: string): boolean {
  const lower = value.trim().toLowerCase();
  return placeholderFragments.some((fragment) => lower.includes(fragment));
}

function looksLikeGritOnlyAuthority(value: Record<string, unknown>): boolean {
  const hasGritMetadata =
    "frontmatter" in value || "gritFrontmatter" in value || "markdown" in value;
  return hasGritMetadata && !("normativeSources" in value);
}

function looksLikeNxOptionsOnlyAuthority(value: Record<string, unknown>): boolean {
  return (
    "ruleId" in value &&
    "patternName" in value &&
    ("scope" in value || "forbids" in value || "why" in value || "message" in value) &&
    !("normativeSources" in value)
  );
}
