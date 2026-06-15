## Why

The H5 Grit catalog is implemented, but the current proof record is not strong
enough to support new pattern backfill or retirements. Stage 0 seed evidence
showed:

- native Grit samples pass for 23 testable patterns and 45 samples;
- `bun run habitat:check -- --json --tool grit-check` exits 0 with the 22 Grit
  checks plus `baseline-integrity`;
- `bun run habitat:check -- --json --rule grit-check` exits 0 with only
  `baseline-integrity`, so a known tool id in the wrong selector namespace can
  still create a false green until `habitat-oclif-entrypoint-repair` lands;
- a raw current-tree `grit --json check` probe over the declared roots ran past
  a useful design-probe bound and produced no captured proof;
- `habitat fix --dry-run` currently finds 0 matches on the live tree, which is
  useful hygiene evidence but not codemod safety proof;
- only `adapter-boundary.json` existed under
  `tools/habitat-harness/baselines`, so H5 "empty baseline" claims depended on
  missing-file semantics.

Current implementation proof is recorded in `workstream/command-proof-log.md`
and `workstream/phase-record.md`. As of the explicit-baseline slice, the 22
current Grit checks have committed `[]` baseline files and
`baseline-integrity` accepts them; injected violations, apply safety, parity
retirement, and product/runtime proof remain open.

This repair makes the proof model truthful before the first Grit pilot. It does
not add new patterns. It proves or reclassifies the current 22 enforced checks,
the single implemented apply codemod, old-mechanism parity claims, baseline
semantics, and stale H5/H6 closure records.

## Target Authority Refs

- `docs/projects/habitat-harness/dra-takeover-frame.md` Product Outcome, Hard
  Core, Grit Pattern Corpus Ledger, First Recovery Wave.
- `docs/projects/habitat-harness/recovery-claim-ledger.md` rows
  `CLAIM-H5-GRIT`, `CLAIM-H6-ONE-PATH`, `CLAIM-P1-BASELINE`,
  `CLAIM-PRODUCT-TRANSFORMS`, and `CLAIM-P1-EFFECT-FIT`.
- `docs/projects/habitat-harness/grit-pattern-corpus-ledger.md` current
  implemented check rows and current apply row.
- `docs/projects/habitat-harness/research/official-docs-gritql.md`.
- `docs/projects/habitat-harness/research/local-grit-corpus-extraction.md`.
- `docs/projects/habitat-harness/research/official-docs-effect.md` and
  `docs/projects/habitat-harness/research/local-effect-adoption-fit.md`.
- `openspec/changes/habitat-grit-catalog/**` historical H5 packet.
- `openspec/changes/habitat-enforcement-consolidation/**` historical H6
  retirement packet.

## What Changes

- Add a Grit proof matrix for every current Grit check and the current apply
  pattern. Each row records native sample proof, current-tree proof, injected
  violation proof, baseline action, parity source, apply safety, and non-claims.
- Establish proof classes that must stay separate: native Grit samples,
  Habitat current-tree wrapper scan, raw Grit acquisition/provenance, injected
  violation, Habitat baseline behavior, old-mechanism parity, Nx target
  scheduling, dry-run no-write, applied diff, rollback, typecheck/test proof,
  and records realignment.
- Require a controlled injected-violation harness for all current enforced
  Grit checks. The harness must create probe files under approved scan roots,
  run Habitat through the real check path, assert the exact Habitat rule id
  fails, remove probes in all outcomes, and prove the worktree is clean.
- Require the existing `deep_import_to_public_surface` apply pattern to prove
  target export existence, dry-run no-write behavior, applied diff shape,
  rollback, type-only preservation, Biome handoff, and type/test proof before
  it is used as product evidence for safe transformations.
- Add explicit committed empty baseline files for the current enforced Grit
  checks, replacing the historical ambiguity where missing baseline files acted
  as empty locks.
- Reconcile H5/H6 record claims that overstate current proof, especially
  "empty baselines", current-tree parity, raw scan behavior, and codemod
  safety.
- Keep Grit semantics, Habitat baselines, Biome formatting, Nx scheduling, and
  Effect orchestration as distinct owner layers.

## What Does Not Change

- No new Grit check or apply pattern is introduced in this repair.
- No old mechanism is retired by this repair unless parity proof and downstream
  realignment are explicitly recorded.
- No generated output is hand-edited.
- No runtime Civ7 product behavior is claimed from Grit proof.
- No broad Effect migration is approved by this packet. Effect is reopened only
  under the trigger matrix in `design.md`.

## Effect Decision For This Slice

This slice starts as a proof repair over the current adapter. It may proceed
without adding Effect only if implementation work is limited to proof records,
tests, fixtures, command probes, downstream realignment, and explicit baseline
records.

Effect becomes required before dependent implementation if this repair needs
new manual machinery for Grit command provenance, JSON schema parsing, scan-root
services, dry-run/apply transactions, cleanup/finalizers, or service-injected
adapter tests. Those concerns match `habitat-effect-grit-adapter` and
`habitat-effect-command-runner` directly.

## Requires

- `habitat-oclif-entrypoint-repair` implementation before final command proof,
  because selector false-greens must be fixed before `--rule` and `--tool`
  probes can be trusted.
- Stage 0 ledgers committed on this branch.
- Official GritQL, Effect, Biome, and Nx evidence packs read by implementers
  before code changes.

## Enables Parallel Work

- The first new Grit pilot can start after this repair proves the proof model.
- Pattern-generator metadata repair can use the same proof matrix contract.
- Effect Grit adapter design can run in parallel if the trigger matrix fires.
- The first new Grit pilot cannot use the current pattern generator to create
  enforced rules until pattern-generator metadata repair lands or this repair
  records an explicit reviewed stop-gate path.

## Affected Owners

- `.grit/patterns/habitat/**` only for fixture additions or proof-only sample
  improvements.
- `tools/habitat-harness/test/**` for injected proof harnesses and adapter
  proof tests.
- `tools/habitat-harness/baselines/**` for explicit empty Grit baselines.
- `tools/habitat-harness/src/lib/grit.ts` only if a reviewed design accepts
  the substrate decision for adapter hardening.
- `tools/habitat-harness/src/lib/command-engine.ts` only for proof hooks or
  baseline/report plumbing approved by this packet and by the command repair
  dependency.
- H5/H6/project records listed in the downstream ledger.

## Forbidden Owners

- No new architecture rule semantics.
- No Grit ownership of Nx graph law, Biome safe-fix semantics, generated-zone
  writes, product runtime proof, or baseline policy beyond Habitat integration.
- No new handwritten parse/transaction framework in `grit.ts` after an Effect
  trigger fires.
- No `--force` apply proof without a clean-worktree, dry-run, applied-diff, and
  rollback record.
- No claim that green native samples or green `nx grit:check` alone prove
  current-tree enforcement or apply safety.

## Stop Conditions

- `habitat-oclif-entrypoint-repair` has not landed, and a selector proof depends
  on truthful `--rule`/`--tool` behavior.
- A current Grit check cannot be injected without modifying protected generated
  output or leaving dirty files.
- A Grit rule's current-tree scan root cannot be stated as an exact runnable
  path set.
- A new Grit pilot depends on generated enforced rules before the pattern
  generator requires authority source, proving source, scan roots, fixture
  model, baseline policy, and hook-scope metadata.
- The apply codemod cannot prove target export existence, type-only
  preservation, no-write dry-run, applied diff, and rollback.
- Implementation needs new Grit adapter parse/provenance/transaction machinery
  and no Effect/substrate packet has been opened.
- A reviewer accepts a P1/P2 finding about proof inflation, unsafe apply,
  baseline ambiguity, owner-layer duplication, or stale records.

## Consumer Impact

Agents can trust Grit results as a structural proof surface only after this
repair lands:

- current checks have row-level proof, not just catalog presence;
- false-green selector behavior is not hidden inside Grit proof claims;
- the existing apply codemod has a real safety packet or is reclassified;
- old H5/H6 records say what is historical and what is current;
- the next Grit pilot starts from a proof model that future agents can repeat.

## Verification Gates

- `bun run openspec -- validate habitat-grit-proof-repair --strict`
- `GRIT_TELEMETRY_DISABLED=true grit patterns test --json`
- `bun run --cwd tools/habitat-harness test -- grit-patterns.test.ts`
- `bun run habitat:check -- --json --tool grit-check`
- `bun run habitat:check -- --json --rule grit-check`
- `bun run habitat:check -- --json --rule <each-grit-rule-id>`
- injected-violation proof for every current Grit check
- baseline behavior proof for explicit or missing Grit baselines
- old-mechanism parity probes for wrapped-script, wrapped-eslint, and
  wrapped-test surfaces that H5/H6 used as parity evidence
- `nx run @internal/habitat-harness:grit:check --outputStyle=static`
- `bun run habitat:fix -- --dry-run`
- controlled apply proof for `deep_import_to_public_surface`
- typecheck/test gates selected by the applied-diff surface
- stale-record scan over H5/H6/Habitat records
- `bun run openspec:validate`
