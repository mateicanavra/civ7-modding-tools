# Takeover Grit Diagnostic Acquisition Wave 01

Status: active; affected review 07 accepted three P2s and one P3; eighth
bounded repair is next

Record target:
`docs/projects/mapgen-studio-runtime-transition/verification-ledger.md`

## Packet

Objective: replace the identity- and path-specific Grit diagnostic adapters
with one generic, hermetic `check | apply-dry-run` observation capability on a
clean child of the takeover control seal. Every selected rule must receive one
truthful public execution disposition and only a complete native observation
may produce `clean` or findings.

This is G.1 only. It supplies generic diagnostic acquisition needed by the
MapGen closeout, but it does not admit fixes, apply authority, A.2 Authority,
domain behavior, product simplification, stack recutting, or product closure.

Authority order:

1. current direct user direction and the sealed takeover frame;
2. root and closest `AGENTS.md` routers;
3. `.habitat` rule and Pattern Authority;
4. Habitat diagnostic and structural-check public contracts;
5. the pinned installed Grit package and native executable as observed facts;
6. clean source at `d82b64450e18` as the reconstruction base;
7. the inherited mixed worktree only as bounded design evidence.

The skills loaded for this packet are `civ7-habitat-dra-workstream`,
`civ7-architecture-authority`, `dev:effect-ts`, `dev:typebox`, and
`typescript-refactoring`. Their governing implications are: preserve the
authority/tool boundary, model state as closed data, parse unknown values at
the boundary, retain typed failures through Effect, acquire and release scoped
resources, remove special cases rather than rename them, and bind review and
proof to an exact frozen tree.

## Baseline And Protected State

- clean reconstruction branch:
  `codex/mapgen-runtime-closeout-control-reconciliation`;
- exact HEAD: `d82b64450e189db0e43ea92b9889803c095424c4`;
- sole parent: `8ec2a96e3319a97902dc974b920160e1a1c5ad5b`;
- protected `main == origin/main == 46943c5f1165`;
- protected readiness sentinel `f325250d0878`;
- inherited evidence remains `62` tracked changes, `31` actual untracked
  files, `75` normal porcelain entries, and `0` staged paths;
- no Git operation, Graphite mutation lease, provider implementation owner, or
  provider reviewer was active when this packet froze;
- the unrelated original-owner Studio runner remains outside this wave.

No hunk is copied from the inherited tree. The clean source is rewritten
toward the target model; inherited files and tests are evidence about useful
shapes and failed approaches only.

## Research Wave

All three lanes were read-only and changed no repository file, ref, worktree,
Graphite state, or persistent process.

| Lane | Agent | State | Decision input |
| --- | --- | --- | --- |
| clean call graph and state model | `/root/provider_clean_model` | closed-passed | production call graph, special-case reachability, smallest closed target model, hidden public-disposition scope |
| inherited hunk and source attribution | `/root/provider_evidence_corpus` | closed-passed | useful ideas to reimplement, ten concrete inherited defects, forbidden corpus, exact dependency order |
| pinned native wire oracle | `/root/provider_proof_oracle` | closed-passed | executable identity, hermetic command topology, exact observed schemas, terminal/count laws, RemoveFile limit, deterministic proof matrix |

The reports agree on the six accepted blockers and on one necessary scope
correction: an internal provider result is insufficient. The structural check
surface must expose `no-matched-scan-roots` rather than labeling that selected
rule `executed`.

## Authority And Ownership

- `.habitat` owns rule identity, pattern files, scan roots, messages, lane, and
  the declared diagnostic acquisition policy.
- `tools/habitat` owns catalog materialization, root admission, native process
  execution, wire decoding, observation reconciliation, diagnostic projection,
  and public execution disposition.
- Grit owns pattern syntax and its native wire formats. Habitat decodes the
  pinned formats; it does not invent findings from human text.
- `PatternApplyGritPort` and the existing generic `applyDryRun` fix transaction
  remain separate. This wave neither grants live-write authority nor changes
  the G.2 fix-admission policy.
- The docs portability rule remains an ordinary Grit rule. Its only special
  fact is the manifest-declared `{ "kind": "apply-dry-run" }` acquisition
  policy. Rule id, path, extension, and file type never choose the adapter.

Input manifests may omit diagnostic acquisition only as source shorthand for
the normalized default `{ kind: "check" }`. Runtime rule facts and diagnostic
catalog entries always carry the required closed discriminant.

### Directional Resource Seam

The structural-check consumer depends on a capability-named
`StructuralRuleDiagnosticsPort` and receives a directionally generalized
`RuleDiagnosticExecutionResult`. `service/impl.ts` adapts the currently
selected concrete Grit provider into that narrow `runRules` port. This removes
vendor naming from the dependency noun, but the result and public report still
carry Grit-specific provider failure kinds and the catalog/identity schemas
remain Grit-shaped. The output contract is therefore not vendor-stable yet.

G.1 is not completed provider swappability. `RuleSourceFacts` still carries
the Grit runner, `patternName`, pattern assets, and Grit diagnostic acquisition
policy; the service dependency also remains the concrete Grit provider because
the fix module consumes its check/apply operations. Renaming that larger
dependency would merely hide the leak and would create a false mega-port.

The immediate post-G.1 architecture slice must separate capability-level rule
selection and admitted scope from provider-specific pattern identity and
acquisition configuration; define capability-level output and error state;
separate generic catalog/identity contracts from Grit wire identities; then
move the implementation to the canonical
`resources/<capability>/providers/<vendor>` topology. It must not invent an
opaque `providerRuleRef`, claim Grit and ast-grep can consume the same authored
assets, or import the full RAWR runtime-realization substrate into Habitat.
That follow-on slice is mechanical only after its input/selection boundary is
semantically locked; it is not folded into this six-blocker candidate.

That slice also owns provider lifetime. G.1 currently revalidates package and
native version identity before every command. Direct measurement puts five
native `--version` calls at about 0.04 seconds total, so this is truthful
redundancy rather than the source of the all-Grit latency. The follow-on must
make successful preflight lazy once per realized Habitat provider/runtime, not
cross-process global state. G.1 does not add an ad hoc mutable cache merely to
hide the lifecycle boundary.

## Target State Model

Plan every selected rule exactly once:

```ts
type PlannedGritRule =
  | { readonly kind: "execute"; readonly rule: RuleSourceFacts; readonly roots: readonly [string, ...string[]] }
  | { readonly kind: "not-applicable"; readonly rule: RuleSourceFacts; readonly reason: "no-matched-scan-roots" }
  | { readonly kind: "refused"; readonly rule: RuleSourceFacts; readonly decision: DiagnosticScanRootRefusal };
```

The executable branch also carries the normalized `check | apply-dry-run`
policy. Grouping may optimize identical executable plans only after this
immutable per-rule plan exists. No later layer recomputes, falls back to all
caller roots, drops an unmatched rule, or synthesizes clean from an empty
merge. Independent per-rule acquisitions may run with the established bounded
concurrency of two; their catalogs, workspaces, evidence, outcomes, and timing
remain isolated and deterministically reassembled in selected-rule order.

Acquisition is one closed union:

```ts
type GritDiagnosticAcquisition =
  | { readonly kind: "acquisition-failed"; readonly failure: GritAcquisitionFailure; /* evidence */ }
  | { readonly kind: "parse-failed"; readonly failure: GritParseFailure; /* evidence */ }
  | { readonly kind: "parsed-incomplete"; readonly failure: GritIncompleteObservation; /* evidence */ }
  | { readonly kind: "observed-complete"; readonly observation: GritObservation; /* evidence */ };
```

`not-run`, `acquisition-failed`, `parse-failed`, `parsed-incomplete`, and
`observed-complete` are distinct semantic states. Only `observed-complete` may
be projected to clean or findings. Every switch over plan, acquisition,
observation, and event type ends in a compiler-checked `never` assertion.

Public propagation is equally closed. The rule-diagnostics structural port
returns the rule result together with either `executed`, `not-applicable` with
`no-matched-scan-roots`, or an existing refusal/failure disposition. The
structural policy must not relabel every returned row `executed`. Because each
rule is acquired independently, the provider also returns that rule's own
duration. The structural consumer must not label the total serial wall time as
one shared execution group or copy that total onto every rule.

## Pinned Native Contract

Package and current native evidence:

- package `@getgrit/cli@0.1.0-alpha.1743007075`;
- direct executable
  `node_modules/@getgrit/cli/node_modules/.bin_real/grit`;
- current platform `darwin/arm64`, Mach-O arm64;
- native version `grit 0.1.1`;
- size `84,376,600` bytes;
- SHA-256
  `ce6f216eb60f5652f5f60156e411d136ce600cb29d9616e5e2018a38fdde0cb7`.

Runtime resolves and preflights the direct installed native. It never invokes
`node_modules/.bin/grit` or `run-grit.js`, because that shim may download a
binary. The package spec and native version are runtime identity facts; the
current arm64 size and digest are exact proof evidence rather than a universal
cross-platform constant.

Every diagnostic acquisition owns one scoped parent containing:

- `.grit/grit.yaml` with only the selected catalog;
- an empty `GRIT_USER_CONFIG` directory;
- an empty isolated `GRIT_CACHE_DIR`;
- no ambient repository or user Grit configuration.

The command runs from the parent that owns `.grit`, uses absolute admitted
pattern and target paths, disables downloads and telemetry, disables colors,
sets `GRIT_MAX_FILE_SIZE_BYTES=0`, and cleans every scoped resource on success
or failure.

Check uses the direct native with `--json check --level error --no-cache` and
pins the sole JSON document to `stderr`. Apply observation uses
`--jsonl apply <absolute-pattern> <absolute-root> --dry-run --force --output
compact` and pins JSONL to `stdout`. Output on the wrong stream, both streams,
truncation, wrapper text, or blank JSONL records fails closed.

## Closed Wire Contracts

Check JSON requires closed objects and required `paths` and `results`. Each
result requires `check_id`, `local_name`, `path`, complete start/end positions,
and the observed `extra` shape. Only top-level `paths` proves processing.
Completion additionally requires:

- at least one processed path for every executed root;
- every processed path is canonical and contained by its admitted root;
- every result path occurs in the top-level processed paths;
- every result identity belongs to the selected catalog;
- `check_id` and `local_name` do not conflict.

An empty eligible root can emit `{ paths: [], results: [] }`; that is
`parsed-incomplete`, never clean. Native execution from the scoped external
catalog did not honor a nested target `.gitignore`, so this wave does not claim
whole-filesystem completeness beyond its independently admitted root/path
oracle.

Compact JSONL is a closed TypeBox union of `PatternInfo`, `AllDone`, `Match`,
`InputFile`, `Rewrite`, `CreateFile`, `RemoveFile`, and `AnalysisLog`. `DoneFile`
and unknown typenames are rejected for this command profile. Completion needs
exactly one final `AllDone`, no event after it, reason `allMatchesFound`, and
reconciled counts.

Observed count law:

- `Match`: `max(1, ranges.length)`;
- `Rewrite`: `max(1, original.ranges.length)`;
- `CreateFile`: `1`, established by a pinned native `Rewrite + CreateFile`
  fixture;
- informational events and `AnalysisLog`: `0`.

`RemoveFile` is decoded, but its count law is deliberately not invented. The
pinned native could not be made to emit it: whole-body deletion produced a
zero-range `Rewrite`, filename deletion produced `Rewrite`, and `$new_files`
produced `Rewrite + CreateFile`. Any observed `RemoveFile` therefore yields
`parsed-incomplete` with `unproven-remove-file-cardinality` until a real pinned
fixture establishes the law. This is closed fail-safe behavior, not a clean or
finding claim.

Any `AnalysisLog` below native level `400`, a non-success terminal reason,
missing processing evidence, ambiguous CreateFile path containment, or a count
mismatch blocks completion. Valid JSONL with an error analysis and no terminal
is parsed-incomplete, not malformed and not tool-unavailable.

## Failure Vocabulary

The implementation retains exact distinctions at least at these levels:

- acquisition: native missing, unexecutable, identity mismatch, scoped-config
  failure, spawn failure, interruption, timeout, or nonzero command exit;
- parse: no output, wrong/multiple streams, truncation, malformed JSON/JSONL,
  blank record, schema drift, or unknown event;
- incomplete: no processed paths, unobserved root, path escape, result without
  processing evidence, unexpected/conflicting identity, analysis failure,
  terminal shape/reason/order failure, processed zero, count mismatch, or
  unproven RemoveFile cardinality;
- complete: clean or findings only.

Typed provider/resource failures remain typed through Effect. They are mapped
once at the observation boundary; acquisition failure is not collapsed into
parse failure, and valid incomplete native output is not described as an
internal schema error.

## Historical Initial Write Authorization

This list records the implementation owner's original authorization and its
later bounded amendments. It is not the current candidate inventory. The
mechanically complete final candidate path set for review 07 appears under
`Seventh Repair Integration And Proof`.

The primary implementation owner may write only these behavior and focused
test paths:

- `.habitat/AUTHORITY-TOOL-SEPARATION.md`;
- `.habitat/docs/rules/ensure_docs_checkout_paths_are_portable/rule.json`;
- `tools/habitat/src/providers/grit/apply-dry-run.ts` (new);
- `tools/habitat/src/providers/grit/check.ts` (new);
- `tools/habitat/src/providers/grit/diagnostics.ts`;
- `tools/habitat/src/providers/grit/env.ts`;
- `tools/habitat/src/providers/grit/failures.ts`;
- `tools/habitat/src/providers/grit/index.ts`;
- `tools/habitat/src/providers/grit/output.ts`;
- `tools/habitat/src/providers/grit/request.ts`;
- `tools/habitat/src/providers/grit/resource.ts`;
- `tools/habitat/src/providers/grit/runner.ts`;
- `tools/habitat/src/providers/grit/scan-roots/index.ts`;
- `tools/habitat/src/providers/grit/scoped-config.ts`;
- `tools/habitat/src/providers/grit/types.ts`;
- delete `tools/habitat/src/providers/grit/docs-apply.ts`;
- delete `tools/habitat/src/providers/grit/source-check.ts`;
- `tools/habitat/src/service/model/check/dto/check.schema.ts`;
- `tools/habitat/src/service/model/check/policy/disposition-diagnostics.policy.ts`;
- `tools/habitat/src/service/model/check/policy/structural/context.policy.ts`;
- `tools/habitat/src/service/model/check/policy/structural/report.policy.ts`;
- `tools/habitat/src/service/model/check/policy/structural/source-execution.policy.ts`;
- only the structural-check adapter block in `tools/habitat/src/service/impl.ts`;
- `tools/habitat/src/service/model/diagnostics/dto/diagnostic-catalog.schema.ts`;
- `tools/habitat/src/service/model/diagnostics/dto/diagnostic-command.schema.ts`;
- `tools/habitat/src/service/model/diagnostics/dto/diagnostic-identity.schema.ts`;
- `tools/habitat/src/service/model/diagnostics/dto/diagnostic-outcome.schema.ts`;
- `tools/habitat/src/service/model/diagnostics/errors/diagnostic-provider.errors.ts`;
- `tools/habitat/src/service/model/diagnostics/index.ts`;
- `tools/habitat/src/service/model/diagnostics/policy/rule-runtime/architecture.policy.ts`;
- `tools/habitat/src/service/model/rules/dto/registry.schema.ts`;
- `tools/habitat/src/service/model/rules/policy/facts.policy.ts`;
- only Grit runner-path semantic validation in
  `tools/habitat/src/service/model/rules/repositories/registry.repository.ts`;
- `tools/habitat/test/lib/grit-provider.test.ts`;
- `tools/habitat/test/lib/grit-provider-current-tree-execution.test.ts` (new);
- only the Grit-local block of `tools/habitat/test/lib/vendor-providers.test.ts`;
- focused public disposition cases in
  `tools/habitat/test/lib/rule-selection.test.ts`;
- only the shared Grit fake-port result block in
  `tools/habitat/test/support/habitat-service-deps.ts`;
- only the Grit `runRules` override in
  `tools/habitat/test/service/check-baseline-manifest-service.test.ts`;
- only the two Grit fact expectations in
  `tools/habitat/test/rules/registry/facts.test.ts`;
- only the provider-failure fixture tag in
  `tools/habitat/test/lib/check-summaries.test.ts`;
- only the two provider-failure fixture tags in
  `tools/habitat/test/lib/hooks.test.ts`;
- only the structural rule-diagnostics fake port in
  `tools/habitat/test/lib/structure-check-execution.test.ts`;
- only the structural rule-diagnostics adapter in
  `tools/habitat/test/lib/check-baseline-provider-boundary.test.ts`;
- focused Grit pattern-path authority cases in
  `tools/habitat/test/rules/registry/contract.test.ts`.

The two localized fake-port blocks are the first scope amendment after
implementation began. Making the Grit port disposition required changes its
return shape; leaving either fake on the old bare `RuleRunResult` shape would
make the owner typecheck false. They may wrap the existing result with its
truthful `executed` disposition and may not change any surrounding baseline,
service, or harness behavior.

The three later integration-test paths are a second localized amendment after
the DRA ran the full uncached Habitat suite. Facts expectations must name the
new normalized default acquisition field, while summary and hook fixtures must
use the new closed malformed-output failure tag. They may change no unrelated
test behavior. The first full-suite attempt is retained as a failed integration
gate rather than hidden by the focused pass.

The consumer-seam paths are a third bounded amendment after architecture
review against the canonical resource/provider model. They may rename only the
structural consumer port/result, adapt the concrete provider at service
construction, and update the two direct context fixtures. They may not rename
the concrete `HabitatServiceDeps.grit` mega-capability, move the provider file
tree, generalize provider-specific rule inputs, or claim completed provider
swappability.

The review-repair paths are a fourth bounded amendment. `report.policy.ts` is
needed so neutral provider failure blocks an advisory rule; the registry
repository and contract test are needed to reject arbitrary asset reads before
referenced-file probing. No surrounding registry semantics, report status,
baseline behavior, or non-Grit runner path may change.

No static invalid-pattern fixture is admitted; tests create isolated fixtures
dynamically. `constants.ts` and `failure.ts` stay untouched unless the primary
owner proves one has become dead and asks the DRA to amend this packet before
writing it.

The DRA alone may update the four workstream record paths:

- this Wave Packet;
- `verification-ledger.md`;
- `cleanup-register.jsonl`;
- `gate-register.jsonl`.

`NEXT-PACKET.md` may receive only a terminal phase handoff after G.1 passes.
Any other path is a stop condition and requires explicit packet amendment
before mutation.

## Forbidden Scope

- every A.2 Authority or domain file and every unrelated vendor-provider hunk;
- fix-module admission, live apply, mutation, rollback, and safe-write claims;
- package or lockfile changes, generated output, caches, baselines, and broad
  fixture churn;
- inherited record edits or any write in the preserved evidence worktree;
- control semantics, final sink graph, recut design, Graphite submission,
  remote, PR, readiness, Studio runtime, or product behavior mutation.

## Implementation Order

1. normalize manifest policy, catalog policy, disposition, and diagnostic state
   vocabulary;
2. build the one-pass per-rule root-plan union;
3. build direct-native resolution/preflight and scoped hermetic resources;
4. implement closed check JSON and compact JSONL decoders;
5. interpret check and apply observations without identity/path special cases;
6. exhaustively dispatch acquisition policy and propagate the public
   disposition;
7. delete docs/text adapters, cache-provenance state, and stale native identity;
8. rebuild focused synthetic tests and the real pinned-native suite;
9. update authority prose only to the behavior actually proven.

One primary implementation owner owns this tightly coupled set. No second
writer overlaps it. The DRA remains responsible for target judgment, findings,
integration, records, tests, Git/Graphite, and closure.

## Proof Matrix

Focused tests must cover:

- closed decoders for every valid event and every malformed/incomplete class;
- mixed selected rules where one matches explicit roots and one is publicly
  `not-applicable/no-matched-scan-roots`;
- all-unmatched, multi-root, child-root, missing, outside, protected, and
  disjoint-root plans;
- no empty merge becomes clean and no catalog leaks across rule/root plans;
- direct native path, package/native identity, download-disabled environment,
  scoped cleanup, hostile ambient config isolation, and pinned streams;
- positive, clean, mixed, empty-root, and invalid-catalog check fixtures;
- Match, multi-range Rewrite, zero-range Rewrite, CreateFile, clean terminal,
  docs portability rewrite, and completion-blocked RemoveFile JSONL;
- no filesystem or repository mutation before and after every real dry run.

Closing command classes:

```bash
nx run habitat:check --skip-nx-cache --outputStyle=static
bun run --cwd tools/habitat test --run \
  test/lib/grit-provider.test.ts \
  test/lib/grit-provider-current-tree-execution.test.ts \
  test/lib/vendor-providers.test.ts \
  test/lib/rule-selection.test.ts
nx run habitat:boundaries --skip-nx-cache --outputStyle=static
nx run habitat:build --skip-nx-cache --outputStyle=static
nx run habitat:test --skip-nx-cache --outputStyle=static
bun habitat check --rule prohibit_product_scan_roots_in_grit_provider --json
bun habitat check --rule ensure_docs_checkout_paths_are_portable --json
bun habitat check --runner grit --json
bun biome ci --max-diagnostics=none <exact-changed-source-and-test-paths>
bun run lint
bun run openspec:validate
git diff --check
```

Before Graphite mutation, classify every changed path and run every truthful
reported target, parse both JSONL registers, freeze the exact candidate object
digest, recheck protected refs and inherited `62/31/75/0`, and prove no active
Git operation or overlapping mutation lease.

## Initial Pre-Freeze Integration Outcome

The DRA integrated the primary handoff, repaired five full-suite fixture
expectations, added the directional resource seam, replaced false shared Grit
timing with provider-measured per-rule duration, and restored the established
bounded acquisition concurrency of two. A read-only runtime audit found no
P0/P1, required that concurrency correction as P2, accepted the duration law,
and kept lazy once-per-runtime preflight in the immediate follow-on lifecycle
slice.

Current candidate proof:

- Habitat typecheck, boundaries, build, and diff hygiene pass;
- six focused files pass `60/60`; the complete Habitat suite passes `342/342`;
- strict OpenSpec validation passes all `371` items; root lint routing passes;
- provider source and focused candidate tests pass scoped Biome;
- full changed-path Biome checks 35 files and remains red at 24 errors plus 20
  infos. Every error is on a pre-existing committed line in eight shared/test
  files. This is differential residue, not a clean-Biome claim and not an
  invitation to broaden G.1 into unrelated cleanup;
- the exact corrected all-Grit command selected all 79 rules: 74 pass, four
  fail on one missing declared root and three existing Studio/Swooper product
  findings, and the docs portability rule reports one advisory incomplete
  observation from an existing archived Markdown parse failure. No incomplete
  observation is mislabeled clean;
- the live provider-boundary rule passes, and real apply-dry-run fixtures prove
  no repository mutation.

No current-tree red result is hidden. The four enforced and one advisory rows
remain named downstream obligations or external current-tree evidence; they do
not invalidate the generic provider state machine that reported them.

## Initial Review Outcome

Three fresh agents independently reproduced the exact 45-path manifest and
digest
`1f6b7c0539eb7da0742d13311310f60ec43e6a91ef07e5d9ed7d5103be98cad6`
before and after review. Every reviewer remained read-only. All three requested
changes; overlapping reports consolidate to ten accepted defects:

| Finding | Severity | Disposition | Repair law |
| --- | --- | --- | --- |
| `G1-AUTH-001`, `G1-TS-001` | P1 | accepted | only complete clean/findings outcomes are public `executed`; every acquisition, parse, incomplete, identity, or missing-outcome failure becomes neutral `failed` and blocks regardless of advisory lane |
| `G1-AUTH-002`, `G1-PROD-001` | P1 | accepted | canonicalize before final scan-root authority, store only canonical admitted roots, and refuse outside/protected/declaration symlink escape before acquisition |
| `G1-AUTH-003` | P2 | accepted | enforce lexical and canonical `.habitat` containment for every pattern asset before reading it |
| `G1-TS-002` | P1 | accepted | `PatternInfo.valid === false` is parsed-incomplete, never observed-complete |
| `G1-TS-003` | P2 | accepted | acquisition, parse, and incomplete states own disjoint failure unions and state-specific constructors; dispatch is compiler-exhaustive |
| `G1-TS-004` | P2 | accepted | preserve typed acquisition causes through the observation boundary; do not infer native identity or command state from prose or relabel root/config failures |
| `G1-TS-005` | P2 | accepted | pinned-native preflight requires completed exit code zero in addition to exact output identity |
| `G1-TS-006` | P2 | accepted | a blank native message is normalized to the nonblank authority message before public projection |
| `G1-PROD-002` | P2 | accepted | decode the closed source-derived non-null `MatchReason` object for every compact event that embeds it; retain the honest not-yet-observed label |
| `G1-PROD-003` | P2 | accepted | a command that never spawned remains `tool-unavailable` evidence rather than a false completed process |

The directional resource seam, concurrency/timing model, current-tree outcome
claims, rule-id independence, dry-run non-mutation, and forbidden-scope
containment otherwise passed. No finding authorizes the post-G.1 physical
topology move, G.2 fix admission, A.2, or unrelated inherited Biome cleanup.

The repair is one integrated semantic model, not ten independent patches:

1. canonical authority planning for roots and pattern assets;
2. closed typed acquisition/wire state and exact command evidence;
3. truthful neutral public disposition and report blocking.

One primary owner may implement the tightly coupled repair after the DRA
freezes its exact write-set amendment. Every materially affected permanent
role then reruns with a fresh agent on the complete repaired digest.

### Integrated Repair Model

Canonical authority planning becomes Effectful. It canonicalizes the repository
root without fallback, uses lexical root relationships only to select candidate
rules, canonicalizes every matched existing root, and then reapplies
outside-repo, protected-zone, and declared-root authority to the canonical
repo-relative path. Missing roots remain explicit refusals; other filesystem
canonicalization failures become a per-rule `GritRootCanonicalizationFailed`
plan. Execute plans store only canonical absolute roots. Check and apply consume
those roots without a second transformation. Post-observation path
canonicalization remains required and prevents nested symlink traversal from
becoming a truthful success, but G.1 does not claim no-follow filesystem
sandboxing or eliminate the admission-to-execution TOCTOU window.

Pattern authority is enforced twice. Registry semantics reject Grit `pattern`
and `applyPattern` paths unless they are relative, normalized `.habitat/...`
file paths with no backslash, empty, dot, or parent segment, and must do so
before attempting referenced-file reads. Runtime construction independently
canonicalizes `.habitat` and the selected asset beneath the canonical repo,
proves asset containment before reading it, validates the fenced source, and
only then allocates the temporary workspace. Pattern authority/read failures
are `GritPatternAssetFailed`; temporary workspace/catalog construction alone is
`GritScopedConfigFailed`.

The private acquisition union has disjoint failure vocabularies:

- pre-command: scoped config, root canonicalization, or pattern asset;
- command: unavailable, native identity mismatch, nonzero exit, interruption,
  or internal provider contract;
- parse: missing/wrong/truncated output, malformed output, or schema drift;
- incomplete: observation incompleteness or unexpected diagnostic identity.

State-specific constructors make cross-products unrepresentable. Pre-command
failure does not fabricate command evidence. Command capture preserves typed
unavailable, identity, nonzero, and interruption causes before synthesizing
the command result; diagnostic evidence projects a never-spawned command as
`tool-unavailable`. Acquisition dispatch is exhaustive. Preflight requires a
completed zero exit with exact version output.

The neutral result adds `failed`. Only `clean | findings` map to `executed`;
not-applicable, scan-root refusal, provider failure, identity failure, and
missing outcome each retain their own exhaustive mapping. Structural `failed`
and `refused` become `execution-failed`, and report construction forces
`status: fail` for execution/dependency failure before advisory-lane logic so
top-level `ok` cannot remain true.

Compact `MatchReason` tolerance is source-derived and deliberately not claimed
as a live dry-run observation. The closed six-field object requires
`metadataJson`, `source`, `name`, `title`, `explanation`, and `level`; nullable
strings remain strings, source is `AGENT | GRITQL | STDLIB | UNKNOWN`, and level
is `none | info | warn | error | null`. It is admitted at Match,
Rewrite.original, CreateFile, and RemoveFile.original. `PatternInfo.valid ===
false` is incomplete. Blank check messages project the nonblank authority
message.

### Repaired Integration And Proof

The sole repair owner closed all ten accepted findings and the DRA then found
four final integration gaps inside the same model before freeze: lexical
outside-repository roots were still probed before refusal; typed preflight
errors were projected with the never-spawned target command's identity;
CreateFile evidence did not canonicalize its parent; and the unused synchronous
scan-root validation surface left a second authority route reachable. The same
primary owner repaired those exact paths. No reviewer was reused and no review
was opened on an intermediate tree.

The repaired model now:

- refuses a lexical outside-repository root before candidate `exists` or
  `realPath` access and before any Grit command;
- records the capability request separately from the command actually observed,
  so preflight failure evidence names `grit-pinned-native-preflight` and never
  fabricates target execution;
- canonicalizes the existing parent of a proposed CreateFile path and blocks
  escaped or unresolvable parents as incomplete;
- removes `validateScanRoots`, `PatternScanRootValidationOptions`,
  `discoverPatternScanRoots`, and their barrel exports, leaving one Effectful
  canonical planner.

Root-owned repaired proof passed:

- uncached Habitat check, boundaries, build, and the full 39-file/364-test
  suite;
- five focused files with 90/90 tests, including live pinned-native execution;
- all 14 current Grit provider TypeScript files under Biome;
- strict OpenSpec validation for 371/371 items and workspace lint routing for
  nine projects;
- exact 49-path classification into two Habitat-authority, four workspace,
  fifteen provider, sixteen service/model, and twelve Habitat test paths;
- `git diff --check`, zero staged paths, protected refs unchanged, and the
  inherited evidence tree still at 62 tracked changes, 31 actual untracked
  files, 75 porcelain entries, and zero staged paths.

Full changed TypeScript/JSON Biome checked 41 files and truthfully remains red
at 36 errors and 27 infos across eleven shared/test files. All 36 error
diagnostics resolve through `git blame --contents` to committed lines; zero is
candidate-owned. The error count includes two pairs of diagnostics on the same
committed line, yielding 34 unique blamed locations. This is retained
differential evidence, not a Biome pass or permission to broaden G.1.

The repaired current-tree runtime evidence is also explicit:

- `prohibit_product_scan_roots_in_grit_provider` passes;
- the advisory docs-portability rule now correctly exits red with `status:
  fail` when the pinned native reports an incomplete archived-Markdown parse;
- the full runner selected all 79 Grit rules: 74 enforced passes, four enforced
  failures, and one advisory failure. The four enforced failures are one
  missing declared foundation root plus three existing Studio/Swooper product
  findings; the advisory failure is the named docs parse. No provider failure
  is labeled executed or top-level healthy.

The complete candidate remains 49 status paths: 45 tracked and four untracked,
with no staged path, active mutation lease, or Git operation. The next action is
an exact object freeze followed by three fresh agents filling the permanent
TypeScript/state-space, architecture/authority, and product/runtime/library
roles.

## Review Contract

After implementation and root integration freeze the complete candidate. Three
fresh agents then fill the permanent roles for this changeset:

1. TypeScript/state-space: closed unions, TypeBox boundary correctness, Effect
   error/resource typing, exhaustiveness, impossible states, and test type
   truth;
2. architecture/authority: `.habitat` versus provider ownership, genericity,
   immutable root planning, public disposition truth, special-case deletion,
   and forbidden-scope containment;
3. product/runtime/library: pinned Grit semantics, hermetic process behavior,
   check/JSONL wire truth, count/terminal laws, dry-run non-mutation, and honest
   product nonclaims.

Every finding names severity, evidence, impact, smallest repair, and residual
limit. Accepted material repair reopens every materially affected role with a
fresh agent. Reviews bind to one exact tree; role continuity never means agent
session reuse.

## Affected Review Outcome 01

Three fresh agents independently reproduced the complete 49-row manifest and
digest
`138646fa1a903debe411b0549c34d2ee2331dbab4fce82de3764ae75c82a4a12`
before and after review. Every reviewer remained read-only. The affected review
requested changes with four accepted P2 defects:

| Finding | Role | Disposition | Repair law |
| --- | --- | --- | --- |
| `G1-AUTH-004` | architecture/authority | accepted P2 | normalize repository-relative authority so declared `.` is the canonical empty root and contains every in-repository descendant; test default and explicitly requested child execution |
| `G1-RR-TS-001` | TypeScript/state-space | accepted P2 | correlate acquisition state, failure literal, and command observation in both TypeBox and TypeScript; parse/incomplete/complete require a completed target command |
| `G1-RR-TS-002` | TypeScript/state-space | accepted P2 | classify preflight interruption and nonzero before identity; preserve completed wrong-identity/output evidence as completed rather than tool-unavailable |
| `G1-RR-TS-003` | TypeScript/state-space | accepted P2 | correlate native command family/output contracts, forbid failed exit zero, and return narrow observation variants from constructors |

The product reviewer reported that non-null `MatchReason.level` should use
Pascal-case `None | Info | Warn | Error`. The DRA source-rejected that finding.
The exact pinned source places `#[serde(rename_all = "camelCase")]` directly on
`EnforcementLevel`; for its single-word variants serde emits lowercase
`none | info | warn | error`, exactly as the current schema states. The live
native still has not emitted a non-null reason, so the packet continues to
label this tolerance source-derived rather than observed.

All other initial findings remain closed. The next repair is one correlated
state/evidence model plus repository-root normalization, not five independent
patches. Because it touches every review axis through shared acquisition and
runtime evidence, all three permanent roles reopen with fresh agents after the
next exact freeze.

### Second Repair Integration And Proof

The same sole implementation owner closed the four accepted P2s before any new
review. The change remains within nine already authorized source/test paths:
the two acquisition callers, output/capture/resource/root planning, the
diagnostic command schema, the primary provider test, and one stale nonzero
preflight assertion in the existing vendor-provider test.

The resulting model now:

- normalizes `.`, empty, and equivalent repo-root spellings to one empty
  repository-relative authority value; that root contains every in-repository
  descendant while outside-before-probe and protected-root refusal remain;
- makes native command family/output a closed three-variant union and derives
  the output contract from family at construction;
- gives completed, failed, interrupted, and unavailable observations narrow
  schemas, types, and constructors; failed exit codes are nonzero integers;
- correlates every command acquisition failure with its only truthful command
  state, while parse, incomplete, and complete acquisition require a completed
  target command;
- classifies preflight interruption and nonzero before identity, retains
  completed wrong-version/stream/truncation evidence as completed, and reserves
  tool-unavailable evidence for pre-spawn failure;
- preserves lowercase source-derived MatchReason levels under the pinned serde
  camelCase authority.

Root-owned proof after this repair passed uncached Habitat check, boundaries,
build, the 39-file/367-test full suite, and the five-file/93-test focused suite.
All 14 current provider TypeScript files pass Biome; strict OpenSpec remains
371/371; nine-project workspace lint routing passes; diff hygiene passes. Full
changed TypeScript/JSON Biome remains exactly 36 errors and 27 infos across 41
files, with all 36 errors on 34 unique committed-line blame locations and zero
candidate-owned error.

Real runtime proof is stable: the provider-boundary rule passes, the advisory
docs rule truthfully fails on incomplete native parsing, and the full 79-rule
matrix remains 74 enforced passes, four enforced failures, and one advisory
failure with the same five named current-tree rows. No target command runs
after a failing preflight.

The candidate is still exactly 49 status paths, 45 tracked and four untracked,
with zero staged paths. A new object digest and three entirely fresh agents are
required; none of the first affected-review sessions may be reused.

## Affected Review Outcome 02

Three entirely fresh agents independently reproduced the second 49-row digest
`4036f6a10d0b54f06da824b0786a9d2338022289451b8042a5ffeabbd15a09d4`
before and after review. Architecture/authority and product/runtime/library
passed with zero P0-P3. TypeScript/state-space accepted two P2 defects:

| Finding | Disposition | Repair law |
| --- | --- | --- |
| `G1-RR2-TS-001` | accepted P2 | expose narrow check/apply/preflight request variants; admit only check/apply target requests in acquisitions; correlate complete observation kind to its request family; retain literal family in the helper type; validate completed command/request identity in the constructor and reject preflight or cross-check/apply products |
| `G1-RR2-TS-002` | accepted P2 | interrupted command exit code is integer or null; a typed interruption without a returned process result records null, while returned interrupted results retain their observed integer |

The product reviewer independently confirmed the source-rejected MatchReason
finding: exact tag `v0.1.0-alpha.1743007075` at commit `fe3643396dab` applies
serde camelCase to `EnforcementLevel`, so lowercase literals remain correct.
It also independently reran 53 focused tests and the 79-rule matrix with the
same 74/4/1 outcome.

All authority findings, runtime/library findings, command-state/failure
correlations, and public failure laws remain closed. The third repair is narrow:
target request/observation identity and honest unknown interruption exit only.
All three roles reopen fresh after it because acquisition evidence is shared.

### Third Repair Integration And Proof

The same sole implementation owner closed both accepted second-review P2s
before a new review within seven already authorized source/test paths: the
diagnostic-command schema; request, check, apply-dry-run, output, and runner;
and the primary provider test. The repair first narrowed each target request
and complete observation product, then the DRA rejected one false integration
state before freeze: a completed command whose evidence disagreed with its
request was being reported as a pre-command failure. The final model instead
gives that condition its own closed `evidence-mismatch` acquisition carrying
the target request, completed command, internal-contract failure, and detail.

The repaired state space now:

- exports exact check, apply-dry-run, and preflight request schemas and types,
  while target acquisition admits only the check/apply union;
- preserves literal request variants through helper overloads and correlates
  observed-complete check requests only with check observations and apply
  requests only with apply observations;
- validates completed command identity against the request before parsing or
  completing an observation, including command id, executable, argv, and scan
  roots, without a TypeScript assertion;
- records a typed interruption with no returned process result as exit `null`,
  while preserving an observed integer exit and captured output when a returned
  command result reports interruption;
- reserves `pre-command-failed` for canonical root, pattern-asset, and scoped-
  configuration failure, and maps `evidence-mismatch` exhaustively to public
  provider failure rather than fabricating either pre-command or incomplete
  wire evidence.

Root-owned proof after the final correction passed uncached Habitat check,
boundaries, build, the five-file `94/94` focused suite, and the complete
39-file `368/368` suite. Biome checks over the 14 provider files and two focused
tests report no errors and five inherited test infos. Full changed
TypeScript/JSON Biome still reports 36 errors and 27 infos over 41 files; all
35 unique current error locations blame to committed lines and zero is
candidate-owned. Strict OpenSpec remains 371/371, and root lint routes all nine
projects successfully.

Runtime proof remains stable and explicit. The provider-boundary rule passes;
the advisory docs rule truthfully fails on incomplete native parsing; and the
single owned all-Grit run selected 79 rules with 74 enforced passes, four
enforced failures, and one advisory failure. The same five named current-tree
rows remain red. The candidate remains exactly 49 status paths, 45 tracked and
four untracked, with zero staged path, active mutation lease, Git operation, or
protected-state drift. A new exact object freeze and three entirely fresh role
agents are required before any staging or Graphite mutation.

## Affected Review Outcome 03

The final third-review tree contained 49 rows at digest
`d20f74912b810d1850e1825c5fcff4e47b33904a7bff539337cb0f94f041024a`.
The TypeScript/state-space and architecture/authority reviewers independently
rebound their first-freeze reviews after the only intervening changes proved to
be reviewer-session records. A replacement fresh product/runtime/library
reviewer then reproduced the same digest before and after review. The original
product session is retained only as a failed runtime-capacity receipt: it never
inspected the repository or produced a review result.

TypeScript/state-space passed with zero P0-P3. Architecture/authority and the
replacement product/runtime/library reviewer independently accepted the same
two P2 defects:

| Finding | Disposition | Repair law |
| --- | --- | --- |
| `G1-RR3-AUTH-001` | accepted P2 | carry normalized cwd in completed command observation evidence, preserve it through every constructor, compare request and completed cwd before parsing, and add cwd to the mismatch matrix |
| `G1-RR3-AUTH-002` | accepted P2 | preserve scan-root authority refusal as dependency/refusal truth through the generic result, structural disposition, summary, and hook projection; never relabel it `GritObservationIncomplete` or diagnostic unavailability |

The cwd gap is bounded: current live execution builds and runs the same process
request, so no current misexecution was observed. The evidence contract was
nevertheless incomplete because an injected or faulty result from another
working directory could satisfy every compared field and become complete.

Scan-root refusal already fails closed, but it currently assigns the wrong
owner. A missing, outside, protected, generated, or not-approved root is a
Habitat authority decision. Rendering it with a Grit provider-failure marker
causes hook summaries to claim diagnostic unavailability and pre-commit to
report a JSON parse failure. The repair must preserve the typed refusal rather
than merely change prose.

All other state, authority, runtime, wire, non-mutation, scope, and nonclaim
axes remain closed. Both defects touch shared evidence or public disposition,
so all three permanent roles reopen with entirely fresh agents after one
bounded repair and a new exact freeze.

### Fourth Repair Integration And Proof

The same sole implementation owner closed both accepted P2s before any new
review. The final authorized production set is seven paths: diagnostic command
schema, request capture, acquisition output, provider diagnostic projection,
rule-runtime architecture, Grit runner disposition, and structural source
execution. Four existing focused test files cover provider evidence, structural
projection, summary classification, and pre-commit behavior.

Completed, failed, interrupted, and unavailable command observations now carry
normalized cwd. Native requests normalize the same field, typed pre-spawn and
returned errors preserve it, and check/apply evidence compares cwd beside
invocation id, executable, argv, and scan roots. The mismatch matrix proves all
five fields independently. A root integration run caught and corrected one
test fixture that used `.` relative to the package-local test cwd; production
comparison remained strict.

Scan-root refusal now remains typed across the provider boundary. The result no
longer uses a Grit provider-failure marker. The refused disposition carries the
existing `DiagnosticScanRootRefusal`, then the structural consumer constructs
an existing dependency-refusal diagnostic and maps protected/generated reasons
to owner `protected-zones`, with empty/outside/missing/not-approved reasons
owned by `diagnostic-catalog`. Hook summaries therefore report dependency
refusal and pre-commit reports a finding, never diagnostic unavailability or a
JSON parse failure.

Root-owned proof passed uncached Habitat check, boundaries, build, the complete
39-file `371/371` suite, and a seven-file `120/120` focused set. All 14 provider
files plus the diagnostic-command schema and rule-runtime architecture pass
Biome. Full changed TypeScript/JSON Biome remains exactly 36 errors and 27
infos over 41 files, with 35 unique current error locations and zero candidate-
owned error. Strict OpenSpec remains 371/371, and root lint routes all nine
projects successfully.

Runtime evidence is stable except for the intended ownership correction. The
provider-boundary rule passes; docs portability still truthfully fails on
incomplete native parsing; and the all-Grit matrix remains 79 selected, 74
enforced passes, four enforced failures, and one advisory failure. The missing
Foundation root now reports `Dependency refused` instead of provider
unavailability. The candidate remains 49 paths, 45 tracked and four untracked,
with zero staged path, active mutation lease, Git operation, or protected-state
drift. Three entirely fresh permanent-role agents must review a new exact digest
before any staging or Graphite mutation.

## Affected Review Outcome 04

Three entirely fresh role agents independently reproduced the complete 49-row
digest `e5f5824ecc6c4f8121a678f03a53b2465c1d81df4e10e7265a14d29c1d6c8798`
before and after review. All remained read-only. The product reviewer returned
one empty response, which was not accepted as a result; its retry bound to the
unchanged digest and delivered a complete review.

The review accepted three findings:

| Finding | Disposition | Repair law |
| --- | --- | --- |
| `G1-RR4-AUTH-001` | accepted P2 | carry typed execution disposition through every RuleReport and classify summaries/hooks from state, never diagnostic prose; preserve the source scan-root refusal payload including protected owner/recovery; settle the CheckReport wire-version change explicitly and prove ordinary findings colliding with all old marker families remain findings |
| `G1-RR4-TS-001` | accepted P2 | replace catch-all refusal-owner mapping with compiler-exhaustive handling of all six current refusal reasons and prove the complete owner matrix |
| `G1-RR4-TS-002` | accepted P3 | assert normalized target-request and independently observed actual-command cwd across preflight, typed unavailable/interrupted, and returned failed/interrupted branches |

`G1-RR4-AUTH-001` is broader than scan-root refusal. `RuleReport` currently
drops the typed disposition, and summary/hook policy reconstructs not-
applicable, dependency-refused, and diagnostic-unavailable states from message
prefixes. A schema-valid ordinary Grit finding whose authored message begins
with one of those prefixes can therefore be misclassified. Diagnostic prose is
rendering, not a control protocol.

The fifth repair must first map the complete CheckReport producer/consumer and
schema-version surface. It may then carry one closed typed disposition/source
payload through the report boundary and delete message parsing as authority.
This is a shared wire/state correction, so all three permanent roles reopen
with entirely fresh agents after repair.

### Fifth Repair Design 05

Three disjoint read-only design agents closed the wire, state, and proof
surfaces before implementation. The DRA accepts a clean coordinated cutover:
`CheckReport.schemaVersion`, `VerifyCheckSummary.reportSchemaVersion`, and
`VerifyReceipt.schemaVersion` all become literal v2. Every `RuleReport` gains a
required closed disposition. V1 is rejected rather than admitted through an
optional field, a v1-in-place break, or a v1/v2 compatibility union. Habitat is
private, every discovered parser is in-repository, CI only archives the report,
and the D0 compatibility matrix already assigns versioned handling to these
surfaces. Historical v1 phase evidence remains historical and unchanged.

Report state is authority; status and diagnostics are projections. The closed
report union contains executed, typed not-applicable, diagnostic scan-root
dependency refusal carrying the complete existing decision, diagnostic
provider execution failure carrying its exact provider failure kind, selector
refusal carrying the existing typed refusal, and baseline-integrity passed or
refused. The internal execution state retains timing, while the report's
executed state does not duplicate `durationMs`. The obsolete scan-root owner
conversion is deleted: a protected decision already carries exact owner and
recovery, and an unowned catalog refusal must not acquire a fabricated owner.

Every producer must populate this state and every consumer must branch on it.
The Grit provider preserves the failure kind it currently drops; structural
source execution preserves the complete scan-root decision; ordinary reports
project internal state; selector and baseline built-ins receive explicit
states; summaries derive outcome, hook kind, refused count, not-applicable
count, and built-in membership without inspecting rule ids, runner ids, or
diagnostic text. The three not-applicable equality checks, `Dependency
refused:` prefix check, Grit provider marker parser, and message-based owner
logic remain only as rendering where still useful, never as control protocol.

The authorized production set is the check DTO/barrel; structural state,
selection, source-execution, report, summaries, and disposition rendering;
rule-diagnostic architecture plus the Grit runner; verify receipt DTO and
constructor; and only mechanical current-contract edits in the Habitat README,
CLI smoke blueprint, and D0 public-surface compatibility matrix. The authorized
test/support set is the existing check-summary, rule-selection, Grit provider,
verify receipt, hook/parser, hook service, check service, baseline-manifest,
command, structure-check, and Habitat dependency fixtures. The owner must stop
for any additional production, document, or cross-domain path.

Proof is adversarial and round-trip based. Schema tests accept only complete v2
reports/receipts and reject v1 or v2 without disposition. Ordinary executed
findings colliding with all three retired not-applicable messages, the
dependency prefix, and all provider-failure markers remain ordinary findings.
All six scan-root reasons survive execution, RuleReport, JSON serialization,
closed parsing, hook summary, and verify summary; protected cases preserve the
exact owner/recovery payload. Provider failure kind survives the same chain.
Selector and baseline built-ins classify from their state. The real hook
subprocess parser is exercised directly, without an `as CheckReport` fixture.
All preflight, typed unavailable/interrupted, and returned failed/interrupted
branches assert both requested and independently observed normalized cwd.

This remains a directional seam cleanup, not a vendor-swappability claim.
`RuleSourceFacts` still exposes the Grit runner, pattern identity, and Grit
acquisition policy. The immediate post-G.1 architecture slice must separate
capability-level rule demand from provider-specific selection/assets and move
the implementation under `resources/<capability>/providers/<vendor>`, including
lazy once-per-realized-provider preflight. G.1 does not invent an opaque
provider rule reference, move the provider tree, or import the full runtime
realization substrate.

### Fifth Repair Integration And Proof

The sole implementation owner completed 23 authorized paths and no others.
`RuleReport` now requires a closed report disposition, `CheckReport` and
`VerifyReceipt` are coordinated v2 wires, and the check semantic validator
rejects stale v1, missing disposition, and incompatible failure/built-in status.
Internal execution retains timing while report execution does not duplicate it.
Every scan-root refusal carries the complete existing decision, every provider
failure carries its exact kind, and selector/baseline built-ins carry explicit
state. Summaries, hooks, verify, refused/not-applicable counts, and built-in
membership use disposition only. All old diagnostic equality, prefix, provider
marker, rule-id, runner-id, and refusal-owner control protocols are absent.

The focused proof is now 146/146 across eight suites. It covers every retired
message-family collision, all six scan-root decisions through the real
structural report producer and v2 JSON parser into hook/verify summaries,
provider failure from a real Grit outcome through the generic execution result
and report boundary, selector/baseline built-ins, stale and incomplete wire
rejection, the direct hook subprocess parser, and every named requested versus
observed cwd branch. The complete Habitat suite is 39 files and 396/396 tests.

Root-owned uncached check, boundaries, build, and full tests pass. Strict
OpenSpec remains 371/371 and root lint routes all nine projects successfully.
Changed TypeScript/JSON Biome selected 54 paths and checked 51, reporting 71
errors and 58 infos only on committed-line starts; zero diagnostic is attributed
to an uncommitted line under the established differential oracle. `git diff
--check`, the v1/prose-classifier closure grep, JSONL uniqueness, protected refs,
and the inherited 62/31/75/0 census pass. No provider command remains running.

Runtime proof remains stable while now exposing v2 typed state. The provider
boundary passes. Docs portability truthfully fails advisory with
`GritObservationIncomplete`. The all-Grit matrix selects 79 rules: 74 enforced
passes, four enforced failures, and one advisory failure. The same five named
rows remain red; the missing Foundation root is a typed dependency refusal, the
three Studio/Swooper findings are ordinary executed findings, and docs is a
typed provider failure. The complete candidate is 61 status paths, 57 tracked
and four untracked, with zero staged path, mutation lease, Git operation, ref
drift, or other-worktree mutation. Three fresh permanent-role agents must bind
to a new exact object digest before any closing or Graphite operation.

## Affected Review Outcome 05

All three permanent roles were filled by entirely fresh agents. The first two
reviewers bound the 61-row digest `1000d3ef55f1`; after the product-review slot
opened, the DRA appended only that fresh reviewer receipt and froze successor
digest `62d840626a672fe02ae9bf63ab0d979c6722b53891f422d3cd431c0adc43d7aa`.
TypeScript/state-space and architecture/authority mechanically rebound that
single-record delta. Product/runtime/library reviewed the successor directly.
All three reproduced the final digest after review and remained read-only.

Seven P2 findings are accepted:

| Finding | Repair law |
| --- | --- |
| `G1-RR5-TS-001` | classify `no-applicable-rules` only when every real rule is typed not-applicable and every accompanying baseline row passed; never erase an executed/advisory/failed rule |
| `G1-RR5-TS-002` | make `empty` rootless and require a root for outside, missing, and not-approved scan-root refusals; reject contradictory/incomplete v2 evidence |
| `G1-RR5-AUTH-001` | stop calling output vendor-neutral and assign capability output/error plus catalog/identity separation to the explicit post-G.1 architecture slice |
| `G1-RR5-AUTH-002` | advance the packet header to the actual repair/review continuation |
| `G1-RR5-PROD-001` | correlate hook subprocess exit status with parsed report truth and fail closed on either mismatch direction |
| `G1-RR5-PROD-002` | require selector refusal to be the sole report row; reject mixed selector/execution state before summary precedence can hide a stronger failure |
| `G1-RR5-PROD-003` | supersede active compatibility assertions that still advertise rejected CheckReport/Verify proof v1 without rewriting historical receipts |

No reviewer found a defect in pinned-native acquisition, hermetic environment,
closed native decoding, processed-path/count truth, immutable root planning,
failure-state separation, v2 collision handling, or the stable live runtime
matrix. The sixth repair is bounded to the accepted state, hook, test, and
current-record surfaces. It does not reopen provider topology or full runtime
realization.

### Sixth Repair Integration And Proof

One sole implementation owner closed the seven accepted P2s in exactly five
production paths, two focused tests, and two current Habitat docs. The DRA also
corrected one additional current `CheckReport v1` assertion discovered in the
already authorized recovery ledger during integration; historical seed evidence
was not rewritten.

Aggregate report state is now closed at the actual boundary. A selector refusal
must be the sole report row. `no-applicable-rules` requires at least one real
typed not-applicable row, every real row not-applicable, and only a passed
baseline row alongside it. Executed, advisory, dependency-refused,
execution-failed, selector-refused, or baseline-refused state cannot disappear
behind not-applicability. The scan-root schema has one exact rootless `empty`
variant, three rooted unowned variants, and two rooted protected variants; it
rejects both invented empty roots and missing required roots.

The hook command boundary now uses one exit/report correlation function for
subprocess and in-process results. A parsed report is admitted only for exact
canonical exit `0` when `ok` and exit `1` when not `ok`; either mismatch becomes
a closed `status-mismatch` without a pass summary, so downstream admission is
false. Current compatibility authority now names `CheckReport v2` and
`VerifyReceipt v2`; the packet truthfully calls its output only directionally
generalized and assigns input, output/error, catalog/identity, topology, and
lifetime separation to the explicit post-G.1 slice.

Focused proof passes 59/59. Root-owned uncached Habitat check, boundaries,
build, and the complete 39-file 405/405 suite pass. Strict OpenSpec remains
371/371 and root lint routes nine projects. Changed TypeScript/JSON Biome
selected 57 paths and checked 54, reporting 76 errors and 58 infos whose start
lines all blame to committed content; zero is candidate-owned under the
established differential oracle. Diff hygiene, register uniqueness, protected
refs, inherited 62/31/75/0 state, zero staging, and zero provider process pass.

Live runtime proof remains stable: the provider-boundary rule passes and the
all-Grit matrix selects 79 rules with 74 enforced passes, four enforced
failures, and one advisory failure. The same five named red rows and typed
dispositions remain. The complete candidate is now 66 status paths, 62 tracked
and four untracked. It requires a new exact digest and three fresh permanent-
role reviewers before any closing or Graphite operation.

## Affected Review Outcome 06

All three permanent roles were filled by entirely fresh agents. State-space and
architecture/authority reviewed 66-row digest `7a643925867d`; after the product
reviewer was registered, both mechanically rebound the receipt-only successor
digest `32f568cd8fb65b5d5963429e5a61f8b38f0d32c8aba8962813b2b0520e56a8e9`.
Product/runtime/library reviewed that successor directly. All three reproduced
the final digest after review and remained read-only.

Twelve findings are accepted:

| Finding | Severity | Repair law |
| --- | --- | --- |
| `G1-RR6-PROD-001` | P1 | retain Darwin/arm64 size and SHA only as platform-scoped evidence; cross-platform CI proves package pin, direct native path, and native version without asserting another platform's artifact |
| `G1-RR6-TS-001` | P2 | preserve report-derived exit for the pre-push in-process check and route every parsed result through the same exit/report correlation law without changing final hook admission semantics |
| `G1-RR6-TS-002` | P2 | selected-rule target requests and accepted root decisions are nonempty; pinned preflight is exactly rootless; constructors and TypeBox schemas reject the impossible products |
| `G1-RR6-TS-003` | P2 | attach requested roots to failed command evidence only when normalized cwd also matches id, executable, and argv |
| `G1-RR6-TS-004` | P3 | keep registry runner policy as authored authority and one top-level projected acquisition decision; remove the duplicate nested policy from `RuleSourceFacts` |
| `G1-RR6-PROD-002` | P2 | semantic CheckReport validation recomputes the producer's disposition, lane, diagnostic, and status law so enforced findings cannot parse as pass or advisory |
| `G1-RR6-PROD-003` | P2 | bound pinned-native preflight explicitly and preserve timeout as typed interrupted acquisition evidence |
| `G1-RR6-AUTH-001` | P2 | retire active `--tool` and 22-rule claims; current selection is `--runner grit`, and unknown-runner v2 refusal is the gate |
| `G1-RR6-AUTH-002` | P2 | mark dated CheckReport v1 Effect decisions historical and establish v2 as current authority without rewriting the evidence |
| `G1-RR6-AUTH-003` | P2 | bind current check, diagnostic, and verify contracts to existing service-model owners or explicitly retire removed exports; do not invent facades |
| `G1-RR6-AUTH-004` | P2 | replace stale fifth-repair proof and agent state in the sole live resume section with review-06 truth |
| `G1-RR6-AUTH-005` | P2 | distinguish historical initial owner authorization from the mechanically complete current candidate path set and prove set equality before freeze |

The original provider implementation otherwise passed all three lanes: pinned
hermetic acquisition, closed native decoding, processed-path truth, immutable
root planning, exhaustive observed dispatch, failure-state separation, and the
directional-only resource seam remain accepted. No A.2 or unrelated vendor
hunk crossed the packet. The review result reopens one combined repair and all
three fresh review roles; it does not reopen provider topology or full runtime
realization.

### Seventh Repair Design

Three read-only design lanes converged on one bounded repair. One implementation
owner must integrate the overlapping state and product paths; no second writer
may split request, command, report, preflight, or root topology.

The target model is deliberately small:

- pre-push records the exit derived from `report.ok`; its existing typed summary
  remains the hook-admission authority, so a truthful nonzero not-applicable
  check may still allow the final hook to continue;
- selected-rule roots are one nonempty tuple from planning through provider and
  native request; preflight is exactly rootless; generic failed observations may
  remain rootless when they cannot be attributed to the requested target;
- failed observations inherit roots only when normalized cwd, command id,
  executable, and argv all identify the same request;
- authored Grit runner policy projects once into top-level
  `RuleSourceFacts.diagnosticAcquisition`; the projected runner does not retain a
  second copy;
- one shared report-status function owns production and semantic validation;
  it derives status from disposition, lane, and diagnostics before any hook
  summary exists;
- one existing Grit timeout value bounds target and preflight execution, and a
  timeout remains typed on interrupted evidence;
- the Darwin/arm64 digest is host-scoped evidence, while every host still proves
  the pinned package, direct native path, native version, and live execution;
- active selector/docs authority uses `--runner`; dated `--tool`, v1, and
  22-rule statements remain explicitly historical;
- the broad D0 compatibility matrix is demoted to a historical recovery
  snapshot with a small current check/diagnostic/verify owner overlay. It is not
  reconstructed row by row.

The proof-placement correction is explicit: this repair adds no TypeScript
compiler-API verifier, no new Grit rule, no global matrix-normalization gate,
no second timeout constant, and no new progress apparatus. Existing TypeScript
compilation, TypeBox parsing, focused behavior tests, registered Habitat/Grit
rules, and live pinned execution own the claims they already express.

The exact implementation/current-authority write set is:

- `tools/habitat/src/service/modules/hook/model/policy/check-command.policy.ts`;
- `tools/habitat/src/service/modules/hook/model/policy/procedure-context.policy.ts`;
- `tools/habitat/src/service/modules/hook/model/policy/procedure-operations.policy.ts`;
- `tools/habitat/src/service/modules/hook/router/pre-push.router.ts`;
- `tools/habitat/src/service/model/diagnostics/dto/diagnostic-scan-root.schema.ts`;
- `tools/habitat/src/service/model/diagnostics/dto/diagnostic-command.schema.ts`;
- `tools/habitat/src/service/model/diagnostics/index.ts`;
- `tools/habitat/src/providers/grit/resource.ts`;
- `tools/habitat/src/providers/grit/apply-dry-run.ts`;
- `tools/habitat/src/providers/grit/scan-roots/index.ts`;
- `tools/habitat/src/providers/grit/request.ts`;
- `tools/habitat/src/service/modules/fix/model/policy/pattern-apply-transaction.policy.ts`;
- `tools/habitat/src/service/model/rules/dto/registry.schema.ts`;
- `tools/habitat/src/service/model/rules/policy/facts.policy.ts`;
- `tools/habitat/src/service/model/check/dto/check.schema.ts`;
- `tools/habitat/src/service/model/check/index.ts`;
- `tools/habitat/src/service/model/check/policy/structural/report.policy.ts`;
- `tools/habitat/test/service/hook-service.test.ts`;
- `tools/habitat/test/lib/grit-provider.test.ts`;
- only the Grit request block in `tools/habitat/test/lib/vendor-providers.test.ts`;
- `tools/habitat/test/rules/registry/facts.test.ts`;
- `tools/habitat/test/lib/grit-provider-current-tree-execution.test.ts`;
- `tools/habitat/test/lib/check-summaries.test.ts`;
- `tools/habitat/test/lib/hooks.test.ts`;
- `docs/projects/habitat-harness/recovery-claim-ledger.md`;
- `docs/projects/habitat-harness/domain-refactor-prep/scenario-corpus.md`;
- `docs/projects/habitat-harness/effect-orchestration-evaluation.md`;
- `docs/projects/habitat-harness/public-surface-compatibility-matrix.md`.

The same four workstream records remain DRA-only. No other path is authorized.
After implementation and root proof, the packet must relabel the original
write-set list as historical authorization and embed the complete final sorted
candidate path set. That one-time accounting replaces, rather than creates, a
new tracking mechanism.

### Seventh Repair Integration And Proof

The sole implementation owner changed 25 of the 28 authorized implementation
and current-authority paths. The DRA then made four narrow integration
corrections inside the candidate: it applied the existing positive timeout
normalizer to preflight as well as target execution, replaced two remaining
active `--tool` examples with `--runner`, simplified typed timeout projection,
and made the Darwin/arm64 digest test a real host-gated test. It also repaired
newly introduced structural lint in the focused Grit test and one pre-existing
candidate lint error in `rule-selection.test.ts`. That last path was already
part of G.1 and is recorded as DRA integration, not seventh-owner scope.

The resulting model closes all twelve review-06 findings without adding a
compiler-API verifier, Grit rule, compatibility reconstruction, Linux digest
authority, timeout constant, tracking surface, provider topology, or G.2
behavior. `deriveRuleReportStatus` is the sole producer/validator status law;
selected targets carry nonempty roots, preflight carries exactly none, failed
root attribution binds normalized cwd plus command identity, registry facts
project one acquisition decision, and both target and preflight share the
existing effective timeout.

Root proof passed:

- the seven-file focused suite passed 137/137, and the three-file integration
  rerun passed 65/65;
- uncached Habitat check, boundaries, build, and the complete 39-file 407/407
  suite passed;
- strict OpenSpec validation passed 371/371, workspace lint routed nine
  projects, and `git diff --check` passed;
- changed TypeScript/JSON Biome selected 58 paths and checked 55, reporting 79
  errors and 61 infos. Exact blob-to-current comparison against review 06 found
  zero introduced errors and five newly introduced advisory callback infos;
- the provider-boundary rule passed. The one-rule docs check truthfully
  returned typed `GritObservationIncomplete` for malformed Markdown input;
- the complete live Grit matrix selected 79 rules: 74 passes and five failures.
  The failures remain the expected Foundation missing-root authority refusal,
  three enforced Studio/Swooper boundary findings, and one advisory docs parse
  failure. There are 78 enforced rules and one advisory rule;
- protected refs, zero staging, register uniqueness, inherited 62/31/75/0
  evidence, and zero provider/test process all passed. Local Ubuntu execution
  is unavailable; host gating and CI topology are covered, while actual Ubuntu
  execution remains an explicit residual.

The complete sorted 68-path candidate set for freeze and review 07 is:

```text
.habitat/AUTHORITY-TOOL-SEPARATION.md
.habitat/docs/rules/ensure_docs_checkout_paths_are_portable/rule.json
.habitat/habitat/toolkit/_blueprints/cli/verify_habitat_cli_smoke_contract/check.ts
docs/projects/habitat-harness/domain-refactor-prep/scenario-corpus.md
docs/projects/habitat-harness/effect-orchestration-evaluation.md
docs/projects/habitat-harness/public-surface-compatibility-matrix.md
docs/projects/habitat-harness/recovery-claim-ledger.md
docs/projects/mapgen-studio-runtime-transition/cleanup-register.jsonl
docs/projects/mapgen-studio-runtime-transition/gate-register.jsonl
docs/projects/mapgen-studio-runtime-transition/verification-ledger.md
docs/projects/mapgen-studio-runtime-transition/waves/takeover-grit-diagnostic-acquisition-01.md
tools/habitat/README.md
tools/habitat/src/providers/grit/apply-dry-run.ts
tools/habitat/src/providers/grit/check.ts
tools/habitat/src/providers/grit/diagnostics.ts
tools/habitat/src/providers/grit/docs-apply.ts
tools/habitat/src/providers/grit/env.ts
tools/habitat/src/providers/grit/failures.ts
tools/habitat/src/providers/grit/index.ts
tools/habitat/src/providers/grit/output.ts
tools/habitat/src/providers/grit/request.ts
tools/habitat/src/providers/grit/resource.ts
tools/habitat/src/providers/grit/runner.ts
tools/habitat/src/providers/grit/scan-roots/index.ts
tools/habitat/src/providers/grit/scoped-config.ts
tools/habitat/src/providers/grit/source-check.ts
tools/habitat/src/providers/grit/types.ts
tools/habitat/src/service/impl.ts
tools/habitat/src/service/model/check/dto/check.schema.ts
tools/habitat/src/service/model/check/index.ts
tools/habitat/src/service/model/check/policy/disposition-diagnostics.policy.ts
tools/habitat/src/service/model/check/policy/structural/context.policy.ts
tools/habitat/src/service/model/check/policy/structural/report.policy.ts
tools/habitat/src/service/model/check/policy/structural/selection.policy.ts
tools/habitat/src/service/model/check/policy/structural/source-execution.policy.ts
tools/habitat/src/service/model/check/policy/summaries.policy.ts
tools/habitat/src/service/model/diagnostics/dto/diagnostic-catalog.schema.ts
tools/habitat/src/service/model/diagnostics/dto/diagnostic-command.schema.ts
tools/habitat/src/service/model/diagnostics/dto/diagnostic-identity.schema.ts
tools/habitat/src/service/model/diagnostics/dto/diagnostic-outcome.schema.ts
tools/habitat/src/service/model/diagnostics/dto/diagnostic-scan-root.schema.ts
tools/habitat/src/service/model/diagnostics/errors/diagnostic-provider.errors.ts
tools/habitat/src/service/model/diagnostics/index.ts
tools/habitat/src/service/model/diagnostics/policy/rule-runtime/architecture.policy.ts
tools/habitat/src/service/model/rules/dto/registry.schema.ts
tools/habitat/src/service/model/rules/policy/facts.policy.ts
tools/habitat/src/service/model/rules/repositories/registry.repository.ts
tools/habitat/src/service/modules/fix/model/policy/pattern-apply-transaction.policy.ts
tools/habitat/src/service/modules/hook/model/policy/check-command.policy.ts
tools/habitat/src/service/modules/hook/model/policy/procedure-operations.policy.ts
tools/habitat/src/service/modules/verify/model/dto/verify.schema.ts
tools/habitat/src/service/modules/verify/model/policy/receipt.policy.ts
tools/habitat/test/commands/habitat-commands.test.ts
tools/habitat/test/lib/check-baseline-provider-boundary.test.ts
tools/habitat/test/lib/check-summaries.test.ts
tools/habitat/test/lib/grit-provider-current-tree-execution.test.ts
tools/habitat/test/lib/grit-provider.test.ts
tools/habitat/test/lib/hooks.test.ts
tools/habitat/test/lib/rule-selection.test.ts
tools/habitat/test/lib/structure-check-execution.test.ts
tools/habitat/test/lib/vendor-providers.test.ts
tools/habitat/test/lib/verify-receipt.test.ts
tools/habitat/test/rules/registry/contract.test.ts
tools/habitat/test/rules/registry/facts.test.ts
tools/habitat/test/service/check-baseline-manifest-service.test.ts
tools/habitat/test/service/check-service.test.ts
tools/habitat/test/service/hook-service.test.ts
tools/habitat/test/support/habitat-service-deps.ts
```

The list equals the current porcelain path set exactly: 64 tracked changes and
four untracked files, with zero staged path. Review binds the status and object
identity of these paths, including the three intentional provider deletions.

## Affected Review Outcome 07

Three entirely fresh sessions filled the permanent roles. TypeScript/state-
space ran as collaboration agent `/root/provider_rereview_state_space_07`.
Because the collaboration tree reached its hard total-thread limit, the DRA
opened architecture/authority task
`019f5a34-d0fe-73b3-805b-cdcd50b17401` and product/runtime/library task
`019f5a34-d8c1-7f82-a953-50d48124b113` as fresh read-only sessions rather than
reuse any old reviewer. All three independently reproduced the exact 68-row
digest `712fed3cfc4ace06f867a12b8ba959a5cc76f0f6055c006124a31c15c462ea1b`
before and after review and mutated no candidate or control state.

Four findings are accepted:

| Finding | Severity | Repair law |
| --- | --- | --- |
| `G1-RR7-TS-001` | P2 | selector-refusal production must call the shared `deriveRuleReportStatus`; a hardcoded coincidentally equal status is still a second authority |
| `G1-RR7-PROD-001` | P2 | an enforced row fails for every unbaselined diagnostic, regardless of serialized severity; malformed advisory severity cannot make an enforced finding pass through the hook parser |
| `G1-RR7-AUTH-001` | P2 | regenerate the existing execution-surface JSON, Markdown, and anatomy artifacts so current authority no longer names the three deleted adapters; this is record repair, not topology work |
| `G1-RR7-AUTH-002` | P3 | delete only the newly unreferenced public `gritBin` constant; the pinned native path remains the sole executable authority |

The repair remains deliberately smaller than the review corpus. It changes the
shared status producer/validator law and its direct tests, deletes one dead
constant, and regenerates one existing three-artifact authority map through its
checked-in generator. It adds no compiler API, new rule, report abstraction,
compatibility matrix, timeout mechanism, topology move, G.2, A.2, or broad
cleanup.

Review proof passed 131 state-focused tests, 137 product/authority-focused
tests, Habitat TypeScript check, diff hygiene, the provider boundary rule, an
unknown-runner refusal, and a selected-rule execution. Product review
reproduced its fail-open case through the real hook parser. The other eleven
review-06 repairs and the original six provider blockers passed all roles.

### Eighth Repair Integration And Proof

One sole implementation owner changed exactly the eight authorized paths. The
repair removes rather than expands authority: selector refusal now constructs
its disposition and diagnostics once and calls `deriveRuleReportStatus`;
enforced reports fail for every unbaselined diagnostic regardless of serialized
severity; the unused `gritBin` alias is deleted; and the existing execution-
surface generator refreshes only its three owned artifacts. The DRA applied the
existing Biome formatter to the check schema after differential hygiene found
one repair-owned formatting diagnostic. No compiler API, new rule, abstraction,
compatibility matrix, timeout mechanism, topology move, G.2, A.2, or proof
apparatus was added.

Root proof passed:

- the seven-file focused suite passed 139/139 and the complete Habitat suite
  passed 39 files and 408/408 tests;
- uncached Habitat check, boundaries, and build passed; strict OpenSpec passed
  371/371; root lint routed nine projects; and `git diff --check` passed;
- the execution-surface generator reported 813 surfaces and 122 rule-JSON
  surfaces. Two root reruns preserved identical artifact hashes and the exact
  status set;
- changed TypeScript/JSON selected 57 paths and checked 56, retaining the
  review-07 totals of 79 errors and 61 infos. Exact pre/post comparison of all
  five repair-owned TypeScript files found zero new diagnostics after the
  formatter correction;
- the provider-boundary rule passed. The one-rule docs check truthfully returned
  typed `GritObservationIncomplete`;
- the complete 79-rule live Grit matrix retained 74 passes and the same five
  red rows: one enforced missing-root authority refusal, three enforced Studio/
  Swooper boundary findings, and one advisory incomplete parse;
- all three generated artifacts omit the deleted adapters and stale import
  edges, no `gritBin` reference remains, and the branch, protected refs, zero
  staging, inherited evidence, and process boundaries remain unchanged.

Three entirely fresh review-08 sessions are registered in the permanent roles:

- TypeScript/state-space: task `019f5a4e-e929-7832-9587-9d274f99c3a0`;
- architecture/authority: task `019f5a4e-efe5-7853-ba1b-be86624ff177`;
- product/runtime/library: task `019f5a4e-f688-70f0-b81b-e83343954df6`.

They were created registration-only and may not inspect the candidate until the
DRA freezes and sends one exact manifest digest. No prior reviewer session is
reused.

The complete current sorted 73-path candidate set for repair-10 freeze is:

```text
.habitat/AUTHORITY-TOOL-SEPARATION.md
.habitat/docs/rules/ensure_docs_checkout_paths_are_portable/rule.json
.habitat/habitat/toolkit/_blueprints/cli/verify_habitat_cli_smoke_contract/check.ts
docs/projects/habitat-harness/domain-refactor-prep/scenario-corpus.md
docs/projects/habitat-harness/effect-orchestration-evaluation.md
docs/projects/habitat-harness/execution-surface-map/execution-surface-anatomy.md
docs/projects/habitat-harness/execution-surface-map/execution-surface-map.json
docs/projects/habitat-harness/execution-surface-map/execution-surface-map.md
docs/projects/habitat-harness/public-surface-compatibility-matrix.md
docs/projects/habitat-harness/recovery-claim-ledger.md
docs/projects/mapgen-studio-runtime-transition/cleanup-register.jsonl
docs/projects/mapgen-studio-runtime-transition/gate-register.jsonl
docs/projects/mapgen-studio-runtime-transition/verification-ledger.md
docs/projects/mapgen-studio-runtime-transition/waves/takeover-grit-diagnostic-acquisition-01.md
tools/habitat/README.md
tools/habitat/scripts/execution-surface-map.ts
tools/habitat/src/providers/grit/apply-dry-run.ts
tools/habitat/src/providers/grit/check.ts
tools/habitat/src/providers/grit/constants.ts
tools/habitat/src/providers/grit/diagnostics.ts
tools/habitat/src/providers/grit/docs-apply.ts
tools/habitat/src/providers/grit/env.ts
tools/habitat/src/providers/grit/failures.ts
tools/habitat/src/providers/grit/index.ts
tools/habitat/src/providers/grit/output.ts
tools/habitat/src/providers/grit/request.ts
tools/habitat/src/providers/grit/resource.ts
tools/habitat/src/providers/grit/runner.ts
tools/habitat/src/providers/grit/scan-roots/index.ts
tools/habitat/src/providers/grit/scoped-config.ts
tools/habitat/src/providers/grit/source-check.ts
tools/habitat/src/providers/grit/types.ts
tools/habitat/src/service/impl.ts
tools/habitat/src/service/model/check/dto/check.schema.ts
tools/habitat/src/service/model/check/index.ts
tools/habitat/src/service/model/check/policy/disposition-diagnostics.policy.ts
tools/habitat/src/service/model/check/policy/structural/context.policy.ts
tools/habitat/src/service/model/check/policy/structural/report.policy.ts
tools/habitat/src/service/model/check/policy/structural/selection.policy.ts
tools/habitat/src/service/model/check/policy/structural/source-execution.policy.ts
tools/habitat/src/service/model/check/policy/summaries.policy.ts
tools/habitat/src/service/model/diagnostics/dto/diagnostic-catalog.schema.ts
tools/habitat/src/service/model/diagnostics/dto/diagnostic-command.schema.ts
tools/habitat/src/service/model/diagnostics/dto/diagnostic-identity.schema.ts
tools/habitat/src/service/model/diagnostics/dto/diagnostic-outcome.schema.ts
tools/habitat/src/service/model/diagnostics/dto/diagnostic-scan-root.schema.ts
tools/habitat/src/service/model/diagnostics/errors/diagnostic-provider.errors.ts
tools/habitat/src/service/model/diagnostics/index.ts
tools/habitat/src/service/model/diagnostics/policy/rule-runtime/architecture.policy.ts
tools/habitat/src/service/model/rules/dto/registry.schema.ts
tools/habitat/src/service/model/rules/policy/facts.policy.ts
tools/habitat/src/service/model/rules/repositories/registry.repository.ts
tools/habitat/src/service/modules/fix/model/policy/pattern-apply-transaction.policy.ts
tools/habitat/src/service/modules/hook/model/policy/check-command.policy.ts
tools/habitat/src/service/modules/hook/model/policy/procedure-operations.policy.ts
tools/habitat/src/service/modules/verify/model/dto/verify.schema.ts
tools/habitat/src/service/modules/verify/model/policy/receipt.policy.ts
tools/habitat/test/commands/habitat-commands.test.ts
tools/habitat/test/lib/check-baseline-provider-boundary.test.ts
tools/habitat/test/lib/check-summaries.test.ts
tools/habitat/test/lib/grit-provider-current-tree-execution.test.ts
tools/habitat/test/lib/grit-provider.test.ts
tools/habitat/test/lib/hooks.test.ts
tools/habitat/test/lib/rule-selection.test.ts
tools/habitat/test/lib/structure-check-execution.test.ts
tools/habitat/test/lib/vendor-providers.test.ts
tools/habitat/test/lib/verify-receipt.test.ts
tools/habitat/test/rules/registry/contract.test.ts
tools/habitat/test/rules/registry/facts.test.ts
tools/habitat/test/service/check-baseline-manifest-service.test.ts
tools/habitat/test/service/check-service.test.ts
tools/habitat/test/service/hook-service.test.ts
tools/habitat/test/support/habitat-service-deps.ts
```

The list equals the current porcelain path set exactly: 69 tracked changes and
four untracked files, with zero staged paths. It includes the three intentional
provider deletions, the four paths exposed by repair 08, and the existing
execution-surface generator first changed by repair 10.

## Affected Review Outcome 08

All three fresh sessions independently reproduced the 72-row digest
`025d8b54b1392f81029c11d2c5f09758027cb6091a6454365ac06d3420c5106d`
before and after review and remained read-only. State-space and product/runtime
independently reproduced the same remaining fail-open; architecture found one
current selector-vocabulary contradiction.

Three P2 findings are accepted, representing two distinct defects:

| Finding | Repair law |
| --- | --- |
| `G1-RR8-TS-001` | `deriveRuleReportStatus` must apply the enforced/unbaselined diagnostic guard before disposition dispatch, so `baseline-integrity/passed` cannot carry contradictory diagnostics as green |
| `G1-RR8-PROD-001` | the real hook parser must reject that same contradictory baseline-integrity wire; this independently corroborates the state finding rather than defining a second repair |
| `G1-RR8-AUTH-001` | current supported-scenario and repair-constraint prose must name `owner/rule/runner` and `rule/runner`; explicitly historical `--tool` evidence remains untouched |

The ninth repair changes only the shared status function, its direct validator
and real hook regressions, and the two active authority sentences. The status
function may gain concise JSDoc because this state law is now stable and useful
to preserve for future agents and humans; no comment belongs on still-moving
provider topology. No new abstraction, verifier, rule, generator, tracking
surface, provider topology, G.2, A.2, or broad prose sweep is admitted.

Review proof passed Habitat TypeScript, 116 state-focused tests, 30 authority-
focused tests, 132 product-focused tests, the provider-boundary rule, generated-
map source-set/currentness inspection, and the complete live 79-rule matrix
with the same 74 passes and five named red rows. The product and state lanes
both reproduced the fail-open through the real hook parser. Ubuntu execution
remains the same explicit residual.

### Ninth Repair Integration And Proof

One sole implementation owner changed exactly the five authorized paths. The
general enforced/unbaselined diagnostic guard now runs before disposition
dispatch, so no provider severity or otherwise-green disposition can reopen an
enforced report. Direct validator and real hook-parser regressions cover the
previously valid `baseline-integrity/passed` contradiction. The two current
selector sentences now name `runner`; historical `--tool` evidence remains
untouched. The DRA removed one redundant second unbaselined-diagnostic check
after the new guard. No abstraction replaced it.

`deriveRuleReportStatus` now carries concise JSDoc because the exported state
law is stable and useful to future agents and humans. No comment was added to
the still-directional resource/provider seam or any topology scheduled to move
after G.1.

Root proof passed:

- the seven-file focused suite passed 139/139 and the complete Habitat suite
  passed 39 files and 410/410 tests;
- uncached Habitat check, boundaries, and build passed; strict OpenSpec passed
  371/371; root lint routed nine projects; and `git diff --check` passed;
- changed TypeScript/JSON selected 57 paths and checked 56, retaining exactly
  79 errors and 61 infos. The two changed test files retain the review-08
  diagnostic multiset, while the changed schema introduces no diagnostic;
- the execution-surface generator retained exact review-08 hashes for 813
  surfaces and 122 rule-JSON surfaces;
- the provider-boundary rule passed. The one-rule docs check truthfully
  returned typed `GritObservationIncomplete`;
- the complete live matrix selected 79 Grit rules, with 74 passes and the same
  five red rows: one enforced missing-root authority refusal, three enforced
  Studio/Swooper boundary findings, and one advisory incomplete parse;
- at that historical gate, the candidate remained 72 paths: 68 tracked and four
  untracked paths, including three intentional deletions, with zero staging. A
  byte-for-byte status-path comparison found no entry or exit;
- protected refs, both JSONL uniqueness checks, the preserved evidence census
  of 62 tracked changes, 31 actual untracked files, 75 default porcelain
  entries, and zero staging all passed. No provider, Grit, Vitest, TypeScript,
  or Habitat Nx process remains.

Three entirely fresh review-09 tasks are registered in the permanent roles:

- TypeScript/state-space: task `019f5a72-0ea8-7cc1-b9fd-ff3ef6d46c23`;
- architecture/authority: task `019f5a72-259a-7473-aa49-51c6127e9216`;
- product/runtime/library: task `019f5a72-3ffb-7ad3-a27c-5949bf4f77cf`.

They are registration-only until the DRA freezes and sends one exact manifest
digest. No prior reviewer task is reused. Review 09 binds the complete 72-path
candidate, not merely the five-path repair.

## Affected Review Outcome 09

All three fresh tasks independently reproduced the 72-row digest
`7abbdfa463f3edc90315cee40afbde0f6305ba996e51764fa11afd0830610955`
before and after review and remained read-only. Review accepted five P2
findings representing four distinct defects:

| Finding | Repair law |
| --- | --- |
| `G1-RR9-TS-001` | a not-applicable aggregate contains only passing rows; any failing row reaches the ordinary fail-closed outcome before hook admission |
| `G1-RR9-PROD-001` | the real hook path must block that same failing row; this corroborates the state finding and does not add a raw exit or `report.ok` admission guard |
| `G1-RR9-TS-002` | `baseline-integrity` is an enforced-only built-in disposition; semantic validation rejects any advisory lane before status admission |
| `G1-RR9-AUTH-001` | current scenario authority advertises only diagnostic dry-run and explicit no-write live refusal; G.2 safe-write, rollback, and formatter claims remain future work |
| `G1-RR9-AUTH-002` | the existing execution-surface generator excludes nested Git roots as a class, then regenerates only its three owned artifacts |

Typed summary remains hook-admission authority. The product reviewer suggested
also requiring `report.ok`, but that would duplicate the summary state and
contradict the settled command/report ownership law. Repair instead changes
`isNotApplicableOutcome` so every member must have status `pass`; a clean
not-applicable row remains admitted, advisory not-applicability remains
advisory-only, and a failing row remains failed. No raw exit-code admission rule
is added.

The categorical repair is ten paths. The tenth entered only after the first
root seven-file integration gate exposed an existing service fixture that still
encoded the rejected fail-open wire:

1. `tools/habitat/src/service/model/check/policy/summaries.policy.ts`
2. `tools/habitat/src/service/model/check/dto/check.schema.ts`
3. `tools/habitat/test/lib/check-summaries.test.ts`
4. `tools/habitat/test/lib/hooks.test.ts`
5. `tools/habitat/test/service/hook-service.test.ts`
6. `docs/projects/habitat-harness/domain-refactor-prep/scenario-corpus.md`
7. `tools/habitat/scripts/execution-surface-map.ts`
8. `docs/projects/habitat-harness/execution-surface-map/execution-surface-anatomy.md`
9. `docs/projects/habitat-harness/execution-surface-map/execution-surface-map.json`
10. `docs/projects/habitat-harness/execution-surface-map/execution-surface-map.md`

That fixture changes only from a failing not-applicable report with a diagnostic
to the clean passing not-applicable report its test already claims to exercise.
The failing and advisory paths remain covered through the real hook parser in
`hooks.test.ts`. No production scope changed.

The generator repair uses the existing recursive walk and skips a child
directory carrying its own `.git` marker. It adds no Git subprocess, workspace
reconstruction, checker, rule, or test project. Generated counts and hashes are
observed after deterministic regeneration rather than predicted in authority.

Review proof passed Habitat TypeScript, 144 state-focused tests, 123 authority-
focused tests, 118 product-focused tests, the provider boundary, and the same
complete live 79-rule matrix. One product reviewer disclosed a read-only wave-
section scope overrun; its executable corroborating finding is retained, but
its receipt is not treated as a clean pass. All three tasks are terminal and
archived. Sole implementation owner `/root/provider_primary_repair_07` is
reactivated for this exact repair before another all-new three-role review.

No compiler API, new Grit rule, compatibility-matrix reconstruction, live-write
implementation, test file, provider topology, G.2, A.2, staging, Git, or
Graphite mutation is admitted.

### Tenth Repair Integration And Proof

The sole implementation owner changed the initial nine authorized paths. The
first root seven-file gate then failed one existing service test because its
`notApplicableCheckReport` fixture still carried `ok: false`, status `fail`, and
an unbaselined diagnostic while expecting affected execution to continue. The
DRA admitted that already-candidate test as the tenth path and changed only the
fixture to the clean passing not-applicable report its scenario names. The gate
then passed 145/145. No production scope widened.

The repaired model now has one categorical aggregation law: every row in a
not-applicable outcome is passing. Clean typed not-applicability remains
admitted, advisory diagnostics remain advisory-only, and failing rows remain
failed. `baseline-integrity` is rejected outside the enforced lane before the
shared status derivation. Typed summary remains hook admission authority; no
`report.ok` or raw-exit duplicate was added.

Current scenario authority now describes dry-run observation and explicit live
no-write refusal only. The existing execution-surface walker skips a child
directory carrying its own `.git` marker; it adds no Git subprocess or second
workspace model. Two deterministic regenerations report 603 surfaces, including
122 rule JSON and 162 package scripts, with zero `.repos/effect` or
`.civ7/outputs/resources` path. Artifact hashes are:

- anatomy: `cf5296f208055e5154e896b873661da30f04c64aa6aa319f2d1f530a54d1ac01`;
- JSON: `d796e74c7da7d60369fe224340964e4dc5b327510d8c995c27e71bb46ab3fb42`;
- Markdown: `3345b8804c0879d1932fab25c125eeeadd3ad65d8a5aa18d426fed704afadf1a`.

Root proof passed:

- the seven-file focused suite passed 145/145 after the one truthful fixture
  correction; the full Habitat suite passed 39 files and 415/415 tests;
- uncached Habitat check, boundaries, and build passed; strict OpenSpec passed
  371/371; root lint routed nine projects; and `git diff --check` passed;
- changed TypeScript/JSON selected 58 paths and checked 57, retaining exactly 79
  errors and 61 infos. The newly changed generator is individually clean and the
  repair introduced no net diagnostic;
- the provider-boundary rule passed. The one-rule docs check truthfully returned
  typed `GritObservationIncomplete`;
- the complete live matrix selected 79 Grit rules, with 74 passes and the same
  five red rows: one enforced missing-root authority refusal, three enforced
  Studio/Swooper boundary findings, and one advisory incomplete observation;
- the candidate is exactly the current sorted 73-path block above: 69 tracked
  and four untracked paths, including three intentional deletions, with zero
  staging;
- protected refs, both JSONL uniqueness checks, and the preserved evidence
  census of 62 tracked changes, 31 actual untracked files, 75 default porcelain
  entries, and zero staging all passed. No repair-owned provider, Grit, Vitest,
  TypeScript, generator, or Habitat Nx process remains.

Three entirely fresh review-10 tasks are registered in the permanent roles:

- TypeScript/state-space: task `019f5a99-9157-7f41-8b6f-0feec67afcab`;
- architecture/authority: task `019f5a99-8aa1-7c72-977b-b0535a1c7a7d`;
- product/runtime/library: task `019f5a99-8367-7852-b207-fda502f3ebf1`.

They remain registration-only until the DRA freezes and sends one exact 73-row
manifest digest. No prior reviewer task is reused. Review 10 binds the complete
candidate, not merely the ten-path repair.

### Affected Review Outcome 10 And Eleventh Repair Design

```json
{"review":10,"digest":"70d6e704c6b8f4a42ef696b928673292e18bd71c8fe3bfdcca7d2c7a3455b936","paths":73,"verdict":"changes-requested","findings":{"p2":4,"p3":1,"distinctDefects":4},"next":"repair-11-state-collapse"}
```

All three fresh roles reproduced the manifest before and after review and made
no mutation. The repair is deliberately subtractive:

- staged pure not-applicability records exit zero with no diagnostic; provider
  not-applicability preserves the provider result. The synthetic
  `notApplicableDiagnostic` API is deleted. Real report/hook construction, not
  hand-built summaries alone, proves the clean state.
- `GritResultSchema` rejects a `check_id` whose parsed identity segment is
  empty, and the projection constructor validates its output against
  `ObservedGritDiagnosticIdentitySchema`. A schema round trip owns the law; no
  new identity variant is introduced without observed native evidence.
- current scenario authority states that zero-exit dry-run stdout is forwarded
  without completeness parsing and that every live `habitat fix` request is
  refused without writing. It advertises no approved live-apply pattern class.

One implementation owner may write only:

1. `docs/projects/habitat-harness/domain-refactor-prep/scenario-corpus.md`
2. `tools/habitat/src/service/model/check/policy/structural/source-execution.policy.ts`
3. `tools/habitat/src/service/model/check/policy/disposition-diagnostics.policy.ts`
4. `tools/habitat/src/service/model/check/index.ts`
5. `tools/habitat/src/providers/grit/types.ts`
6. `tools/habitat/src/service/model/diagnostics/dto/diagnostic-identity.schema.ts`
7. `tools/habitat/test/lib/rule-selection.test.ts`
8. `tools/habitat/test/lib/check-summaries.test.ts`
9. `tools/habitat/test/lib/grit-provider.test.ts`

No parser integration, compiler-API verifier, Grit rule, topology move, G.2,
A.2, generator, or new proof apparatus enters this repair. JSDoc changes only
if they preserve a settled owner or invariant that the executable contract does
not already make obvious. Root retains records, integration, review, and Git.

### Eleventh Repair Integration And Proof

```json
{"repair":11,"paths":9,"statusPaths":73,"staged":0,"focused":"141/141","habitat":"417/417","stagedRuntime":"79/79 pass","liveRuntime":"74 pass; 4 enforced red; 1 advisory red","verdict":"passed-ready-to-freeze"}
```

The repair deleted the synthetic not-applicable diagnostic state, preserved
provider results, closed empty parsed Grit identities, and corrected the three
current scenario rows. Root adversarial fuzzing found that the first regex could
backtrack to an earlier `#`; the final boundary instead requires a nonempty
segment after the last separator, and the regression includes a trailing `#`.
No new identity variant or parser entered.

Uncached Habitat check, boundaries, build, and all 417 tests passed. Strict
OpenSpec passed 371 items; root lint routing passed. Scoped Biome has no format
diff and retains six errors/eight infos at unchanged pre-repair lines. The real
empty staged run now returns 79 clean typed not-applicable passes. Provider,
docs, and all-Grit checks retain the accepted 1/1 provider pass and 79-rule
74/4/1 matrix. The candidate remains 69 tracked plus four untracked paths with
zero staging; refs, inherited 62/31/75/0 evidence, and process ownership did not
move.

Three fresh permanent-role agents are registration-only until the next exact
manifest freezes: `/root/provider_review11_state_space`,
`/root/provider_review11_authority`, and `/root/provider_review11_product`.

### Affected Review 11 And Commit Gate

```json
{"review":11,"initialDigest":"0e879865c76065c083f441381e134ed9dbab4312b3d1c19d4e9bd417cadcf2d4","successorDigest":"6a42846b2a4546ba450ed4133f8657503d7e26be1d6d1c2c82def8e3c24bfc44","paths":73,"accepted":{"p3":1},"verdict":"passed-commit-gate"}
```

State-space passed after correcting only the recorded focused count from 140
to 141. Architecture accepted one P3: the raw-report-to-`RuleRunResult`
compatibility function and its sole helper had no callers beside a barrel
export. Deleting those two functions and the export left the runner-owned
acquisition/projection path intact; affected authority review, provider Vitest
39/39, and Habitat check passed.

The fresh product/runtime/library task reproduced the original manifest and
confirmed that the two provider blobs were the only later semantic movement.
It passed the complete candidate with no P0-P3. Ubuntu native execution,
`RemoveFile` cardinality, full capability-demand/topology separation, and a
no-follow filesystem sandbox remain explicit nonclaims or later work.

### Seal Receipt

```json
{"branch":"codex/mapgen-runtime-closeout-grit-diagnostic-acquisition","parent":"d82b64450e189db0e43ea92b9889803c095424c4","initialCreate":"cd08b0ecfc7d39cf5edd54e9e325a6adfd4f4499","paths":73,"remoteMutation":false,"verdict":"sealed"}
```

The staged path set and index blobs exactly matched candidate digest
`cdba7c37dd0dda13c7d9c1d16f2ef292334ede7f99714523c4322b95c3bd36b4`.
Graphite created one child with the reviewed subject and body. This terminal
receipt is the only post-create content; the final identity is the branch ref
after its receipt-only amendment.

## Stop Conditions

Stop and return to DRA synthesis if implementation needs an unlisted path,
cannot preserve the fix port, cannot distinguish incomplete from malformed
wire data, requires the downloader shim, branches on current rule identity or
path type, cannot publicly represent an unmatched selected rule, observes a
new pinned native event shape or law, or encounters inherited/Graphite/process
state drift.

No staging, commit, restack, submission, remote, or PR operation runs until the
complete candidate passes review and closing gates under a fresh exact-scope
Graphite mutation lease.

## Non-Goals

- no G.2 fix/apply admission;
- no A.2 Authority or domain train;
- no claim that RemoveFile cardinality is known;
- no claim that native check observes ignored files as a repository walk;
- no live mutation or safe-write claim;
- no semantic lock, sink design, recut, matrix, merge, or product closure.
