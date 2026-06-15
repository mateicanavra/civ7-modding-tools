## Why

Habitat currently ships one allowlisted Grit apply pattern:
`deep_import_to_public_surface`. It is wired into `habitat fix`, and it can
rewrite imports under recipe and map source roots. That is not yet enough to
count as product-safe structural transformation.

Fresh evidence shows:

- native Grit tests pass for the pattern;
- the live tree currently has zero matching deep domain ops imports under the
  apply scan roots;
- `bun run habitat:fix -- --dry-run` exits 0 and reports zero matches;
- public domain `/ops` entrypoints do not consistently re-export every symbol
  from the deeper `ops/index.ts` implementation surfaces;
- the current adapter invokes `grit apply` with `--force` and returns only
  exit code, stdout, and stderr;
- the Effect evaluation has already provisionally selected
  `habitat-effect-grit-adapter` for Grit command provenance, parser/projection
  proof, dry-run proof, and apply transactions.

This change turns the existing codemod from "implemented under proof" into an
implementation-ready repair packet with a codemod-specific safety contract. It
does not run a live write. It specifies the proof required before any agent may
claim `deep_import_to_public_surface` as a safe transformation capability.

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

- Add an apply-codemod proof packet for
  `deep_import_to_public_surface`.
- Specify target-export preflight for every candidate imported symbol before
  rewrite approval.
- Require missing-export refusal proof, including an injected negative case.
- Require live and injected candidate inventory over the exact recipe/map roots.
- Require dry-run no-write proof as its own class, with final clean status.
- Require applied-diff proof only through `habitat-effect-grit-adapter` or an
  accepted typed transaction substrate with equivalent command provenance,
  scoped cleanup, rollback, and final clean-status proof.
- Require type-only import preservation, Biome handoff over changed paths, and
  selected type/test gates after an applied diff.
- Realign downstream ledgers so the existing pattern is not counted as product
  safe transformation until those proofs exist.

## What Does Not Change

- No new Grit pattern is introduced.
- No live codemod apply is run by this design packet.
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

Live writes for this codemod are therefore gated by
`habitat-effect-grit-adapter` task 8 or by an equivalent reviewed substrate.
Native sample proof, live zero-match dry-run, and pattern-file presence remain
useful evidence, but they are not safe-transform proof.

## Requires

- Accepted design packet for `habitat-effect-grit-adapter`, already present in
  this stack.
- Implementation of `habitat-effect-grit-adapter` task 8 before live apply
  proof, or an equivalent typed transaction substrate accepted by review.
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

After implementation, agents may treat this codemod as a product-safe structural
transform only when the proof artifact names: live match inventory, export
preflight, missing-export refusal, dry-run no-write, approved applied diff,
type-only preservation, Biome handoff, selected type/test gates, rollback, and
final clean status.

Until then, the truthful consumer message is: the pattern exists and its native
sample passes, but it is not yet safe-transform product evidence.

## Verification Gates

- `bun run openspec -- validate habitat-grit-apply-deep-import-public-surface-proof --strict`
- local Grit binary resolution proof
- `GRIT_TELEMETRY_DISABLED=true PATH="$PWD/node_modules/.bin:$PATH" grit patterns test --filter deep_import_to_public_surface --json`
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
