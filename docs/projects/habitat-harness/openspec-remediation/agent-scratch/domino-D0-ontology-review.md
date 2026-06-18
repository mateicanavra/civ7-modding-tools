# D0 Deep Habitat Ontology Review

## Review Scope

Fresh ontology-design review of the D0 Deep Habitat OpenSpec packet only:
`openspec/changes/deep-habitat-d0-command-surface-inventory/`.

This review checks semantic identity, naming, state modeling, compatibility
actions, relationship semantics, proof/evidence terminology, and whether the
packet leaves implementation-time semantic decisions open. It is not an
implementation review and not a broad corpus sweep.

## Mandatory Anchors Read

- `/Users/mateicanavra/.agents/skills/ontology-design/SKILL.md`
- `/Users/mateicanavra/.agents/skills/ontology-design/references/axes.md`
- `/Users/mateicanavra/.agents/skills/ontology-design/references/principles.md`
- `/Users/mateicanavra/.agents/skills/ontology-design/references/where-defaults-hide.md`
- `/Users/mateicanavra/.agents/skills/ontology-design/references/representation-choices.md`
- `/Users/mateicanavra/.agents/skills/ontology-design/references/operationalization.md`
- `/Users/mateicanavra/.agents/skills/ontology-design/references/maintenance.md`
- `/Users/mateicanavra/.agents/skills/ontology-design/references/examples.md`
- `/Users/mateicanavra/.agents/skills/ontology-design/references/source-map.md`
- `/Users/mateicanavra/.agents/skills/ontology-design/todo.md`
- `/Users/mateicanavra/.agents/skills/domain-design/SKILL.md`
- `/Users/mateicanavra/.agents/skills/information-design/SKILL.md`
- `/Users/mateicanavra/.agents/skills/solution-design/SKILL.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/typescript-refactoring/SKILL.md`

## Packet Files Read

- `openspec/changes/deep-habitat-d0-command-surface-inventory/proposal.md`
- `openspec/changes/deep-habitat-d0-command-surface-inventory/design.md`
- `openspec/changes/deep-habitat-d0-command-surface-inventory/tasks.md`
- `openspec/changes/deep-habitat-d0-command-surface-inventory/specs/habitat-harness/spec.md`
- `openspec/changes/deep-habitat-d0-command-surface-inventory/workstream/phase-record.md`
- `openspec/changes/deep-habitat-d0-command-surface-inventory/workstream/review-disposition-ledger.md`
- `openspec/changes/deep-habitat-d0-command-surface-inventory/workstream/downstream-realignment-ledger.md`
- `openspec/changes/deep-habitat-d0-command-surface-inventory/workstream/closure-checklist.md`
- `docs/projects/habitat-harness/openspec-remediation/agent-scratch/domino-D0-rereview.md`

The D0 packet files were re-read from current disk state after the control
update that said D0 had changed.

## Verdict

Not accepted.

The current packet repaired the latest negative review's two explicit blockers:
stable `surface_id` semantics are now deterministic and plane-specific, and
`compatibility_handling` is now a closed action ontology separate from
`target_owner` and `downstream_dominoes`. The packet also avoids the specific
repaired ambiguity: the D0 packet itself contains no `downstream-decision`, no
"future packet decides" phrasing, and no "handed to downstream owner" phrasing
as a compatibility action.

One ontology blocker remains. `related_surface_ids` is still an untyped edge
bucket even though D0 uses it for several different relationship semantics. That
lets an implementation agent decide vague relationship meaning later, which
trips the D0 falsifier.

## P1 Findings

None.

## P2 Findings

### P2-1: `related_surface_ids` is an untyped relationship bucket for multiple operational meanings

Evidence:

- `design.md` defines `related_surface_ids` as "Other rows when a surface
  appears on multiple planes."
- The same design then uses `related_surface_ids` for rename continuity:
  "If a surface is renamed but compatibility remains, keep the old row and mark
  the new row through `related_surface_ids`."
- It also uses `related_surface_ids` for deprecation/replacement links and for
  generated-derived source authority: generated rows keep their ID and update
  `related_surface_ids` to the source row.
- `specs/habitat-harness/spec.md` requires old rows to remain linked to
  replacements through `related_surface_ids`, and separately requires one
  TypeScript name appearing on multiple planes to link through the same field.

Why this blocks acceptance:

The field currently carries at least four distinct relationship meanings:

- same current surface appears on multiple planes;
- old surface was renamed to a new surface;
- deprecated surface has a replacement;
- generated or derived row is governed by a source-authority row.

Those are not the same edge. They have different direction, lifecycle, and
compatibility consequences. A later packet reading one `related_surface_ids`
value cannot tell whether it means "same public surface on another plane",
"replacement to migrate toward", "historical predecessor", or "source authority
that must be changed instead of generated output." That is generic edge
inflation in ontology terms: the ID reference exists, but the relation does not
say what work it performs.

The problem is not that D0 lacks row IDs or row linking. The problem is that the
relationship semantics are still chosen by prose context or by implementation
judgment. This violates the relationship test and the falsifier: D0 can still be
read as letting an implementation agent choose vague relationship meaning later.

Required repair:

Make row relationships typed. Any of these would be sufficient at packet level:

- replace `related_surface_ids` with a structured relationship list such as
  `related_surfaces: [{ relation, surface_id }]`;
- keep `related_surface_ids` only for same-surface cross-plane links and add
  explicit fields for `replaces_surface_id`, `replaced_by_surface_id`, and
  `source_authority_surface_id`;
- or define a closed relation ontology adjacent to the field, with allowed
  relation values such as `same-surface-other-plane`, `renamed-from`,
  `renamed-to`, `deprecated-replacement`, `generated-from`, and
  `docs-example-of`.

The repair should specify direction, allowed endpoints, and operational meaning
for each relation type. It should also say whether each relationship affects
compatibility handling, source-authority edits, downstream citation, or
migration/deprecation behavior.

## Acceptance Notes

- `surface_id` now passes the ontology identity test at packet level. The design
  names `surface_id` as semantic identity, defines the `D0-<plane>-<surface-key>`
  format, gives plane-specific source-key rules, defines normalization, collision
  handling, non-reuse, rename/deprecation behavior, generated-derived lifecycle,
  and forbids ad hoc implementation identity.
- Plane names are operationally serviceable. They use familiar engineering
  concepts for commands, command JSON, human output, package exports, scripts,
  Nx targets, generators, migrations, hooks, and docs examples. The packet does
  not appear to invent target-domain names unnecessarily.
- State names are sufficiently precise for D0's inventory role. The state
  glossary separates public stability, versioning, package-internal exposure,
  command-only DTOs, tests, generated-derived surfaces, deprecated surfaces,
  refused surfaces, and docs examples. The names are mostly standard or tied to
  a D0-specific compatibility invariant.
- `compatibility_handling` now passes the action ontology test. It is closed to
  `preserve`, `version`, `facade`, `deprecate`, `refuse`, `document-only`, and
  `generated-only`; no value means unclassified; downstream ownership cannot
  substitute for choosing a handling action.
- `target_owner` and `downstream_dominoes` are distinct enough for D0's current
  purpose: owner names who may redesign, while downstream dominoes name packets
  that must cite the row. They would benefit from a closed packet-ID value rule,
  but that gap is not a P1/P2 blocker by itself because compatibility action is
  no longer encoded there.
- Proof/evidence-shaped names are handled as compatibility facts, not accepted
  target semantics. The packet repeatedly states that current `Proof*` names are
  not target language and that later packets may keep, rename, version, or
  remove them only after citing D0 rows.

Skills used: ontology-design, domain-design, information-design, solution-design, typescript-refactoring.
