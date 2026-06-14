## ADDED Requirements

### Requirement: Apply Codemod Requires Target Export Proof

Habitat SHALL NOT apply `deep_import_to_public_surface` to a candidate import
unless every imported symbol is proven exported by the target public
`@mapgen/domain/<domain>/ops` module.

#### Scenario: Candidate symbol is publicly exported

- **WHEN** a recipe or map source imports a value or type from
  `@mapgen/domain/<domain>/ops/<tail>`
- **AND** the same imported symbol is exported by
  `@mapgen/domain/<domain>/ops`
- **THEN** Habitat may classify the candidate as rewrite-eligible
- **AND** the proof record names the symbol, source specifier, target specifier,
  target source authority, and import kind

#### Scenario: Candidate import uses aliases or inline type specifiers

- **WHEN** a candidate import clause contains named imports with aliases or
  inline `type` specifiers
- **THEN** Habitat SHALL track exported name, local alias, per-specifier
  type/value kind, source specifier, and target specifier
- **AND** Habitat SHALL prove target export existence against the exported name
  rather than the local alias

#### Scenario: Candidate import uses default, namespace, mixed, or side-effect form

- **WHEN** a candidate import clause uses default import, namespace import,
  mixed default plus named import, or side-effect-only import syntax
- **THEN** Habitat SHALL reject the candidate unless the proof contract
  explicitly proves semantic equivalence for that import form
- **AND** rejected candidates SHALL remain unchanged and be recorded as blocked
  by unsupported import-clause form

#### Scenario: Candidate symbol is not publicly exported

- **WHEN** a candidate deep import names a symbol missing from the target public
  `/ops` module
- **THEN** Habitat SHALL refuse the rewrite or leave that import unchanged
- **AND** the proof record SHALL classify the candidate as blocked by missing
  target export
- **AND** Habitat SHALL NOT claim product-safe transformation for that candidate

### Requirement: Dry-Run Proof Is Separate From Applied-Diff Proof

Habitat SHALL record dry-run no-write proof and applied-diff proof as separate
proof classes for `deep_import_to_public_surface`.

#### Scenario: Dry-run finds no live matches

- **WHEN** `habitat fix --dry-run` or direct `grit apply --dry-run` processes
  the approved recipe/map roots and finds zero matches
- **THEN** Habitat records live-tree hygiene evidence
- **AND** Habitat SHALL NOT claim target-export safety, applied-diff safety, or
  rollback safety from that command

#### Scenario: Dry-run uses an injected match

- **WHEN** an injected file under an approved recipe/map root contains an
  eligible deep domain ops import
- **AND** an agent runs the Habitat fix dry-run path
- **THEN** no source file changes are present after the command
- **AND** the proof record captures command provenance, candidate inventory,
  no-write status, and final clean status

### Requirement: Apply Proof Is Transactional

Habitat SHALL run live `deep_import_to_public_surface` apply proof only through
`habitat-effect-grit-adapter` or an equivalent accepted typed transaction
substrate.

#### Scenario: Transaction substrate is present

- **WHEN** the accepted substrate can record command provenance, source state,
  candidate inventory, target-export preflight, applied diff, Biome handoff,
  selected type/test gates, rollback, and final clean status
- **THEN** Habitat may run the controlled apply proof for this codemod

#### Scenario: Transaction substrate is absent

- **WHEN** implementation cannot provide typed command results, scoped cleanup,
  rollback proof, and final clean status
- **THEN** Habitat SHALL NOT run a live codemod apply as product proof
- **AND** downstream records SHALL keep the codemod classified as implemented
  under proof rather than product-safe transformation

### Requirement: Apply Diff Is Reviewable And Bounded

Habitat SHALL accept an applied diff for `deep_import_to_public_surface` only
when every changed file, import specifier, range, and formatter-owned change is
approved by the proof contract.

#### Scenario: Approved apply changes only import sources

- **WHEN** a controlled apply rewrites deep domain ops imports to public `/ops`
- **THEN** the diff changes only approved import specifiers plus Biome-owned
  formatting on the approved changed paths
- **AND** the proof record includes before/after file digests and a bounded diff
  artifact

#### Scenario: Apply changes an unexpected file or range

- **WHEN** the applied diff includes an unapproved file, range, file creation,
  file deletion, or unrelated edit
- **THEN** Habitat rejects the proof
- **AND** rollback or transaction cleanup SHALL return the worktree to clean
  status before closure

### Requirement: Import Kind Is Preserved

Habitat SHALL preserve import kind when applying
`deep_import_to_public_surface`.

#### Scenario: Type-only import is rewritten

- **WHEN** a candidate uses `import type`
- **THEN** the rewritten import SHALL still use `import type`
- **AND** selected typecheck gates SHALL pass after the controlled diff

#### Scenario: Value import is rewritten

- **WHEN** a candidate uses a value import
- **THEN** the rewritten import SHALL remain a value import
- **AND** selected runtime-relevant tests or typecheck gates SHALL pass after
  the controlled diff

### Requirement: Downstream Product Claims Stay Current

Habitat SHALL keep downstream records truthful about the current safety status
of `deep_import_to_public_surface`.

#### Scenario: Safe-transform proof is incomplete

- **WHEN** any required proof class is missing
- **THEN** downstream records SHALL describe the codemod as implemented under
  proof
- **AND** they SHALL NOT count it as product-safe transformation evidence

#### Scenario: Safe-transform proof is complete

- **WHEN** live and injected match inventory, target-export preflight,
  missing-export refusal, import-clause support classification, import-kind
  preservation, dry-run no-write, approved applied diff, Biome handoff,
  selected type/test gates, rollback, and final clean status all pass
- **AND** the aggregate Grit proof matrix links the exact proof id
- **THEN** downstream records may classify the codemod as product-safe within
  its stated scan roots and export contract
