# D8 Final Cross-Domino Rereview

Status: ACCEPTED FOR DESIGN/SPECIFICATION ONLY.

D8 Pattern Governance satisfies the cross-domino acceptance bar for the
repaired OpenSpec packet. I found no unresolved P1/P2 findings in D8
dependencies, downstream handoffs, source blockers, packet-index status
language, or D9/D11/D13/G-HOST non-claims.

This review does not authorize source implementation, does not mark D8
implementation-complete, and does not update the packet index by itself.

## Scope

Reviewed as design/specification only:

- `openspec/changes/deep-habitat-d8-pattern-governance/**`.
- `docs/projects/habitat-harness/openspec-remediation/context.md`.
- `docs/projects/habitat-harness/openspec-remediation/packet-index.md`.
- D8 first-wave scratch under
  `docs/projects/habitat-harness/openspec-remediation/agent-scratch/domino-D8-*.md`.
- Existing final D8 domain/ontology, TypeScript/validation, and
  OpenSpec/information rereviews.
- Accepted D0-D7 packet records where they define D8-consumed contracts.
- Source and starter packets/current incomplete records for D9, D11, D13, and
  G-HOST.
- Current Pattern Authority source and tests as behavior evidence only.

Skill anchors read before review:

- `/Users/mateicanavra/.agents/skills/domain-design/SKILL.md`.
- `/Users/mateicanavra/.agents/skills/information-design/SKILL.md`.
- `/Users/mateicanavra/.agents/skills/solution-design/SKILL.md`.
- `/Users/mateicanavra/.agents/skills/system-design/SKILL.md`.
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/civ7-open-spec-workstream/SKILL.md`.
- Civ7 Open Spec Workstream references: `source-map.md`, `phase-loop.md`,
  `artifact-contracts.md`, and `validation-checks.md`.

## Cross-Domino Findings

No P1/P2 findings.

### Dependencies

Accepted. D8 now names the full consumed-contract set and separates design-time
acceptance from source implementation blockers.

The repaired proposal requires D0, D1, D2, D5, D6, D7, and D10/G-HOST where
touched. The phase record adds D9 and D13 as handoff dependencies rather than
D8-owned implementation domains. The consumed-contract matrix in
`openspec/changes/deep-habitat-d8-pattern-governance/design.md` explicitly
forbids D8 from changing public surfaces without D0 rows, inventing D1 output
families, reading whole D2 rows as authority, deciding D5 baseline truth,
parsing raw D6 diagnostics, building D7 reports, encoding D10/G-HOST policy,
executing D9 transactions, or creating D13 generator files.

This repairs the first-wave D1/D7/D10/G-HOST omission. Conditional D7 and
D10/G-HOST handling is acceptable because D8 only consumes those owners where
current-tree outcomes, protected zones, host policy, scan roots, probes, apply
paths, or host gates are touched.

### Downstream Handoffs

Accepted. The downstream ledger now gives exact owner-facing rows for D0, D1,
D2, D5, D6, D7, D10/G-HOST, D9, D11, D13, recovery, docs, tests, and packet
index movement.

The key downstream projections are complete:

- D9 consumes only `ApplyAdmissionProjection` or explicit D8 apply refusal.
- D11 consumes local-feedback eligibility only through D8/D7/D10 projections.
- D13 consumes `CandidateHandoffProjection` and hands registration/admission to
  D8.
- Recovery records consume `PatternRecoveryProjection`.

No downstream packet is forced to reconstruct lifecycle semantics from file
presence, Grit markdown, baseline files, generator options, rule lanes, hook
fields, or whole Pattern Authority manifests.

### Source Blockers

Accepted. Source implementation remains blocked behind concrete prerequisites
instead of being treated as a design cleanup task.

The packet blocks source work behind concrete D0 rows, D1 output-family
citations, live D2 `ruleGovernanceFacts`/`ruleGritFacts`/`ruleBaselineFacts`,
D5 `BaselineAuthorityProjection` or refusal, D6 diagnostic projections,
accepted D7 check outcome projections where consumed, D10/G-HOST protected-zone
or host-policy contracts where touched, and D9/D13 handoff inputs where apply
or candidate behavior is touched.

The write set and protected paths in `design.md` are sufficient for later
implementation planning and protect baselines, apply patterns, Grit config,
hook/command/apply/baseline libraries, product roots, generated artifacts,
lockfiles, vendor caches, and unrelated source roots unless an owning packet
authorizes the change.

### Packet Index Language

Accepted with sequencing constraint. At review time, the live packet index still
kept D8 in blocking packet status, which was correct until final rereviews and
validation were aggregated by the workstream owner.

The downstream ledger provides complete post-acceptance language for the D8
index row: design/specification accepted only, final rereviews found no
unresolved P1/P2, not implementation-complete, and source implementation still
blocked behind D0/D1/D2/D5/D6/D7/D10/G-HOST prerequisites where touched.

At closure aggregation time, the domain/ontology, TypeScript/validation,
OpenSpec/information, code/vendor topology, and cross-domino final review files
exist on disk and record no unresolved P1/P2 findings. Packet-index movement
depends on the workstream owner recording those lanes plus validation in the
durable control records.

### D9/D11/D13/G-HOST Non-Claims

Accepted. D8 now publishes the required adjacent-domain non-claims:

- D9 owns dry-run, live writes, rollback, path approval, formatter handoff,
  transaction gates, recovery, and transaction failure semantics. D8 apply
  admission does not execute or approve writes.
- D11 owns hook sequencing, staged-file behavior, local output, and
  local-feedback non-claims. D8 local-feedback admission is eligibility only.
- D13 owns candidate file creation and candidate/refusal surfaces. D8 owns
  registration/admission; D13 must not write active Grit patterns, rule rows,
  baseline state, hook eligibility, or apply admission by implication.
- G-HOST owns host declarations, generated/protected-zone ownership, host
  gates, unsupported host starter shapes, and host-policy missing refusals. D8
  may reference host-policy decisions but must not encode Civ/MapGen host
  semantics inside Pattern Governance.

## Validation Observed

- `bun run openspec -- validate deep-habitat-d8-pattern-governance --strict`:
  passed.
- `bun run openspec:validate`: passed, 249 items validated.
- `git diff --check`: passed.
- Complete-standard wording audit over D8 packet, D8 scratch, and packet index
  found no active reduced-standard D8 guidance beyond the canonical D13 packet
  title/slug classified by the closure record as exact traceability text.

## Residual Non-Blocking Notes

- The packet index must not be updated to accepted status until the remaining
  final-review aggregation and validation rules in the D8 workstream records
  are satisfied.
- D8 source implementation remains a later phase. The repaired packet is
  accepted as design/specification input only.

Skills used: domain-design, information-design, solution-design, system-design,
civ7-open-spec-workstream.
