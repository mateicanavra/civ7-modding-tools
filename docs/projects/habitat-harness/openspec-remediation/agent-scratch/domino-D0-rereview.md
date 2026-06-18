# D0 Deep Habitat OpenSpec Packet Rereview

## Review Scope

Fresh, packet-specific adversarial rereview of
`openspec/changes/deep-habitat-d0-command-surface-inventory/` only. This review
treats the prior D0 review as negative acceptance evidence and asks whether the
current packet is implementation-ready for the Public Surface Compatibility
Matrix before later Habitat Toolkit refactors change CLI behavior, command JSON,
package exports, scripts, Nx targets, generators, migrations, hooks, or public
examples.

## Mandatory Anchors Read

- `/Users/mateicanavra/.agents/skills/domain-design/SKILL.md`
- `/Users/mateicanavra/.agents/skills/information-design/SKILL.md`
- `/Users/mateicanavra/.agents/skills/solution-design/SKILL.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/typescript-refactoring/SKILL.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/typescript-refactoring/references/smell-catalog.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/typescript-refactoring/references/refactoring-mechanics.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/typescript-refactoring/references/paradigms-and-patterns.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/typescript-refactoring/references/llm-slop-cleanup.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/typescript-refactoring/references/worked-examples.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/typescript-refactoring/assets/refactor-findings-template.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/typescript-refactoring/assets/refactor-plan-template.md`

## Packet Files Read

- `openspec/changes/deep-habitat-d0-command-surface-inventory/proposal.md`
- `openspec/changes/deep-habitat-d0-command-surface-inventory/design.md`
- `openspec/changes/deep-habitat-d0-command-surface-inventory/tasks.md`
- `openspec/changes/deep-habitat-d0-command-surface-inventory/specs/habitat-harness/spec.md`
- `openspec/changes/deep-habitat-d0-command-surface-inventory/workstream/phase-record.md`
- `openspec/changes/deep-habitat-d0-command-surface-inventory/workstream/review-disposition-ledger.md`
- `openspec/changes/deep-habitat-d0-command-surface-inventory/workstream/downstream-realignment-ledger.md`
- `openspec/changes/deep-habitat-d0-command-surface-inventory/workstream/closure-checklist.md`
- `docs/projects/habitat-harness/openspec-remediation/agent-scratch/domino-D0-review.md`

## Verdict

Not accepted.

The current D0 packet repaired most prior blockers: it now names the matrix path,
row columns, state glossary, plane authority, write set, protected paths,
historical path policy, validation categories, downstream citation rule, and
TypeScript refactoring compatibility boundary. However, D0 is not yet an
implementation-ready compatibility authority because two acceptance-critical
decisions still survive as implementation-time judgment:

1. the stable row ID contract is not deterministic enough for a durable citation
   authority;
2. `downstream-decision` in `compatibility_handling` can let D0 avoid choosing
   the compatibility handling that later packets are supposed to obey.

Under the falsifier, both remain blockers: an implementation agent could still
reasonably decide row identity and compatibility disposition later.

## P1 Findings

### P1-1: Row IDs are required, but the packet still leaves row identity design to the implementation agent

Evidence:

- `proposal.md:40-43` says every matrix row has a stable `surface_id` that later
  dominoes must cite.
- `design.md:78-95` defines the row schema and says `surface_id` is a stable ID
  in the form `D0-<plane>-<slug>`, unique and never reused.
- `tasks.md:37-38` asks the implementation to add stable `surface_id` values.
- `specs/habitat-harness/spec.md:27-31` requires stable IDs but does not define
  slug derivation, collision handling, or row identity preservation rules.

Why this blocks acceptance:

D0 is the compatibility citation authority. A row ID is not a cosmetic label; it
is the handle later packets cite before changing a command, DTO, export, script,
target, generator, migration, hook, or public example. The current contract
defines an ID shape but not the identity rule. An implementation agent still has
to decide whether the canonical row for `check --json` is
`D0-cli-check-json`, `D0-cli-habitat-check-json`, `D0-cli-check-flag-json`, or
something else. The same problem appears for package subpaths, command DTOs,
human output classes, generator schema/factory/refusal rows, and docs examples.

That violates the D0 falsifier. The packet must remove implementation-time row
ID design, not merely require stable IDs after the implementation invents them.
The TypeScript refactoring analogy is a missing model: the packet has a stringly
typed ID slot and a broad uniqueness convention where it needs a deterministic
surface identity rule.

Required repair:

Define the row identity algorithm before implementation. At minimum:

- canonical slug construction from plane plus normalized surface key;
- per-plane surface key rules, such as command verb/arg/flag, command JSON type,
  package export symbol/subpath, root script name, Nx target name, generator or
  migration name plus schema/factory/refusal facet, hook command/output facet,
  and docs example source anchor;
- collision rule, such as append the source-path stem only when two rows produce
  the same canonical key;
- rename/deprecation rule saying old `surface_id` values are never reused and a
  replacement row links through `related_surface_ids`;
- explicit rule that implementation may discover row instances from source, but
  may not choose an ad hoc ID scheme.

## P2 Findings

### P2-1: `downstream-decision` is an escape hatch in the compatibility handling column

Evidence:

- `proposal.md:81-83` says later packets may not move, narrow, rename, version,
  or reinterpret a listed surface unless they cite the D0 `surface_id` and use
  the D0 compatibility handling.
- `proposal.md:87-90` says later public-surface changes must preserve, version,
  deprecate, or refuse according to matrix rows.
- `design.md:88-91` defines `contract_state`, `compatibility_handling`, and
  `target_owner`, but allows `compatibility_handling` to be `downstream-decision`.
- `specs/habitat-harness/spec.md:13-18` requires a later packet to follow the
  row's compatibility handling and record whether the row is preserved,
  versioned, facaded, deprecated, refused, or handed to a downstream owner.

Why this blocks acceptance:

`downstream-decision` is not a compatibility handling. It is a deferral marker.
For D0's actual role, downstream ownership and compatibility handling are
different axes:

- `target_owner` names who may redesign the surface later.
- `compatibility_handling` tells that owner what compatibility obligation applies
  before changing the current public surface.

Allowing `compatibility_handling = downstream-decision` lets a matrix row satisfy
the schema while withholding the decision later packets must obey. That recreates
the implementation-time design gap D0 exists to close. It also weakens the
state-space collapse D0 is supposed to enable: instead of reducing public
compatibility states to a closed set of actions, it leaves an open-ended state
whose semantics are whatever the future packet decides.

This is not a claim that D0 must choose target behavior. D0 can and should leave
target redesign to D1/D3/D4/D7/D9/D11/D12/D13 as applicable. But D0 still has to
classify the current compatibility obligation: preserve, version, facade,
deprecate, refuse, document-only, or generated-only. The downstream packet may
then design the target shape inside that obligation.

Required repair:

Remove `downstream-decision` from `compatibility_handling`, or constrain it so it
cannot be used as a primary handling value. If a downstream packet owns redesign,
record that in `target_owner` and `downstream_dominoes`; keep
`compatibility_handling` as the closed compatibility action set. If a row truly
cannot choose a compatibility handling, D0 should stop as incomplete rather than
emit a row that later packets can reinterpret.

## Acceptance Notes

No additional P1/P2 findings were found against artifact path, row schema
columns, plane authority, state glossary, write set, stale-path policy,
protected paths, source-read-only boundary, validation categories, or downstream
owner naming. Those prior blockers appear repaired at packet level, subject to
the two findings above.
