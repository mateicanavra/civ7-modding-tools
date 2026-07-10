# Obligation Corpus Contract

Role: exact Stage 0 row contract for `obligation-corpus.jsonl`.

Normative method:
`docs/projects/mapgen-studio-runtime-transition/WORKSTREAM.md`

Each non-empty line is one JSON object. Unknown keys are invalid. All strings
are non-empty unless the type is explicitly nullable. Arrays contain unique
items. Repository paths are root-relative. `rowId` is globally unique and
matches `^[a-z0-9][a-z0-9._:-]*$`.

## Common Row

| Key | Type/cardinality | Allowed values or rule |
| --- | --- | --- |
| `schemaVersion` | integer, required | exactly `1` |
| `rowId` | string, required | globally unique stable id |
| `kind` | string enum, required | `config`, `effect-diagnostic`, `habitat-rule`, `packet-obligation`, `control-input` |
| `sourceRefs` | string array, min 1 | exact paths, commits, record ids, or report anchors |
| `evidenceSourceRefs` | string array, min 0 | immutable evidence inputs only |
| `authorityRefs` | string array, min 1 | controlling or candidate authority anchors |
| `owner` | string, required | semantic decision owner |
| `forbiddenOrNonOwners` | string array, min 0 | containers/callers that must not own the obligation |
| `applicabilityConditions` | string array, min 1 | conditions under which the row applies |
| `uncertainty` | string enum, required | `none`, `bounded`, `unresolved` |
| `uncertaintyReason` | string or null, required | null iff `uncertainty` is `none` |
| `expectedBehaviorOrInvariant` | string, required | one inspectable claim |
| `requiredEvidence` | evidence-requirement array, min 1 | schema below |
| `currentState` | string enum, required | `unexamined`, `confirmed-valid`, `confirmed-invalid`, `contradictory`, `stale`, `not-applicable` |
| `strongestEvidenceClass` | string enum, required | `none`, `authority`, `review`, `source-accounting`, `static`, `behavior`, `endpoint`, `browser`, `setup`, `in-game`, `integration` |
| `recordHome` | string, required | durable row/evidence/finding owner |
| `groupId` | string or null, required | batching aid only; never replaces the row |
| `openingProposal` | string enum, required | Stage 0 proposal vocabulary from `WORKSTREAM.md` |
| `semanticDisposition` | string enum or null, required | null until Stage 1; then final semantic vocabulary |
| `verificationState` | string enum, required | `not-run`, `running`, `failed`, `passed`, `not-applicable`, `stale`, `invalidated`, `environment-unavailable` |
| `notes` | string or null, required | context only, never a hidden disposition |
| `details` | object, required | exactly one kind schema below |

An evidence-requirement object has exactly four keys:

| Key | Type/cardinality | Rule |
| --- | --- | --- |
| `requirementId` | string, required | unique within the row |
| `evidenceClass` | string enum, required | one evidence class from the common row |
| `claim` | string, required | claim this evidence establishes |
| `gateIds` | string array, min 1 | every id resolves to `gate-register.jsonl` before closure |

## Kind Details

### Config

Exactly these keys are present:

| Key | Type/cardinality |
| --- | --- |
| `kind` | literal `config` |
| `configId` | string, globally unique among config rows |
| `sourcePath` | string, globally unique among config rows |
| `schemaDefaultSources` | string array, min 1 |
| `canonicalMaterializedDigest` | string or null |
| `jsonRoundTripState` | verification-state enum |
| `uiSelectionState` | verification-state enum |
| `authoringState` | verification-state enum |
| `browserGenerationState` | verification-state enum |
| `saveDeployState` | verification-state enum |
| `runInGameInputState` | verification-state enum |
| `sameConfigNoStudioTransformState` | verification-state enum |

There are exactly nine config rows, one for each id/path enumerated in
`verification-ledger.md`. Proxy, wildcard, map-name exception, property-name
exception, and group-only rows are invalid.

### Effect Diagnostic

Exactly these keys are present:

| Key | Type/cardinality |
| --- | --- |
| `kind` | literal `effect-diagnostic` |
| `diagnosticId` | string, globally unique |
| `reportCommand` | string |
| `reportTree` | full commit/tree identity string |
| `configurationDigest` | digest string |
| `reportPath` | string |
| `reportDigest` | digest string |
| `pluginCategory` | literal `plugin` |
| `ruleKey` | SHA-256 of the exact diagnostic message |
| `ruleMessage` | exact Biome plugin diagnostic message |
| `path` | string |
| `sourceSpan` | object with integer `startLine`, `startColumn`, `endLine`, `endColumn` |
| `severity` | non-empty reporter severity string |
| `occurrenceCount` | integer, min 1 |
| `semanticFixGroup` | string or null |

Biome 2.4.16's plugin reporter does not expose the packaged Grit rule id. The
corpus must not invent one. `ruleKey` provides deterministic semantic grouping
from the message's `Rule`, `Why`, and `Fix` text. `ruleKey` is lower-case
hexadecimal SHA-256 of the UTF-8 bytes of
`JSON.stringify([ruleMessage])`. `diagnosticId` is the same hash over
`JSON.stringify([ruleKey, path, startLine, startColumn, endLine, endColumn,
severity])`. Array order defines canonical encoding; no object-key
canonicalization or locale-sensitive formatting is involved. The row count and
unique diagnostic ids equal the frozen structured report. No diagnostic may
disappear because a later report moved its source span; comparison uses both
`diagnosticId` and the span-independent `ruleKey`/path family.

### Habitat Rule

Exactly these keys are present:

| Key | Type/cardinality |
| --- | --- |
| `kind` | literal `habitat-rule` |
| `ruleId` | string, globally unique |
| `invariantClass` | string enum `structure`, `boundary`, `source-pattern`, `hook-policy`, `aggregate` |
| `positiveAssertion` | string |
| `lifecycle` | string enum `durable`, `transitional`, `stale`, `split-pending` |
| `runner` | string enum `structure`, `grit`, `nx`, `script`, `aggregate` |
| `scanRoots` | string array, min 1 |
| `positiveFixtures` | string array, min 1 for retained rules |
| `negativeFixtures` | string array, min 1 for retained rules |
| `parserFixtures` | string array, min 0 |
| `falsePositiveFixtures` | string array, min 0 |
| `currentTreeResult` | verification-state enum |
| `baselineContract` | string |
| `hookScope` | string or null |
| `promotionTarget` | string or null |
| `removalCondition` | string or null |

`durable` requires `promotionTarget`; `transitional` and `stale` require
`removalCondition`. Runner choice does not change semantic ownership. No rule
outside Habitat is admitted.

### Packet Obligation

Exactly these keys are present:

| Key | Type/cardinality |
| --- | --- |
| `kind` | literal `packet-obligation` |
| `packetId` | string enum `P01` through `P21` |
| `obligationId` | string, unique within the packet |
| `obligationType` | string enum `task`, `gate`, `evidence`, `review` |
| `packetAnchor` | string |
| `gateIds` | string array, min 1 for `gate`, `evidence`, or `review`; otherwise min 0 |

The corpus contains every task, gate, evidence row, and required review lane
from all 21 packets. One packet-level proxy row is invalid.

### Control Input

Exactly these keys are present:

| Key | Type/cardinality |
| --- | --- |
| `kind` | literal `control-input` |
| `controlInputId` | string, globally unique |
| `controlType` | string enum `user-direction`, `review`, `correction`, `session`, `watcher`, `scratch`, `stash`, `worktree` |
| `classification` | string enum `authority`, `coordination`, `evidence`, `control`, `stale`, `excluded` |
| `material` | boolean |
| `contentDigest` | digest string |
| `findingIds` | string array, min 0 |
| `affectedGateIds` | string array, min 0 |

Every material control input has at least one `findingId`, `affectedGateId`, or
accepted authority reference. Every referenced id resolves before Stage 0 can
close.

## Effect Report Constructor

The Effect diagnostic source is selected now rather than left to a Stage 0
worker:

- tree: the exact frozen Stage 0 source tree;
- scope constructor: NUL-delimited repository-owned tracked targets from
  `git ls-files -z -- '*.ts' '*.tsx'`; gitlink contents such as `.repos/effect`
  are therefore excluded without a path special case;
- config: root `biome.json` and its full `@catenarycloud/linteffect` extension;
- raw command per deterministic target chunk:
  `bun biome lint --reporter=json --max-diagnostics=none <targets...>`;
- Effect selector: structured diagnostics whose `category` is exactly
  `plugin`;
- durable filtered output:
  `evidence/effect/stage-0-biome-effect-diagnostics.json`;
- configuration inputs: `biome.json`, `package.json`, `bun.lock`, and the
  resolved `@catenarycloud/linteffect` package/config/rule-file digests.

At the opening tree, root Biome configuration admits no other plugin. Stage 0
must verify that fact before using the selector. If another plugin is present,
classification becomes a design input and the corpus gate remains open rather
than guessing by rule name.

The accepted pinned Biome 2.4.16 raw reporter shape is:

```text
{
  command: literal "lint",
  diagnostics: Array<{
    severity: string,
    message: string,
    category: string,
    location: {
      path: string,
      start: { line: integer, column: integer },
      end: { line: integer, column: integer }
    },
    advices: Array<unknown>
  }>,
  summary: {
    changed: nonnegative integer,
    unchanged: nonnegative integer,
    matches: nonnegative integer,
    duration: nonnegative integer,
    errors: nonnegative integer,
    warnings: nonnegative integer,
    infos: nonnegative integer,
    skipped: nonnegative integer,
    suggestedFixesSkipped: nonnegative integer,
    diagnosticsNotPrinted: nonnegative integer,
    scannerDuration: nonnegative integer
  }
}
```

Missing fields, non-integer or sub-one coordinates, start-after-end ranges, or a
non-JSON report fail the collector. Raw summary fields receive exactly the
shape and nonnegative-range validation shown above; they are retained as input
metadata but do not determine normalized counts. Additional Biome fields are
ignored for normalized identity but covered by the retained raw-shape fixture
and pinned tool/config digests.

Stage 0 materializes
`docs/projects/mapgen-studio-runtime-transition/collect-effect-diagnostics.ts`
with this exact algorithm:

1. Require a clean tree equal to `--tree`; resolve repository root and collect
   the tracked TS/TSX list from Git as NUL-delimited bytes.
2. Convert backslashes to `/`; resolve absolute reporter paths under the repo
   root; strip one leading `./`; apply POSIX normalization; reject NUL, empty,
   `.`, `..`, paths beginning `../`, or absolute/outside-root results. Preserve
   Unicode bytes and case otherwise.
3. Sort target paths by UTF-8 byte order using `Buffer.compare`. Partition that
   total order into consecutive, non-overlapping chunks of 256; every target
   appears exactly once.
4. Spawn the raw Biome command as an argv array, never through a shell. Accept
   exit `0` or diagnostic exit `1`; any other exit, stderr-only result, or JSON
   shape failure stops collection.
5. Parse every report and retain only diagnostics with `category === "plugin"`.
   Compute `ruleKey` and `diagnosticId` with the array encodings above.
6. Group identical canonical diagnostic tuples by `diagnosticId` and set
   `occurrenceCount` to their count. If one id maps to non-identical tuples,
   stop as a hash collision. No other duplicate collapse is allowed.
7. Sort normalized diagnostics by `ruleKey`, path, start line, start column, end
   line, end column, severity, then `diagnosticId`; string comparisons use UTF-8
   byte order and coordinates are numeric.

   The canonical diagnostic tuple is exactly
   `[ruleKey, path, startLine, startColumn, endLine, endColumn, severity]`.
   Each normalized `diagnostics[]` object has properties in this order:
   `diagnosticId`, `ruleKey`, `ruleMessage`, `path`, `sourceSpan`, `severity`,
   `occurrenceCount`. `sourceSpan` has properties `startLine`, `startColumn`,
   `endLine`, `endColumn` in that order. If one `ruleKey` maps to more than one
   exact `ruleMessage`, stop as a rule-key collision.
8. Write one envelope with properties in this order:
   `schemaVersion` as integer literal `1`; `reportTree` (`commit`, `tree`);
   `targets` (`count`, `digest`), where `count` is
   `sortedTargetPaths.length`; `configuration` (`biomeJsonDigest`,
   `packageJsonDigest`, `bunLockDigest`, `lintEffectVersion`, `lintEffectPackageDigest`,
   `fullConfigDigest`, `ruleSetDigest`); `collector` (`command`, `chunkSize`);
   `diagnostics`; `summary` (`rawPluginDiagnosticCount`, `diagnosticCount`,
   `uniqueRuleCount`, `severityCounts`).
9. Compute `targets.digest` from UTF-8 `JSON.stringify(sortedTargetPaths)`.
   Compute `configurationDigest` for corpus rows from UTF-8
   `JSON.stringify` of the seven configuration values in the envelope's stated
   order. Serialize the envelope with
   `JSON.stringify(envelope, null, 2) + "\n"`, write a sibling temporary file,
   fsync, and atomically rename it to the output. `reportDigest` is SHA-256 of
   those final UTF-8 bytes.

Every file digest above is lower-case hexadecimal SHA-256 of the file's raw
bytes. `fullConfigDigest` is the digest of resolved
`@catenarycloud/linteffect/configs/full.jsonc`. Parse that file and resolve every
listed Grit rule; normalize each to a lintEffect-package-relative POSIX path.
Sort `[path, fileDigest]` pairs by path with `Buffer.compare`, then by digest,
and define `ruleSetDigest` as SHA-256 of UTF-8 `JSON.stringify(sortedPairs)`.
Define `lintEffectPackageDigest` the same way over the sorted union of
`package.json`, `configs/full.jsonc`, and every referenced rule file. The
version is the exact `version` string from that package's `package.json`.

`configurationDigest` is SHA-256 of UTF-8
`JSON.stringify([biomeJsonDigest, packageJsonDigest, bunLockDigest,
lintEffectVersion, lintEffectPackageDigest, fullConfigDigest, ruleSetDigest])`.
The first three values are raw-byte digests of the repository-root files with
those names. `collector.command` is the literal string
`bun biome lint --reporter=json --max-diagnostics=none <targets...>` and
`collector.chunkSize` is integer `256`.

`rawPluginDiagnosticCount` is the number of selected plugin diagnostics before
duplicate grouping. `diagnosticCount` is the normalized diagnostics array
length. `uniqueRuleCount` is the number of distinct `ruleKey` values.
`severityCounts` is an array of `{ severity, count }` objects, properties in
that order, sorted by UTF-8 severity bytes; each count is over normalized
diagnostics, so its sum equals `diagnosticCount`. The sum of all
`occurrenceCount` values equals `rawPluginDiagnosticCount`.

The exact invocation is:

```text
bun docs/projects/mapgen-studio-runtime-transition/collect-effect-diagnostics.ts --tree <frozen-commit> --output docs/projects/mapgen-studio-runtime-transition/evidence/effect/stage-0-biome-effect-diagnostics.json
```

The output count is the required Effect row count. A second extraction from the
envelope must produce exactly one corpus row per unique `diagnosticId`; count or
identity mismatch fails Stage 0.

Collector fixtures include the full pinned raw shape above with
`category: "plugin"`, no rule-id field, and a `Rule`/`Why`/`Fix` message; a
non-plugin diagnostic; target lists around the 256 boundary; duplicate chunk
output; relative, absolute, backslash, and outside-root paths; hash-vector
assertions; total-order ties; and two spans sharing one `ruleKey`. Any reporter-
shape change reopens the constructor rather than silently producing zero rows.

The fixture set has three separately authored golden artifacts: pinned raw
chunk reports, the exact normalized envelope bytes, and the expected lower-case
SHA-256 of those bytes. The collector test may not generate its own expected
file. It also includes distinct-message/same-`ruleKey` and distinct-tuple/same-
`diagnosticId` injected collision vectors, plus assertions for
`rawPluginDiagnosticCount`, `diagnosticCount`, `uniqueRuleCount`, every sorted
severity count, occurrence-count sum, target/config/rule/package digests, final
newline, and `reportDigest`. Golden assertions explicitly include
`schemaVersion === 1` and `targets.count === sortedTargetPaths.length`.

## Validation And Closure Queries

Stage 0 first creates a TypeBox discriminated-union schema from this exact
contract and a project-local validator beside the corpus. It may not add or
rename fields. The validator is invoked with:

```text
bun docs/projects/mapgen-studio-runtime-transition/validate-obligation-corpus.ts docs/projects/mapgen-studio-runtime-transition/obligation-corpus.jsonl
```

The validator uses `Value.Check`, rejects unknown keys, reports line and row id,
enforces all conditional/cardinality/uniqueness rules above, verifies every
cross-reference against `gate-register.jsonl` and the finding/wave records, and
prints counts by kind. Its own focused fixtures cover one valid row per kind,
unknown key, invalid enum, missing conditional field, duplicate identity,
unresolved gate/finding reference, and wrong config/report count.

The Stage 0 gate record retains the command, schema/validator/corpus digests,
fixture result, counts, and zero-error verdict. Corpus queries use structured
`jq -s` selection by `kind`, `owner`, `semanticDisposition`,
`verificationState`, and unresolved reference; grep-based counts are invalid.
