# D11 Final TypeScript/Validation Rereview

Lane: TypeScript state-space and validation.

Worktree: `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation`

Branch: `codex/d11-local-feedback-packet`

Reviewed change: `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d11-local-feedback`

## Read Register

Mandatory anchoring read:

- `/Users/mateicanavra/.agents/skills/domain-design/SKILL.md`
- `/Users/mateicanavra/.agents/skills/information-design/SKILL.md`
- `/Users/mateicanavra/.agents/skills/ontology-design/SKILL.md`
- `/Users/mateicanavra/.agents/skills/ontology-design/references/axes.md`
- `/Users/mateicanavra/.agents/skills/ontology-design/references/examples.md`
- `/Users/mateicanavra/.agents/skills/ontology-design/references/maintenance.md`
- `/Users/mateicanavra/.agents/skills/ontology-design/references/operationalization.md`
- `/Users/mateicanavra/.agents/skills/ontology-design/references/principles.md`
- `/Users/mateicanavra/.agents/skills/ontology-design/references/representation-choices.md`
- `/Users/mateicanavra/.agents/skills/ontology-design/references/source-map.md`
- `/Users/mateicanavra/.agents/skills/ontology-design/references/where-defaults-hide.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/typescript-refactoring/SKILL.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/typescript-refactoring/references/llm-slop-cleanup.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/typescript-refactoring/references/paradigms-and-patterns.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/typescript-refactoring/references/refactoring-mechanics.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/typescript-refactoring/references/smell-catalog.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/typescript-refactoring/references/worked-examples.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/typescript-refactoring/assets/refactor-findings-template.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/typescript-refactoring/assets/refactor-plan-template.md`
- `/Users/mateicanavra/.agents/skills/testing-design/SKILL.md`
- `/Users/mateicanavra/.agents/skills/testing-design/references/axes.md`
- `/Users/mateicanavra/.agents/skills/testing-design/references/principles/principles.md`
- `/Users/mateicanavra/.agents/skills/testing-design/references/principles/universal.md`
- `/Users/mateicanavra/.agents/skills/testing-design/references/principles/axis-1-2-assurance-and-mode.md`
- `/Users/mateicanavra/.agents/skills/testing-design/references/principles/axis-3-4-legibility-and-discovery.md`
- `/Users/mateicanavra/.agents/skills/testing-design/references/principles/axis-5-6-evidence-and-speed.md`
- `/Users/mateicanavra/.agents/skills/testing-design/references/principles/heuristics.md`
- `/Users/mateicanavra/.agents/skills/testing-design/references/defaults/where-defaults-hide.md`
- `/Users/mateicanavra/.agents/skills/testing-design/references/defaults/problem-framing.md`
- `/Users/mateicanavra/.agents/skills/testing-design/references/defaults/execution.md`
- `/Users/mateicanavra/.agents/skills/testing-design/references/defaults/design-judgment.md`
- `/Users/mateicanavra/.agents/skills/testing-design/references/leaflet-software-testing.md`
- `/Users/mateicanavra/.agents/skills/testing-design/references/examples.md`

Required packet and implementation inputs read:

- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/AGENTS.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/docs/projects/habitat-harness/phase2-workstream-packets/D11-local-feedback.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/docs/projects/habitat-harness/openspec-remediation/packet-index.md`
- Every file under `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d11-local-feedback`
- D11 first-wave scratch files under `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/docs/projects/habitat-harness/openspec-remediation/agent-scratch/domino-D11-*.md`, excluding this final output
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat/src/lib/hooks.ts`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat/test/lib/hooks.test.ts`
- Accepted upstream packet sections for D0, D1, D3, D6, D7, D9, and D10, targeted to public compatibility blockers, non-claims, graph/affected facts, diagnostic projections, local-feedback check projections, transaction projections, and protected mutation projections.

Repo state observed before review:

- Active branch: `codex/d11-local-feedback-packet`
- Existing uncommitted repaired packet/scratch changes were present before this final scratch write.
- No source, packet, or control files were edited by this review.

## Verdict

Accepted for design/specification only.

No unresolved P1/P2 TypeScript state-space or validation blockers remain in the current repaired D11 packet.

D11 is not implementation-complete. Source implementation remains blocked behind concrete D0 compatibility rows, D1 output-family/non-claim handling, and live upstream projections/facts for the touched source slice: D3 graph/affected facts, D6 staged diagnostic projections, D7 `LocalFeedbackCheckProjection`, D9 local-feedback-safe transaction projection where surfaced, D10 protected/generated mutation projection, and D8 eligibility/admission only if consumed.

## Acceptance Basis

The repaired D11 design now collapses the relevant state space instead of preserving the current accidental states:

- Resource commit allowance is no longer accepted as independent target state. `design.md` and `specs/habitat-harness/spec.md` require a discriminated resource decision where allowed/refused behavior derives from the variant, and legacy `allowPreCommit` can exist only as a compatibility projection.
- Optional trace soup is not the target. D11 now defines ordered stage outcomes, terminal local feedback, consumed authority metadata, recovery text, and D1 non-claims, with legacy `HookTrace` handled through D0/D1 compatibility.
- Raw diagnostic parsing is not a target. D11 requires D6 staged diagnostic projections directly or through D7 with D6 owner metadata; parsing raw Grit output, D7 human output, or diagnostic message text is rejected as target authority.
- Hidden fallback pass is blocked. Required D3/D6/D7/D9/D10 authority being missing, malformed, unavailable, refused, or contradictory makes hook pass impossible for the required stage. Literal pre-push `main` fallback is constrained as local feedback only and cannot hide required graph/target unavailability.

The implementation plan is ordered enough for later execution without inventing design decisions:

- public surface inventory and D0/D1 compatibility first;
- internal resource union and facade if needed;
- target trace/stage outcome model;
- pre-commit stage-local results;
- D9/D8 boundary decisions only where consumed;
- pre-push base/affected model;
- public wording/docs compatibility;
- behavior validation after the logical moves.

The validation matrix separates design-time shape checks from later source behavior tests and names false-green scenarios explicitly: unavailable authority, protected mutation refusal, partial staging, formatter/restage failure, D6 diagnostic finding/unavailable states, D7 refusal, D9 projection refusal where consumed, D3 graph/target unavailable, Nx affected failure, unsupported hook/help behavior, and working-tree residue checks.

## Findings

No P1 findings.

No P2 findings.

No P3 findings recorded for this lane. Remaining risks are intentionally represented as source blockers, not design/specification blockers.

## Acceptance Statement

D11 may be treated as accepted for TypeScript/validation design/specification. This acceptance does not authorize source implementation until concrete D0 rows and live upstream projections are available for the touched surfaces and slices.

Skills used: domain-design, information-design, ontology-design, typescript-refactoring, testing-design.
