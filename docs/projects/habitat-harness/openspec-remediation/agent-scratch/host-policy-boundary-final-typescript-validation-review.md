# G-HOST Final TypeScript / State-Space / Validation Rereview

## Verdict

Accepted for design/specification.

No unresolved P1/P2 findings remain in this lane on the repaired disk state. The packet now specifies a Host Policy Boundary that keeps host-owned facts out of generic Habitat, blocks missing/unavailable/malformed/conflicting host policy from becoming pass/allow/not-applicable, and defers source implementation behind D0/D1 plus accepted/live G-HOST projections.

## Scope Reviewed

- Source packet: `docs/projects/habitat-harness/phase2-workstream-packets/G-HOST-host-policy-boundary-gate.md`
- Current packet: `openspec/changes/deep-habitat-host-policy-boundary-gate/**`
- Remediation routers: `docs/projects/habitat-harness/openspec-remediation/context.md`, `docs/projects/habitat-harness/openspec-remediation/packet-index.md`

## P1 Findings

None.

## P2 Findings

None.

## P3 Findings

None.

## Review Notes

- State-space collapse is now explicit. `design.md:123-143` defines declared, missing, unavailable, malformed, conflicting, and not-applicable read states, and explicitly prohibits collapsing missing/unavailable/malformed/conflicting into pass, allow, or not-applicable. `proposal.md:105-114` carries the same condition as a stop condition, and `spec.md:25-28` makes invalid declaration sources a normative bad-case scenario.
- The canonical owner/module shape is bounded enough for design/specification. `design.md:15-41` assigns G-HOST as the single owner of host policy declarations, recovery instructions, apply gates, project support/refusal facts, declaration states, and consumer projections, while D9/D10/D13/D14 consume projections without recreating host policy locally.
- Declaration variants are closed at the spec level. `design.md:106-122` names the bounded `HostPolicyDeclaration` family, while `spec.md:30-55` requires those closed declaration variants for surfaces, apply gates, and project support/refusal.
- Consumer projection boundaries are repaired. `design.md:155-214` defines separate D10, D9, D13, and D14 projections; `spec.md:57-84` requires those consumers to consume projections rather than infer host policy from paths, package names, schema enums, current literals, or thrown strings.
- Broad optional DTO and escape-hatch risks are directly blocked. `design.md:139-143` rejects unknown ids and unavailable sources as empty lists or optional fields, and `design.md:243-245` forbids unbounded optional DTOs, free-form notes, and untyped JSON records for host facts.
- Public compatibility blockers are preserved. `proposal.md:91-103`, `design.md:280-292`, `spec.md:86-103`, and `tasks.md:37-45` require D0 rows and D1 output-family/non-claim handling before any touched public or durable source surface changes.
- Validation gates are falsifying rather than demonstrative. `design.md:294-317`, `spec.md:105-127`, `tasks.md:47-64`, and `phase-record.md:32-55` require bad-case coverage for declared, missing, unavailable, malformed, conflicting, unsupported, and not-applicable states, plus consumer tests proving missing/invalid projections block local host-policy computation.
- The write/protected set is adequately constrained for a non-implementation packet. `design.md:247-264` limits later candidate source paths subject to D0 rows, and `design.md:266-278` forbids hand edits to generated outputs, lockfiles, `dist/**`, `mod/**`, `.civ7/outputs/**`, and unrelated D9/D10/D13/D14 behavior.
- `mod/**` drift-observation rows are not consumable D10 guard facts. `design.md:70-72` marks the `mods/mod-swooper-maps/mod/**` rows as drift-observation input only with no D10 guard/protected/generated projection, and `design.md:76-79` explicitly blocks D10 consumption until a later accepted declaration row upgrades them into `HostPolicyDeclaration`.
- The packet avoids source implementation authorization. `proposal.md:45-52`, `tasks.md:12-14`, `review-disposition-ledger.md:3-9`, `closure-checklist.md:16-25`, and `packet-index.md:28` all keep G-HOST pending final review and source implementation blocked until acceptance and required compatibility/projection gates exist.

## Validation Run

- `bun run openspec -- validate deep-habitat-host-policy-boundary-gate --strict` passed.
- `bun run openspec:validate` passed for the full OpenSpec corpus.

## Residual Risk

The remaining risk is implementation-time: source work still needs to realize the design as discriminated/closed TypeScript states, not as a flat optional projection DTO. That risk is already captured as a source blocker by `design.md:243-245`, `tasks.md:18-35`, and `tasks.md:49-64`; it is not an unresolved design/specification blocker.
