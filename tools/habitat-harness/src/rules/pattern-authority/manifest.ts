export const patternAuthorityManifestSchemaVersion = 1;
export const patternAuthorityManifestRoot = "tools/habitat-harness/src/rules/pattern-authority";
export const patternAuthorityCandidateRoot = `${patternAuthorityManifestRoot}/candidates`;

export type PatternAuthorityLifecycle = "candidate" | "registered-advisory" | "registered-enforced";

export type PatternAuthorityOwnerTool = "grit-check" | "grit-apply";

export type PatternAuthoritySourceKind =
  | "frame"
  | "taxonomy"
  | "canonical-doc"
  | "accepted-spec"
  | "adr"
  | "agent-router";

export type PatternAuthorityProvingSourceKind =
  | "native-grit-sample"
  | "current-tree-scan"
  | "injected-violation"
  | "retired-mechanism"
  | "test"
  | "manual-review";

export type PatternAuthorityCurrentTreeResultClass =
  | "zero-findings"
  | "accepted-baseline"
  | "findings-block-registration";

export type PatternAuthorityBaselineAction = "committed-empty" | "committed-debt" | "blocked";

export type PatternAuthorityHookDecision = "none" | "pre-commit";

export type PatternAuthorityApplySafety =
  | { kind: "not-apply"; rationale: string }
  | {
      kind: "apply";
      dryRunCommand: string;
      noWriteProof: string;
      appliedDiffProof: string;
      rollbackProof: string;
      typeAndTestProof: string;
    };

export interface PatternAuthoritySource {
  kind: PatternAuthoritySourceKind;
  pathOrUrl: string;
  claim: string;
}

export interface PatternAuthorityProvingSource {
  kind: PatternAuthorityProvingSourceKind;
  pathOrCommand: string;
  claim: string;
}

export interface PatternAuthorityManifestBase {
  schemaVersion: 1;
  ruleId: string;
  patternName: string;
  lifecycle: PatternAuthorityLifecycle;
  openspecChangeId: string;
  ownerProject: string;
  ownerTool: PatternAuthorityOwnerTool;
}

export interface CandidatePatternAuthorityManifest extends PatternAuthorityManifestBase {
  lifecycle: "candidate";
  candidateArtifacts: {
    patternPath: string;
    manifestPath: string;
  };
  registration: {
    accepted: false;
    reason: string;
  };
  requiredForRegistration: string[];
}

export interface RegisteredPatternAuthorityManifest extends PatternAuthorityManifestBase {
  lifecycle: "registered-advisory" | "registered-enforced";
  normativeSources: PatternAuthoritySource[];
  provingSources: PatternAuthorityProvingSource[];
  language: {
    gritLanguage: string;
    parserVariant: string;
    officialDocsSource: string;
    localProofCommand: string;
  };
  scanRoots: {
    include: string[];
    exclude: string[];
    gritignorePolicy: string;
  };
  fixtureStrategy: {
    positive: string[];
    negative: string[];
    parserEdge: string[];
    falsePositive: string[];
  };
  falsePositiveModel: {
    risk: string[];
    controls: string[];
    suppressionPolicy: string;
  };
  currentTreeScan: {
    command: string;
    resultClass: PatternAuthorityCurrentTreeResultClass;
    evidencePath: string;
  };
  baselineContract: {
    baselinePath: string;
    ruleIntroductionManifest: string;
    baselineAction: PatternAuthorityBaselineAction;
  };
  hookScope: {
    decision: PatternAuthorityHookDecision;
    rationale: string;
    costAndScopeEvidence: string;
  };
  applySafety: PatternAuthorityApplySafety;
}

export type PatternAuthorityManifest =
  | CandidatePatternAuthorityManifest
  | RegisteredPatternAuthorityManifest;

export type PatternAuthorityValidationFailureReason =
  | "missing-manifest"
  | "malformed-manifest"
  | "placeholder-manifest"
  | "contradicted-manifest"
  | "orphan-manifest"
  | "grit-metadata-only"
  | "nx-options-only";

export interface PatternAuthorityValidationIssue {
  reason: PatternAuthorityValidationFailureReason;
  path: string;
  message: string;
}

export interface PatternAuthorityRuleReference {
  ruleId: string;
  patternName?: string;
  manifestPath?: string;
  ownerTool?: string;
  lifecycle?: "advisory" | "enforced";
  hookScope?: "pre-commit";
}

export interface PatternAuthorityValidationOptions {
  manifestPath?: string;
  ruleReferences?: readonly PatternAuthorityRuleReference[];
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

export function patternAuthorityManifestPath(ruleId: string): string {
  return `${patternAuthorityManifestRoot}/${ruleId}.json`;
}

export function validatePatternAuthorityManifest(
  value: unknown,
  options: PatternAuthorityValidationOptions = {}
): PatternAuthorityValidationResult {
  if (value == null) {
    return {
      ok: false,
      issues: [
        {
          reason: "missing-manifest",
          path: options.manifestPath ?? "<manifest>",
          message:
            "Pattern Authority Manifest is required before registered pattern authority can be accepted.",
        },
      ],
    };
  }

  const issues: PatternAuthorityValidationIssue[] = [];
  if (!isRecord(value)) {
    addIssue(
      issues,
      "malformed-manifest",
      "<manifest>",
      "Pattern Authority Manifest must be a JSON object."
    );
    return { ok: false, issues };
  }

  if (looksLikeGritOnlyAuthority(value)) {
    addIssue(
      issues,
      "grit-metadata-only",
      "<manifest>",
      "Grit frontmatter or prose is not Habitat authority metadata."
    );
  }
  if (looksLikeNxOptionsOnlyAuthority(value)) {
    addIssue(
      issues,
      "nx-options-only",
      "<manifest>",
      "Nx generator options are command input only and are not accepted Habitat authority metadata."
    );
  }

  validateBaseFields(value, issues);

  const lifecycle = typeof value.lifecycle === "string" ? value.lifecycle : undefined;
  if (lifecycle === "candidate") {
    validateCandidateFields(value, issues);
  } else if (lifecycle === "registered-advisory" || lifecycle === "registered-enforced") {
    validateRegisteredFields(value, issues, options);
  }

  if (issues.length > 0) return { ok: false, issues };

  const manifest = value as unknown as PatternAuthorityManifest;
  return {
    ok: true,
    manifest,
    state: manifest.lifecycle,
    authorityAccepted: manifest.lifecycle !== "candidate",
  };
}

function validateBaseFields(
  value: Record<string, unknown>,
  issues: PatternAuthorityValidationIssue[]
) {
  requireExactNumber(value, "schemaVersion", patternAuthorityManifestSchemaVersion, issues);
  requireString(value, "ruleId", issues);
  requireString(value, "patternName", issues);
  requireEnum(
    value,
    "lifecycle",
    ["candidate", "registered-advisory", "registered-enforced"],
    issues
  );
  requireString(value, "openspecChangeId", issues);
  requireString(value, "ownerProject", issues);
  requireEnum(value, "ownerTool", ["grit-check", "grit-apply"], issues);
  checkPlaceholderString(value, "ruleId", issues);
  checkPlaceholderString(value, "patternName", issues);
  checkPlaceholderString(value, "openspecChangeId", issues);
  checkPlaceholderString(value, "ownerProject", issues);
}

function validateCandidateFields(
  value: Record<string, unknown>,
  issues: PatternAuthorityValidationIssue[]
) {
  const candidateArtifacts = objectAt(value, "candidateArtifacts", issues);
  if (candidateArtifacts) {
    requireString(candidateArtifacts, "patternPath", issues, "candidateArtifacts.patternPath");
    requireString(candidateArtifacts, "manifestPath", issues, "candidateArtifacts.manifestPath");
  }
  const registration = objectAt(value, "registration", issues);
  if (registration) {
    if (registration.accepted !== false) {
      addIssue(
        issues,
        "contradicted-manifest",
        "registration.accepted",
        "Candidate manifests must not mark registration as accepted."
      );
    }
    requireString(registration, "reason", issues, "registration.reason");
  }
  requireStringArray(value, "requiredForRegistration", issues, { min: 1 });
}

function validateRegisteredFields(
  value: Record<string, unknown>,
  issues: PatternAuthorityValidationIssue[],
  options: PatternAuthorityValidationOptions
) {
  validateSources(value, issues);
  validateLanguage(value, issues);
  validateScanRoots(value, issues);
  validateFixtureStrategy(value, issues);
  validateFalsePositiveModel(value, issues);
  validateCurrentTreeScan(value, issues);
  validateBaselineContract(value, issues);
  validateHookScope(value, issues);
  validateApplySafety(value, issues);
  validateRegisteredContradictions(value, issues);
  validateRuleReference(value, issues, options);
}

function validateSources(
  value: Record<string, unknown>,
  issues: PatternAuthorityValidationIssue[]
) {
  validateArrayOfObjects(value, "normativeSources", issues, { min: 1 }, (entry, index) => {
    requireEnum(
      entry,
      "kind",
      ["frame", "taxonomy", "canonical-doc", "accepted-spec", "adr", "agent-router"],
      issues,
      `normativeSources.${index}.kind`
    );
    requireString(entry, "pathOrUrl", issues, `normativeSources.${index}.pathOrUrl`);
    requireString(entry, "claim", issues, `normativeSources.${index}.claim`);
    checkPlaceholderString(entry, "claim", issues, `normativeSources.${index}.claim`);
  });
  validateArrayOfObjects(value, "provingSources", issues, { min: 1 }, (entry, index) => {
    requireEnum(
      entry,
      "kind",
      [
        "native-grit-sample",
        "current-tree-scan",
        "injected-violation",
        "retired-mechanism",
        "test",
        "manual-review",
      ],
      issues,
      `provingSources.${index}.kind`
    );
    requireString(entry, "pathOrCommand", issues, `provingSources.${index}.pathOrCommand`);
    requireString(entry, "claim", issues, `provingSources.${index}.claim`);
    checkPlaceholderString(entry, "claim", issues, `provingSources.${index}.claim`);
  });
}

function validateLanguage(
  value: Record<string, unknown>,
  issues: PatternAuthorityValidationIssue[]
) {
  const language = objectAt(value, "language", issues);
  if (!language) return;
  for (const field of [
    "gritLanguage",
    "parserVariant",
    "officialDocsSource",
    "localProofCommand",
  ]) {
    requireString(language, field, issues, `language.${field}`);
    checkPlaceholderString(language, field, issues, `language.${field}`);
  }
}

function validateScanRoots(
  value: Record<string, unknown>,
  issues: PatternAuthorityValidationIssue[]
) {
  const scanRoots = objectAt(value, "scanRoots", issues);
  if (!scanRoots) return;
  requireStringArray(scanRoots, "include", issues, { min: 1, path: "scanRoots.include" });
  requireStringArray(scanRoots, "exclude", issues, { path: "scanRoots.exclude" });
  requireString(scanRoots, "gritignorePolicy", issues, "scanRoots.gritignorePolicy");
  for (const include of arrayValue(scanRoots.include)) {
    if (typeof include === "string" && !looksLikePath(include)) {
      addIssue(
        issues,
        "malformed-manifest",
        "scanRoots.include",
        `Scan root '${include}' is not a concrete repository path.`
      );
    }
  }
}

function validateFixtureStrategy(
  value: Record<string, unknown>,
  issues: PatternAuthorityValidationIssue[]
) {
  const fixtureStrategy = objectAt(value, "fixtureStrategy", issues);
  if (!fixtureStrategy) return;
  requireStringArray(fixtureStrategy, "positive", issues, {
    min: 1,
    path: "fixtureStrategy.positive",
  });
  requireStringArray(fixtureStrategy, "negative", issues, {
    min: 1,
    path: "fixtureStrategy.negative",
  });
  requireStringArray(fixtureStrategy, "parserEdge", issues, { path: "fixtureStrategy.parserEdge" });
  requireStringArray(fixtureStrategy, "falsePositive", issues, {
    path: "fixtureStrategy.falsePositive",
  });
}

function validateFalsePositiveModel(
  value: Record<string, unknown>,
  issues: PatternAuthorityValidationIssue[]
) {
  const falsePositiveModel = objectAt(value, "falsePositiveModel", issues);
  if (!falsePositiveModel) return;
  requireStringArray(falsePositiveModel, "risk", issues, {
    min: 1,
    path: "falsePositiveModel.risk",
  });
  requireStringArray(falsePositiveModel, "controls", issues, {
    min: 1,
    path: "falsePositiveModel.controls",
  });
  requireString(
    falsePositiveModel,
    "suppressionPolicy",
    issues,
    "falsePositiveModel.suppressionPolicy"
  );
  checkPlaceholderString(
    falsePositiveModel,
    "suppressionPolicy",
    issues,
    "falsePositiveModel.suppressionPolicy"
  );
}

function validateCurrentTreeScan(
  value: Record<string, unknown>,
  issues: PatternAuthorityValidationIssue[]
) {
  const currentTreeScan = objectAt(value, "currentTreeScan", issues);
  if (!currentTreeScan) return;
  requireString(currentTreeScan, "command", issues, "currentTreeScan.command");
  requireEnum(
    currentTreeScan,
    "resultClass",
    ["zero-findings", "accepted-baseline", "findings-block-registration"],
    issues,
    "currentTreeScan.resultClass"
  );
  requireString(currentTreeScan, "evidencePath", issues, "currentTreeScan.evidencePath");
}

function validateBaselineContract(
  value: Record<string, unknown>,
  issues: PatternAuthorityValidationIssue[]
) {
  const baselineContract = objectAt(value, "baselineContract", issues);
  if (!baselineContract) return;
  requireString(baselineContract, "baselinePath", issues, "baselineContract.baselinePath");
  requireString(
    baselineContract,
    "ruleIntroductionManifest",
    issues,
    "baselineContract.ruleIntroductionManifest"
  );
  requireEnum(
    baselineContract,
    "baselineAction",
    ["committed-empty", "committed-debt", "blocked"],
    issues,
    "baselineContract.baselineAction"
  );
}

function validateHookScope(
  value: Record<string, unknown>,
  issues: PatternAuthorityValidationIssue[]
) {
  const hookScope = objectAt(value, "hookScope", issues);
  if (!hookScope) return;
  requireEnum(hookScope, "decision", ["none", "pre-commit"], issues, "hookScope.decision");
  requireString(hookScope, "rationale", issues, "hookScope.rationale");
  requireString(hookScope, "costAndScopeEvidence", issues, "hookScope.costAndScopeEvidence");
  checkPlaceholderString(hookScope, "rationale", issues, "hookScope.rationale");
  checkPlaceholderString(
    hookScope,
    "costAndScopeEvidence",
    issues,
    "hookScope.costAndScopeEvidence"
  );
}

function validateApplySafety(
  value: Record<string, unknown>,
  issues: PatternAuthorityValidationIssue[]
) {
  const applySafety = objectAt(value, "applySafety", issues);
  if (!applySafety) return;
  requireEnum(applySafety, "kind", ["not-apply", "apply"], issues, "applySafety.kind");
  if (applySafety.kind === "not-apply") {
    requireString(applySafety, "rationale", issues, "applySafety.rationale");
    checkPlaceholderString(applySafety, "rationale", issues, "applySafety.rationale");
    return;
  }
  if (applySafety.kind === "apply") {
    for (const field of [
      "dryRunCommand",
      "noWriteProof",
      "appliedDiffProof",
      "rollbackProof",
      "typeAndTestProof",
    ]) {
      requireString(applySafety, field, issues, `applySafety.${field}`);
      checkPlaceholderString(applySafety, field, issues, `applySafety.${field}`);
    }
  }
}

function validateRegisteredContradictions(
  value: Record<string, unknown>,
  issues: PatternAuthorityValidationIssue[]
) {
  if (
    value.lifecycle !== "registered-enforced" &&
    objectAtNoIssue(value, "hookScope")?.decision === "pre-commit"
  ) {
    addIssue(
      issues,
      "contradicted-manifest",
      "hookScope.decision",
      "Pre-commit hook scope requires registered-enforced lifecycle."
    );
  }
  if (objectAtNoIssue(value, "currentTreeScan")?.resultClass === "findings-block-registration") {
    addIssue(
      issues,
      "contradicted-manifest",
      "currentTreeScan.resultClass",
      "A current-tree scan that blocks registration cannot be accepted as a registered manifest."
    );
  }
  if (objectAtNoIssue(value, "baselineContract")?.baselineAction === "blocked") {
    addIssue(
      issues,
      "contradicted-manifest",
      "baselineContract.baselineAction",
      "A blocked baseline action cannot be accepted as a registered manifest."
    );
  }
  const applyKind = objectAtNoIssue(value, "applySafety")?.kind;
  if (value.ownerTool === "grit-check" && applyKind === "apply") {
    addIssue(
      issues,
      "contradicted-manifest",
      "applySafety.kind",
      "grit-check manifests must not claim apply safety."
    );
  }
  if (value.ownerTool === "grit-apply" && applyKind === "not-apply") {
    addIssue(
      issues,
      "contradicted-manifest",
      "applySafety.kind",
      "grit-apply manifests must include apply safety proof fields."
    );
  }
}

function validateRuleReference(
  value: Record<string, unknown>,
  issues: PatternAuthorityValidationIssue[],
  options: PatternAuthorityValidationOptions
) {
  if (!options.requireRuleReference) return;
  const ruleId = typeof value.ruleId === "string" ? value.ruleId : "";
  const reference = options.ruleReferences?.find((candidate) => candidate.ruleId === ruleId);
  if (!reference) {
    addIssue(
      issues,
      "orphan-manifest",
      "ruleId",
      `Registered manifest '${ruleId || "<unknown>"}' has no matching rule-pack reference.`
    );
    return;
  }
  if (
    typeof value.patternName === "string" &&
    reference.patternName &&
    reference.patternName !== value.patternName
  ) {
    addIssue(
      issues,
      "contradicted-manifest",
      "patternName",
      `Manifest pattern '${value.patternName}' does not match rule-pack pattern '${reference.patternName}'.`
    );
  }
  if (
    options.manifestPath &&
    reference.manifestPath &&
    reference.manifestPath !== options.manifestPath
  ) {
    addIssue(
      issues,
      "contradicted-manifest",
      "manifestPath",
      `Manifest path '${options.manifestPath}' does not match rule-pack reference '${reference.manifestPath}'.`
    );
  }
  if (
    typeof value.ownerTool === "string" &&
    reference.ownerTool &&
    reference.ownerTool !== value.ownerTool
  ) {
    addIssue(
      issues,
      "contradicted-manifest",
      "ownerTool",
      `Manifest ownerTool '${value.ownerTool}' does not match rule-pack ownerTool '${reference.ownerTool}'.`
    );
  }
  if (
    typeof value.lifecycle === "string" &&
    reference.lifecycle &&
    ((value.lifecycle === "registered-advisory" && reference.lifecycle !== "advisory") ||
      (value.lifecycle === "registered-enforced" && reference.lifecycle !== "enforced"))
  ) {
    addIssue(
      issues,
      "contradicted-manifest",
      "lifecycle",
      `Manifest lifecycle '${value.lifecycle}' does not match rule-pack lane '${reference.lifecycle}'.`
    );
  }
}

function requireString(
  value: Record<string, unknown>,
  field: string,
  issues: PatternAuthorityValidationIssue[],
  path = field
) {
  if (typeof value[field] !== "string" || value[field].trim() === "") {
    addIssue(issues, "malformed-manifest", path, `${path} must be a non-empty string.`);
  }
}

function requireExactNumber(
  value: Record<string, unknown>,
  field: string,
  expected: number,
  issues: PatternAuthorityValidationIssue[]
) {
  if (value[field] !== expected) {
    addIssue(issues, "malformed-manifest", field, `${field} must be ${expected}.`);
  }
}

function requireEnum(
  value: Record<string, unknown>,
  field: string,
  allowed: readonly string[],
  issues: PatternAuthorityValidationIssue[],
  path = field
) {
  if (typeof value[field] !== "string" || !allowed.includes(value[field])) {
    addIssue(issues, "malformed-manifest", path, `${path} must be one of: ${allowed.join(", ")}.`);
  }
}

function objectAt(
  value: Record<string, unknown>,
  field: string,
  issues: PatternAuthorityValidationIssue[]
): Record<string, unknown> | undefined {
  const entry = value[field];
  if (!isRecord(entry)) {
    addIssue(issues, "malformed-manifest", field, `${field} must be an object.`);
    return undefined;
  }
  return entry;
}

function objectAtNoIssue(
  value: Record<string, unknown>,
  field: string
): Record<string, unknown> | undefined {
  const entry = value[field];
  return isRecord(entry) ? entry : undefined;
}

function validateArrayOfObjects(
  value: Record<string, unknown>,
  field: string,
  issues: PatternAuthorityValidationIssue[],
  options: { min?: number },
  validateEntry: (entry: Record<string, unknown>, index: number) => void
) {
  const array = value[field];
  if (!Array.isArray(array)) {
    addIssue(issues, "malformed-manifest", field, `${field} must be an array.`);
    return;
  }
  if (options.min !== undefined && array.length < options.min) {
    addIssue(
      issues,
      "malformed-manifest",
      field,
      `${field} must contain at least ${options.min} entry.`
    );
  }
  array.forEach((entry, index) => {
    if (!isRecord(entry)) {
      addIssue(
        issues,
        "malformed-manifest",
        `${field}.${index}`,
        `${field}.${index} must be an object.`
      );
      return;
    }
    validateEntry(entry, index);
  });
}

function requireStringArray(
  value: Record<string, unknown>,
  field: string,
  issues: PatternAuthorityValidationIssue[],
  options: { min?: number; path?: string } = {}
) {
  const path = options.path ?? field;
  const array = value[field];
  if (!Array.isArray(array)) {
    addIssue(issues, "malformed-manifest", path, `${path} must be an array.`);
    return;
  }
  if (options.min !== undefined && array.length < options.min) {
    addIssue(
      issues,
      "malformed-manifest",
      path,
      `${path} must contain at least ${options.min} entry.`
    );
  }
  array.forEach((entry, index) => {
    if (typeof entry !== "string" || entry.trim() === "") {
      addIssue(
        issues,
        "malformed-manifest",
        `${path}.${index}`,
        `${path}.${index} must be a non-empty string.`
      );
    } else if (isPlaceholderText(entry)) {
      addIssue(
        issues,
        "placeholder-manifest",
        `${path}.${index}`,
        `${path}.${index} contains placeholder authority or proof text.`
      );
    }
  });
}

function checkPlaceholderString(
  value: Record<string, unknown>,
  field: string,
  issues: PatternAuthorityValidationIssue[],
  path = field
) {
  const entry = value[field];
  if (typeof entry === "string" && isPlaceholderText(entry)) {
    addIssue(
      issues,
      "placeholder-manifest",
      path,
      `${path} contains placeholder authority or proof text.`
    );
  }
}

function addIssue(
  issues: PatternAuthorityValidationIssue[],
  reason: PatternAuthorityValidationFailureReason,
  path: string,
  message: string
) {
  issues.push({ reason, path, message });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isPlaceholderText(value: string): boolean {
  const lower = value.trim().toLowerCase();
  return placeholderFragments.some((fragment) => lower.includes(fragment));
}

function looksLikePath(value: string): boolean {
  return (
    value.startsWith(".") ||
    value.startsWith("/") ||
    value.startsWith("tools/") ||
    value.startsWith("docs/") ||
    value.startsWith("openspec/") ||
    value.startsWith("packages/") ||
    value.startsWith("mods/") ||
    value.startsWith("apps/")
  );
}

function looksLikeGritOnlyAuthority(value: Record<string, unknown>): boolean {
  const hasGritMetadata =
    "frontmatter" in value || "gritFrontmatter" in value || "markdown" in value;
  return hasGritMetadata && !("normativeSources" in value) && !("provingSources" in value);
}

function looksLikeNxOptionsOnlyAuthority(value: Record<string, unknown>): boolean {
  const hasOldGeneratorAuthorityInput =
    "scope" in value || "forbids" in value || "why" in value || "message" in value;
  const hasSparseGeneratorInput =
    "ruleId" in value && "patternName" in value && "ownerProject" in value && "lifecycle" in value;
  const hasCandidateManifestState = "candidateArtifacts" in value || "registration" in value;
  const hasManifestAuthority = "normativeSources" in value || "provingSources" in value;
  return (
    (hasOldGeneratorAuthorityInput || hasSparseGeneratorInput) &&
    !hasManifestAuthority &&
    !hasCandidateManifestState
  );
}

function arrayValue(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}
