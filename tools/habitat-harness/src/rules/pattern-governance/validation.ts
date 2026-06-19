import { Value } from "typebox/value";
import {
  type PatternAuthorityLifecycle,
  type PatternAuthorityManifest,
  PatternAuthorityManifestSchema,
  type PatternAuthorityRuleReferenceInput,
  type PatternAuthorityValidationFailureReason,
  type PatternAuthorityValidationIssue,
} from "./schema.js";
import { patternAuthorityCandidateRoot, patternAuthorityManifestPath } from "./paths.js";

export interface PatternAuthorityRulePackReferenceInput {
  id: string;
  gritPattern?: string;
  manifestPath?: string;
  ownerTool?: string;
  lane?: "advisory" | "enforced";
}

export interface PatternAuthorityValidationOptions {
  manifestPath?: string;
  ruleReferences?: readonly PatternAuthorityRuleReferenceInput[];
  requireRuleReference?: boolean;
}

export type PatternAuthorityValidationResult =
  | {
      ok: true;
      manifest: PatternAuthorityManifest;
      state: PatternAuthorityLifecycle;
      authorityAccepted: boolean;
    }
  | {
      ok: false;
      issues: PatternAuthorityValidationIssue[];
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

export function validatePatternAuthorityManifest(
  value: unknown,
  options: PatternAuthorityValidationOptions = {}
): PatternAuthorityValidationResult {
  if (value == null) {
    return {
      ok: false,
      issues: [
        issue(
          "missing-manifest",
          options.manifestPath ?? "<manifest>",
          "Pattern Authority Manifest is required before pattern governance can evaluate admission."
        ),
      ],
    };
  }

  const issues = preSchemaIssues(value);
  for (const error of Value.Errors(PatternAuthorityManifestSchema, value)) {
    issues.push(
      issue(
        "malformed-manifest",
        error.instancePath || "<manifest>",
        error.message || "Pattern Authority Manifest does not match the schema."
      )
    );
  }
  if (issues.length > 0) return { ok: false, issues };

  const manifest = Value.Parse(PatternAuthorityManifestSchema, value);
  issues.push(...semanticIssues(manifest, options));
  if (issues.length > 0) return { ok: false, issues };

  return {
    ok: true,
    manifest,
    state: manifest.lifecycle,
    authorityAccepted: false,
  };
}

function preSchemaIssues(value: unknown): PatternAuthorityValidationIssue[] {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return [issue("malformed-manifest", "<manifest>", "Pattern Authority Manifest must be a JSON object.")];
  }

  const record = value as Record<string, unknown>;
  const issues: PatternAuthorityValidationIssue[] = [];
  if (looksLikeGritOnlyAuthority(record)) {
    issues.push(
      issue(
        "grit-metadata-only",
        "<manifest>",
        "Grit frontmatter or prose is not Habitat authority metadata."
      )
    );
  }
  if (looksLikeNxOptionsOnlyAuthority(record)) {
    issues.push(
      issue(
        "nx-options-only",
        "<manifest>",
        "Nx generator options are command input only and are not accepted Habitat authority metadata."
      )
    );
  }
  return issues;
}

function semanticIssues(
  manifest: PatternAuthorityManifest,
  options: PatternAuthorityValidationOptions
): PatternAuthorityValidationIssue[] {
  const issues: PatternAuthorityValidationIssue[] = [];
  checkManifestStorage(manifest, options, issues);
  checkPlaceholderContent(manifest, issues);

  if (manifest.lifecycle === "candidate") return issues;

  checkRegisteredContradictions(manifest, issues);
  checkRuleReference(manifest, options, issues);
  return issues;
}

function checkManifestStorage(
  manifest: PatternAuthorityManifest,
  options: PatternAuthorityValidationOptions,
  issues: PatternAuthorityValidationIssue[]
) {
  if (!options.manifestPath) return;
  if (manifest.lifecycle === "candidate") {
    if (!options.manifestPath.startsWith(`${patternAuthorityCandidateRoot}/`)) {
      issues.push(
        issue(
          "contradicted-manifest",
          "manifestPath",
          "Candidate Pattern Authority Manifests must be stored under the candidate artifact root."
        )
      );
    }
    return;
  }

  const expectedPath = patternAuthorityManifestPath(manifest.ruleId);
  if (options.manifestPath !== expectedPath) {
    issues.push(
      issue(
        "contradicted-manifest",
        "manifestPath",
        `Registered Pattern Authority Manifest must be stored at '${expectedPath}'.`
      )
    );
  }
}

function checkRegisteredContradictions(
  manifest: Extract<PatternAuthorityManifest, { lifecycle: "registered-advisory" | "registered-enforced" }>,
  issues: PatternAuthorityValidationIssue[]
) {
  if (manifest.lifecycle !== "registered-enforced" && manifest.hookScope.decision === "pre-commit") {
    issues.push(
      issue(
        "contradicted-manifest",
        "hookScope.decision",
        "Pre-commit local-feedback admission requires a registered-enforced manifest lifecycle."
      )
    );
  }
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
  if (manifest.ownerTool === "grit-check" && manifest.applySafety.kind === "apply") {
    issues.push(
      issue(
        "apply-safety-contradicted",
        "applySafety.kind",
        "grit-check manifests must not request apply admission."
      )
    );
  }
  if (manifest.ownerTool === "grit-apply" && manifest.applySafety.kind === "not-apply") {
    issues.push(
      issue(
        "apply-safety-missing",
        "applySafety.kind",
        "grit-apply manifests must include apply admission inputs."
      )
    );
  }
}

function checkRuleReference(
  manifest: Extract<PatternAuthorityManifest, { lifecycle: "registered-advisory" | "registered-enforced" }>,
  options: PatternAuthorityValidationOptions,
  issues: PatternAuthorityValidationIssue[]
) {
  if (!options.requireRuleReference) return;
  const reference = options.ruleReferences?.find((candidate) => candidate.ruleId === manifest.ruleId);
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
  if (options.manifestPath && reference.manifestPath && reference.manifestPath !== options.manifestPath) {
    issues.push(
      issue(
        "contradicted-manifest",
        "manifestPath",
        `Manifest path '${options.manifestPath}' does not match rule-pack reference '${reference.manifestPath}'.`
      )
    );
  }
  const expectedPath = patternAuthorityManifestPath(manifest.ruleId);
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
  issues: PatternAuthorityValidationIssue[],
  path = "<manifest>"
) {
  if (typeof value === "string") {
    if (isPlaceholderText(value)) {
      issues.push(
        issue("placeholder-manifest", path, `${path} contains placeholder authority text.`)
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
  reason: PatternAuthorityValidationFailureReason,
  path: string,
  message: string
): PatternAuthorityValidationIssue {
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
