# G-HOST Host Policy Boundary Cross-Domino Product Review

## Lane Verdict

Blocked for design/specification acceptance.

G-HOST is the right owner boundary, but the OpenSpec packet does not yet own the
host declaration/refusal contract that D9, D10, D13, and D14 need. Those packets
can still infer host policy differently: D10 already defines host-owned surface
fields, D9 defines host apply-gate behavior, D13 defines host-owned scaffold
refusals, and D14 defines the authoring fence. Accepting G-HOST as written would
turn a named owner into a pointer, not an authority.

## P1 Findings

### P1-1: G-HOST names the owner but does not define the declaration ontology its consumers require

The source packet requires a host declaration/refusal contract for generated and
protected zones, regeneration commands, pattern-specific apply gates,
unsupported host-owned project/generator/authoring kinds, future authoring
triggers, and non-claims
(`docs/projects/habitat-harness/phase2-workstream-packets/G-HOST-host-policy-boundary-gate.md:31-40`).
The OpenSpec packet collapses that into "Define host policy declaration and
refusal boundary" and one two-scenario requirement
(`openspec/changes/deep-habitat-host-policy-boundary-gate/design.md:22-26`,
`openspec/changes/deep-habitat-host-policy-boundary-gate/specs/habitat-harness/spec.md:3-13`).

That leaves the declaration shape to consumers. D10 already defines required
facts such as stable id, matcher, surface kind, owner authority, allowed lanes,
recovery instruction, and non-claims
(`openspec/changes/deep-habitat-d10-protected-zone-authority/design.md:46-84`,
`openspec/changes/deep-habitat-d10-protected-zone-authority/specs/habitat-harness/spec.md:22-34`).
D9 defines host apply-gate blocking and MapGen public-ops consumption
(`openspec/changes/deep-habitat-d9-transformation-transaction/specs/habitat-harness/spec.md:138-158`).
D13 defines `host-policy-missing` scaffold refusals
(`openspec/changes/deep-habitat-d13-scaffolding-refusal-contracts/specs/habitat-harness/spec.md:62-81`).

Repair:

- Add G-HOST-owned closed declaration families before acceptance:
  `host-generated-surface-declaration`, `host-protected-surface-declaration`,
  `host-apply-gate-declaration`, `host-scaffold-policy-declaration`,
  `host-policy-unavailable`, `host-policy-missing`, `host-policy-malformed`,
  and `host-policy-conflict`.
- Define required fields per family: host declaration id, host owner, matcher or
  gate trigger, owning downstream consumer, allowed authority lane, recovery or
  regeneration instruction, D1 non-claim ids, D0 surface ids when public, and
  source blocker when the declaration is absent.
- State that D10, D9, and D13 consume G-HOST projections and may not locally
  invent missing fields.

### P1-2: D9 is a direct G-HOST consumer, but the OpenSpec packet and index omit it from G-HOST enablement

The source packet says G-HOST unblocks "D10, D13, and D9 host-policy
consumption," while D9 still depends on D10 for generated/protected path
authority
(`docs/projects/habitat-harness/phase2-workstream-packets/G-HOST-host-policy-boundary-gate.md:42-50`).
The OpenSpec proposal and packet index enable only D10 and D13
(`openspec/changes/deep-habitat-host-policy-boundary-gate/proposal.md:42-47`,
`docs/projects/habitat-harness/openspec-remediation/packet-index.md:28-30`).

D9's accepted downstream ledger still says it requires G-HOST declarations for
host-specific apply gates, including current MapGen public-ops validation
(`openspec/changes/deep-habitat-d9-transformation-transaction/workstream/downstream-realignment-ledger.md:16-17`).
Current source confirms why: generic transaction code still validates
`@mapgen/domain/**/ops` imports and `mods/mod-swooper-maps` public-ops paths
inside `grit-apply.ts`
(`tools/habitat-harness/src/lib/grit-apply.ts:830-915`).

Repair:

- Add D9 to G-HOST `Enables` and downstream realignment as a direct host
  apply-gate consumer.
- Keep the D9/D10 split explicit: D9 consumes G-HOST apply-gate declarations;
  D9 consumes D10 path-authority projections for generated/protected/host-owned
  mutation surfaces.
- Add a G-HOST spec scenario for MapGen public-ops validation as a declared
  host apply gate and a missing-gate refusal.
- Update packet index/control rows so G-HOST enables D9 host-gate consumption
  without implying D9 can skip D10 path authority.

### P1-3: G-HOST and D14 leave authoring ownership ambiguous for host-owned unsupported requests

The source packet includes unsupported host-owned project, generator, or
authoring kinds and future authoring topology triggers in the G-HOST contract
(`docs/projects/habitat-harness/phase2-workstream-packets/G-HOST-host-policy-boundary-gate.md:37-40`).
D14, however, owns authoring-specific blocked-action language, future criteria,
and authoring refusal facts; it also states that host policy does not imply
MapGen authoring support unless a later accepted authoring contract consumes it
(`openspec/changes/deep-habitat-d14-authoring-topology-fence/design.md:20-27`,
`openspec/changes/deep-habitat-d14-authoring-topology-fence/specs/habitat-harness/spec.md:38-62`).

The G-HOST OpenSpec packet does not define this split. As a result, D13 could
interpret a host-owned scaffold request through G-HOST while D14 interprets an
authoring-looking request through the authoring fence. That is exactly the stop
condition in the user frame: D14 remains a fence unless G-HOST explicitly
defines a host declaration needed by later owner packets.

Repair:

- Add a G-HOST/D14 boundary section: G-HOST may declare host-owned scaffold
  policy for non-authoring host shapes; D14 owns authoring-looking request
  classification, blocked action, future criteria, and authoring non-claims.
- Add a G-HOST non-claim: a host declaration never implies MapGen recipe,
  domain, operation, stage, step, registry, Studio artifact, or topology
  generator support.
- Add D14 to G-HOST downstream realignment as a fence consumer/non-owner, not as
  an implementation unblocker.

## P2 Findings

### P2-1: Public-surface compatibility is acknowledged but not routed to concrete D0 rows

The source packet says the host declaration file location becomes a new internal
or public config surface and D0 must classify it
(`docs/projects/habitat-harness/phase2-workstream-packets/G-HOST-host-policy-boundary-gate.md:87-91`).
The OpenSpec proposal only lists D0 as a requirement and says generic commands
may report host policy facts through explicit records
(`openspec/changes/deep-habitat-host-policy-boundary-gate/proposal.md:37-47`,
`openspec/changes/deep-habitat-host-policy-boundary-gate/proposal.md:64-66`).

Repair:

- Add a D0 surface inventory subsection for G-HOST: host declaration file/config
  location, package exports if declaration/projection types are exported,
  command/hook/refusal output fields, docs examples, and generator help/errors
  where host-owned refusals are public.
- Mark source implementation blocked until concrete D0 rows exist for every
  touched public or durable surface.
- Add D1 output-family mapping for host-policy refusals and non-claim ids before
  implementation.

### P2-2: The packet says the write set is in `design.md`, but `design.md` does not name it

The proposal says the expected Habitat implementation write set is named in
`design.md`
(`openspec/changes/deep-habitat-host-policy-boundary-gate/proposal.md:49-54`).
The design only says the later executor needs a concrete write set and protected
path list before implementation
(`openspec/changes/deep-habitat-host-policy-boundary-gate/design.md:46-54`).
That defers source blocker classification to implementation.

Current source evidence identifies at least these blockers:
`generated-zones.ts` embeds Swooper/Civ7 generated paths and remediation text
(`tools/habitat-harness/src/lib/generated-zones.ts:17-37`);
`grit-apply.ts` embeds MapGen public-ops validation
(`tools/habitat-harness/src/lib/grit-apply.ts:830-915`);
the project generator schema admits current-repo kinds while runtime supports
only plugin/foundation/app
(`tools/habitat-harness/src/generators/project/schema.json:15-37`,
`tools/habitat-harness/src/generators/project/generator.cjs:51-56`).

Repair:

- Add a reviewed later implementation write set for G-HOST-owned declaration
  records, declaration parser/schema, consumer projection tests, and docs rows.
- Add protected paths: generated outputs, lockfiles, dist/mod outputs,
  `.civ7/outputs/**`, MapGen/Civ source, D9/D10/D13/D14 implementation files
  unless consumed through reviewed projections, and other OpenSpec packets
  except explicit status/control realignment rows.
- State which current source blockers remain blocked behind D10, D9, D13, or
  D14 rather than G-HOST source work.

### P2-3: Validation gates do not falsify host-policy separation

The OpenSpec validation gates are classify over one Swooper config path,
OpenSpec validation, full OpenSpec validation, and diff hygiene
(`openspec/changes/deep-habitat-host-policy-boundary-gate/proposal.md:74-79`).
Those gates can pass without proving missing host policy refuses, host apply
gates are declared, D10/D9/D13 consume projections, or authoring remains D14.
The source packet requires declaration/refusal shape, D9/D10/D13 consumer
matrix, schema tests, missing declaration tests, apply gate behavior, and
unsupported host-shape non-claim tests
(`docs/projects/habitat-harness/phase2-workstream-packets/G-HOST-host-policy-boundary-gate.md:93-107`).

Repair:

- Add design-time review oracles: host path/gate inventory, declaration matrix,
  D9/D10/D13/D14 consumer matrix, D0/D1 public/output mapping, and stop-condition
  audit.
- Add later implementation gates: host declaration schema tests,
  missing/malformed/conflicting declaration tests, unregistered host policy bad
  case, D10 generated/protected consumer tests, D9 apply-gate missing/declaration
  tests, D13 host-owned scaffold refusal tests, and D14 authoring non-claim
  tests.
- Preserve the classify command only as orientation evidence; it does not prove
  host policy correctness.

## P3 Findings

### P3-1: G-HOST control records still read as packet preparation rather than an acceptance-ready packet

The review ledger only records global constraints and a pending per-domino
adversarial gate. The downstream ledger has generic "later domino packets"
instead of row-level D9/D10/D13/D14 repairs. The closure checklist still has all
design readiness boxes unchecked.

Repair:

- After fixing P1/P2 items, update the review ledger with this review and
  accepted/rejected dispositions.
- Replace the generic downstream row with separate D9, D10, D13, D14, D0, and
  D1 rows.
- Only mark design/specification acceptance after strict OpenSpec validation,
  full OpenSpec validation, diff hygiene, and the repaired per-domino review
  ledger show no accepted unresolved P1/P2 findings.

## Downstream Realignment Repairs

- D10: consume only G-HOST-owned host declarations for host-owned path, owner,
  regeneration/recovery, and missing/unavailable states. Move any host field
  invented in D10 back to G-HOST or mark it as a D10 projection field derived
  from G-HOST.
- D9: consume G-HOST apply-gate declarations directly and D10 path-authority
  projections for generated/protected/host-owned paths. Add missing-gate refusal
  and MapGen public-ops declaration scenarios.
- D13: consume G-HOST only for host-owned, non-authoring scaffold policy and
  `host-policy-missing` refusals. Consume D14 for authoring-specific refusal
  facts.
- D14: record that G-HOST declarations cannot open authoring support. Future
  authoring work may consume host declarations only through a later accepted
  authoring owner packet.
- D0: add concrete rows for host declaration config/file location, public
  command/refusal output, generator help/errors, docs examples, and exported
  types if any are public.
- D1: map host-policy refusals, recovery instructions, and non-claim ids into
  the accepted output-family/refusal model.

## Packet-Index And Control Repairs

- Change the G-HOST row to enable `D10, D13, and D9 host-gate consumption`.
- Keep D9's requires cell explicit: D9 requires D10 for generated/protected path
  authority and G-HOST for host-specific apply gates where touched.
- Add G-HOST context variables and final review variable names if this packet is
  moving to acceptance status.
- Update G-HOST `proposal.md`, `design.md`, `tasks.md`, `spec.md`,
  `workstream/downstream-realignment-ledger.md`, and
  `workstream/review-disposition-ledger.md` before acceptance.
- Keep the packet status blocked until the repaired review ledger records no
  accepted unresolved P1/P2 findings.

## Accepted / Blocked Lane Verdict

Blocked.

The lane should accept the owner direction: host policy belongs outside generic
Habitat core, and D10/D9/D13/D14 are the right consumer/fence packets. The lane
must block G-HOST acceptance because the owner packet does not yet define the
contract its consumers are already trying to consume. Stop condition is met:
D9, D10, D13, and D14 can still infer host policy differently.
