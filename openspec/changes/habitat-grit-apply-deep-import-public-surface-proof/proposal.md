## Why

Habitat ships one allowlisted Grit apply pattern:
`deep_import_to_public_surface`. It is wired into `habitat fix`, and it can
rewrite imports under recipe and map source roots. This packet records the
proof boundary that makes the supported named-import rewrite path safe to cite
as a bounded structural transformation.

Current evidence shows:

- native Grit tests pass for the pattern;
- the live tree currently has zero matching deep domain ops imports under the
  apply scan roots;
- `bun run habitat:fix -- --dry-run` exits 0 and reports zero matches;
- target-export unit proof covers safe public-export rewrites, type-only
  preservation, missing-export refusal, and unchanged source on refusal;
- injected dry-run proof leaves the probe source unchanged for both safe and
  missing-export cases;
- controlled proof-worktree live apply rewrites only the approved morphology
  probe import and runs selected cold Swooper gates;
- public domain `/ops` entrypoints do not consistently re-export every symbol
  from the deeper `ops/index.ts` implementation surfaces;
- the accepted apply transaction substrate records command provenance,
  target-export failure tags, bounded diffs, selected gates, and cleanup.

This change turns the existing codemod packet from pre-implementation design
state into current proof-state documentation for the bounded safe-transform
contract. It does not add a new source remediation and does not claim broad
product/runtime transformation closure.

## Target Authority Refs

- `docs/projects/habitat-harness/dra-takeover-frame.md`
- `docs/projects/habitat-harness/recovery-claim-ledger.md`, especially
  `CLAIM-PRODUCT-TRANSFORMS`, `CLAIM-H5-GRIT`, `CLAIM-P1-EFFECT-FIT`, and
  `CLAIM-P1-STALE-RECORDS`
- `docs/projects/habitat-harness/grit-pattern-corpus-ledger.md`, current apply
  row `deep_import_to_public_surface`
- `docs/projects/habitat-harness/effect-orchestration-evaluation.md`
- `docs/projects/habitat-harness/research/local-grit-corpus-extraction.md`
- `docs/projects/habitat-harness/research/official-docs-gritql.md`
- `openspec/changes/habitat-grit-proof-repair/**`
- `openspec/changes/habitat-effect-grit-adapter/**`
- `.grit/patterns/habitat/apply/deep_import_to_public_surface.md`
- `tools/habitat-harness/src/lib/grit.ts`
- `tools/habitat-harness/src/lib/command-engine.ts`

## What Changes

- Align the apply-codemod proof packet for
  `deep_import_to_public_surface` with current aggregate proof.
- Record target-export preflight for supported named import candidates before
  rewrite approval.
- Record missing-export refusal proof, including an injected negative case.
- Record live and injected candidate inventory over the exact recipe/map roots.
- Record dry-run no-write proof as its own class, with final clean status.
- Record controlled applied-diff proof through the accepted transaction
  substrate with command provenance, scoped cleanup, rollback, and final
  clean-status proof.
- Record type-only import preservation, Biome handoff over changed paths, and
  selected cold type/test gates after an applied diff.
- Realign downstream ledgers so the existing pattern is counted only inside the
  supported bounded safe-transform proof boundary.

## What Does Not Change

- No new Grit pattern is introduced.
- No new live codemod apply is run by this record-alignment checkpoint.
- No public `/ops` export is added by this packet.
- No generated output, lockfile, or Civ7 runtime artifact is edited.
- No claim is made that Grit proves TypeScript export existence, Biome
  formatting safety, Nx scheduling, or product runtime behavior.

## Effect Decision For This Slice

Effect is the preferred implementation substrate for live apply proof because
the codemod safety problem is primarily orchestration: command provenance,
candidate inventory, export preflight, transaction scope, after-write gates,
rollback, interruption cleanup, and final clean status.

Implementation may proceed without the Effect adapter only if a reviewer
accepts an equivalent typed transaction substrate that provides the same
outcomes: structured command results, injected services for tests, scoped
cleanup, rollback proof, export-preflight failures as data, and final clean
status after every outcome. Preserving the current `SpawnResult` plus handwritten
phase notes is not accepted.

Live writes for this codemod remain gated by the accepted transaction
substrate. Native sample proof, live zero-match dry-run, target-export unit
proof, injected dry-run, controlled proof-worktree apply, selected gates, and
cleanup are separate proof classes.

## Requires

- Accepted Grit apply transaction substrate from the downstack Habitat repair
  layers.
- `habitat-grit-proof-repair` proof matrix remains the aggregate Grit proof
  ledger and points to this packet for the apply row.
- Official Grit and Effect evidence read before implementation.

## Enables Parallel Work

- The Effect Grit adapter can implement generic apply transaction services
  while this packet owns codemod-specific target-export and fixture proof.
- The Grit proof repair can keep check-rule proof separate while linking its
  apply row to this packet.
- Future apply codemods can copy the proof shape only after this one proves the
  path end to end.

## Affected Owners

- `.grit/patterns/habitat/apply/deep_import_to_public_surface.md` for fixture
  expansion and sample precision.
- `tools/habitat-harness/src/lib/grit.ts` or its Effect-backed successor for
  transaction routing after the adapter lands.
- `tools/habitat-harness/src/lib/command-engine.ts` for `habitat fix`
  handoff only through the accepted adapter.
- `tools/habitat-harness/test/**` for codemod target-export, dry-run, and
  transaction tests.
- `openspec/changes/habitat-grit-proof-repair/**` for aggregate proof matrix
  references after implementation.
- downstream Habitat initiative ledgers that mention product transformations.

## Protected Owners

- Generated output and ignored build artifacts.
- `.civ7/outputs/resources/**`.
- Domain runtime implementation files except controlled injected fixtures in
  tests or transaction proof roots.
- Public domain `/ops` export semantics unless a separate domain-public-surface
  change accepts those exports.
- Biome and Nx configuration.

## Stop Conditions

- A candidate rewrite imports a symbol that is not exported by the target
  public `/ops` surface.
- Current-tree inventory finds a live candidate outside the approved recipe/map
  roots.
- Dry-run produces a file change, or no-write proof cannot prove clean status.
- The implementation needs transaction, rollback, finalizer, or command
  provenance behavior before the Effect adapter or equivalent substrate exists.
- The applied diff includes files or ranges outside the approved rewrite set.
- Type-only imports become value imports, or value imports become type-only.
- Biome, selected typecheck, or selected tests fail after the controlled diff.
- Rollback or scoped cleanup cannot prove final clean status.

## Consumer Impact

Agents may treat this codemod as a bounded safe structural transform only for
the supported named value/type import path where target export existence is
proved, missing exports fail closed, import kind is preserved, the applied diff
is bounded, selected gates pass, and cleanup returns the proof worktree to clean
status.

The truthful consumer message is still narrower than broad product closure:
unsupported import forms, broad full-test closure, generated-output freshness,
baseline writes, parity closure, raw direct Grit acquisition, and
product/runtime behavior remain non-claims.

## Verification Gates

- `bun run openspec -- validate habitat-grit-apply-deep-import-public-surface-proof --strict`
- local Grit binary resolution proof
- `GRIT_TELEMETRY_DISABLED=true grit patterns test --filter deep_import_to_public_surface --json`
- direct live match inventory over `mods/*/src/{recipes,maps}`
- `bun run habitat:fix -- --dry-run`
- injected dry-run no-write proof through the Habitat fix path
- target-export preflight unit and integration proof
- missing-export refusal proof
- controlled applied-diff proof through the accepted transaction substrate
- Biome handoff over changed paths
- selected typecheck/test gates for changed import surfaces
- rollback and final clean-status proof
- downstream ledgers updated with product-safe or not-yet-safe status
- `bun run openspec:validate`
