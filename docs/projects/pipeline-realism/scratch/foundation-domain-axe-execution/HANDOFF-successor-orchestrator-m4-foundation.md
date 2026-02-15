# Successor Handoff Prompt — M4 Foundation Domain Axe Cutover

## Read This First
You are stepping into the orchestrator role for the Foundation M4 cutover after a turbulent implementation phase that required an explicit red-team anchoring pass. Your job is not to preserve momentum at all costs; your job is to preserve architecture quality while still shipping.

The most important context is this: we already did a corrective pass and validated it. The branch is not in free-fall anymore, but it is still pre-integration. You should treat this handoff as a continuation from a stabilized checkpoint, not a fresh discovery spike.

## What We Were Trying To Achieve (and still are)
The mission of M4 is an architecture-first cutover of Foundation with a strict no-legacy end state. We are intentionally willing to break compatibility where needed to avoid carrying bad boundaries forward.

The north star:
- clean operation boundaries,
- step-owned orchestration,
- stage boundaries that reflect domain semantics,
- lane ownership that is explicit (`artifact:map.*` cut in the right slice),
- and guardrails that keep these boundaries from regressing.

## Current Reality (post-anchor pass)
The anchoring pass is complete. We launched three fresh threads (AR1, AR2, RP1), ran independent reviews, triaged findings, fixed mandatory pre-integration items, and revalidated.

What that means practically:
- The known high-risk regressions around disabled `compute-tectonic-history` test callsites were fixed.
- Milestone and issue docs were synced so they no longer pretend `S04`/`S07` are already landed.
- Foundation reference docs were corrected to reflect the current ops surface.
- We intentionally deferred lane-cutover implementation work to the correct slice (`S07`) to avoid out-of-order churn.
- We kept one temporary guard stub (`compute-tectonic-history`) with explicit deletion trigger.

## Branch + Stack Snapshot
```yaml
stack_snapshot:
  worktree: /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails
  branch: codex/prr-m4-s06d-foundation-scratch-audit-ledger
  top_commit: 103a641d8
  stack_tip_order:
    - codex/prr-m4-s06d-foundation-scratch-audit-ledger
    - codex/prr-m4-s06c-foundation-guardrails-hardening
    - codex/prr-m4-s06b-foundation-tectonics-local-rules
    - codex/prr-m4-s06a-foundation-knobs-surface
    - codex/prr-m4-s06-test-rewrite-architecture-scans
    - codex/prr-m4-s05-ci-strict-core-gates
    - codex/prr-m4-s03-tectonics-op-decomposition
    - codex/prr-m4-s02-contract-freeze-dead-knobs
```

## Anchor Findings Disposition (authoritative)
```yaml
anchor_findings:
  ANCHOR-F001:
    summary: tests still called disabled computeTectonicHistory
    disposition: resolved
  ANCHOR-F002:
    summary: docs implied stage split already landed
    disposition: resolved
  ANCHOR-F003:
    summary: lane split not yet implemented
    disposition: keep_for_S07_intentionally
  ANCHOR-F004:
    summary: stale Foundation reference docs
    disposition: resolved
  ANCHOR-F005:
    summary: temporary legacy guard stub still exists
    disposition: keep_temporarily_with_deletion_trigger
```

## Hard Invariants (Non-Negotiable)
These are not “guidance.” They are operating constraints.

- No stage runtime merge/defaulting.
- No manual public→internal schema translation.
- Compile is not runtime normalization.
- Step orchestrates ops; ops do not orchestrate peer ops.
- Strategies stay inside ops and should be powered by op-local rules.
- No casual shared-lib rule-shim patterns.
- No duplicate core helper math when mapgen-core already has it.
- Architecture quality takes precedence over backward compatibility; no legacy bridge final state.

## Strategic Posture For Remaining Work
You are now in control of a sequence that should be conservative in architecture and aggressive in execution.

The strategy from here:
1. Hold `S04` blocked until IG-1 integration checkpoint exits green.
2. Use RP1 plan as canonical execution steering for integration-and-beyond.
3. Keep changes slice-correct:
   - do not pull `S07` lane-cut implementation forward,
   - do not muddy `S04` with tuning or docs-only churn,
   - do not re-open old architecture debates unless a new hard blocker appears.
4. Keep worker prompts architecture-anchored and absolute-path-only every time.

## IG-1 Integration Gate (what “ready” actually means)
```yaml
ig1_contract:
  entry_requires:
    - S02_S03_S05_S06_committed_and_stable
    - anchor_pass_triage_and_mandatory_fixes_complete
    - pre_IG1_validation_green
  mandatory_actions:
    - integrate_ecology_stack
    - evaluate_pr_threshold_policy
    - reanchor_on_resulting_tip
    - run_GI1_validation_bundle
  exit_requires:
    - ecology_merge_status: pass
    - reanchor_status: pass
    - baseline_gates: pass
    - explicit_signoff_logged_in_scratch
```

## Verification Baseline Already Confirmed
```yaml
verified_in_anchor_pass:
  - bun run --cwd mods/mod-swooper-maps check
  - bun run --cwd mods/mod-swooper-maps lint
  - REFRACTOR_DOMAINS="foundation" DOMAIN_REFACTOR_GUARDRAILS_PROFILE=full bun run lint:domain-refactor-guardrails
  - bun run --cwd mods/mod-swooper-maps test -- test/foundation/contract-guard.test.ts test/foundation/no-op-calls-op-tectonics.test.ts test/foundation/m11-tectonic-events.test.ts test/foundation/m11-tectonic-segments-history.test.ts test/foundation/tile-projection-materials.test.ts test/m11-config-knobs-and-presets.test.ts test/standard-recipe.test.ts test/standard-compile-errors.test.ts
  - rewritten_hotspot_tests: pass
```

## How To Run Your Agent Team Without Repeating Past Failures
Treat every worker assignment as a mini-contract.

Required in each assignment:
- absolute worktree paths,
- docs-first read + attestation,
- explicit invariants,
- exact files they own,
- exact verification commands,
- scratch update expectations.

Avoid two failure modes:
- “Do a review” with vague scope (creates shallow output).
- “Fix this area” without architecture constraints (creates thrash).

Use this sequencing template when work is risky:
1. Independent review agent (fresh eyes).
2. Orchestrator triage and explicit disposition.
3. Focused fix agent with strict file scope.
4. Quick re-check reviewer on hotspots only.

## Canonical Artifact Map
```yaml
canonical_artifacts:
  milestone:
    - /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/docs/projects/pipeline-realism/milestones/M4-foundation-domain-axe-cutover.md
  issues:
    - /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/docs/projects/pipeline-realism/issues
  orchestrator_scratch:
    - /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/docs/projects/pipeline-realism/scratch/foundation-domain-axe-execution/00-plan.md
    - /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/docs/projects/pipeline-realism/scratch/foundation-domain-axe-execution/master-scratch.md
    - /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/docs/projects/pipeline-realism/scratch/foundation-domain-axe-execution/decision-log.md
    - /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/docs/projects/pipeline-realism/scratch/foundation-domain-axe-execution/stack-ledger.md
    - /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/docs/projects/pipeline-realism/scratch/foundation-domain-axe-execution/orchestrator-anchor-triage.md
    - /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/docs/projects/pipeline-realism/scratch/foundation-domain-axe-execution/agent-RP1-reanchor-plan.md
```

## First 60 Minutes (Operator Runbook)
Start by orienting, not editing.

- Confirm you are on the expected branch/worktree and stack tip.
- Read triage + RP1 plan first, then milestone/issues.
- Reconfirm what is intentionally deferred (`S07`) vs ready now (IG-1 prep).

Then execute control actions:
- stamp takeover in `master-scratch.md`, `decision-log.md`, `stack-ledger.md`.
- run IG-1 prep commands and capture evidence logs.
- if integration reveals drift, create one dedicated conflict-fix slice before touching S04.

Only after IG-1 is green:
- unblock `S04`.
- keep strict ordering through `S07`, `S08`, `S09`.

## Communication Style Expected From Successor
You should communicate in a way that keeps the project calm and precise:
- explain intent before each major mutation,
- call out architectural tradeoffs directly,
- reject low-signal churn,
- and keep scratch artifacts current so future handoffs are cheap.

## Proposed target
A successor can take this doc, orient in under one hour, and continue execution through IG-1 and post-S04 without reopening resolved architecture mistakes.

## Changes landed
Rewritten handoff as an operator-level briefing with contextual ramp-up, strategy guidance, and structured maps for enumerable state.

## Open risks
- Ecology integration timing can still shift IG-1 timing.
- Temporary legacy stub deletion must be enforced later; do not let it fossilize.

## Decision asks
- none
