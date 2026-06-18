# D13 Final Domain/Ontology Review

Reviewer: fresh final D13 domain/ontology rereviewer.
Worktree: `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation`.
Branch observed: `codex/d13-scaffolding-refusal-packet`.

## Verdict

Accepted for design/specification only from the domain/ontology lane. I found no unresolved P1/P2 domain, ontology, owner-boundary, naming, or semantic-clarity blockers in the current repaired D13 disk state.

This verdict is explicitly based on a post-cleanup reread after the control refresh. I reread the current repaired packet after the D13 proposal was updated to say D13 owns the generic refusal envelope while D14 owns Authoring Topology blocked-action language, future acceptance criteria, authoring-specific recovery semantics, and source behavior remains blocked behind D14 early-fence language. I also reread the cleaned first-wave OpenSpec scratch state and treated first-wave scratch reports as negative historical input, not target authority.

The acceptance is not source implementation acceptance. Source implementation remains blocked behind the named D0, D2, D8, G-HOST, D10, and D14 implementation facts and compatibility rows.

## Files Read

- `/Users/mateicanavra/.codex/skills/domain-design/SKILL.md`
- `/Users/mateicanavra/.codex/skills/information-design/SKILL.md`
- `/Users/mateicanavra/.codex/skills/ontology-design/SKILL.md`
- `/Users/mateicanavra/.codex/skills/solution-design/SKILL.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/AGENTS.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/docs/projects/habitat-harness/openspec-remediation/context.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/docs/projects/habitat-harness/openspec-remediation/packet-index.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/docs/projects/habitat-harness/phase2-workstream-packets/D13-scaffolding-and-refusal-contracts.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d13-scaffolding-refusal-contracts/proposal.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d13-scaffolding-refusal-contracts/design.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d13-scaffolding-refusal-contracts/specs/habitat-harness/spec.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d13-scaffolding-refusal-contracts/tasks.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d13-scaffolding-refusal-contracts/workstream/closure-checklist.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d13-scaffolding-refusal-contracts/workstream/downstream-realignment-ledger.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d13-scaffolding-refusal-contracts/workstream/phase-record.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d13-scaffolding-refusal-contracts/workstream/review-disposition-ledger.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/docs/projects/habitat-harness/openspec-remediation/agent-scratch/domino-D13-domain-ontology-investigation.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/docs/projects/habitat-harness/openspec-remediation/agent-scratch/domino-D13-typescript-state-investigation.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/docs/projects/habitat-harness/openspec-remediation/agent-scratch/domino-D13-code-vendor-topology-investigation.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/docs/projects/habitat-harness/openspec-remediation/agent-scratch/domino-D13-openspec-information-testing-investigation.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/docs/projects/habitat-harness/openspec-remediation/agent-scratch/domino-D13-cross-domino-product-investigation.md`
- Existing final D13 scratch files present on disk for adjacent lanes were observed as current worktree context, but not used as authority for this domain/ontology verdict.

## Checks Run

- `git status --short --branch`
  - Observed branch `codex/d13-scaffolding-refusal-packet`.
  - Existing repaired packet and scratch changes were already present. I did not edit packet files and did not commit.
- `bun run openspec -- validate deep-habitat-d13-scaffolding-refusal-contracts --strict`
  - Passed: `Change 'deep-habitat-d13-scaffolding-refusal-contracts' is valid`.
- `bun run openspec:validate`
  - Passed: 249 OpenSpec items passed, 0 failed.
- `git diff --check`
  - Passed with no output.
- Post-fix forbidden-term audit state:
  - The exact forbidden-term audit over the D13 change, packet index, context, and D13 scratch is clean after the final first-wave OpenSpec scratch line cleanup.
  - A broader exploratory search still finds allowed control/non-claim mentions such as `not implementation-complete` and historical scratch discussion, but I did not classify those as forbidden audit failures.

## Domain/Ontology Assessment

D13 owner identity is now stable enough for design/specification. The target owner is `Scaffolding and Refusal`, not `generator`, `project generator`, `pattern generator`, or the inherited incomplete `Scaffolding owner` label. The design explicitly gives D13 request classification, pre-write decisions, scaffold receipts, refusal shape, owner routing, recovery instructions, retry condition, no-write result, and command-facing wording for D13-owned scaffold/refusal states.

Adjacent-owner boundaries are clear:

- D0 owns public compatibility decisions and required rows before generator/schema/help/output/docs/export changes.
- D2 owns registry metadata, generated-zone facts, and governance facts.
- D8 owns Pattern Governance admission, baseline acceptance, hook eligibility, diagnostic/local-feedback admission, apply safety, retirement, and registered promotion semantics.
- G-HOST owns host declarations and host-owned scaffold policy.
- D10 owns generated/protected-zone semantics.
- D14 owns Authoring Topology design, authoring-specific blocked-action language, future criteria, recovery semantics, and MapGen authoring implementation.

Inherited and generic names are properly dispositioned. `generator` is constrained to an Nx implementation surface; `kind` is constrained to a public option that must parse into a closed supported kind or refusal; `artifact` is rejected as broad target language; `rule-pack entry` is rejected for candidate output; `lifecycle` is constrained as D8-owned semantics. Current Civ/MapGen/workspace terms including `mod`, `engine`, `control`, `adapter`, `sdk`, `tooling`, and `@civ7` are compatibility/workspace facts unless accepted by D0, D2, or G-HOST. They are not elevated to generic Habitat taxonomy.

Candidate pattern, registered promotion, host policy, and Authoring Topology semantics are correctly owned for design/specification. D13 can write candidate drafts and candidate manifests only as non-active candidate output. Registered promotion is routed/refused through D8 and cannot become D13 admission authority. Host-specific behavior is source-blocked behind G-HOST; D13 only defines the generic `host-policy-missing` refusal shape and must not infer host semantics. Authoring Topology requests are refused through the D14 boundary; D13 owns the generic refusal envelope only.

Legacy proof/evidence product terminology is kept out of D13 target type/code language. The design rejects proof/evidence-shaped vocabulary as D13 product code/type language unless D0 later preserves it for an existing public surface. The current D13 target language uses scaffold requests, pre-write decisions, receipts, command outcomes, handoff records, and refusals.

## P1/P2 Findings

No unresolved P1/P2 findings remain in this final domain/ontology rereview.

Previously reported first-wave P1/P2 findings were repaired in the current disk state:

- closed ontology and state/refusal model now exist;
- Civ/workspace assumptions are constrained as compatibility/workspace facts;
- G-HOST dependency is represented as a source blocker and host-policy refusal boundary;
- candidate output and registered Pattern Governance promotion are separated;
- D13/D14 sequencing is resolved as generic refusal envelope versus D14 authoring-specific authority;
- refusal fields, receipt fields, write/protected sets, and D0 blockers are specified;
- validation no longer relies on nonexistent `habitat generate`;
- the pattern generator rule-pack wording contradiction is a D0 compatibility blocker rather than an accepted D13 semantic claim.

## P3 Notes

- The source packet still says `Scaffolding owner`, but the OpenSpec design explicitly supersedes that inherited label with `Scaffolding and Refusal`. I do not consider the source packet label a blocker because the source packet is controlling input, not final target authority.
- G-HOST remains an incomplete upstream packet in the packet index. This is not a D13 design/spec blocker because D13 records host-specific source behavior as blocked behind accepted/live G-HOST declarations and does not claim host-policy implementation closure.
- Existing first-wave scratch files retain historical blocked verdict text. That is acceptable as negative input because the D13 review ledger imports and dispositions those findings, and current packet files now contain the repaired target contract.

## Acceptance Statement

D13 can be accepted for design/specification only from the final domain/ontology lane. This acceptance does not authorize source implementation, does not update the packet index by itself, and does not remove later source blockers: concrete D0 compatibility rows, live D2/D8 projections, accepted/live G-HOST declarations where consumed, D10 path/zone decisions where touched, and D14 early-fence language for authoring-specific refusals.

Skills used: domain-design, information-design, ontology-design, solution-design.
