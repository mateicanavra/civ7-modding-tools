import { realpathSync } from "node:fs";
import path from "node:path";
import { FileSystem } from "@effect/platform";
import type { PlatformError } from "@effect/platform/Error";
import {
  pathCoveragePatternMatches,
  type RuleGritFacts,
} from "@habitat/cli/service/model/rules/index";
import { Effect, Match, Option } from "effect";
import type { GritApplyFindingEvidence } from "./output.js";
import { pathIsWithinRoot } from "./path.js";

const canonicalExistingPath = Option.liftThrowable((candidate: string) =>
  realpathSync.native(candidate)
);

export function gritApplyAnalysisPathIsRelevant(
  observedPath: string,
  rule: RuleGritFacts,
  canonicalRepo: string
): boolean {
  return Match.value(path.isAbsolute(observedPath)).pipe(
    Match.when(false, () => true),
    Match.when(true, () => relevantAbsoluteAnalysisPath(observedPath, rule, canonicalRepo)),
    Match.exhaustive
  );
}

function relevantAbsoluteAnalysisPath(
  observedPath: string,
  rule: RuleGritFacts,
  canonicalRepo: string
): boolean {
  return Option.match(canonicalExistingPath(observedPath), {
    onNone: () => true,
    onSome: (canonical) =>
      !pathIsWithinRoot(canonical, canonicalRepo) ||
      exactCoverageContainsPath(rule, canonicalRepo, canonical),
  });
}

interface FindingValidationOptions {
  readonly rule: RuleGritFacts;
  readonly roots: readonly [string, ...string[]];
  readonly canonicalRepo: string;
  readonly fs: FileSystem.FileSystem;
}

type FindingBatchValidation =
  | {
      readonly kind: "accepted";
      readonly findings: readonly GritApplyFindingEvidence[];
    }
  | { readonly kind: "rejected"; readonly detail: string };

/** Canonicalizes provider evidence and refuses findings outside exact read-only authority. */
export const validateGritApplyFindingsEffect = Effect.fn("grit.applyFindings.validate")(function* (
  findings: readonly GritApplyFindingEvidence[],
  options: FindingValidationOptions
) {
  const validations = yield* Effect.forEach(
    findings,
    (finding) => validateFindingEffect(finding, options),
    { concurrency: 1 }
  );
  const rejection = Option.fromNullable(
    validations.find((validation) => validation.kind === "invalid")
  );
  return Match.value(rejection).pipe(
    Match.when({ _tag: "Some" }, ({ value }) => rejectedFindings(value.detail)),
    Match.when({ _tag: "None" }, () => acceptedValidatedFindings(validations)),
    Match.exhaustive
  );
});

type FindingValidation =
  | { readonly kind: "valid"; readonly finding: GritApplyFindingEvidence }
  | { readonly kind: "invalid"; readonly detail: string };

const validateFindingEffect = Effect.fn("grit.applyFinding.validate")(function* (
  finding: GritApplyFindingEvidence,
  options: FindingValidationOptions
) {
  return yield* Match.value(finding).pipe(
    Match.when({ kind: "match" }, (match) => validateExistingFindingEffect(match, options)),
    Match.when({ kind: "remove-file" }, (remove) => validateExistingFindingEffect(remove, options)),
    Match.when({ kind: "create-file" }, (create) => validateCreateFindingEffect(create, options)),
    Match.when({ kind: "rewrite" }, (rewrite) => validateRewriteFindingEffect(rewrite, options)),
    Match.exhaustive
  );
});

const validateExistingFindingEffect = Effect.fn("grit.applyFinding.validateExisting")(function* (
  finding: Extract<GritApplyFindingEvidence, { kind: "match" | "remove-file" }>,
  options: FindingValidationOptions
) {
  const endpoint = yield* validateExistingEndpointEffect(finding.path, finding.kind, options);
  return findingFromExistingEndpoint(finding, endpoint);
});

function findingFromExistingEndpoint(
  finding: Extract<GritApplyFindingEvidence, { kind: "match" | "remove-file" }>,
  endpoint: EndpointValidation
): FindingValidation {
  return Match.value(endpoint).pipe(
    Match.when({ kind: "invalid" }, (invalid) => invalid),
    Match.when({ kind: "valid" }, ({ path: validPath }) =>
      validFinding({ kind: finding.kind, path: validPath })
    ),
    Match.exhaustive
  );
}

const validateCreateFindingEffect = Effect.fn("grit.applyFinding.validateCreate")(function* (
  finding: Extract<GritApplyFindingEvidence, { kind: "create-file" }>,
  options: FindingValidationOptions
) {
  const endpoint = yield* validateAbsentEndpointEffect(finding.path, finding.kind, options);
  return findingFromCreateEndpoint(finding, endpoint);
});

function findingFromCreateEndpoint(
  finding: Extract<GritApplyFindingEvidence, { kind: "create-file" }>,
  endpoint: EndpointValidation
): FindingValidation {
  return Match.value(endpoint).pipe(
    Match.when({ kind: "invalid" }, (invalid) => invalid),
    Match.when({ kind: "valid" }, ({ path: validPath }) =>
      validFinding({ kind: finding.kind, path: validPath })
    ),
    Match.exhaustive
  );
}

const validateRewriteFindingEffect = Effect.fn("grit.applyFinding.validateRewrite")(function* (
  finding: Extract<GritApplyFindingEvidence, { kind: "rewrite" }>,
  options: FindingValidationOptions
) {
  const original = yield* validateExistingEndpointEffect(
    finding.originalPath,
    "rewrite-original",
    options
  );
  return yield* Match.value(original).pipe(
    Match.when({ kind: "invalid" }, (invalid) => Effect.succeed(invalid)),
    Match.when({ kind: "valid" }, (validOriginal) =>
      validateRewriteDestinationEffect(finding, validOriginal, options)
    ),
    Match.exhaustive
  );
});

const validateRewriteDestinationEffect = Effect.fn("grit.applyFinding.validateRewriteDestination")(
  function* (
    finding: Extract<GritApplyFindingEvidence, { kind: "rewrite" }>,
    original: Extract<EndpointValidation, { kind: "valid" }>,
    options: FindingValidationOptions
  ) {
    const absolute = absoluteEndpoint(finding.rewrittenPath, "rewrite-destination");
    const rewritten = yield* Match.value(absolute).pipe(
      Match.when({ kind: "invalid" }, (invalid) => Effect.succeed(invalid)),
      Match.when({ kind: "valid" }, ({ path: absolutePath }) =>
        validateAbsoluteRewriteDestinationEffect(finding, original, absolutePath, options)
      ),
      Match.exhaustive
    );
    return rewriteFindingFromEndpoint(original, rewritten);
  }
);

const validateAbsoluteRewriteDestinationEffect = Effect.fn(
  "grit.applyFinding.validateAbsoluteRewriteDestination"
)(function* (
  finding: Extract<GritApplyFindingEvidence, { kind: "rewrite" }>,
  original: Extract<EndpointValidation, { kind: "valid" }>,
  absolutePath: string,
  options: FindingValidationOptions
) {
  const canonical = yield* Effect.option(options.fs.realPath(absolutePath));
  return yield* Option.match(canonical, {
    onNone: () =>
      validateAbsentEndpointEffect(finding.rewrittenPath, "rewrite-destination", options),
    onSome: (existing) =>
      validateExistingRewriteDestinationEffect(finding, original, absolutePath, existing, options),
  });
});

const validateExistingRewriteDestinationEffect = Effect.fn(
  "grit.applyFinding.validateExistingRewriteDestination"
)(function* (
  finding: Extract<GritApplyFindingEvidence, { kind: "rewrite" }>,
  original: Extract<EndpointValidation, { kind: "valid" }>,
  absolutePath: string,
  canonicalPath: string,
  options: FindingValidationOptions
) {
  const destination = validateEndpointAuthority(
    canonicalPath,
    finding.rewrittenPath,
    "rewrite-destination",
    options
  );
  return existingRewriteDestination(finding, original, absolutePath, destination);
});

function existingRewriteDestination(
  finding: Extract<GritApplyFindingEvidence, { kind: "rewrite" }>,
  original: Extract<EndpointValidation, { kind: "valid" }>,
  absolutePath: string,
  destination: EndpointValidation
): EndpointValidation {
  return Match.value(destination).pipe(
    Match.when({ kind: "invalid" }, (invalid) => invalid),
    Match.when({ kind: "valid" }, () =>
      sameLexicalRewriteDestination(finding, original, absolutePath)
    ),
    Match.exhaustive
  );
}

function sameLexicalRewriteDestination(
  finding: Extract<GritApplyFindingEvidence, { kind: "rewrite" }>,
  original: Extract<EndpointValidation, { kind: "valid" }>,
  absolutePath: string
): EndpointValidation {
  return Match.value(absolutePath === path.normalize(finding.originalPath)).pipe(
    Match.when(true, () => original),
    Match.when(false, () =>
      invalidEndpoint(`rewrite-destination-collision: ${finding.rewrittenPath}.`)
    ),
    Match.exhaustive
  );
}

function rewriteFindingFromEndpoint(
  original: Extract<EndpointValidation, { kind: "valid" }>,
  rewritten: EndpointValidation
): FindingValidation {
  return Match.value(rewritten).pipe(
    Match.when({ kind: "invalid" }, (invalid) => invalid),
    Match.when({ kind: "valid" }, ({ path: rewrittenPath }) =>
      validFinding({ kind: "rewrite", originalPath: original.path, rewrittenPath })
    ),
    Match.exhaustive
  );
}

type EndpointValidation =
  | { readonly kind: "valid"; readonly path: string }
  | { readonly kind: "invalid"; readonly detail: string };

const validateExistingEndpointEffect = Effect.fn("grit.applyFinding.validateExistingEndpoint")(
  function* (observed: string, label: string, options: FindingValidationOptions) {
    const absolute = absoluteEndpoint(observed, label);
    return yield* Match.value(absolute).pipe(
      Match.when({ kind: "invalid" }, (invalid) => Effect.succeed(invalid)),
      Match.when({ kind: "valid" }, ({ path: absolutePath }) =>
        validateCanonicalExistingEndpointEffect(absolutePath, observed, label, options)
      ),
      Match.exhaustive
    );
  }
);

const validateCanonicalExistingEndpointEffect = Effect.fn(
  "grit.applyFinding.validateCanonicalExistingEndpoint"
)(function* (
  absolutePath: string,
  observed: string,
  label: string,
  options: FindingValidationOptions
) {
  const canonical = yield* Effect.option(options.fs.realPath(absolutePath));
  return Option.match(canonical, {
    onNone: () => invalidEndpoint(`unresolvable-${label}-path: ${observed}.`),
    onSome: (existing) => validateEndpointAuthority(existing, observed, label, options),
  });
});

const validateAbsentEndpointEffect = Effect.fn("grit.applyFinding.validateAbsentEndpoint")(
  function* (observed: string, label: string, options: FindingValidationOptions) {
    const absolute = absoluteEndpoint(observed, label);
    return yield* Match.value(absolute).pipe(
      Match.when({ kind: "invalid" }, (invalid) => Effect.succeed(invalid)),
      Match.when({ kind: "valid" }, ({ path: absolutePath }) =>
        validateAbsentAbsoluteEffect(absolutePath, observed, label, options)
      ),
      Match.exhaustive
    );
  }
);

const validateAbsentAbsoluteEffect = Effect.fn("grit.applyFinding.validateAbsentAbsolute")(
  function* (
    absolutePath: string,
    observed: string,
    label: string,
    options: FindingValidationOptions
  ) {
    const link = yield* Effect.either(options.fs.readLink(absolutePath));
    return yield* Match.value(link).pipe(
      Match.when({ _tag: "Right" }, () =>
        Effect.succeed(invalidEndpoint(`${label}-symlink-collision: ${observed}.`))
      ),
      Match.when({ _tag: "Left" }, ({ left }) =>
        validateAbsentReadLinkFailureEffect(left, absolutePath, observed, label, options)
      ),
      Match.exhaustive
    );
  }
);

const validateAbsentReadLinkFailureEffect = Effect.fn(
  "grit.applyFinding.validateAbsentReadLinkFailure"
)(function* (
  error: PlatformError,
  absolutePath: string,
  observed: string,
  label: string,
  options: FindingValidationOptions
) {
  const existence = yield* Effect.either(options.fs.exists(absolutePath));
  return yield* Match.value({ readLinkMissing: isMissingPath(error), existence }).pipe(
    Match.when({ existence: { _tag: "Right", right: true } }, () =>
      Effect.succeed(invalidEndpoint(`${label}-collision: ${observed}.`))
    ),
    Match.when({ readLinkMissing: true, existence: { _tag: "Right", right: false } }, () =>
      validateAbsentParentEffect(absolutePath, observed, label, options)
    ),
    Match.when({ readLinkMissing: true, existence: { _tag: "Left" } }, () =>
      Effect.succeed(invalidEndpoint(`${label}-existence-probe-failed: ${observed}.`))
    ),
    Match.orElse(() =>
      Effect.succeed(invalidEndpoint(`${label}-symlink-probe-failed: ${observed}.`))
    )
  );
});

const validateAbsentParentEffect = Effect.fn("grit.applyFinding.validateAbsentParent")(function* (
  absolutePath: string,
  observed: string,
  label: string,
  options: FindingValidationOptions
) {
  const parent = yield* Effect.option(options.fs.realPath(path.dirname(absolutePath)));
  return Option.match(parent, {
    onNone: () => invalidEndpoint(`${label}-parent-unresolvable: ${observed}.`),
    onSome: (canonicalParent) =>
      validateEndpointAuthority(
        path.join(canonicalParent, path.basename(absolutePath)),
        observed,
        label,
        options
      ),
  });
});

function absoluteEndpoint(observed: string, label: string): EndpointValidation {
  return Match.value(path.isAbsolute(observed)).pipe(
    Match.when(true, () => validEndpoint(path.normalize(observed))),
    Match.when(false, () => invalidEndpoint(`${label}-path-base-ambiguous: ${observed}.`)),
    Match.exhaustive
  );
}

function validateEndpointAuthority(
  canonical: string,
  observed: string,
  label: string,
  options: FindingValidationOptions
): EndpointValidation {
  return Match.value(options.roots.some((root) => pathIsWithinRoot(canonical, root))).pipe(
    Match.when(false, () => invalidEndpoint(`${label}-path-escape: ${observed}.`)),
    Match.when(true, () =>
      validateRepositoryEndpoint(canonical, observed, label, options.rule, options.canonicalRepo)
    ),
    Match.exhaustive
  );
}

function validateRepositoryEndpoint(
  canonical: string,
  observed: string,
  label: string,
  rule: RuleGritFacts,
  canonicalRepo: string
): EndpointValidation {
  return Match.value(pathIsWithinRoot(canonical, canonicalRepo)).pipe(
    Match.when(false, () => invalidEndpoint(`${label}-repository-path-escape: ${observed}.`)),
    Match.when(true, () =>
      validateExactCoverageEndpoint(canonical, observed, label, rule, canonicalRepo)
    ),
    Match.exhaustive
  );
}

function validateExactCoverageEndpoint(
  canonical: string,
  observed: string,
  label: string,
  rule: RuleGritFacts,
  canonicalRepo: string
): EndpointValidation {
  return Match.value(exactCoverageContainsPath(rule, canonicalRepo, canonical)).pipe(
    Match.when(false, () => invalidEndpoint(`${label}-outside-exact-coverage: ${observed}.`)),
    Match.when(true, () => validEndpoint(canonical)),
    Match.exhaustive
  );
}

function validFinding(finding: GritApplyFindingEvidence): FindingValidation {
  return { kind: "valid", finding };
}

function validEndpoint(endpointPath: string): EndpointValidation {
  return { kind: "valid", path: endpointPath };
}

function invalidEndpoint(detail: string): EndpointValidation {
  return { kind: "invalid", detail };
}

function rejectedFindings(detail: string): FindingBatchValidation {
  return { kind: "rejected", detail };
}

function acceptedValidatedFindings(
  validations: readonly FindingValidation[]
): FindingBatchValidation {
  const findings = deduplicateFindings(validations.flatMap(validatedFindingValues));
  return Option.match(transformationEndpointConflict(findings), {
    onNone: () => ({ kind: "accepted", findings }),
    onSome: rejectedFindings,
  });
}

function validatedFindingValues(validation: FindingValidation): GritApplyFindingEvidence[] {
  return Match.value(validation).pipe(
    Match.when({ kind: "valid" }, ({ finding }) => [finding]),
    Match.when({ kind: "invalid" }, () => []),
    Match.exhaustive
  );
}

function isMissingPath(error: PlatformError): boolean {
  return error._tag === "SystemError" && error.reason === "NotFound";
}

function deduplicateFindings(
  findings: readonly GritApplyFindingEvidence[]
): readonly GritApplyFindingEvidence[] {
  return [...new Map(findings.map((finding) => [findingKey(finding), finding])).values()].sort(
    compareFindings
  );
}

function compareFindings(left: GritApplyFindingEvidence, right: GritApplyFindingEvidence): number {
  return findingKey(left).localeCompare(findingKey(right));
}

function findingKey(finding: GritApplyFindingEvidence): string {
  return Match.value(finding).pipe(
    Match.when(
      { kind: "rewrite" },
      ({ kind, originalPath, rewrittenPath }) => `${kind}\0${originalPath}\0${rewrittenPath}`
    ),
    Match.when({ kind: "match" }, ({ kind, path: findingPath }) => `${kind}\0${findingPath}`),
    Match.when({ kind: "create-file" }, ({ kind, path: findingPath }) => `${kind}\0${findingPath}`),
    Match.when({ kind: "remove-file" }, ({ kind, path: findingPath }) => `${kind}\0${findingPath}`),
    Match.exhaustive
  );
}

interface EndpointOwner {
  readonly endpoint: string;
  readonly owner: string;
}

function transformationEndpointConflict(
  findings: readonly GritApplyFindingEvidence[]
): Option.Option<string> {
  const rows = findings.flatMap(endpointOwnerRows).sort(compareEndpointOwners);
  const conflict = rows.find(endpointOwnerConflictsWithPrevious);
  return Option.map(
    Option.fromNullable(conflict),
    ({ endpoint }) => `conflicting-transformation-endpoint: ${endpoint}.`
  );
}

function endpointOwnerRows(finding: GritApplyFindingEvidence): EndpointOwner[] {
  return Match.value(finding).pipe(
    Match.when({ kind: "match" }, () => []),
    Match.when({ kind: "rewrite" }, ({ originalPath, rewrittenPath }) =>
      [...new Set([originalPath, rewrittenPath])].map((endpoint) => ({
        endpoint,
        owner: findingKey(finding),
      }))
    ),
    Match.when({ kind: "create-file" }, ({ path: endpoint }) => [
      { endpoint, owner: findingKey(finding) },
    ]),
    Match.when({ kind: "remove-file" }, ({ path: endpoint }) => [
      { endpoint, owner: findingKey(finding) },
    ]),
    Match.exhaustive
  );
}

function compareEndpointOwners(left: EndpointOwner, right: EndpointOwner): number {
  const endpointOrder = left.endpoint.localeCompare(right.endpoint);
  return Match.value(endpointOrder).pipe(
    Match.when(0, () => left.owner.localeCompare(right.owner)),
    Match.orElse((order) => order)
  );
}

function endpointOwnerConflictsWithPrevious(
  row: EndpointOwner,
  index: number,
  rows: EndpointOwner[]
): boolean {
  return Option.match(Option.fromNullable(rows[index - 1]), {
    onNone: () => false,
    onSome: (previous) => previous.endpoint === row.endpoint && previous.owner !== row.owner,
  });
}

function exactCoverageContainsPath(
  rule: RuleGritFacts,
  canonicalRepo: string,
  canonicalPath: string
): boolean {
  return Match.value(rule.pathCoverage.every((coverage) => coverage.kind === "exact-path")).pipe(
    Match.when(false, () => false),
    Match.when(true, () => exactPathCoverageContains(rule, canonicalRepo, canonicalPath)),
    Match.exhaustive
  );
}

function exactPathCoverageContains(
  rule: RuleGritFacts,
  canonicalRepo: string,
  canonicalPath: string
): boolean {
  const relative = path.relative(canonicalRepo, canonicalPath).split(path.sep).join("/");
  return rule.pathCoverage.some(
    (coverage) =>
      coverage.kind === "exact-path" &&
      coverage.patterns.some((pattern) => pathCoveragePatternMatches(pattern, relative))
  );
}
