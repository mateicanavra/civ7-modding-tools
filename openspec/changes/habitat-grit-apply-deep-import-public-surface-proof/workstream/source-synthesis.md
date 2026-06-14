# Source Synthesis - Deep Import Apply Proof

## Authority Order

1. Product frame: `docs/projects/habitat-harness/dra-takeover-frame.md`.
2. Claim ledger: `docs/projects/habitat-harness/recovery-claim-ledger.md`.
3. Corpus ledger: `docs/projects/habitat-harness/grit-pattern-corpus-ledger.md`.
4. Current executable code and pattern files.
5. Existing OpenSpec packets:
   `habitat-grit-proof-repair`, `habitat-effect-grit-adapter`, and
   `habitat-enforcement-surface-cleanup`.
6. Official Grit and Effect docs.

## Product Source

The product outcome is a Habitat structural operating system for agents:
classify first, generate supported structure, enforce in the correct owner
layer, shrink baselines, provide safe transformations, and keep records
truthful. An apply codemod only advances that outcome when agents can trust the
transform, not merely when a pattern file exists.

`CLAIM-PRODUCT-TRANSFORMS` says the current tree has one apply pattern and that
candidate transformations need safety and applied-diff proof. The Grit corpus
ledger names `deep_import_to_public_surface` as the current apply row and
requires target export existence, dry-run/apply proof, type-only preservation,
and rollback.

## Current Code Source

`.grit/patterns/habitat/apply/deep_import_to_public_surface.md` declares
`language js(typescript)` and rewrites:

- `import type ... from "@mapgen/domain/<domain>/ops/<tail>"` to the public
  `/ops` module under recipe/map filenames;
- value imports with the same source shape, excluding `import type`.

`tools/habitat-harness/src/lib/grit.ts` hardcodes the apply pattern in
`gritApplyPatterns`, discovers recipe/map roots from `mods/*/src`, invokes
`grit apply`, passes `--force` and `--output compact`, and returns
`SpawnResult`.

`tools/habitat-harness/src/lib/command-engine.ts` runs Grit apply first in
`runFix`, then runs Biome check or write depending on dry-run mode.

## Official Grit Source

Official Grit docs support:

- native pattern tests through `grit patterns test`;
- apply execution through `grit apply`;
- `--dry-run`, `--force`, and compact output options;
- explicit target language selection through `language js(typescript)`;
- rewrite syntax with metavariables.

They do not supply Habitat-specific guarantees for TypeScript export existence,
safe import-kind preservation, no-write proof, transaction rollback, Biome
handoff, or final clean status. Habitat must own those proof classes.

## Official Effect Source

Official Effect docs support typed success/error/requirement channels, tagged
errors, service Layers, platform commands, scopes, and finalizers. These
capabilities map directly to the repeated manual work otherwise needed for
codemod safety:

- command provenance;
- service-injected tests for Git, filesystem, Grit, and target-export checks;
- structured missing-export failures;
- scoped transaction cleanup;
- rollback and final clean-status proof.

The existing Effect evaluation and `habitat-effect-grit-adapter` packet already
select Effect for Grit adapter apply transactions. This codemod packet consumes
that selection.

## Local Evidence

| Evidence id | Source | Result | Implication |
| --- | --- | --- | --- |
| DIPS-E1 | local pattern file | one native rewrite sample exists | fixture proof exists, but only one class |
| DIPS-E2 | `PATH="$PWD/node_modules/.bin:$PATH" command -v grit` | local Grit binary resolves under `node_modules/.bin` | direct shell proof must include local PATH |
| DIPS-E3 | `grit patterns test --filter deep_import_to_public_surface --json` | exits 0 and reports success | native fixture proof passes |
| DIPS-E4 | `rg "@mapgen/domain/.../ops/..."` over recipe/map roots | no output, exit 1 | live tree has no obvious current candidates |
| DIPS-E5 | direct `grit apply ... --dry-run --output compact` | processed 234 files and found 0 matches | direct dry-run hygiene proof only |
| DIPS-E6 | `bun run habitat:fix -- --dry-run` | processed 234 files, found 0 matches; Biome no fixes | Habitat dry-run hygiene proof only |
| DIPS-E7 | public domain ops files | public `ops.ts` files do not uniformly re-export named ops from `ops/index.ts` | target-export preflight is mandatory |
| DIPS-E8 | `habitat-effect-grit-adapter/design.md` | apply transaction flow and tagged apply failures are already designed | live apply implementation should consume that substrate |

## Design Consequences

1. Keep native fixture proof, dry-run proof, and applied-diff proof separate.
2. Treat the current zero-match live dry-run as hygiene evidence, not safety
   proof.
3. Require target-export preflight before every candidate rewrite.
4. Require missing-export refusal proof before product-safe classification.
5. Require semicolon preservation or an explicit Biome-owned formatting
   classification in applied-diff proof.
6. Gate live apply proof behind Effect-backed or equivalent typed transaction
   services.
7. Keep Grit, Habitat, Biome, Nx, and Effect owner layers explicit.
