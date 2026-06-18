# D8 Final OpenSpec / Information Rereview

Status: ACCEPTED FOR DESIGN/SPECIFICATION ONLY

This rereview assesses the repaired D8 Pattern Governance packet as
design/specification input only. It does not authorize source refactor work, it
does not mark D8 implementation-complete, and it does not replace the remaining
final rereview lanes or packet-index closure step.

## Sources Read

- Mandatory skill anchors:
  - `/Users/mateicanavra/.agents/skills/domain-design/SKILL.md`
  - `/Users/mateicanavra/.agents/skills/information-design/SKILL.md`
  - `/Users/mateicanavra/.agents/skills/testing-design/SKILL.md`
  - `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/civ7-open-spec-workstream/SKILL.md`
  - `civ7-open-spec-workstream/references/source-map.md`
  - `civ7-open-spec-workstream/references/artifact-contracts.md`
  - `civ7-open-spec-workstream/references/validation-checks.md`
  - `civ7-open-spec-workstream/references/phase-loop.md`
- Repo/workflow context:
  - `AGENTS.md`
  - `docs/projects/habitat-harness/openspec-remediation/context.md`
  - `docs/projects/habitat-harness/openspec-remediation/packet-index.md`
  - `docs/projects/habitat-harness/openspec-remediation/review-disposition-ledger.md`
- D8 controlling and repaired packet inputs:
  - `docs/projects/habitat-harness/phase2-workstream-packets/D8-pattern-governance.md`
  - `openspec/changes/deep-habitat-d8-pattern-governance/proposal.md`
  - `openspec/changes/deep-habitat-d8-pattern-governance/design.md`
  - `openspec/changes/deep-habitat-d8-pattern-governance/tasks.md`
  - `openspec/changes/deep-habitat-d8-pattern-governance/specs/habitat-harness/spec.md`
  - `openspec/changes/deep-habitat-d8-pattern-governance/workstream/phase-record.md`
  - `openspec/changes/deep-habitat-d8-pattern-governance/workstream/review-disposition-ledger.md`
  - `openspec/changes/deep-habitat-d8-pattern-governance/workstream/downstream-realignment-ledger.md`
  - `openspec/changes/deep-habitat-d8-pattern-governance/workstream/closure-checklist.md`
- D8 first-wave findings:
  - `docs/projects/habitat-harness/openspec-remediation/agent-scratch/domino-D8-domain-ontology-investigation.md`
  - `docs/projects/habitat-harness/openspec-remediation/agent-scratch/domino-D8-typescript-state-investigation.md`
  - `docs/projects/habitat-harness/openspec-remediation/agent-scratch/domino-D8-code-vendor-topology-investigation.md`
  - `docs/projects/habitat-harness/openspec-remediation/agent-scratch/domino-D8-openspec-information-testing-investigation.md`
  - `docs/projects/habitat-harness/openspec-remediation/agent-scratch/domino-D8-cross-domino-investigation.md`

## Review Result

No unresolved P1/P2 findings remain for the OpenSpec/information rereview lane.

The repaired packet now gives a later implementation agent a complete enough
Pattern Governance contract without asking that agent to invent lifecycle names,
admission inputs, refusal states, validation split, public-surface blockers,
write ownership, or downstream projections while editing source.

## Packet Assessment

### Proposal And Scope

`proposal.md` now states D8's product purpose as preventing candidates,
diagnostics, local feedback, apply-capable patterns, refusals, and retirements
from collapsing into one accidental state. It also classifies current source as
present-state evidence only, not target authority.

The proposal repairs the first-wave dependency gap by naming D0, D1, D2, D5,
D6, D7, D10, and G-HOST conditions where D8 consumes public-surface,
output/refusal, registry, baseline, diagnostic, current-tree, protected-zone,
or host-policy authority. It also blocks source implementation behind concrete
D0 rows for generator schema/output, manifest JSON, exports, `rules.json`,
Grit paths, baselines, command output, docs, and guidance.

The stop conditions are specific and useful: file presence, broad registry
fields, baseline files, Grit frontmatter, generator options, diagnostic
admission, hook fields, and legacy active Grit rows without `manifestPath` are
all rejected as admission authority.

### Design And Domain Information

`design.md` is now the packet decision center. It defines current behavior as
incomplete target evidence, gives D8 a precise domain boundary, records vendor
boundaries for Grit/Biome/Nx, and separates Pattern Governance from Pattern
Authority.

The target ontology is closed enough for design/specification acceptance:
`candidate-draft`, `candidate-under-review`, `manifest-invalid-candidate`,
`diagnostic-admitted`, `local-feedback-admitted`, `apply-admitted`, `refused`,
and `retired` are defined with owner inputs and consumer meaning. The packet
also fixes historical naming risk by mapping `registered-advisory`,
`registered-enforced`, `authorityAccepted`, `hookScope`, `applySafety`, Grit
frontmatter/prose, and baseline file presence to compatibility or adjacent-owner
meanings instead of treating them as D8 authority.

The consumed-contract matrix and projection table are sufficient for
implementation readiness planning. D8 consumes D0/D1/D2/D5/D6/D7/D10/G-HOST
contracts and publishes narrow projections for D2, D6, D7, D9, D11, D13,
recovery records, and users. This resolves the earlier risk that downstream
owners would inspect whole manifests, registry rows, Grit markdown, baseline
files, or generator options to recreate lifecycle semantics.

The refusal taxonomy is now closed for implementation. The TypeScript state
model, expected refactor moves, write set, protected paths, validation matrix,
and non-claims give source implementers enough shape without authorizing source
edits from this packet review.

### Spec Delta

`specs/habitat-harness/spec.md` now has multiple falsifiable requirement
families instead of one broad requirement. It covers lifecycle admission,
candidate non-authority, manifest validation as necessary-but-not-sufficient,
D2 registry projection consumption, D5 baseline authority consumption, D6
diagnostic capability consumption, explicit local-feedback admission, separated
apply admission, stable refusal reasons, and downstream narrow projections.

The scenarios include the central bad cases from the first-wave review:
candidate output cannot become active by file presence, manifest success still
requires owner inputs, broad rule rows cannot imply admission, baseline file
presence cannot admit a pattern, native Grit success cannot imply D8 admission,
diagnostic admission cannot become apply-ready, D9 cannot read diagnostic state
as write authority, and D13 cannot register active state by implication.

### Tasks And Execution Readiness

`tasks.md` is now an implementation sequence, not a list of design prompts. It
starts with packet readiness and source blockers, then moves through current
behavior characterization, state model introduction, candidate and manifest
admission, diagnostic/local-feedback admission, apply handoff, consumer
projections, validation, downstream realignment, and closure.

The source blockers are appropriately explicit: D0 rows, D1 output-family
citations, live D2 projections, D5 baseline authority/refusal, D6 diagnostic
inputs, and conditional D7/D10/G-HOST/D11/D9 prerequisites must exist where
touched. The validation section correctly separates source implementation gates
from design-time OpenSpec validation.

### Workstream Control Records

The phase record, review ledger, downstream ledger, and closure checklist now
match the repaired packet state.

The review ledger imports every first-wave P1/P2 family and records repair
evidence instead of treating global constraints as acceptance evidence. The
phase record uses `$ACTIVE_REMEDIATION_WORKTREE` and
`$ACTIVE_REMEDIATION_BRANCH`, which resolve to the requested worktree and
`codex/d8-pattern-governance-packet` in `context.md`. The downstream ledger
names concrete D0, D1, D2, D5, D6, D7, D10/G-HOST, D9, D11, D13, recovery,
docs, tests, and packet-index dispositions.

The packet index intentionally still marks D8 as blocking. That is not a
remaining defect for this lane because the D8 closure checklist and downstream
ledger both require packet-index movement only after all final rereviews and
validation pass. The current index row enforces the active gate and prevents
implementation from starting early.

## Validation Evidence

Commands run from
`/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation`:

| Gate | Result | Non-claim |
| --- | --- | --- |
| `bun run openspec -- validate deep-habitat-d8-pattern-governance --strict` | Passed: `Change 'deep-habitat-d8-pattern-governance' is valid`. | OpenSpec shape only; does not prove source behavior. |
| `bun run openspec:validate` | Passed: 249 items passed, 0 failed. | Full OpenSpec corpus shape only; does not prove Habitat runtime behavior. |
| `git diff --check` | Passed with no output. | Diff hygiene only. |
| Complete-standard wording audit over `$D8_CHANGE/**`, D8 scratch, and packet index | No active reduced-standard guidance found in the repaired D8 packet, D8 scratch, or packet index beyond the canonical D13 packet title/slug classified by the closure record as exact traceability text rather than D8 guidance. | Historical scratch remains negative-control input, not current guidance. |

## Closure Notes

- No source implementation was reviewed as complete or authorized.
- No packet artifact needs an OpenSpec/information P1/P2 repair before this
  lane can accept the repaired D8 design/specification packet.
- Remaining unchecked closure items are expected workflow state: other final
  rereview lanes, packet-index update, and final closure records must still run
  before the D8 packet as a whole can move out of blocking status.
- Source implementation remains blocked behind the concrete prerequisites named
  in the D8 proposal, phase record, downstream ledger, and tasks.

Skills used: domain-design, information-design, testing-design,
civ7-open-spec-workstream.
