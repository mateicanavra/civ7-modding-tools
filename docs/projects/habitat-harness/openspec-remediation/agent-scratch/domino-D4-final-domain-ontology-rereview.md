# D4 Final Domain/Ontology Rereview

## Sources Read

- Required skills read in full:
  - `/Users/mateicanavra/.codex/plugins/cache/rawr-hq/cognition/1.0.0/skills/domain-design/SKILL.md`
  - `/Users/mateicanavra/.codex/plugins/cache/rawr-hq/cognition/1.0.0/skills/information-design/SKILL.md`
  - `/Users/mateicanavra/.codex/plugins/cache/rawr-hq/cognition/1.0.0/skills/ontology-design/SKILL.md`
- Required ontology references read in full:
  - `/Users/mateicanavra/.codex/plugins/cache/rawr-hq/cognition/1.0.0/skills/ontology-design/references/axes.md`
  - `/Users/mateicanavra/.codex/plugins/cache/rawr-hq/cognition/1.0.0/skills/ontology-design/references/examples.md`
  - `/Users/mateicanavra/.codex/plugins/cache/rawr-hq/cognition/1.0.0/skills/ontology-design/references/maintenance.md`
  - `/Users/mateicanavra/.codex/plugins/cache/rawr-hq/cognition/1.0.0/skills/ontology-design/references/operationalization.md`
  - `/Users/mateicanavra/.codex/plugins/cache/rawr-hq/cognition/1.0.0/skills/ontology-design/references/principles.md`
  - `/Users/mateicanavra/.codex/plugins/cache/rawr-hq/cognition/1.0.0/skills/ontology-design/references/representation-choices.md`
  - `/Users/mateicanavra/.codex/plugins/cache/rawr-hq/cognition/1.0.0/skills/ontology-design/references/source-map.md`
  - `/Users/mateicanavra/.codex/plugins/cache/rawr-hq/cognition/1.0.0/skills/ontology-design/references/where-defaults-hide.md`
- D4 active packet read in full:
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d4-orientation-routing/proposal.md`
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d4-orientation-routing/design.md`
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d4-orientation-routing/specs/habitat-harness/spec.md`
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d4-orientation-routing/tasks.md`
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d4-orientation-routing/workstream/phase-record.md`
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d4-orientation-routing/workstream/review-disposition-ledger.md`
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d4-orientation-routing/workstream/downstream-realignment-ledger.md`
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d4-orientation-routing/workstream/closure-checklist.md`
- Remediation context and source packet read in full:
  - `docs/projects/habitat-harness/openspec-remediation/context.md`
  - `docs/projects/habitat-harness/openspec-remediation/packet-index.md`
  - `docs/projects/habitat-harness/phase2-workstream-packets/D4-orientation-and-routing.md`
- Accepted dependency specs/designs read in full:
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d0-command-surface-inventory/design.md`
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d0-command-surface-inventory/specs/habitat-harness/spec.md`
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d2-rule-registry-metadata-contract/design.md`
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d2-rule-registry-metadata-contract/specs/habitat-harness/spec.md`
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d3-workspace-graph-boundary/design.md`
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d3-workspace-graph-boundary/specs/habitat-harness/spec.md`
- D4 scratch reviews read in full:
  - `docs/projects/habitat-harness/openspec-remediation/agent-scratch/domino-D4-review.md`
  - `docs/projects/habitat-harness/openspec-remediation/agent-scratch/domino-D4-domain-ontology-investigation.md`
  - `docs/projects/habitat-harness/openspec-remediation/agent-scratch/domino-D4-code-topology-investigation.md`
  - `docs/projects/habitat-harness/openspec-remediation/agent-scratch/domino-D4-typescript-state-investigation.md`
  - `docs/projects/habitat-harness/openspec-remediation/agent-scratch/domino-D4-openspec-testing-investigation.md`
  - `docs/projects/habitat-harness/openspec-remediation/agent-scratch/domino-D4-information-design-investigation.md`
  - `docs/projects/habitat-harness/openspec-remediation/agent-scratch/domino-D4-cross-domino-investigation.md`

Validation/audit commands run from `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation`:

- `git status --short --branch`
- `bun run openspec -- validate deep-habitat-d4-orientation-routing --strict`
- targeted language audit over the D4 change root for retired graph-state terms, reduced-standard phrases, optional-target phrasing, and overclaiming command guidance
- `rg -n "GraphRefusal|graph-refusal|ruleRoutingFacts|ClassifyResult|PathClassification|DiffClassification|RuleRouting|TargetGuidance|RecoveryInstruction|NonClaim|D14|D0" /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d4-orientation-routing`

## Verdict

Accepted for design/specification only.

No unresolved P1/P2 domain or ontology blockers remain in the current D4 packet on disk. D4 now defines a closed `ClassifyResult` state model, uses exact target language for `ClassifyResult`, `PathClassification`, `DiffClassification`, `RuleRouting`, `TargetGuidance`, `RecoveryInstruction`, and `NonClaim`, and consumes D2/D3 by named facts instead of rebuilding their truth locally.

The packet is not source-implementation-ready. It correctly preserves source blockers for concrete D0 rows, live D2 `ruleRoutingFacts`, and live D3 graph/target facts.

## P1/P2 Findings

None.

The previous P1/P2 blockers are repaired in the active D4 packet:

- The closed state model is now explicit: `project-path`, `workspace-path`, `diff`, `malformed-or-pathless-diff`, `unresolved-owner`, and `graph-refusal`.
- D4 uses D3 `GraphRefusal` / `graph-refusal`; it does not invent a D4-owned graph state.
- Malformed/pathless diff, unresolved owner, unavailable target, and graph-refusal behavior are specified as distinct states or scenarios with refusal/recovery/non-claim requirements.
- D4 consumes D2 `ruleRoutingFacts`; legacy `scope` is compatibility prose only and cannot be route authority.
- D4 consumes D3 project ownership, target availability, unavailable targets, aggregate/workspace targets, and `GraphRefusal`; it does not own graph truth, alias validity, dependency resolution, target existence, or graph read status.
- Public compatibility is no longer left to implementation judgment: D4 names every classify command/JSON/human-output/package-export/docs/generated surface class and blocks source edits until concrete D0 `surface_id` rows and closed D0 handling actions exist.
- The D14 handoff now names required example states and preserves non-support: classify orientation does not imply generator support, MapGen authoring support, rule correctness, target freshness, apply safety, or verify closure.

## P3 Findings

- P3: `packet-index.md` still records D4 as `draft scaffold; global constraints applied; per-domino adversarial gate BLOCKING`. This is stale once this final rereview is accepted, but it is a process/status update, not a D4 domain or ontology blocker.
- P3: `closure-checklist.md` still has unchecked rows for final rereview, OpenSpec validation, language audit, and packet-index status. This is expected before this scratch review lands; the active design/spec content is acceptable.
- P3: The active packet still contains the phrases `supported actions`, `next safe commands`, and `optional target shapes` only in forbidden-language or stop-condition contexts. These are acceptable as negative guidance and do not leak into target terminology.

## Acceptance Conditions

For design/specification acceptance:

- This final rereview is the remaining acceptance condition for the D4 domain/ontology lane.
- `bun run openspec -- validate deep-habitat-d4-orientation-routing --strict` passed locally with: `Change 'deep-habitat-d4-orientation-routing' is valid`.
- The active D4 packet language audit found no retired graph-state target terminology in the D4 change root.

For later source implementation:

- Concrete D0 public-surface rows must exist and be cited before changing classify command invocation, path JSON, diff JSON, human output, package exports, docs examples, or generated surfaces.
- D2 live implementation must expose `ruleRoutingFacts` before D4 source relies on routing projections.
- D3 live implementation must expose classify-safe project ownership, target availability, unavailable target, aggregate/workspace target, and `GraphRefusal` facts before D4 source relies on graph guidance.
- D4 source work must stay inside the approved write set and must not edit D2 registry authority, D3 graph authority, D7 enforcement, D13 scaffolding/generator behavior, or D14 topology-fence implementation.

## Final Recommendation

Accept D4 for design/specification only. There are no remaining P1/P2 domain or ontology blockers in the repaired packet.

After this review is consumed, update the packet index and closure checklist to reflect acceptance status. Do not treat that status update as authorization for source implementation; the implementation blockers above remain active.

Skills used: domain-design, information-design, ontology-design.
