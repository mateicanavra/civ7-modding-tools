## Why

Stage 0 found that the H2 scaffold/ratchet claim was not current executable
truth at packet open. Seed code treated a missing baseline file as an empty
locked baseline, while the recovery frame requires every hardened baseline to
be explicit, committed, and backed by documented missing-file semantics. That
gap matters because
future agents use Habitat output as structural truth: if a rule's baseline
state is implicit, stale, malformed, orphaned, or supplied by an unmodeled
external exception source, the harness can look trustworthy while proof depends
on hidden convention.

Seed evidence at packet open:

- `tools/habitat-harness/src/lib/baseline.ts` says missing baseline file means
  empty locked baseline.
- `tools/habitat-harness/src/lib/command-engine.ts` marks a rule locked when
  the loaded baseline set is empty and `exceptionPath` is `none`.
- only `tools/habitat-harness/baselines/adapter-boundary.json` existed in the
  seed capture.
- `bun run habitat:check -- --json --rule workspace-entrypoints` reports
  `workspace-entrypoints` locked with no diagnostics, even though no explicit
  baseline file exists for that rule.
- `bun run habitat:check -- --json --rule adapter-boundary` reports seven
  baselined adapter-boundary diagnostics and `baseline-integrity` passing.

Post-downstack current evidence at implementation start is different: the
accepted Grit proof stack has 22 committed empty Grit baseline files, while
non-Grit registered rules and external exception sources still require this
packet's explicit contract repair. Treat the bullets above as seed evidence for
why the packet exists, not as current behavior after this branch closes.

This change opened the baseline/scaffold contract repair and now carries the
implementation branch that makes baseline state explicit, typed, testable, and
aligned with downstream Grit proof and generator metadata repairs.

## Target Authority Refs

- `docs/projects/habitat-harness/dra-takeover-frame.md`
- `docs/projects/habitat-harness/recovery-claim-ledger.md` rows
  `CLAIM-H2-SCAFFOLD` and `CLAIM-P1-BASELINE`
- `docs/projects/habitat-harness/grit-pattern-corpus-ledger.md`
- `openspec/changes/habitat-harness-scaffold/**`
- `openspec/changes/habitat-grit-proof-repair/**`
- `openspec/changes/habitat-effect-grit-adapter/**`
- current `tools/habitat-harness/src/lib/baseline.ts`,
  `command-engine.ts`, `rules/architecture.ts`, `rules/rules.json`,
  `baselines/**`, and harness tests

## What Changes

- Make every registered Habitat rule's baseline state explicit and auditable:
  committed empty locked baseline file, committed debt baseline file, modeled
  external exception source, or contract failure.
- Replace implicit missing-baseline success with a typed baseline contract
  outcome. Missing baseline files for registered rules no longer silently mean
  locked unless the implementation packet explicitly records a reviewed
  migration step that creates the explicit locked state before closure.
- Define baseline file validation: JSON array, sorted stable keys, unique
  strings, registered rule ownership, no orphan files, and no malformed or
  unreadable files hidden behind green reports.
- Define baseline mutation policy for `--expand-baseline`: selected rules must
  be valid through the accepted command selector boundary, rule-introduction
  status must be proven by a rule-introduction baseline manifest, and
  existing-rule baseline growth must fail before any write.
- Inventory every non-`none` `exceptionPath` and reconcile current external
  sources, including `adapter-boundary` and `doc-ambiguity`, into modeled
  baseline contract state.
- Lock baseline v1 keys to current executable behavior, `path::message`, unless
  a separate key-format migration is accepted.
- Require `baseline-integrity` to fail closed for comparison-source failures:
  unavailable comparison base, missing or malformed base rule registry,
  unreadable base baseline, and Graphite stack states where trunk merge-base
  comparison would hide growth on a downstack rule.
- Require a documented Effect adoption gate before implementation commits to a
  plain TypeScript state-module design. If Effect services, layers, schemas,
  tagged errors, scoped resources, or command orchestration remove recurring
  manual failure classes from this repair, implementation should adopt Effect
  behind the existing Habitat boundary instead of preserving the current manual
  structure.
- Add tests and command proofs for locked empty baselines, debt baselines,
  missing baseline contract failure, malformed files, orphan files,
  shrink-only growth rejection, rule introduction acceptance, and clean current
  command behavior.
- Realign downstream Grit proof and generator metadata work so they consume the
  baseline contract instead of rediscovering baseline policy.

## What Does Not Change

- No Grit parser/projection/apply implementation belongs to this packet.
- No oclif command-shell repair belongs to this packet.
- No new Grit rule semantics or pattern authoring belongs to this packet.
- No generator authority/proving metadata repair belongs to this packet, except
  for any baseline-file format adjustment needed to preserve generator output.
- No product/runtime Civ7 behavior is claimed.

## Requires

- Stage 0 claim ledger rows for H2 scaffold and P1 baseline, already present.
- Command selector trust from `habitat-oclif-entrypoint-repair` before
  implementation performs selector-sensitive baseline writes.
- The baseline boundary from `habitat-effect-grit-adapter`, which keeps
  baseline policy and mutation outside the Grit adapter.
- The local Effect evaluation in
  `docs/projects/habitat-harness/effect-orchestration-evaluation.md`, the
  official-docs evidence pack in
  `docs/projects/habitat-harness/research/official-docs-effect.md`, and current
  official Effect docs for services, layers, schema, and command/resource
  orchestration.

## Enables Parallel Work

- `habitat-grit-proof-repair` can prove baselined/unbaselined findings against
  a typed baseline contract.
- `habitat-pattern-generator-metadata-repair` can require new generated rules to
  carry authority/proving metadata while relying on a known explicit baseline
  file contract.
- The first Grit pilot can distinguish current zero-findings proof from
  baseline-hidden debt.

## Affected Owners

- `tools/habitat-harness/src/lib/baseline.ts`
- `tools/habitat-harness/src/lib/command-engine.ts`
- `tools/habitat-harness/src/rules/architecture.ts`
- `tools/habitat-harness/src/rules/rules.json` only for baseline metadata fields
  accepted by this packet
- `tools/habitat-harness/baselines/**`
- `tools/habitat-harness/test/**`
- `tools/habitat-harness/README.md`
- downstream Habitat recovery ledgers and affected OpenSpec workstream records

## Forbidden Owners

- `.grit/patterns/**`
- Grit adapter implementation internals owned by `habitat-effect-grit-adapter`
- hook side-effect implementation
- Nx taxonomy/boundary configuration
- Biome configuration or write behavior
- generated outputs
- product/runtime source

## Stop Conditions

- The repair cannot represent adapter-boundary debt without either preserving a
  second hidden baseline owner or changing the rule's architectural meaning.
- Existing-rule baseline growth can still pass before write or during
  `baseline-integrity`.
- A missing, malformed, or orphaned baseline file can still produce a green
  command without a contract diagnostic.
- The implementation requires generator metadata policy decisions that are
  broader than the baseline file contract; in that case open or unblock
  `habitat-pattern-generator-metadata-repair` rather than folding it silently
  into this packet.
- The implementation design preserves manual string/result conventions where
  Effect would materially simplify typed errors, dependency injection, scoped
  resources, or command provenance for the baseline contract.
- A reviewer accepts a P1/P2 finding about proof inflation, duplicate owner
  layers, hidden exceptions, or stale record realignment.

## Consumer Impact

Agents keep using the Habitat command surface, but baseline output becomes
auditable:

- a locked rule is locked because an explicit empty baseline state exists;
- tracked debt is debt because the baseline contract owns it;
- missing or malformed baseline files become contract failures;
- `--expand-baseline` cannot write for an invalid selection or existing-rule
  growth;
- future Grit proof can cite baseline state without treating implicit file
  absence as evidence.

## Verification Gates

- `bun run openspec -- validate habitat-scaffold-contract-repair --strict`
- baseline contract unit matrix
- baseline integrity unit matrix with fake Git/rule registry state
- command proof for `workspace-entrypoints` locked baseline behavior
- command proof that invalid `--rule`, `--tool`, and `--owner` baseline
  expansion requests exit before any write
- comparison-source failure tests for missing merge-base, missing or malformed
  base `rules.json`, unreadable base baselines, and Graphite stack comparison
  ambiguity
- Effect adoption-gate record showing why the implementation chooses an Effect
  service/layer shape or a plain TypeScript state-module shape
- command proof for `adapter-boundary` debt baseline behavior
- malformed/orphan/missing baseline probes that fail with contract diagnostics
- `--expand-baseline` refusal probes for invalid selection and existing-rule
  growth
- `bun run --cwd tools/habitat-harness test`
- selected root Habitat check probes after command trust repair
- `bun run openspec:validate`
