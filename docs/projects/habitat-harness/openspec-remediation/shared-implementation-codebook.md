# Deep Habitat Implementation Codebook

This is the shared frame for the implementation agent and the supervisor agent.
It is not a replacement for the OpenSpec packets. It is the compact product
codebook to read before stepping into implementation or supervision.

Resolve paths through `$REMEDIATION_DIR/context.md`. The execution authority is
the packet index plus the per-domino OpenSpec changes: `$REMEDIATION_DIR/packet-index.md`
and `$OPENSPEC_CHANGES/deep-habitat-*`.

## Product Vision

Habitat is a generic repo-local structural toolkit for agents and humans. Its
job is to make repository work less ambiguous: classify before editing, route
to the owning domain, check structure, keep baselines honest, guard generated
and protected zones, apply approved rewrites safely, scaffold supported shapes,
refuse unsupported ones clearly, and hand off command outcomes without claiming
more than the command actually established.

The outcome is not a cleaner pile of TypeScript files. The outcome is a repo
operating surface whose commands, types, diagnostics, transactions, guards,
receipts, refusals, and recovery paths match real maintenance scenarios. The
implementation should make unsupported states harder to represent, not easier
to route around.

## Shared Philosophy

- Product scenarios lead. Start from what an agent or human is trying to do in
  the repo, then implement the owner contract that lets them do it safely.
- Domain language is chosen, not inherited. Current names are behavior evidence,
  not authority. Prefer standard engineering names unless Habitat intentionally
  elevates a special invariant, policy, or compatibility case.
- One owner per invariant. When Graph truth, baseline authority, Grit
  diagnostics, pattern governance, transaction safety, local feedback, host
  policy, or protected-zone truth is needed, consume the owning projection; do
  not recreate it locally.
- Collapse state space. The TypeScript refactor should delete impossible states,
  replace flag soup with discriminated outcomes, and keep public compatibility
  explicit through D0/D1 decisions.
- Refusal is product behavior. A correct refusal is better than a silent green
  path, guessed scaffold, unowned write, or local hook result presented as more
  than local feedback.
- OpenSpec packets are design/specification authority only. They are accepted
  for implementation planning, not proof that source work is complete.

## Operating Posture

Implementation runs one domino at a time in packet-index order unless an
accepted packet explicitly permits a different dependency order. For each
domino, read the source packet, OpenSpec `proposal.md`, `design.md`, `tasks.md`,
`specs/habitat-harness/spec.md`, workstream ledgers, final review scratch, and
downstream realignment before touching source.

The supervisor is a product and domain steward. Their power is direct thread
guidance: read the implementation thread first, intervene only when it protects
the product/domain outcome, and avoid overloading the implementer with broad
theory when a narrow correction is enough. Soft power still holds the line.

Both roles should keep these skills active as operating models: Habitat DRA
Workstream, Systematic Workstream, DRA Structural Watcher, Framing Design,
Domain Design, Information Design, Ontology Design, Solution Design, System
Design, Testing Design, TypeScript Refactoring, and Create Goal.

## Watchpoints

- D0-D15 and G-HOST are complete for design/specification, not source
  implementation. Source work still has the blockers named in each row.
- Do not revive proof/evidence-shaped product code or type names unless a
  packet explicitly earns them for a concrete repo-maintenance scenario.
- Do not invent compatibility handling. Public surfaces cite D0; output-family
  semantics cite D1.
- Do not turn D14 into authoring implementation or D15 into a default substrate
  migration. They are bounded by their accepted trigger/fence contracts.
- Avoid brittle local paths in durable docs. Use `$REMEDIATION_DIR/context.md`
  variables, repo-relative paths, or declared fixtures.
- Generated output, lockfiles, baseline JSON, and host/generated zones are not
  casual edit targets. Touch them only when the active packet owns the reason.

## Where To Go For Detail

- Product/domain frame: `$HABITAT_PROJECT/domain-mapping/domain-design-packet.md`
- Refactor frame: `$HABITAT_PROJECT/domain-refactor-frame.md`
- OpenSpec remediation frame: `$HABITAT_PROJECT/openspec-remediation-frame.md`
- Packet index and sequencing: `$REMEDIATION_DIR/packet-index.md`
- Operational variables: `$REMEDIATION_DIR/context.md`
- Per-domino authority: `$OPENSPEC_CHANGES/<change-id>/`
