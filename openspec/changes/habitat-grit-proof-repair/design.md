# Design - Grit Proof Repair

## Frame

### Objective

Make the existing Habitat Grit tranche auditably true before any new Grit
pilot or codemod expansion starts.

### Product Movement

This repair moves Habitat toward the repo-local executable structural operating
system by turning Grit from "installed catalog with passing samples" into a
repeatable proof surface: exact scan roots, rule-level current-tree behavior,
baseline state, injected violations, old-mechanism parity, and safe-transform
proof are all visible.

### Exterior

- New Grit pattern authoring.
- Runtime Civ7 behavior.
- Nx graph/taxonomy repair.
- Biome configuration repair.
- Hook side-effect policy.
- Command selector implementation, except as a dependency from
  `habitat-oclif-entrypoint-repair`.

### Falsifier

This design fails if a future agent can claim a Grit rule is enforced because
native samples passed, while the current-tree scan root, Habitat rule mapping,
baseline behavior, and injected violation proof for that rule are absent.

## Stage 0 Diagnosis

The following evidence was collected on branch `codex/habitat-dra-takeover-frame`
after the command-trust design checkpoint. It is historical Stage 0 diagnosis,
not current post-repair command behavior. Current implementation proof rows live
in `workstream/command-proof-log.md`, and the phase record names the current
selector/current-tree and explicit-baseline proof classes and non-claims.

| Probe | Result | Proof class | Non-claim |
| --- | --- | --- | --- |
| `rg --files .grit/patterns/habitat` | 22 check patterns and 1 apply pattern found | corpus enumeration | no current-tree enforcement proof |
| `GRIT_TELEMETRY_DISABLED=true grit patterns test --json` | 23 reports, 45 samples, all success/pass | native sample proof | no scan-root, baseline, parity, or apply safety proof |
| `bun run habitat:check -- --json --tool grit-check` | schemaVersion 1, `ok:true`, 23 passing reports including `baseline-integrity` | Habitat current-tree wrapper proof for valid tool selector | selector truth for wrong namespace |
| `bun run habitat:check -- --json --rule grit-check` | schemaVersion 1, `ok:true`, only `baseline-integrity` | historical selector false-green evidence before `habitat-oclif-entrypoint-repair` | not valid proof of Grit rule behavior or current selector behavior |
| raw `grit --json check` over declared roots | interrupted after useful design-probe bound; no output captured | unresolved raw acquisition proof | no failure or pass claim |
| `bun run habitat:fix -- --dry-run` | Grit apply roots processed 234 files with 0 matches; Biome checked 2343 files with no fixes | live-tree dry-run hygiene | no injected rewrite safety proof |
| `bun tools/habitat-harness/bin/dev.ts check --tool wrapped-script --json` | 4 pass | current wrapper state | no per-rule parity mapping |
| `bun tools/habitat-harness/bin/dev.ts check --tool wrapped-test --json` | 7 pass | current wrapper state | no retirement proof |
| `bun tools/habitat-harness/bin/dev.ts check --tool wrapped-eslint --json` | 1 pass | current wrapper state | no deleted-rule parity proof |
| `nx run @internal/habitat-harness:grit:check --outputStyle=static` | green, served from Nx cache | Nx scheduling/target path | no fresh Grit scan unless cache policy is recorded |
| `find tools/habitat-harness/baselines` | only `adapter-boundary.json` exists | baseline corpus proof | H5 "empty baseline" claims are not explicit files |

System dynamic: the previous H5/H6 closure loop converted green samples,
cached task output, and old parity statements into broad proof. This repair
adds a balancing loop: every Grit row must carry the proof class it actually
has and the proof class it lacks.

## Owner Layer Boundaries

| Concern | Owner |
| --- | --- |
| Pattern syntax and AST matching | GritQL native patterns |
| Current-tree pass/fail, rule mapping, and shrink-only baseline | Habitat |
| Safe formatting after rewrites | Biome |
| Task scheduling and affected-scope optimization | Nx |
| Generated-zone hand-edit protection | file-layer, not Grit |
| Product/runtime behavior | tests/runtime proof, not Grit |
| Typed command/provenance/resource orchestration | accepted `habitat-effect-grit-adapter` substrate for Grit command/result, parser, injected-probe, proof-artifact, and isolated-copy apply concerns |

## Proof Classes

Each proof record must name one class and one non-claim:

| Proof class | Command or artifact | Proves | Does not prove |
| --- | --- | --- | --- |
| Corpus enumeration | `rg --files .grit/patterns/habitat` | pattern files exist | matching behavior |
| Native sample proof | `grit patterns test --json` | sample inputs pass native Grit expectations | repo scan roots, baselines, parity, apply safety |
| Habitat current-tree wrapper proof | `habitat check --json --tool grit-check` | Habitat can project current Grit scan into rule reports for valid tool selector | raw Grit schema stability or injected violations |
| Raw acquisition proof | direct `grit --json check` or adapter-level captured command result | Grit CLI output acquisition and parse shape | Habitat baseline/report mapping |
| Injected violation proof | controlled probe file plus Habitat check | exact rule id fails through real wrapper path | product/runtime behavior |
| Baseline proof | baseline file plus check/expand/integrity command | locked or shrink-only behavior for a row | Grit pattern correctness |
| Old-mechanism parity | wrapped-script/eslint/test probes and old source mapping | old mechanism and Grit agree on current tree or known delta | future retirement unless row-level delta is recorded |
| Nx target proof | `nx run ...:grit:check` and target inspection | Nx can schedule the Grit gate | Grit semantics |
| Dry-run no-write proof | `habitat fix --dry-run` plus worktree/diff evidence | current dry-run command does not write | actual rewrite correctness |
| Applied-diff proof | controlled probe, `habitat fix`, `git diff`, type/test checks | codemod produces expected reviewable diff | safety outside stated scan roots |

## Grit Proof Matrix Contract

Implementation must maintain `workstream/grit-proof-matrix.md` with one row for
each current check and apply pattern. A row is implementation-ready only when it
has:

- pattern file path and Habitat rule id;
- normative source and proving source;
- exact scan roots and exclusions;
- native sample command and sample count;
- current-tree command and output class;
- injected violation fixture/probe path;
- baseline file path and explicit empty status;
- parity source and current parity result, or a no-parity disposition;
- apply safety disposition;
- non-claims and downstream records to update.

Rows may share commands, but commands do not erase row obligations.

The matrix schema must directly carry these fields for every current check row:

| Field | Required content |
| --- | --- |
| Rule id | Habitat rule id from `rules.json` |
| Pattern file | Exact `.grit/patterns/habitat/checks/*.md` path |
| Pattern name | Grit local pattern name |
| Normative source | Cited authority path and section/row |
| Proving source | Existing fixture, old mechanism, injected probe, or current scan source |
| Adapter root | The Habitat adapter scan root that includes the probe |
| Rule-pack scope | `rules.json` scope text and owner project |
| Grit path/source predicate | `$filename`, import-source, or other predicate controlling effective scope |
| Exact scan roots/exclusions | Runnable paths and exclusions for the row |
| Fixture coverage | positive / negative / parser-edge / false-positive counts or evidence-backed not-applicable status |
| Native sample proof | command, report id/count, sample count |
| Current-tree proof | Habitat wrapper command, output class, raw output artifact, selected rule ids |
| Raw acquisition proof | satisfied with command-proof log id or explicitly unclaimed |
| Injected probe | probe path, expected diagnostic, path-control probe outside effective scope |
| Baseline | explicit baseline file path and baseline-integrity proof |
| Parity | old mechanism command, current result, delta, retirement impact |
| Apply disposition | non-apply or separate apply row id |
| Downstream records | stale records that must be patched or marked no-change |
| Non-claims | proof classes this row does not satisfy |

Apply rows use the same authority/proof fields plus:

| Field | Required content |
| --- | --- |
| Live match inventory | command and result before apply |
| Target export preflight | every imported symbol and export source checked |
| Missing-export negative | fixture/probe showing refusal or no rewrite |
| Dry-run no-write | command-proof log id plus clean diff proof |
| Applied diff | bounded diff artifact and allowed change classification |
| Type-only preservation | proof that `import type` remains type-only |
| Biome handoff | formatter command and output |
| Type/test gates | selected commands and result |
| Rollback | cleanup command/proof and final clean status |

No row can move out of pending status until every required field is filled,
or a reviewer-accepted not-applicable disposition names the source evidence.

## Injected Violation Harness

The repair must add or reuse a controlled probe harness with these properties:

- Creates probe files only under approved scan roots and with names that cannot
  collide with real source.
- Records exact path, rule id, command, exit code, stdout/stderr class, and
  expected diagnostic.
- Runs Habitat through the real Grit wrapper path, not a mocked pattern parser.
- Ensures each current enforced Grit check has one probe that fails the exact
  expected Habitat rule id.
- Removes probe files in success and failure paths.
- Fails if `git status --short` is not clean after cleanup.
- Does not touch generated output or protected resource submodules.

Tasks that add injected row probes may use the accepted
`habitat-effect-grit-adapter` substrate. This packet must still keep row-level
proof separate from substrate proof: exact rule-id failures, path-control
probes, generated-output non-claims, baselines, parity, and apply semantics are
not accepted merely because the adapter exists.

## Baseline Decision

Current code treats a missing baseline file as an empty locked baseline. That
is executable behavior, but it is not the same as H5's historical wording that
every introduced rule has an explicit ratchet entry.

This repair chooses explicit committed empty baseline files for every current
enforced Grit check. Empty JSON arrays keep the rule locked, align the filesystem
with the record claim, and avoid using missing-file behavior as hidden proof.

Implementation must:

- add `tools/habitat-harness/baselines/<grit-rule-id>.json` with `[]` for each
  current enforced Grit check that lacks one;
- prove `baseline-integrity` accepts the empty files;
- prove `--expand-baseline` still cannot grow entries outside the accepted
  rule-introduction policy;
- update H5/H6 records to distinguish historical missing-file behavior from the
  new explicit Grit baseline record.

The broader scaffold contract may still decide whether missing baseline files
remain an accepted future policy, but this Grit proof repair will not rely on
that policy for the current tranche.

## Apply Safety Boundary

The existing `deep_import_to_public_surface` row remains implemented but
under-proven until all of the following pass:

- target public `/ops` export exists for each injected private import case;
- dry-run with an injected match produces no file changes;
- actual apply in a clean worktree produces a bounded diff;
- diff only changes approved import specifiers and Biome-owned formatting;
- `import type` remains type-only;
- command result records `--force`, roots, cwd, env, stdout, stderr, and exit
  code;
- selected typecheck/test gates pass after the applied diff;
- rollback is normal Git cleanup and leaves the worktree clean.

The accepted `habitat-effect-grit-adapter` substrate provides the transaction,
cleanup, command-result, and isolated-copy diff-evidence boundary for this row.
This does not close the row: target export preflight, missing-export negative
behavior, type-only preservation, selected type/test gates, and any live
worktree apply claim remain pending in this packet.

Until those row-specific proofs exist, live dry-run hygiene and accepted
isolated-copy substrate evidence remain useful but do not prove safe
transformation.

## Command Proof Log Contract

Implementation must maintain `workstream/command-proof-log.md`. Each command
proof row must contain:

| Field | Required content |
| --- | --- |
| Proof id | Stable id referenced by matrix/tasks |
| Proof class | native sample / current-tree wrapper / raw acquisition / injected violation / baseline / parity / Nx scheduling / dry-run / applied diff / rollback / stale-record scan |
| Branch and commit | branch plus commit or dirty-state marker at execution time |
| Command | exact argv as executed |
| CWD | working directory |
| Env delta | relevant env additions or proof that none were set |
| Exit code | numeric exit code or signal/interruption class |
| Raw output artifact | path under `/tmp` or workstream artifact, or bounded excerpt |
| Parsed summary | counts, ids, statuses, cache state, or selected rule ids |
| Cache/fresh status | required for Nx and Grit cache-sensitive probes |
| Duration/timing source | measured duration or explicit not recorded |
| Proof result | satisfied / failed / interrupted / unclaimed |
| Non-claim | what the command does not prove |
| Skipped-gate rationale | required when a planned proof is not run |

Task 9 proof labels are not accepted until the corresponding command-proof log
row exists and the matrix references it.

## Effect Trigger Matrix

| Trigger | Required action |
| --- | --- |
| New code is needed to classify Grit command failure, JSON parse failure, schema drift, empty scan roots, or pattern projection failure | Open `habitat-effect-grit-adapter` or a reviewed typed adapter design before code changes. |
| Command proof needs argv/cwd/env/duration/failure-class data not available from the current runner | Open `habitat-effect-command-runner` or a reviewed command-proof adapter. |
| Apply proof needs temp workspaces, file locks, finalizers, rollback automation, or interruption cleanup | Open `habitat-effect-grit-adapter`. |
| Unit tests need fake filesystem, fake command runner, fake baseline store, or injectable scan roots inside the adapter | Open `habitat-effect-grit-adapter` or introduce explicit service seams with review. |
| Implementation starts adding stderr string parsing or generic throws for new proof outcomes | Stop and open an Effect/substrate packet. |

Command provenance for adapter-level proof cannot be supplied by handwritten
phase notes alone. If Grit check/apply implementation needs argv, cwd, env
delta, cache dir, scan roots, duration, exit code, stdout, stderr, and failure
class as data, implementation must either:

1. open `habitat-effect-command-runner` as a prerequisite; or
2. include a typed command-result contract inside `habitat-effect-grit-adapter`
   or the reviewed typed-adapter design.

The current `SpawnResult` shape is enough for design-probe summaries, but it is
not enough for new adapter-level proof machinery.

Any accepted Grit adapter substrate must include tests or proof cases for:

- no JSON output;
- malformed JSON;
- wrapper noise around JSON;
- schema drift or missing `results`;
- empty scan roots;
- pattern miss for a registered rule;
- cache-dir provenance and cache/fresh status.

## Substrate Decision Table

Before implementation tasks 4, 6, or any adapter tests begin, fill this table
in the phase record and have the Effect/substrate lane accept it. Current
implementation consumes the accepted `habitat-effect-grit-adapter` substrate at
`3ceb93d5c`; row-level proof remains owned by this packet.

| Concern | Current-code capability | Required proof | Chosen substrate | Trigger result | Evidence path | Reviewer |
| --- | --- | --- | --- | --- | --- | --- |
| Injected violation harness | accepted adapter substrate; row probes pending | exact rule id, path control, cleanup | `habitat-effect-grit-adapter` | accepted at `3ceb93d5c` | `openspec/changes/habitat-effect-grit-adapter/workstream/phase-record.md` | supervisor / Effect-substrate |
| Grit command provenance | accepted adapter substrate; row proof pending | argv/cwd/env/cache/duration/failure class | `habitat-effect-grit-adapter` | accepted at `3ceb93d5c` | `tools/habitat-harness/src/lib/habitat-process.ts`; adapter phase record | supervisor / Effect-substrate |
| Parse/schema classification | accepted adapter substrate; row proof pending | no JSON, malformed JSON, wrapper noise, schema drift, empty roots, pattern miss | `habitat-effect-grit-adapter` | accepted at `3ceb93d5c` | `tools/habitat-harness/src/lib/grit.ts`; adapter tests | supervisor / Effect-substrate |
| Apply transaction | accepted adapter substrate; target-export and semantic proof pending | clean precheck, target export preflight, dry-run, diff, rollback, cleanup | `habitat-effect-grit-adapter` | accepted at `3ceb93d5c` | `tools/habitat-harness/src/lib/grit-apply.ts`; adapter phase record | supervisor / Effect-substrate |
| Fake-service tests | accepted adapter substrate; row probes pending | fake command/fs/baseline/clock or accepted no-fake rationale | `habitat-effect-grit-adapter` | accepted at `3ceb93d5c` | `tools/habitat-harness/test/lib/*` adapter tests | supervisor / Effect-substrate |

## Pattern Generator Gate

The current pattern generator can create enforced Grit rules without the
metadata now required by this recovery frame. Before the first new Grit pilot
uses generated enforced rules, either:

1. `habitat-pattern-generator-metadata-repair` must require authority source,
   proving source, exact scan roots, fixture coverage model, false-positive
   model, baseline policy, and hook-scope decision; or
2. this repair must record an explicit reviewed stop-gate path that keeps
   generated output advisory/unwired until those fields are supplied.

This is a downstream realignment blocker, not discretionary README cleanup.

## Write Set

Expected write set for implementation:

- `openspec/changes/habitat-grit-proof-repair/**`
- `tools/habitat-harness/test/grit/**`
- `.grit/patterns/habitat/**` only for fixture/proof improvements
- `tools/habitat-harness/baselines/**` for explicit empty Grit baselines
- `tools/habitat-harness/src/lib/grit.ts` only after substrate trigger review
- `tools/habitat-harness/src/lib/command-engine.ts` only if command repair and
  this packet both require shared proof/report plumbing
- H5/H6 and Habitat project records named in the downstream ledger

Protected paths:

- generated output paths
- `.civ7/outputs/**`
- product/runtime source unrelated to injected probes
- Nx/Biome/taxonomy config unless a separate workstream owns it

## Test And Proof Design

### Required Tests

- Native pattern sample test remains green and reports all current patterns.
- Grit proof harness injects one violating file per current enforced Grit rule.
- Each injected probe fails the exact expected Habitat rule id and then cleans
  itself up.
- Baseline tests prove the explicit empty baseline contract for Grit rows.
- Apply tests prove dry-run no-write and applied-diff behavior for
  `deep_import_to_public_surface`.
- Adapter parse/projection tests are added only inside the accepted substrate
  boundary.

### Required Commands

Implementation must record command proof metadata for:

- native sample proof;
- Habitat current-tree Grit check;
- selector namespace proof after `habitat-oclif-entrypoint-repair`;
- every injected-violation run or generated summary;
- baseline proof;
- old-mechanism parity;
- Nx `grit:check` scheduling;
- dry-run and applied-diff proof;
- selected typecheck/test gates;
- stale-record scan.

## Downstream Realignment

Patch or reclassify:

- `openspec/changes/habitat-grit-catalog/tasks.md`
- `openspec/changes/habitat-grit-catalog/workstream/phase-record.md`
- `openspec/changes/habitat-enforcement-consolidation/workstream/phase-record.md`
- `docs/projects/habitat-harness/workstream-record.md`
- `docs/projects/habitat-harness/recovery-claim-ledger.md`
- `docs/projects/habitat-harness/grit-pattern-corpus-ledger.md`
- `docs/projects/habitat-harness/review-disposition-ledger.md`
- `docs/projects/habitat-harness/discrepancy-log.md`
- `docs/projects/habitat-harness/FRAME.md`
- `tools/habitat-harness/README.md` if user-facing proof or generator
  guidance changes

Historical proof stays legible. It must no longer read as current proof when
fresh evidence has weaker coverage.

## Review Lanes

- Grit corpus reviewer: matrix completeness, scan roots, fixture/probe shape,
  false-positive model, apply safety.
- Evidence reviewer: proof class separation, command proof labels, stale record
  realignment.
- System reviewer: false-confidence loop, owner-layer duplication, Effect
  trigger adequacy.
- Effect/substrate reviewer: whether current TypeScript proof work is enough
  or adapter/command-runner work should move behind Effect first.

Accepted P1/P2 findings block implementation until repaired or rejected with
source evidence.
