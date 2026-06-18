# Design: D0 Public Surface Compatibility Matrix

## Frame

D0 is not a cleanup task and not a documentation backfill. It is the design of
Habitat's compatibility authority for the refactor train. The problem is not
"write down what exists"; the problem is that current TypeScript and command
surfaces admit too many reachable states because public contracts, internal
helpers, generated records, command DTOs, and historical proof-shaped names are
mixed together.

The TypeScript refactoring lens is central: later refactors are only allowed to
collapse state space after D0 names which surfaces are external contracts and
which are internal implementation details. D0 does not shrink the code state
space directly; it creates the public-surface boundary that lets later packets
shrink it without silent API drift.

## Solution Design Calibration

D0 sits in a rugged, high-commitment design space. A shallow inventory would look
reasonable while preserving the core ambiguity that caused the refactor train to
stall: the same Habitat term can be a CLI promise, a command JSON field, a
package export, a generated record, a docs example, or an internal helper. Greedy
convergence on "list the commands" is therefore rejected.

The acceptance threshold is not completeness theater. D0 is acceptable only when
an implementation agent can answer these questions from the packet without
making a product or domain decision:

1. Which artifact is the compatibility authority?
2. What exact row schema and row ID format must it use?
3. Which public-surface planes must be inventoried separately?
4. Which paths may D0 write, and which paths are evidence only?
5. What state glossary decides whether a surface is stable, versioned,
   command-only, package-internal, generated, deprecated, refused, or docs-only?
6. Which static checks and commands falsify an incomplete matrix?
7. What does a row explicitly not claim?
8. Which downstream owner may redesign the surface later?
9. How is stable row identity derived without ad hoc implementation naming?

The solution is deliberately constraint-shaping: D0 creates the compatibility
constraint that every later packet must cite before changing a surface. That
constraint is the product value. It keeps users and agents from discovering
public contract drift during implementation, and it prevents old proof/evidence
language from becoming target-domain authority merely because it exists today.

## Domain Boundary

- Owner: Public Surface Compatibility.
- Primary consumer: a future domino owner deciding whether a surface can be
  preserved, versioned, moved behind a facade, deprecated, or refused.
- Adjacent owners: D1 receipt contracts, D2 registry metadata, D3 workspace graph
  metadata, D4 classify routing, D7 enforcement, D9 apply transactions, D11
  local feedback, D12 verify handoff, D13 generators/refusals.

D0 owns row completeness, compatibility state, citation mechanics, and
current-behavior samples. D0 does not own target-domain redesign for the
surface. A D0 row can say "this current `Proof*` name is public compatibility";
it cannot say "proof is target language" unless a downstream packet explicitly
keeps that language for a product scenario.

## Matrix Artifact Contract

D0 implementation writes the durable matrix at:

`docs/projects/habitat-harness/public-surface-compatibility-matrix.md`

That file is the citation authority for later packets. It MUST have these
sections:

1. Scope and current worktree command context.
2. State glossary.
3. Plane authority rules.
4. Compatibility matrix.
5. Completeness checklist.
6. Command samples and non-claims.
7. Downstream citation rules.

Every row MUST include:

| Column | Requirement |
| --- | --- |
| `surface_id` | Deterministic stable ID in the form `D0-<plane>-<surface-key>`, unique and never reused. |
| `plane` | One of `cli`, `command-json`, `human-output`, `package-export`, `root-script`, `nx-target`, `generator`, `migration`, `hook`, `docs-example`. |
| `source_path` | Repo-relative source/doc/test path or package manifest path. |
| `symbol_or_surface` | Command, flag, export, script, target, generator, migration, hook, or output shape. |
| `current_behavior_or_schema` | Concise current behavior, JSON shape, or command sample. |
| `known_consumers` | Humans, agents, tests, root scripts, Nx, package imports, generated docs, later dominoes, or unknown. |
| `contract_state` | Exactly one primary state from the state glossary. |
| `row_relationships` | Typed links to other rows, using the closed row relationship ontology below. |
| `compatibility_handling` | One closed action: preserve, version, facade, deprecate, refuse, document-only, or generated-only. |
| `target_owner` | Downstream owner that may redesign the surface, or D0 when the row is inventory-only. |
| `downstream_dominoes` | Later packets that must cite the row. |
| `validation_gate` | Command/test/static check that proves the row was inventoried. |
| `non_claims` | What the row/sample does not prove. |
| `notes` | Short compatibility notes, including proof/evidence compatibility facts. |

If a surface appears on multiple planes, D0 records one row per plane and links
them with `row_relationships` using `same-surface-other-plane`. Package-export
stability and command-JSON stability are separate decisions even when they share
a TypeScript type name.

## Surface Identity Contract

Ontology rule: `surface_id` is the row's semantic identity, not a convenient
label. It must identify the current public surface in a way that later packets
can cite without depending on prose labels, file order, or implementation
judgment.

The ID format is:

`D0-<plane>-<surface-key>`

The `<plane>` segment MUST be one of the matrix planes. The `<surface-key>` is
derived from the plane-specific source identity below. To normalize a segment:
lowercase it, replace every run of non-alphanumeric characters with `-`, trim
leading/trailing `-`, and preserve existing numeric suffixes when they are part
of a source name. Join normalized segments with `-`.

| Plane | Surface key source |
| --- | --- |
| `cli` | `cmd-<verb>`, `cmd-<verb>-arg-<arg>`, `cmd-<verb>-flag-<flag>`, or `cmd-<verb>-forwarding-<forwarding-rule>`. |
| `command-json` | `type-<type-or-interface-name>` for named DTOs, or `cmd-<verb>-json-<object-purpose>` for anonymous command JSON shapes. |
| `human-output` | `cmd-<verb>-line-<claim-purpose>` for stable human-output claims such as safety, handoff, local feedback, or CI authority. |
| `package-export` | `symbol-<exported-symbol>` for TypeScript exports, or `subpath-<package-export-subpath>` for package `exports` keys. |
| `root-script` | `script-<root-package-json-script-name>`. |
| `nx-target` | `target-<nx-target-name>` with `alias-<alias-name>` only when the alias is itself a user-callable target. |
| `generator` | `generator-<generator-name>-<facet>`, where facet is `name`, `schema`, `factory`, or `refusal`. |
| `migration` | `migration-<migration-name>-<facet>`, where facet is `name`, `schema`, `factory`, or `refusal`. |
| `hook` | `hook-<hook-name>` or `hook-<hook-name>-line-<claim-purpose>` for stable output records. |
| `docs-example` | `doc-<doc-path-stem>-<heading-anchor>-<example-purpose>`. |

Collision handling is deterministic. If two rows in the same plane produce the
same `surface_id`, append `-from-<source-path-stem>` using the repo-relative
`source_path` with extension removed and normalized. If a docs or human-output
row still collides, append `-line-<line-number>` from the source file. A row may
not choose a shorter or friendlier ad hoc ID.

Lifecycle rules:

- A `surface_id` is never reused for a different surface.
- If a surface is renamed but compatibility remains, keep the old row and mark
  the relationship with `renamed-to` on the old row and `renamed-from` on the
  new row.
- If a surface is deprecated, keep the old row with `contract_state:
  deprecated`; the replacement row gets its own `surface_id`, linked through
  `deprecated-replacement`.
- If a generated-derived surface changes because its source authority changed,
  keep the generated row ID and update the `generated-from` relationship to the
  source row; do not mint a new generated row merely because generated text
  changed.
- Implementation may discover row instances from source, but it may not invent
  a different row identity algorithm.

## Row Relationship Ontology

`row_relationships` is a list of typed row links, not a generic bag of related
IDs. Each entry MUST use:

`{ relation: <relation>, surface_id: <surface_id> }`

The relation set is closed:

| Relation | Direction | Allowed endpoints | Operational meaning |
| --- | --- | --- | --- |
| `same-surface-other-plane` | Either direction, preferably reciprocal. | Rows for the same current surface on different planes. | Signals that compatibility decisions must consider both rows, while each plane keeps its own state and handling. |
| `renamed-from` | New row -> old row. | Replacement row to predecessor row. | Records rename continuity; later packets preserve or migrate known consumers of the old ID. |
| `renamed-to` | Old row -> new row. | Predecessor row to replacement row. | Records the current successor for a renamed surface while preserving the old ID. |
| `deprecated-replacement` | Deprecated row -> replacement row. | Deprecated row to replacement row. | Names the migration target required before removal. |
| `generated-from` | Generated or derived row -> source-authority row. | `generated-derived` or `generated-only` row to the row that owns the source authority. | Requires later packets to change the source authority instead of generated output. |
| `docs-example-of` | Docs-example row -> command/API/source row. | `docs-example` row to the surface it demonstrates. | Makes docs correction depend on the source surface rather than treating prose as an independent contract. |

No row relationship may be untyped. If a needed relationship does not fit one of
these meanings, D0 stops for packet repair instead of using `notes` as a hidden
relationship channel.

## State Glossary

| State | Decision Rule | Downstream Permission |
| --- | --- | --- |
| `public-stable` | Documented, tested, or exported surface that users/agents/scripts can reasonably rely on now. | Preserve unless a downstream packet designs versioning/deprecation. |
| `public-versioned` | Public surface where change is expected only through schema/version handling. | May change only with version or compatibility wrapper. |
| `package-internal` | Exported or reachable through package code but not intended as consumer API; current exposure is compatibility risk. | Later packet may move behind facade only after preserving any known consumers. |
| `command-only-dto` | Shape exists to serialize command output, not as a reusable domain type. | Redesign belongs to command owner; package exports should not treat it as core domain. |
| `test-only` | Surface exists for fixtures/tests and has no product consumer. | May move with tests; must not be cited as product API. |
| `generated-derived` | Surface is generated, inferred, or derived from another source. | Change the source authority, not hand-edited output. |
| `deprecated` | Existing supported surface planned for removal or replacement. | Requires migration note and replacement before removal. |
| `refused` | Unsupported surface or invocation that Habitat intentionally rejects. | Keep refusal explicit; do not silently accept. |
| `docs-example` | Example prose showing a current invocation or output. | May be corrected as documentation only if D0 records the source surface. |

States are mutually exclusive as the primary state. Secondary links go in
`row_relationships`; `notes` may explain a relationship but must not create a
new untyped relationship.

## Compatibility Handling Semantics

`compatibility_handling` is a closed action set. It is separate from
`target_owner`: the owner says who may redesign the target surface later; the
handling says what current compatibility obligation that owner inherits.

| Handling | Meaning |
| --- | --- |
| `preserve` | Later packets must keep the current invocation, shape, export, script, target, or output meaning behavior-compatible. |
| `version` | Later packets may change the surface only through an explicit version or compatibility wrapper. |
| `facade` | Later packets may move internals only after preserving a stable facade for known consumers. |
| `deprecate` | Later packets may retire the surface only with a named replacement and migration/deprecation note. |
| `refuse` | Habitat must keep rejecting the unsupported surface explicitly; later packets must not silently accept it. |
| `document-only` | The row is a docs example or prose surface; later packets may correct docs only after citing the source surface. |
| `generated-only` | The row is generated or derived; later packets must change the source authority, not hand-edit output. |

No value may mean "unclassified." If D0 cannot choose one of these actions for a
row, the matrix is incomplete and D0 stops rather than emitting the row as
accepted.

## Required Matrix Planes

The D0 implementation must inventory at least:

- CLI verbs: `check`, `classify`, `verify`, `fix`, `graph`, `hook`.
- CLI flags and forwarding behavior, especially `check --json` versus
  `check -- --json`.
- Command JSON and command-only DTOs: `CheckReport`, `Classification`,
  `DiffClassification`, `VerifyProof`, `GritApplyTransactionProof`,
  `HookTrace`, and any adjacent `*Result` emitted by commands.
- Human output lines that claim safety, local feedback, CI authority, handoff, or
  compatibility meaning.
- Package exports from `tools/habitat-harness/src/index.ts`.
- Package export subpaths from `tools/habitat-harness/package.json`.
- Root scripts in `package.json` that call `habitat` or Habitat-owned Nx targets.
- Habitat project scripts and Nx package targets in
  `tools/habitat-harness/package.json`.
- Inferred Nx targets from `tools/habitat-harness/src/plugin.js` and `nx.json`.
- Generators and migrations from `tools/habitat-harness/generators.json`,
  `tools/habitat-harness/migrations.json`, and generator schema files.
- Hook entrypoints and Husky delegation assumptions.
- Habitat docs examples that show command invocations or public JSON/human
  output.

## Write Set

D0 implementation may write:

- `docs/projects/habitat-harness/public-surface-compatibility-matrix.md`.
- `tools/habitat-harness/docs/IMPLEMENTED-SURFACE.md` only to link to the matrix
  or clarify that the matrix owns compatibility classification.
- `tools/habitat-harness/docs/SCENARIOS.md` only to clarify current invocation
  examples surfaced by the matrix.
- `openspec/changes/deep-habitat-d0-command-surface-inventory/**`.
- `docs/projects/habitat-harness/openspec-remediation/packet-index.md` only to
  update D0 status after review.

D0 implementation must treat these as read-only evidence:

- `tools/habitat-harness/src/**`.
- `tools/habitat-harness/package.json`.
- root `package.json`.
- `nx.json`.
- generated artifacts such as `dist/**`, `oclif.manifest.json`, and Nx outputs.

Any need to change TypeScript source, package exports, command behavior, root
scripts, Nx plugin code, generator code, or hooks means D0 has discovered a
future packet decision; D0 records the surface and stops rather than implementing
the change.

## Validation Oracle

D0 closure requires evidence in the matrix, not just green commands. Each
validation command must record expected status, actual status, cache stance, and
non-claims in the matrix or phase record.

- Static export inventory: every `export` in
  `tools/habitat-harness/src/index.ts` has one `package-export` row.
- Package export inventory: every key in `tools/habitat-harness/package.json`
  `exports` has one row.
- Root script inventory: every root `package.json` script containing `habitat`,
  `@internal/habitat-harness`, `grit:check`, `generated:check`, or
  `habitat:rule:` has one row.
- Command inventory: every command file under `tools/habitat-harness/src/commands`
  has verb, flag, JSON/human output, and sample rows where applicable.
- Nx inventory: `nx show project @internal/habitat-harness` output has rows for
  Habitat-owned targets.
- Generator inventory: every generator/migration entry has rows for name, schema,
  factory, and refusal surface.
- Hook inventory: `habitat hook --help` and hook unit tests cover the command
  surface without running a live local hook.

## Historical Path Policy

Absolute paths under
`/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame`
in the source packet are historical provenance only. D0 executable commands run
from `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation`
or use repo-relative paths.

## TypeScript Refactoring Implications

D0's design enables later TypeScript state-space reduction by separating:

- package public exports from internal helpers;
- command DTOs from domain models;
- current compatibility names from target-domain language;
- generated/inferred surfaces from source authority;
- stable public examples from docs-only examples.

D0 must name the current smell without pretending to fix it in this packet:

- `tools/habitat-harness/src/index.ts` is currently a broad compatibility risk
  because package exports, helper reachability, and consumer convenience are not
  yet separated by owner.
- Command JSON types currently risk whole-record leakage: a shape emitted by a
  command can be mistaken for a reusable domain model.
- Proof/evidence-shaped names are current compatibility facts, not target
  language. Later packets may collapse them into receipt, diagnostic,
  transaction, decision, or handoff contracts only after citing D0 rows.
- Generated and inferred surfaces can look editable; D0 must mark them as
  derived so later packets change the owning source instead of hand-editing
  output.
- Docs examples can look like contracts; D0 must separate docs-only examples
  from actual command/API compatibility.

The safe refactoring moves enabled later are explicit:

- broad package export surface -> facade or narrowed package entrypoint;
- command DTO optional/flag soup -> discriminated command result states;
- whole-record leakage -> typed projections owned by a command or domain;
- false-green wrapper around graph/tooling behavior -> explicit graph refusal or
  unavailable-target state;
- broad proof DTOs -> bounded receipt, diagnostic, transaction, or handoff
  contracts where the product scenario earns that language;
- generated/manual ambiguity -> source-authority row plus generated-derived
  state.

D0 itself performs none of those moves. Its refactoring acceptance criterion is
that later packets can choose those moves without reopening public compatibility,
write-set, state-model, or validation-oracle decisions. If a later packet still
has to decide what counts as public, what row state means, whether a generated
surface is editable, or which command falsifies the row, D0 has failed.

## Structural Alternative Rejected

Rejected: "start moving internals and fix imports as tests fail." That would
let inferred return types and broad `src/index.ts` exports drift silently. D0
instead creates the compatibility boundary first, so later refactors can delete
or hide implementation details without breaking public consumers by accident.
