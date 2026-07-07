# Habitat Method Frames

Status: index for reusable Habitat authority-tree method frames

This directory holds all standalone Habitat method frames. The frames survive
compaction and guide future agents through repeatable Habitat authority-tree
work. They compose with root ontology, tree-shape, operation-kind, and
category authority.

Always apply the canonical source order in
`.habitat/.active/frames/FRAME.md` first. After that router selects an active
method specialization, read the named frame before narrower slice or domino
material. `.habitat/.active/dominoes/README.md` may select a current domino, but
it cannot reorder root authority, accepted baselines, canonical docs, Habitat
authority, or the selected method specialization.

Current frames:

- `RULE-REMEDIATION-WORKSTREAM-FRAME.md`: use when a multi-rule Habitat
  authority-tree remediation effort needs the full execution geometry across
  Layer 1 classification fanout, Layer 2 decision-packet fanout or sequencing,
  and Layer 3 sequential implementation slices. It is the parent orchestration
  frame for the three general rule-remediation frames.
- `RULE-ACTION-CLASSIFICATION-FRAME.md`: use when one live Habitat rule needs a
  light action decision. The output is compact row data: current placement,
  action decision, expected remediation outcome, whether a decision packet is
  needed, and blocker/proof. External workstreams may apply it repeatedly, but
  the frame itself remains one-rule scoped.
- `RULE-DECISION-PACKET-FRAME.md`: use after action classification when one
  rule needs clause decomposition and a durable semantic decision before
  implementation. It produces the full decision packet and does not edit files.
- `RULE-REMEDIATION-SLICE-FRAME.md`: use after classifications and decision
  packets exist to implement one coherent remediation slice through bounded
  edits, verification, review disposition, ledger/domino updates, and Graphite
  closure.
- `POST-DEPENDENCY-TAG-POSITION-FRAME.md`: use immediately after Domino 39 to
  ground the next branch. It records what dependency-tag proved, what it did
  not prove, and the decision gate between Artifact Blueprint Gathering,
  garbage collection, and targeted `_blueprints` pruning.
- `DESTINATION-SIMPLIFICATION-FRAME.md`: use when deciding the immediate
  big-swing destination sequence after several movement slices. It records the
  simplified destination set, the dependency-tag before artifact ordering,
  destination merges, not-blueprint calls, and the artifact vs garbage vs
  `_blueprints` pruning gate after dependency-tag gathering.
- `BLUEPRINT-KIND-GATHERING-FRAME.md`: use when the next move is to affirm one
  constructible blueprint kind, create its top-level blueprint lane, gather all
  whole-rule authority that belongs to that kind, and demote non-fitting
  evidence into honest `rules/` or `_remainder/` lanes. It now includes
  sibling/touched-row passes so an admitted kind can merge, reject, or demote
  adjacent false destinations in the same bounded slice.
- `NICHE-LANE-SHAPING-FRAME.md`: use when a parent niche `rules/` lane is
  acting as a semantic junk drawer and the next move is to shape honest child
  lanes before deeper blueprint, capability, projection, or cleanup work.
- `REMAINDER-RECLAMATION-FRAME.md`: use when an initial idea suggests sorted
  `_remainder/` rows may now be reclaimable into existing blueprint, context,
  or smaller remainder destinations; includes analytics preflight, bounded
  adjacent-slice selection, physical movement, proof, and adversarial review.
- `PROJECTION-CONTRACT-SURFACE-FRAME.md`: use when a retained projection seam
  row cannot truthfully move to an existing blueprint or context and the next
  question is whether a narrow projection contract surface should exist before
  additional movement.
- `REMAINDER-REMEDIATION-ACTION-FRAME.md`: specialization adapter for applying
  the three general rule-remediation frames to reviewed `_remainder` rows. It
  owns remainder-specific entry tests, row status semantics, pending-action
  requirements, and closure additions; it no longer duplicates the full method.

Workstream-specific method frames also live here. The current
closed-structure enforcement frame is
`CLOSED-STRUCTURE-ENFORCEMENT-METHOD-FRAME.md`.

- `BLUEPRINT-AUTHORITY-RATCHET-DESCENT-FRAME.md`: use when opening or
  stewarding a full blueprint-authority ratchet from selected scope through
  prework, execution, repair, positive Habitat ratchet, rule-surface cleanup,
  closure, ascent, and next-scope selection. It does not replace the
  closed-structure enforcement frame; it composes that frame as the local
  positive-assertion primitive and adds the larger descent/ascent geometry.
