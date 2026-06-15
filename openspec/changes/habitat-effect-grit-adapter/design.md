# Design - Effect Grit Adapter

## Frame

### Objective

Make Habitat's Grit check/apply adapter a typed, provenance-rich, testable
execution substrate so the current Grit proof repair and future pattern
workstreams can rely on current evidence rather than brittle parser and process
conventions.

### Product Movement

This moves Habitat toward the repo-local executable structural operating system
by making Grit proof and Grit-owned structural transformations safe to trust:
enforce through the correct owner layer, shrink baselines through Habitat, and
apply transformations only after command, parse, projection, diff, and rollback
proof are explicit. Pattern corpus and generator metadata work consume these
proof fields before new enforced rules are created.

### Selection

This frame selects the Grit adapter boundary: command acquisition, scan roots,
raw output parsing, pattern projection, injected probes, current-tree proof,
apply transactions, and proof records.

### Foreground

- Typed infrastructure failures and rule findings as separate concepts.
- Command provenance captured as data.
- Effect services/layers for fakeable process, fs, clock, workspace, baseline,
  and Grit output behavior.
- Scoped resources/finalizers for probe files, temp workspaces, cache dirs, and
  apply rollback.
- Stable Habitat proof records over raw Grit CLI output.

### Exterior

- GritQL pattern semantics and new pattern authoring.
- oclif shell repair.
- Nx task ownership, Biome formatting ownership, and baseline policy outside
  Grit integration.
- Hook side-effect hardening. Existing pre-commit Grit parsing remains manual
  until `habitat-effect-hook-transaction` or a later accepted hook adapter
  routes hooks through this substrate.
- Product/runtime Civ7 proof.

### Hard Core

1. Habitat owns proof records; Grit owns structural matching and rewrites.
2. Effect is an implementation substrate, not authority for Grit, Biome, Nx,
   or product behavior.
3. Grit findings are report data. Adapter failures are typed infrastructure
   failures.
4. CheckReport schemaVersion 1 remains the public command boundary unless a
   separate accepted report-contract change says otherwise.
5. Apply proof must be transactional, reversible through Git review, and
   clean after every outcome.

### Structural Alternative Considered

Alternative: open `habitat-effect-command-runner` first and require every
command path to move behind a shared runner before Grit proof work proceeds.

Rejected for this phase because the immediate product blocker is Grit proof:
scan-root injection, output classification, exact pattern projection, and apply
transaction proof. A broad command-runner migration would enlarge the ownership
surface before the Grit adapter proves the shape. This packet instead folds the
first typed command-result contract into the Grit adapter, with extraction to a
shared runner triggered only after Biome, Nx, hook, or baseline work proves the
same contract is reused without changing command semantics.

### Falsifier

This design fails if implementation can still turn no JSON, malformed JSON,
schema drift, empty scan roots, pattern projection miss, or dirty apply state
into a successful Grit proof record, or if Effect adoption changes Habitat
command behavior without parity proof.

## Current Diagnosis

The current Grit adapter has four structural failure surfaces:

| Surface | Current evidence | Failure mode |
| --- | --- | --- |
| Command result | `SpawnResult` has only exitCode/stdout/stderr | proof records depend on handwritten notes for argv, cwd, env, cache, timing, and failure class |
| Check parse/projection | `parseGritJson()` parses whole output or brace substring and returns undefined on parse errors | no JSON, malformed JSON, wrapper noise, schema drift, and pattern miss collapse into generic diagnostics |
| Scan roots/cache | scan roots are computed at module load and one `cachedReport` is shared | injected probes, cache status, and per-run provenance are difficult to prove |
| Apply | `grit apply` uses `--force` against live roots and then Biome writes/checks | no transaction precheck, dry-run validation, approved diff, rollback finalizer, or interruption cleanup |

The system dynamic is a reinforcing loop: green native samples or cached
aggregate commands become closure claims; closure claims reduce row-level
proof; lower proof depth lets parser/projection/apply gaps stay invisible. The
adapter adds the balancing loop: Grit proof can pass only when the exact
command, parse, projection, scan-root, baseline, and transaction states are
recorded.

## Source Synthesis

Official Effect docs verify the substrate capabilities this packet uses:

- `Effect<Success, Error, Requirements>` carries success, expected error, and
  dependency requirements.
- tagged errors and `catchTag` support structured failure handling.
- Context/Layers support dependency injection and test implementations.
- Scope/finalizers support cleanup on success, failure, or interruption.
- `@effect/platform/Command` supports command execution with process, args,
  env, stdout/stderr/exit information.
- `effect/Schema` supports parse/validation at external data boundaries.

Official Grit docs and source-derived evidence verify Grit's public role and
limits:

- `grit check` and `grit apply` are the official CLI surfaces.
- `grit patterns test` proves authored fixture behavior, not current-tree
  Habitat enforcement.
- public docs do not define a stable JSON/JSONL schema for audit-grade Habitat
  proof.
- apply `--dry-run` and `--force` exist, but Habitat must own transaction
  policy, pattern-owned approval intake, approved diffs, and rollback.
  Pattern/domain semantics such as target export checks must be supplied by the
  Grit-owned output contract or another accepted owner layer, not reimplemented
  in core harness JavaScript.

Official Biome and Nx docs define non-Effect owner boundaries:

- Biome owns formatting, lint diagnostics, safe/unsafe write semantics, and
  reporter behavior for the invoked command. Habitat owns command provenance,
  protected-path policy, target set proof, and diff acceptance.
- Nx owns task scheduling, affected/project graph behavior, and cache replay.
  Habitat must distinguish fresh execution from replay; an Nx cache hit is not
  live Grit behavior proof.

## Substrate Decision

Provisionally select Effect for this adapter. Live dependency adoption and live
path switching remain blocked until this packet's review ledger is repaired and
dependency/platform parity passes.

Accepted substrate:

- Effect programs for Grit check/apply workflows.
- Tagged adapter errors for infrastructure failures.
- Layered services for process, filesystem, workspace policy, clock, baseline
  access, Git state, Grit parser, and proof artifact writing.
- Scoped resources for temp dirs, probe files, cache dirs, transaction
  workspaces, and rollback/final cleanup.
- A Grit-scoped `HabitatProcess` contract inside this packet.

Not accepted in this packet:

- replacing oclif;
- moving all Habitat command execution behind a shared command runner;
- re-authoring the entire check engine;
- changing CheckReport schema;
- changing Grit pattern semantics.

## Adapter Architecture

### Runtime Boundary

Effect execution must stay at one named runtime bridge:

- module: `tools/habitat-harness/src/lib/effect-runtime.ts`;
- allowed runner API: `runHabitatEffect(...)`, or an implementation name with
  the same single-bridge role recorded in the phase record;
- allowed `Effect.run*` or platform runtime calls: this bridge and test helpers
  that explicitly import the bridge for parity tests;
- disallowed: `Effect.run*`, `NodeRuntime.run*`, or platform runtime calls in
  rule libraries, parser modules, command-engine orchestration, Grit adapter
  business logic, or oclif command classes.

Rule libraries and parser modules must return pure results or Effect values.
They must not construct independent runtimes or call `Effect.run*` locally.

Chosen mode: async adapter chain.

Implementation must convert the Grit-touched command/rule call chain to async
explicitly:

- oclif command `run()` methods may `await` command-engine functions;
- `createCheckReport()`, `expandBaselines()` where Grit execution participates,
  and `runFix()` may become async as part of this packet;
- `executeRule()` may return an async result for all rules, with non-Grit rule
  implementations lifted without behavior changes;
- exported Grit-touched APIs from `tools/habitat-harness/src/index.ts` return
  `Promise<...>` materialized results, not public Effect values;
- implementation must inspect and update every repo callsite of those exported
  APIs, and record whether any external package relies on the old sync shape;
- rendering stays at the command boundary after the awaited report/result is
  materialized;
- there is no hidden Promise stored inside report data and no local
  `Effect.run*` inside rule or parser libraries.

If the async adapter chain cannot satisfy command parity and runtime-edge
discipline, the packet stops for a dedicated command/check orchestration change.

### Service Contracts

The adapter owns these service boundaries:

| Service | Responsibility | Fake-layer proof |
| --- | --- | --- |
| `HabitatProcess` | execute `grit`, `git`, selected `biome`, and proof helper commands as argument arrays | command result matrix without spawning real tools |
| `WorkspacePolicy` | repo root, allowed scan roots, protected paths, ignored proof roots | rejected protected path and accepted probe root tests |
| `GitState` | branch, HEAD commit, dirty status, status digest, and before/after cleanliness proof | stale-tree and dirty-tree tests |
| `GritCli` | construct Grit check/apply argv and env | exact argv/env/cwd/cache proof |
| `GritOutputParser` | parse and classify raw stdout/stderr | parser failure matrix |
| `GritProjection` | map raw findings to Habitat rule ids and pattern names | pattern miss and wrong-pattern tests |
| `ProbeWorkspace` | create/remove injected probes and temp transaction roots | cleanup on success/failure/interruption |
| `BaselineAccess` | read existing Habitat baseline snapshots and emit baseline keys/findings for the existing Habitat baseline application path | fake baseline tests; no baseline writes from adapter unit tests |
| `Clock` | timestamps and duration | deterministic duration tests |
| `ProofArtifactWriter` | write raw output/proof artifacts when required | bounded artifact path tests |

### Command Result Contract

Every Grit command result must carry:

| Field | Required content |
| --- | --- |
| command id | stable id referenced by proof logs |
| command kind | grit-check / grit-apply / grit-pattern-test / biome-handoff / git-proof |
| requested executable | logical tool requested by the adapter, such as `grit`, `biome`, `openspec`, or `git` |
| effective executable | resolved process executable, such as `bun` for workspace-owned tools or `git` for system prerequisites |
| execution plane | `workspace-bun-run`, `workspace-bunx-binary`, or `system` |
| argv | argument array, no shell interpolation |
| cwd | effective absolute working directory used by the spawned process |
| git state | branch, HEAD commit, dirty marker, status digest, and before/after status when a probe or apply flow mutates files |
| env delta | selected env keys added/changed, with sensitive values redacted |
| scan roots | exact roots passed to Grit and effective exclusions known to Habitat |
| cache policy | cache dir, no-cache/refresh setting, cache/fresh/replay status when observable |
| timing | start, end, duration, timing source |
| exit | exit code, signal, interrupted flag |
| stdout/stderr | bounded capture or artifact path plus digest |
| parse status | unparsed / parsed / no-json / malformed / schema-drift / unsupported-mode |
| failure tag | none or a tagged adapter failure |
| non-claims | proof classes this command does not establish |

Workspace-owned tool acquisition is centralized in the Habitat process layer.
The accepted default for repo-local tools is Bun's workspace command plane:
`bun run --cwd <repoRoot> <tool> ...`, invoked as an argument-array subprocess
with the effective process cwd set to the repo root. This matches the repo's
root-script/Nx policy and avoids caller-local `PATH` mutation.

When the intended command is a package binary and a same-named root package
script exists, the adapter must not rely on script-first `bun run` resolution.
Those tools use the binary-only local plane `bun x --no-install <tool> ...`
from the repo root. `openspec` is the current collision case. Plain `bunx`
without `--no-install`, direct `node_modules/.bin` path construction, and
ambient `PATH` injection are not accepted proof surfaces for workspace-owned
Habitat tools.

Nx remains the owner for graph-aware, cacheable, or dependency-fresh tasks:
root proof scripts, `affected`, `run-many`, generated Habitat targets, and
selected apply gates. Habitat does not wrap every low-level Grit subprocess in
an Nx target; doing so would add scheduling/cache semantics where the adapter
needs direct command/output provenance.

### Proof Artifact Contract

The command result is not accepted as durable proof until it is written to a
proof artifact and referenced by the consuming proof matrix or command log.

`ProofArtifactWriter` owns this schema:

| Field | Required content |
| --- | --- |
| proof id | stable id, unique within the workstream |
| artifact path | `openspec/changes/habitat-effect-grit-adapter/workstream/proofs/<proof-id>.json` for adapter-local proof; copied or referenced from `openspec/changes/habitat-grit-proof-repair/workstream/command-proof-log.md` when that repair consumes it |
| schema version | adapter proof artifact schema version |
| source tree | branch, HEAD commit, dirty marker, status digest, and before/after status when relevant |
| command result | full command-result contract above |
| normalized summary | pattern ids, rule ids, counts, cache/fresh status, failure tag, and output class |
| raw output | bounded stdout/stderr excerpt plus digest, or artifact path plus digest |
| redaction | list of redacted env keys and proof that sensitive values are not persisted |
| retention | whether the artifact is committed, ephemeral scratch, or copied into a downstream proof log |
| proof class | native sample / current-tree wrapper / raw acquisition / injected violation / dry-run / applied diff / rollback / Biome handoff / Nx scheduling |
| non-claims | proof classes not established |
| downstream links | proof matrix row id, command-proof-log row id, or explicit not-consumed status |

Adapter proof labels are not accepted until either:

- the adapter-local artifact is referenced by
  `habitat-grit-proof-repair/workstream/command-proof-log.md`; or
- the adapter-local artifact explicitly states it is adapter smoke proof and not
  a current Grit row proof.

CheckReport schemaVersion 1 remains unchanged. Proof ids live in workstream
artifacts and command-proof logs unless a separate report-contract change adds
public provenance fields.

### Baseline Boundary

The adapter does not own baseline policy or baseline mutation.

Accepted adapter responsibilities:

- read the baseline snapshot supplied by existing Habitat baseline services;
- emit normalized finding identity, baseline key, and unbaselined/baselined
  classification metadata for command/report assembly;
- pass through enough provenance for `baseline-integrity` and
  `habitat-grit-proof-repair` to record row-level proof.

Forbidden adapter responsibilities:

- deciding missing-file baseline policy;
- expanding or shrinking baseline files;
- writing `tools/habitat-harness/baselines/**`;
- treating a baseline hit as proof of Grit pattern correctness.

Baseline writes remain owned by existing Habitat baseline expansion flows and
the separate scaffold/baseline contract repair.

### Tagged Adapter Failures

The first implementation must model at least:

- `GritToolUnavailable`
- `GritCommandFailed`
- `GritNoJson`
- `GritMalformedJson`
- `GritSchemaDrift`
- `GritUnexpectedResultShape`
- `GritEmptyScanRoots`
- `GritPatternProjectionMiss`
- `GritUnexpectedPatternIdentity`
- `GritCacheProvenanceMissing`
- `GritApplyDirtyWorktree`
- `GritApplyDryRunMismatch`
- `GritApplyUnexpectedFile`
- `GritApplyMissingTargetExport`
- `GritApplyRollbackFailed`
- `GritAdapterInternalContractViolation`

Failure rendering must normalize these into Habitat diagnostics or command
failures. `GritApplyMissingTargetExport` may be preserved from pattern-owned
structured output, but the core harness must not derive it by inspecting
domain-specific import/export files. Raw Effect/Schema parse errors must not
leak as the durable proof format.

## Check Adapter Flow

1. Validate scan roots and selected pattern/rule mapping.
2. Build `grit check` argv with explicit roots, env, cache policy, and output
   mode.
3. Execute through `HabitatProcess`.
4. Parse stdout/stderr according to accepted Grit output schema for the pinned
   CLI version.
5. Validate raw result shape.
6. Project findings by exact pattern identity to Habitat rule ids.
7. Distinguish valid zero-findings from projection miss and empty scan roots.
8. Return rule findings as CheckReport data plus an adapter proof artifact id
   recorded outside CheckReport schemaVersion 1.
9. Return infrastructure failures as tagged adapter failures rendered by the
   command/report boundary.

The adapter must fail closed for:

- no JSON in the expected stream;
- malformed JSON;
- extra wrapper text not accepted by the parser contract;
- missing `results` for check JSON;
- unexpected result fields required for projection;
- registered rule id with no matching pattern identity;
- findings from a pattern outside the requested set;
- empty scan roots after validation;
- cache status required by proof but unavailable.

## Injected Violation Harness

The injected harness is part of the adapter substrate, not individual pattern
logic. It must:

- receive a rule id, pattern identity, probe path template, fixture body, and
  expected diagnostic;
- require row-level effective-scope metadata for every current check row:
  Habitat adapter root, `rules.json` scope, Grit `$filename`/source predicate or
  equivalent effective predicate, exact scan roots, exact exclusions, matching
  probe path, and a nearby outside-scope control probe;
- verify the matching probe and outside-scope control probe are under approved
  roots and outside generated or protected paths;
- create probe files through the scoped filesystem service;
- run the real Habitat Grit adapter path;
- assert the exact Habitat rule id fails and the finding is unbaselined;
- assert the outside-scope control probe does not produce the rule finding;
- remove all probe files in a finalizer;
- verify final `git status --short` is clean or fail the proof.

Unit tests use fake services. Integration proof in `habitat-grit-proof-repair`
uses real controlled files.

## Apply Transaction Flow

The apply path is fail-closed:

1. Verify clean worktree unless running inside an isolated transaction copy.
2. Resolve candidate roots and protected path exclusions.
3. Require pattern-owned structured approval or failure tags for every expected
   rewrite.
4. Run dry-run with machine-readable output when supported by the pinned Grit
   version; otherwise run a transaction-copy apply and classify the resulting
   file/diff evidence as dry-run evidence.
5. Inventory every candidate rewrite or transaction-copy diff over the exact
   live and injected roots. Structured pattern-owned inventory records file,
   symbol, current import source, proposed import source, range, rewrite
   reason, raw output digest, and whether the candidate is expected,
   pre-approved, rejected, or blocked. Transaction-copy diff evidence records
   changed path, before/after digests, diff digest, classification, and the
   raw command provenance without claiming symbol/import semantics. A
   transaction-copy create or delete is blocked unless a future pattern-owned
   approval contract explicitly authorizes that operation.
6. Preserve pattern-owned failure tags for every candidate, not only injected
   expected cases.
7. Validate rewrite set: expected files, pattern-approved candidate metadata,
   approved ranges, no unexpected file, no isolated-copy create/remove file
   without pattern-owned create/delete approval, and no unapproved raw output.
8. Apply in the approved transaction context.
9. Run Biome handoff only over the approved changed paths.
10. Run selected type/test gates.
11. Record diff, raw output digests, command provenance, rewrite inventory, and
    non-claims.
12. Roll back through normal Git cleanup or scoped transaction cleanup.
13. Prove final clean status.

`--force` may appear in the Grit argv only after Habitat's own clean/transaction
precheck has accepted the write set. Grit's prompt or dirty-tree behavior is not
the Habitat safety boundary.

The adapter may validate structured rewrite inventory supplied by the apply
pattern/output contract, but it must not rediscover matches or reconstruct a
pattern's semantic intent from source text in core harness code. If the pinned
Grit CLI emits only compact human output for a matching dry-run, Habitat may
run the same Grit pattern against an isolated transaction copy and classify the
resulting file/diff evidence. Habitat must fail closed when neither
pattern-owned inventory nor isolated diff evidence is available, and it must
not parse TypeScript imports or hardcode domain-specific match logic to turn
human output into semantic proof.

Rollback primitive:

- default apply proof runs in an isolated transaction copy or temp worktree
  owned by an Effect scope;
- live-worktree apply proof is allowed only after clean status, exact allowed
  path inventory, before-digest capture, and explicit rollback command
  recording;
- this packet does not claim live-worktree create/delete rejection; the repaired
  create/delete proof is isolated-copy diff evidence only;
- downstream Biome/type/test gate failure after writes must still invoke
  rollback and final clean-status proof;
- interruption or signal during apply must still invoke scoped finalizers;
- rollback failure is a first-class `GritApplyRollbackFailed` result and blocks
  closure until manually resolved and recorded.

## Package And Dependency Boundary

Implementation may add dependencies to `tools/habitat-harness/package.json`
only after the dependency/platform task records:

- refreshed official Effect, GritQL, Biome, and Nx evidence packs or explicit
  confirmation that the existing packs remain current for the selected version;
- repo-local Effect usage inspection, including runtime-edge, service/layer,
  tagged-error, and platform-package precedent;
- exact `effect`, `@effect/platform`, and platform package versions selected;
- selected platform runtime strategy for Bun dev and built runner paths;
- whether the package already exists in the workspace lockfile;
- Bun dev runner proof for a tiny command, fs, scope/finalizer, and tagged
  error program;
- built runner proof for the same program;
- no user-visible Habitat command behavior change from dependency addition.

If package selection fails parity, this packet stops for a substrate redesign.

## Write Set

Expected implementation write set:

- `tools/habitat-harness/package.json`
- `bun.lock`
- `tools/habitat-harness/src/lib/grit.ts`
- new adapter/runtime modules under `tools/habitat-harness/src/lib/**`
- `tools/habitat-harness/src/lib/command-engine.ts`
- `tools/habitat-harness/src/rules/architecture.ts`
- `tools/habitat-harness/src/commands/check.ts`
- `tools/habitat-harness/src/commands/fix.ts`
- `tools/habitat-harness/src/commands/verify.ts` only if async check
  signature requires call-site alignment
- `tools/habitat-harness/test/grit/**`
- `tools/habitat-harness/test/lib/**`
- `tools/habitat-harness/test/commands/**` for command parity tests
- this change's `workstream/**`
- `openspec/changes/habitat-grit-proof-repair/**` for dependency/proof
  realignment

Protected paths:

- product/runtime source outside controlled probe fixtures;
- generated outputs and ignored build artifacts;
- `.civ7/outputs/resources/**`;
- `.grit/patterns/habitat/checks/**` pattern semantics;
- `tools/habitat-harness/src/rules/rules.json`;
- Nx, Biome, taxonomy, and hook configuration.

## Testing Strategy

### Unit Tests With Fake Services

- command-result fields are populated for success, nonzero, missing tool,
  signal/interruption, and output capture.
- parser matrix: no JSON, malformed JSON, wrapper noise, missing `results`,
  schema drift, unexpected result shape.
- projection matrix: expected pattern, wrong pattern, missing pattern, duplicate
  pattern, findings outside requested set.
- scan-root validation: no roots, missing roots, protected roots, generated
  roots, allowed roots.
- injected probe finalizers run on success, adapter failure, and thrown defect.
- apply transaction rejects dirty tree, missing export, unexpected file, and
  dry-run mismatch.

### Integration Tests

- native Grit pattern tests remain green.
- native fixture row projection remains owned by `habitat-grit-proof-repair`;
  this adapter emits command/provenance artifacts when it runs
  `grit patterns test`, but row-level fixture sample counts and coverage
  classification stay in the proof matrix.
- Habitat Grit tool check still emits CheckReport schemaVersion 1 for valid
  current tree.
- adapter smoke proof for one selected current check row fails the exact rule
  id and cleans up, with a non-claim that all-22 injected proof execution
  remains in `habitat-grit-proof-repair`.
- apply dry-run with an injected match records no writes.
- controlled apply records approved diff, Biome handoff, selected type/test
  proof, rollback, and clean final status.
- apply transaction tests cover after-write command failure, interruption,
  Biome/type gate failure, rollback failure, and final clean-status proof.

### Regression Tests

- existing non-Grit rule checks remain unaffected.
- `habitat-oclif-entrypoint-repair` command selector behavior remains intact.
- current command JSON output shape for valid checks remains compatible.

## Downstream Realignment

- `habitat-grit-proof-repair` task gates 4, 6, 7, and adapter-test rows move
  from blocked-on-substrate to dependent-on-this-change.
- `docs/projects/habitat-harness/effect-orchestration-evaluation.md` records
  this as the first provisionally selected Effect adoption slice pending review
  and dependency/platform parity.
- `docs/projects/habitat-harness/research/local-effect-adoption-fit.md`
  remains research; stable decisions are promoted here and into OpenSpec.
- Future `habitat-effect-command-runner`, `habitat-effect-check-pipeline`, and
  `habitat-effect-hook-transaction` can reuse this result only after explicit
  review of command parity and ownership.
- Pre-commit hook Grit parsing remains outside this packet until
  `habitat-effect-hook-transaction` or a later accepted hook adapter routes it
  through the substrate.

## Milestones And Closure Boundary

Milestone 1: design accepted.

- all review lanes complete;
- accepted P1/P2 findings are repaired or rejected with evidence;
- OpenSpec validation and language guardrails pass.

Milestone 2: adapter implementation ready.

- dependency/platform parity is proven;
- typed adapter services and failures are implemented;
- Grit check parser/projection failure matrix passes;
- injected proof service accepts the full current-row effective-scope contract;
- adapter smoke proof for one selected current check row passes with explicit
  non-claim for all-22 proof;
- apply transaction service covers dry-run, applied diff, downstream gate
  failure, interruption, rollback failure, and final clean status;
- OpenSpec validation and Habitat tests pass;
- Graphite state is clean.

Milestone 3 remains owned by `habitat-grit-proof-repair`: execute all 22
injected rows, explicit baselines, current-tree proof, and apply row proof using
this adapter. The first new Grit pilot remains blocked until command trust and
Grit proof repair gates say it is unblocked.
