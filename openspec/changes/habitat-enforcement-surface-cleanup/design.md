# Design - Enforcement Surface Cleanup

## Frame

### Objective

Make the structural enforcement surface truthful and singular at the agent
operating level: one canonical Habitat verification path, explicit disposition
for every surviving wrapper or diagnostic alias, and no proof claim from empty
selectors, stale H6 records, or unparsed legacy output.

### Product Movement

Habitat becomes a repo-local executable structural operating system only when
agents can ask "what verifies this structure?" and get a truthful answer. H6
historically aimed at that state. This repair makes the claim current by
separating canonical enforcement from surviving legacy diagnostics and by
forcing wrapper proof to be explicit.

### Selection

This frame selects:

- root structural scripts and CI verification wiring;
- Habitat `check`, `verify`, and inferred Nx target surfaces;
- `rules.json` owner-tool inventory;
- wrapped script/test owner surfaces;
- direct legacy scripts that still exist;
- stale H6 closure and train-closed records;
- dependency edges to command, Grit, baseline, boundary, hook, and classify
  repair packets.

### Foreground

- Whole-command truth over target-internal success.
- Canonical structural entrypoints over historical aliases.
- Wrapper output parity over coarse exit-code success.
- Explicit surviving-debt dispositions over old closure prose.
- Owner-layer separation: Nx, Grit, Biome, file-layer, Habitat-native, tests.

### Exterior

- Product/runtime behavior.
- Grit pattern semantics and Grit apply safety.
- Baseline key/state implementation.
- Root/dev/prod oclif entrypoint implementation.
- Hook mutation policy.
- Generated-output content.

### Hard Core

1. Structural verification green means the requested Habitat owner/rule/tool
   actually ran.
2. Root and CI structural verification must route through Habitat unless an
   accepted disposition marks the command as non-canonical diagnostics.
3. Surviving wrappers are not failure; undocumented wrappers are failure.
4. Direct legacy output and Habitat wrapper output must agree on the proof
   class being claimed.
5. Stale H6 records cannot be cited as current proof after this packet.

### Structural Alternative Considered

Alternative: open one stale-record cleanup packet and patch H6 prose without a
fresh enforcement-surface design.

Rejected because the current code still has live structural surfaces to classify:
valid wrappers, a stale `wrapped-eslint` selector surface, direct Python docs
lint, a strict-core legacy alias with known red output, and a broad `habitat
verify` command whose output mixes Habitat, Nx cache, builds, tests, and
generated-zone gates. Records-only cleanup would leave future implementers to
rediscover the owner boundaries.

### Falsifier

This design fails if implementation can still claim H6 current while a direct
root/CI structural command bypasses Habitat, or while a selected owner/tool/rule
proof returns only `baseline-integrity`.

## Current Diagnosis

| Surface | Current evidence | Design consequence |
| --- | --- | --- |
| Root `check` | `package.json` maps `check` to `bun run habitat:verify`. | Canonical root verification exists and must be whole-command proven. |
| CI verification | `.github/workflows/ci.yml` runs `bun run habitat:verify` and uploads `habitat-diagnostics.json`. | CI wiring is structurally aligned, but future proof must include run evidence when available. |
| Main CI job | `.github/workflows/ci.yml` also runs direct build, Biome, lint, and test steps in the `ci` job. | CI green is not a single Habitat proof class; each step needs a surface label and non-claim. |
| Root `lint` | `package.json` maps `lint` to `bun run habitat:check`. | Acceptable alias if documented as Habitat check, not separate enforcement. |
| Direct docs lint | `lint:mapgen-docs` runs `python3 ./scripts/lint/lint-mapgen-docs.py`; direct output exits 0 with 3 warnings. | Either keep as non-canonical diagnostics or route through Habitat with an accepted warning policy. |
| Habitat docs lint | `habitat check --rule mapgen-docs` exits 0 with `mapgen-docs` and `baseline-integrity`, both pass and diagnostics-empty. | Wrapper parser policy must decide whether direct warnings are out-of-claim or should become advisory/enforced diagnostics. |
| Strict-core alias | `lint:domain-refactor-guardrails:strict-core` runs the legacy shell script and currently exits 1 with 29 violation groups. | This is live red diagnostic evidence, not current canonical structural verification. It needs owner and trigger records. |
| Wrapped scripts | `check --tool wrapped-script` passes `mapgen-docs`, `adapter-boundary`, `domain-refactor-guardrails`, and `baseline-integrity`; `adapter-boundary` reports 7 baselined diagnostics. | Wrappers still exist and require per-wrapper disposition, parser policy, and retirement trigger. |
| Wrapped tests | `check --tool wrapped-test` passes six architecture-test wrappers plus `baseline-integrity`. | Test wrappers remain part of default Habitat check and must be labeled by proof class. |
| Stale owner tool | `check --tool wrapped-eslint` exits 0 with only `baseline-integrity`. | Empty selector truth belongs to command repair, but this cleanup must reject stale owner-tool proof. |
| Baselines | Only `tools/habitat-harness/baselines/adapter-boundary.json` exists. | Baseline explicitness is owned by scaffold/baseline repair; this packet consumes that dependency. |
| `habitat verify` | Current run exited 0: Habitat check passed 42 rules, then Nx affected ran build/check/test/boundaries/biome:ci/grit:check/generated:check for 22 projects plus one dependency task; one task read from cache. | Whole-command proof exists for this local state, but implementation needs bounded proof logs and cache/fresh labels. |

## Official Tool Constraints

- Nx official command docs describe `run-many`, `affected`, and task execution
  as task runners, not architecture/product proof. `run-many --all` is
  deprecated because run-many runs all projects when no projects are supplied.
- Nx official affected docs require explicit base/head selection in CI and
  local contexts where default comparison is not the desired proof boundary.
- Biome official CLI docs separate `biome check` and `biome ci`; `biome ci`
  is the CI-oriented check command and should not be treated as a write path.
- Grit official testing docs make `grit patterns test` the native fixture proof
  command; that does not replace Habitat current-tree, baseline, or selector
  proof.
- Effect official docs model programs as typed success, error, and requirement
  channels; Layers provide service dependency graphs; resource scopes release
  acquired resources on success, failure, or interruption; platform Commands
  preserve process argv/env/cwd/stdout/stderr/exit information; concurrency
  composition must choose sequential, bounded concurrent, fail-fast, or
  collect-all behavior deliberately.

## System Dynamics

Reinforcing failure loop:

1. H6 records say one enforcement path exists.
2. Root aliases and stale owner-tool selectors look green.
3. Wrapper warnings, cached tasks, or empty selections are treated as proof.
4. Downstream Grit/hook/classify work cites H6 as current.
5. More stale records accumulate.

Balancing loop introduced by this repair:

1. Every root/CI structural command is classified.
2. Every wrapper has an owner, parser policy, and retirement trigger.
3. Selector-empty cases are blocked by command repair before proof can close.
4. `habitat verify` proof records a structured artifact with whole command,
   base, selected real rules, cache state, and non-claims.
5. H6 records are patched to current proof boundaries.

## Enforcement Surface Taxonomy

| Surface class | Examples | Accepted role | Closure requirement |
| --- | --- | --- | --- |
| Canonical Habitat command | `bun run habitat:check`, `bun run habitat:verify`, `bun run check` | Structural verification entrypoint | Requested selectors validated; whole command exits 0; JSON proof contains selected rules. |
| Habitat-owned Nx target | `@internal/habitat-harness:boundaries`, `grit:check`, `biome:ci`, `generated:check`, owner `habitat:check` targets | Schedulable proof component | Target metadata and command output recorded; cache/fresh state labeled. |
| Wrapped script through Habitat | `mapgen-docs`, `adapter-boundary`, `domain-refactor-guardrails` | Legacy mechanism still mediated by Habitat | Wrapper table names owner, output parser policy, debt state, and trigger. |
| Wrapped test through Habitat | `arch-test-*` rules | Test proof class surfaced in Habitat | Each row states why test remains the owner and what it does not prove. |
| Direct legacy diagnostic alias | strict-core domain guardrail, direct Python docs lint when retained | Non-canonical diagnostic or backlog evidence | Root script name, docs, and records state that it is not the green structural verification path. |
| Exterior product/runtime script | live Civ7 or product verification scripts | Outside H6 structural enforcement | Not counted as Habitat structural proof. |

## CI Step Classification

The current CI workflow has two jobs:

- `ci`: setup, pnpm-artifact guard, dependency install, `bun run build`,
  `bun run biome:ci`, `bun run lint`, and `bun run test:ci`.
- `architecture-strict-core`: setup, `bun run habitat:verify`,
  `bun run habitat:check -- --json --output habitat-diagnostics.json`, and
  diagnostics upload.

Detailed step classification is recorded in
`workstream/ci-classification.md`. H6 proof may cite the
`architecture-strict-core` Habitat verify step as the current CI structural
gate, but it must not imply that every main `ci` green signal is Habitat
structural proof.

## Implementation Decision Points

### Root Script Policy

Implementation must classify every root script whose name starts with `lint`,
`check`, `ci:architecture`, or `habitat`:

- canonical Habitat alias;
- non-canonical diagnostic command;
- exterior product/runtime verifier;
- stale bypass to patch.

Accepted outcomes:

- direct legacy diagnostic scripts remain only with explicit naming, docs, and
  downstream owner rows;
- root structural green scripts route through Habitat;
- stale aliases that select no rules are removed or repaired after command
  selector truth lands.

Rejected outcomes:

- a direct legacy script remains presented as structural verification;
- a stale selector command can pass green with only `baseline-integrity`;
- root script names imply canonical proof when they are diagnostic-only.

### Wrapper Parser Policy

Implementation must compare direct command output with Habitat wrapper output
for current wrapped scripts and wrapped tests.

Accepted outcomes:

- warnings are intentionally outside the structural claim and docs say so;
- warnings become advisory diagnostics through Habitat;
- warnings become enforced diagnostics if the owning authority says they should
  fail.

Rejected outcomes:

- direct warning/debt output disappears from Habitat without a recorded policy;
- coarse exit-code parsing is cited as parity when the legacy command has
  structured or parseable warning/debt output.
- zero-exit test skips, warnings, setup debt, or build-output prerequisites
  disappear from Habitat without a recorded proof policy.

### Verify Proof Policy

`habitat verify` implementation proof must record:

- base selection;
- command argv, cwd, selected env, duration, and outer exit code;
- Habitat check selected rule count and advisory/failing count;
- selected real rule ids excluding built-in integrity-only rules;
- Nx affected target list and project list;
- cache/fresh status per Habitat-owned target where relevant;
- generated-output and resource cleanliness after the run;
- bounded output artifact instead of unreviewable terminal scrollback.

The required artifact contract is recorded in
`workstream/verify-proof-contract.md`. Manual terminal-output summaries are not
accepted as closure evidence for this repair.

### Effect Substrate Decision

Effect is a live substrate candidate for this cleanup, not a dismissed library
choice. Current Habitat evidence shows several manual error classes that Effect
could structurally remove if the implementation touches the relevant code:

| Manual error class | Current source shape | Effect capability that may simplify it | Adoption trigger |
| --- | --- | --- | --- |
| Selector false-green | `selectRules` returns an array without validating that requested filters matched; `createCheckReport` then appends `baseline-integrity`. | Typed expected errors and tagged validation states before report construction. | The implementation changes selector/report assembly instead of only consuming `habitat-oclif-entrypoint-repair`. |
| Command provenance loss | Shared process results collapse command execution to exit/stdout/stderr. | `@effect/platform/Command` plus typed failures can preserve argv, cwd, env delta, duration, stdout, stderr, and exit class as data. | The implementation changes verify proof records, wrapper execution, Grit/Biome/Nx invocation, or hook command execution. |
| Mixed orchestration responsibilities | `createCheckReport` combines selection, timing, baseline loading, rule execution, baseline application, status derivation, integrity checks, and report assembly. | Layers and services can isolate `RuleRegistry`, `RuleRunner`, `BaselineStore`, `CommandRunner`, `Clock`, and `Reporter`. | The implementation rewrites more than local root-script labels or docs records. |
| Cleanup and mutation scope | Graph temp dirs, hook staged-file operations, Grit caches, and future codemod sandboxes rely on manual sequencing. | Resource scopes and finalizers make acquisition/release and interruption behavior explicit. | The implementation changes hook side effects, graph temp dirs, Grit apply, formatter restaging, or codemod transaction proof. |
| Test substitution gaps | Command tests mock the command engine and miss root/dev/prod behavior. | Layers allow fake command, filesystem, Git, baseline, and clock services while integration tests still run real entrypoints. | The implementation adds unit-level proof for command orchestration, selector validation, baseline policy, or hook sequencing. |

Pre-implementation gate: no implementation task may touch
`tools/habitat-harness/src/lib/command-engine.ts`,
`tools/habitat-harness/src/rules/architecture.ts`,
`tools/habitat-harness/src/commands/verify.ts`, wrapper execution, selector
validation, proof provenance, hook sequencing, or command-result contracts until
this adopt/manual decision table is accepted for that slice.

Current design recommendation: adopt Effect only for specific slices where it
removes one of those repeated manual error classes while preserving oclif as the
outer shell and preserving Habitat's owner-layer model. The strongest candidate
slices are selector/check pipeline, command runner/proof provenance,
wrapper-parser projection, hook/codemod transaction scope, and service-injected
tests. Effect is not warranted for a records-only edit, root script renaming,
CI step label correction, or direct documentation patch that does not change
orchestration code.

If adopted, the first implementation packet must be explicit about package
dependency ownership, runtime-edge discipline, service interfaces, migration
path, command parity, and report compatibility. `Effect.run*` belongs at
entrypoint or runtime-adapter boundaries, not scattered through rule
implementations. Effect must not claim Grit, Nx, Biome, baseline, taxonomy, or
product semantics; it can only provide safer orchestration, typed failures,
resource cleanup, and injectable infrastructure.

Accepted Effect proof gates:

- unknown rule/tool/owner selectors cannot green-pass by returning only
  `baseline-integrity`;
- valid checks preserve `CheckReport` schema version 1 unless a separate
  accepted contract change says otherwise;
- command provenance records argv, cwd, env delta, duration, stdout, stderr,
  exit code, and typed failure class where the command is used as proof;
- `check` keeps collect-all diagnostics for valid selections, while
  fix/codemod/hook mutation paths fail closed on unsafe state;
- service-injected unit tests are paired with real root/dev/prod command tests;
- no `Effect.run*` runtime execution is introduced inside rule libraries;
- Nx, Biome, and Grit proof remains native to those tools.

If not adopted for an implementation slice that touches the trigger areas above,
the slice must still provide the same outcomes manually: typed-enough failure
states, command provenance, service or fixture substitution, cleanup proof, and
tests that prevent false-green selector/report behavior.

## Write Set

Expected implementation write set:

- `package.json`
- `.github/workflows/ci.yml` if CI diagnostic policy changes
- `tools/habitat-harness/src/rules/rules.json`
- `tools/habitat-harness/src/rules/architecture.ts`
- `tools/habitat-harness/src/plugin.js`
- `tools/habitat-harness/src/lib/command-engine.ts` only when verify proof
  policy requires command metadata changes
- `tools/habitat-harness/test/**`
- `tools/habitat-harness/README.md`
- root `AGENTS.md`
- `docs/projects/habitat-harness/research/official-docs-effect.md`
- `docs/projects/habitat-harness/research/local-effect-adoption-fit.md`
- `docs/projects/habitat-harness/recovery-claim-ledger.md`
- `docs/projects/habitat-harness/workstream-record.md`
- `openspec/changes/habitat-enforcement-consolidation/**`
- dependent packet ledgers that cite H6 as proof

Protected paths:

- `.grit/**`
- `tools/habitat-harness/baselines/**`
- product/runtime source outside probe creation and removal;
- generated output, `dist/`, `mod/`, and `.civ7/outputs/resources/**`;
- lockfiles.

## Proof Matrix

| Proof area | Required evidence | Closure claim allowed |
| --- | --- | --- |
| Root script inventory | Parsed `package.json` scripts classified by surface taxonomy. | No structural root script bypasses Habitat. |
| CI inspection | Workflow steps and artifact policy inspected. | CI structural gate invokes Habitat and publishes Habitat diagnostics. |
| Rule owner inventory | `rules.json` ownerTool counts and stale selector probes. | Every owner tool has current rules or invalid selectors fail. |
| Legacy script file inventory | Root scripts and surviving `scripts/**` enforcement wrappers classified. | Duplicate or direct legacy paths cannot hide outside root aliases. |
| Wrapper direct parity | Direct command output compared with Habitat report output. | Wrapper report truth matches accepted parser policy. |
| Wrapped-test parity | Every `wrapped-test` direct command compared with Habitat report output, including skip/warning/debt handling. | Test wrappers remain visible proof owners and do not hide zero-exit output. |
| Wrapped debt | `adapter-boundary` and any other debt source has explicit state. | Surviving debt is visible and not greenwashed. |
| Effect decision | Each orchestration-changing implementation slice records adopt/manual outcome against the trigger table. | Manual orchestration remains only when it meets typed failure, provenance, cleanup, and testability standards. |
| CI step classification | Main CI and architecture CI steps classified by proof class and non-claim. | CI Habitat structural proof is not conflated with all CI green signals. |
| Verify command | Structured `VerifyProof` artifact with whole-command exit, base, selected real rules, target list, cache/fresh state, and clean post-state recorded. | Canonical local verification path works for current branch. |
| Downstream records | H6 phase/tasks/workstream records and claim ledger patched. | Future agents see H6 as current-bounded, not historically closed. |

## Review Lanes

- Product/outcome: does this make Habitat a more truthful agent operating
  system, or only rename old scripts?
- Command/evidence: do root, CI, selector, and verify proofs capture whole
  command behavior?
- Owner-layer: are Grit, Nx, Biome, file-layer, Habitat-native, and tests kept
  separate?
- Wrapper/parser: are direct command outputs and Habitat reports aligned?
- Records/downstream: are stale H6 records mandatory repair targets?
