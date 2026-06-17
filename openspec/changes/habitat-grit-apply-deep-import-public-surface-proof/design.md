# Design - Deep Import Apply Proof

## Frame

### Objective

Make the existing `deep_import_to_public_surface` codemod safe enough to be
claimed as a bounded Habitat structural transformation for supported named
value/type imports, while keeping unsupported forms and broad product/runtime
closure explicitly outside the claim.

### Product Movement

The Habitat product outcome requires agents to rely on executable structural
operations, not on stale records or green commands with missing proof. This
packet moves the single current apply codemod toward that outcome by requiring
candidate inventory, target-export safety, typed transaction proof, formatter
handoff, type/test verification, rollback, and truthful downstream records.

### Selection

This frame selects one apply workstream:

- pattern: `.grit/patterns/habitat/apply/deep_import_to_public_surface.md`;
- command path: `habitat fix` through `runGritApplyPatterns`;
- scan roots: discovered `mods/*/src/recipes` and `mods/*/src/maps`;
- rewrite family: `@mapgen/domain/<domain>/ops/<tail>` to
  `@mapgen/domain/<domain>/ops`;
- proof owner: Habitat, with Grit owning the pattern rewrite and Biome owning
  formatting after an approved diff.

### Exterior

- New check or apply pattern authoring.
- General deep-import policy for non-ops imports.
- Adding public domain exports.
- Replacing oclif.
- Broad shared command-runner migration outside the Grit adapter.
- Runtime Civ7 behavior.

### Hard Core

1. Grit owns syntactic matching and rewrite execution. Habitat owns whether the
   transform is safe to offer.
2. A green native Grit sample proves fixture behavior only.
3. A zero-match live dry-run proves live hygiene only.
4. No candidate may rewrite to a public `/ops` surface unless every imported
   symbol is exported there.
5. Live apply proof must be transactional, reviewable, reversible, and clean
   after every outcome.
6. Effect is preferred for this slice when it removes manual orchestration
   gaps through typed command results, services, scopes, and finalizers.

### Structural Alternative Considered

Alternative: keep this codemod inside the aggregate
`habitat-grit-proof-repair` matrix without a separate packet.

Rejected for design ownership. Check patterns and apply codemods have different
blast radius. Checks report diagnostics; codemods mutate files. The aggregate
matrix should reference this packet, while this packet owns export preflight,
transaction proof, applied diff, and rollback semantics for the codemod.

### Falsifier

This design fails if a future implementation can rewrite a deep import without
proving target export existence, if `--force` is treated as the safety boundary,
if dry-run output is cited as applied-diff proof, or if a failed after-write
gate leaves the worktree dirty.

## Current Diagnosis

| Surface | Current evidence | Design implication |
| --- | --- | --- |
| Pattern presence | `.grit/patterns/habitat/apply/deep_import_to_public_surface.md` exists and is allowlisted in `tools/habitat-harness/src/lib/grit.ts`. | Implementation exists; bounded safe-transform proof is now recorded through the accepted apply substrate. |
| Native sample | `grit patterns test --filter deep_import_to_public_surface --json` passes with one rewrite sample; the current expected rewrite drops semicolons from the two import lines. | Native sample proof is accepted as fixture proof only; implementation must either preserve semicolons in the rewrite template or classify the semicolon delta as Biome-owned formatting in applied-diff proof. |
| Live match inventory | `rg` over recipe/map roots finds no `@mapgen/domain/.../ops/...` imports; direct `grit apply ... --dry-run --output compact` reports 234 files and 0 matches. | Live tree currently has no rewrite candidates, so current proof cannot include applied-diff safety. |
| Habitat dry-run | `bun run habitat:fix -- --dry-run` exits 0, reports 0 Grit matches, and Biome applies no fixes. | Useful command hygiene, not target-export or transaction proof. |
| Public ops exports | Domain `ops.ts` files usually default-export `createDomain(...)` from `./ops/index.js`; they do not uniformly re-export every named operation from `ops/index.ts`. | Target-export preflight is mandatory before any rewrite. |
| Adapter shape | The accepted apply substrate records dry-run inventory, target-export failures, bounded apply diffs, Biome handoff, selected gates, and cleanup. | Current safe-transform claim is limited to proof classes named in the aggregate `HGPR-APPLY-*` records. |

## Current Proof-State Update

The aggregate command proof log now records the proof classes this design
required for the supported named import rewrite path:

- `HGPR-APPLY-TARGET-EXPORT-UNIT-2026-06-15`: target-export success,
  type-only preservation, missing-export refusal, and unchanged source on
  refusal;
- `HGPR-APPLY-LIVE-INVENTORY-2026-06-15`: current live zero-candidate
  inventory over recipe/map roots;
- `HGPR-APPLY-POSITIVE-DRY-RUN-2026-06-15` and
  `HGPR-APPLY-MISSING-EXPORT-2026-06-15`: injected no-write success and
  fail-closed missing-export dry-run proof;
- `HGPR-APPLY-LIVE-FIXED-2026-06-15`: controlled proof-worktree applied diff
  on the safe morphology import case;
- `HGPR-APPLY-LIVE-COLD-GATES-2026-06-15`: cold selected Swooper gates after
  the applied diff;
- `HGPR-APPLY-LIVE-ROLLBACK-2026-06-15`: proof-worktree cleanup.

These proof ids do not claim unsupported import-clause forms, broad
`mod-swooper-maps:test`, generated-output freshness, baseline writes, parity
closure, raw direct Grit acquisition, or product/runtime behavior.

## Source Synthesis

Official Grit docs establish the tool boundary:

- `grit patterns test --filter ...` is the native fixture test surface.
- Markdown pattern tests can prove match and rewrite examples.
- `grit apply <pattern> <paths>` is the apply surface.
- `--dry-run`, `--force`, and `--output compact` are CLI options.
- `language js(typescript)` is the correct explicit target-language form for
  TypeScript patterns.

The same docs do not give Habitat a durable safety contract for target exports,
no-write proof, applied-diff review, rollback, or TypeScript type preservation.
Those remain Habitat obligations.

Official Effect docs establish the useful implementation substrate:

- typed success, error, and requirement channels;
- tagged errors for expected failure cases;
- layers for service injection;
- platform command execution carrying process inputs and outputs;
- scopes and finalizers for cleanup after success, failure, or interruption.

The existing Effect evaluation and `habitat-effect-grit-adapter` packet already
select these capabilities for Grit apply transactions. This codemod consumes
that substrate rather than adding handwritten transaction machinery to
`grit.ts`.

## Apply Proof Contract

An accepted proof artifact for this codemod must carry:

| Field | Required content |
| --- | --- |
| proof id | stable id referenced by this packet and the aggregate Grit proof matrix |
| source tree | branch, commit, dirty marker, status digest before and after |
| pattern identity | pattern file, pattern name, version/hash if available |
| scan roots | exact recipe/map roots and protected-path exclusions |
| candidate inventory | file, range, import kind, imported symbols, source specifier, proposed target specifier, Grit match id or digest |
| target export preflight | per candidate symbol, target public module, export source, success or structured failure |
| approval classification | expected, approved live candidate, rejected, or blocked |
| dry-run proof | command provenance, output digest, candidate set, no-write proof, final status |
| applied diff | approved changed paths, bounded diff artifact, before/after digests, allowed range classification |
| type-only preservation | proof that `import type` remains type-only and value imports remain value imports |
| Biome handoff | command provenance, changed paths, output, formatter-owned changes |
| type/test gates | selected commands, rationale, outputs, pass/fail status |
| rollback | transaction context, rollback action, cleanup/finalizer result, final clean status |
| non-claims | proof classes not established by this artifact |

The proof artifact may be stored in the Effect adapter's proof area and linked
from this packet, or stored in this packet's workstream proof area and linked
from the aggregate matrix. In either case, the aggregate matrix must point to
the exact proof id before downstream records claim safe transformation.

## Target Export Contract

For every candidate rewrite:

1. Parse the source import into imported symbol names, exported names, local
   aliases, per-specifier type/value kind, and import-clause form.
2. Resolve the target public module:
   `@mapgen/domain/<domain>/ops`.
3. Inspect the corresponding source authority for that module, not just the
   package path string.
4. Prove every imported symbol is exported by the target public module.
5. Preserve type-only imports as type-only imports.
6. Refuse or leave unchanged any candidate with a missing target export.
7. Record the refusal as product-safety evidence, not as a successful rewrite.

The current public ops surface creates a known risk: most domain `ops.ts` files
default-export the created domain object and import implementation maps from
`./ops/index.js`, but they do not uniformly re-export the named operation
symbols. This means a syntactically valid Grit rewrite can create a TypeScript
import error unless Habitat proves the public export first.

### Import-Clause Model

| Import form | Default disposition | Proof requirement |
| --- | --- | --- |
| named value import | supported when target export exists | exported name, local alias, value kind, source and target specifier |
| named type-only import | supported when target export exists | exported name, local alias, type-only kind, source and target specifier |
| aliased named import | supported when target export exists | exported name checked against target, alias preserved in output |
| inline `type` specifier inside named import | supported only when per-specifier type kind is preserved | exported name, local alias, per-specifier type/value kind |
| default import | rejected unless semantic equivalence is separately proven | target default export and usage equivalence proof |
| namespace import | rejected unless semantic equivalence is separately proven | target namespace export shape and usage equivalence proof |
| mixed default plus named import | rejected unless all clauses are proven equivalent | clause-by-clause export and usage proof |
| side-effect import | rejected | no imported symbol exists to prove |

Rejected forms remain unchanged and are recorded as blocked candidates.

## Transaction Boundary

Live apply implementation depends on `habitat-effect-grit-adapter` task 8 or an
equivalent accepted typed transaction substrate. The accepted flow is:

1. prove clean source state or create an isolated transaction context;
2. resolve scan roots and protected path exclusions;
3. run candidate inventory and target-export preflight;
4. run dry-run or transaction-copy apply to classify the rewrite set;
5. reject missing exports, unexpected files, unapproved ranges, and dry-run
   mismatches;
6. apply only the approved transaction;
7. run Biome over changed paths only;
8. run selected type/test gates;
9. capture diff, output digests, command provenance, and non-claims;
10. roll back or clean up through scoped transaction ownership;
11. prove final clean status.

`--force` may remain in the Grit argv only after Habitat's own precheck accepts
the transaction. Grit prompt behavior is not Habitat safety.

Git may be the rollback primitive only when invoked through the accepted typed
transaction service with before digests, allowed paths, command provenance, and
final clean-status proof. A manual apply followed by handwritten cleanup notes
is not accepted as live apply proof.

## Fixture And Probe Model

Required codemod fixture classes:

| Class | Purpose |
| --- | --- |
| positive value import | proves value import source changes only when target export exists |
| positive type import | proves `import type` source changes while staying type-only |
| mixed import file | proves value and type imports in one file both preserve kind |
| already public import | proves imports from `@mapgen/domain/<domain>/ops` remain unchanged |
| out-of-scope path | proves matching source text outside recipe/map roots is not rewritten |
| missing export | proves a candidate without a public target export is refused or unchanged |
| alias/default edge | proves import syntax edge cases are either supported or explicitly rejected |
| formatting edge | proves semicolon preservation or Biome-owned restoration after apply |

Native Grit fixtures prove pattern syntax. Target-export and missing-export
fixtures must execute through Habitat's preflight, because Grit does not know
TypeScript export authority.

## Downstream Realignment

- `habitat-grit-proof-repair/workstream/grit-proof-matrix.md` and the command
  proof log now point the current apply row at the accepted target-export,
  dry-run, applied-diff, selected-gate, and cleanup proof ids.
- `docs/projects/habitat-harness/recovery-claim-ledger.md` keeps broad product
  transformation closure unclosed, but records this codemod as a bounded safe
  transform for supported named value/type imports under the accepted
  `HGPR-APPLY-*` proof ids.
- `docs/projects/habitat-harness/grit-pattern-corpus-ledger.md` records the
  codemod as executable under proof for that supported shape, with unsupported
  import forms, broad product/runtime closure, generated-output freshness,
  baseline writes, raw direct Grit acquisition, broad tests, and parity closure
  preserved as non-claims.
- `docs/projects/habitat-harness/effect-orchestration-evaluation.md` remains
  the substrate decision authority for why the live write path consumes Effect.

## Write Set

Expected implementation write set:

- `.grit/patterns/habitat/apply/deep_import_to_public_surface.md`
- `tools/habitat-harness/src/lib/grit.ts` or the Effect-backed successor
- `tools/habitat-harness/src/lib/command-engine.ts` only for accepted adapter
  handoff
- `tools/habitat-harness/test/**`
- `openspec/changes/habitat-effect-grit-adapter/**` proof artifacts if the
  adapter owns them
- `openspec/changes/habitat-grit-proof-repair/**` aggregate proof links
- this packet's `workstream/**`

Protected paths:

- generated outputs and ignored build artifacts;
- `.civ7/outputs/resources/**`;
- lockfiles unless dependency changes are owned by the Effect adapter packet;
- public domain exports unless a separate accepted public-surface change owns
  those exports.

## Review Lanes

- Product/outcome: does the packet protect safe structural transformation rather
  than pattern-count closure?
- Grit: are native fixture, live scan, dry-run, and applied-diff proofs kept
  separate?
- TypeScript/export: does every rewrite prove target exports and import-kind
  preservation?
- Effect/substrate: does the design rely on typed transaction services rather
  than handwritten process conventions?
- Evidence: are commands, non-claims, and downstream records precise enough for
  implementation?
