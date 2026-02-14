# IG-1 Checkpoint Packet Template

## Packet metadata
```yaml
packet:
  id: IG-1
  purpose: Pre-S04 ecology merge readiness + GI-1 bridge
  location: docs/projects/pipeline-realism/scratch/foundation-domain-axe-execution/ig-1-checkpoint-packet-template.md
  orchestrator_worktree: /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-agent-ORCH-foundation-domain-axe-execution
```

## Entry criteria checklist
```yaml
entry_criteria:
  ecology_merge_ready: Ecology stack merge branch has been rebased onto the orchestrator anchor and no merge conflicts remain.
  gi1_prechecks_complete: GI-1 gating commands required below have run at least once with clean exit.
  pr_count_threshold: Lower-stack PR count has reached or exceeded the >=45 policy target.
  reanchor_plan_locked: Re-anchor instructions and expected hash are documented.
  user_awareness: Responsible user(s) confirmed the checkpoint is expected and in-scope.
```

## Ecology merge steps
```yaml
ecology_merge_steps:
  - step: snapshot current foundation branch state
    tool: git status -sb
    confirm: clean working tree
  - step: rebase ecology infra branch onto stack anchor
    tool: git fetch origin && git rebase origin/<ecology-branch>
    confirm: no conflicts or manual resolutions
  - step: merge ecology branch into execution workspace
    tool: git merge --no-ff <ecology-branch>
    confirm: merge commit documented in decision log
  - step: exercise newly merged artifacts
    tool: bun run test:vitest --filter ecology
    confirm: tests pass without new failures
```

## PR-count threshold policy (`>=45`) procedure
```yaml
pr_threshold_policy:
  goal: ensure the lower stack collapses only after 45+ PRs are available to merge.
  metric_source: orchestrator-provided PR tracker (e.g., `gh pr list --state open` or dashboard output)
  gating_condition: verified_pr_count >= 45
  action_on_fail: pause the collapse, document rationale in decision-log, and escalate to the orchestrator steward
  documentation: append the supporting output to docs/projects/pipeline-realism/scratch/foundation-domain-axe-execution/decision-log.md
```

## Re-anchor procedure
```yaml
reanchor_procedure:
  - step: capture current HEAD hash and compare to stack_anchor
    command: git rev-parse HEAD && jq -r '.stack_anchor' docs/projects/pipeline-realism/scratch/foundation-domain-axe-execution/master-scratch.md
  - step: update the stack anchor hash to the verified commit
    command: document the new anchor hash in docs/projects/pipeline-realism/scratch/foundation-domain-axe-execution/master-scratch.md and stack-ledger.md
    confirm: master-scratch stack_anchor entry matches the HEAD hash
  - step: rerun git status
    command: git status -sb
    confirm: working tree clean, no untracked files from re-anchor
```

## GI-1 verification command matrix
```yaml
gi1_verification:
  baseline:
    description: confirm foundation stack ready for S04
    commands:
      - git log -1 --oneline
      - bun run test:vitest
    success_criteria: exit_code == 0 for all commands
  scan_health:
    description: run critical linters/testers referenced in existing tooling
    commands:
      - bun run lint:domain-refactor-guardrails
      - bun run lint:mapgen-docs
    success_criteria: linters pass and produce no blocking findings
  artifacts:
    description: ensure artifacts referenced in stack-ledger match actual outputs
    commands:
      - ls artifacts/S04
      - grep -n IG-1 docs/projects/pipeline-realism/scratch/foundation-domain-axe-execution/stack-ledger.md
    success_criteria: artifacts directory populated and ledger IG-1 section populated
```

## Explicit user sign-off capture
```yaml
user_sign_off:
  responsible_user: "<name>"
  date:
    iso: "2026-02-15"
  acknowledgment: "IG-1 entry criteria checked, ecology merge, PR threshold, and GI-1 verifications completed. Ready to resume S04 post-checkpoint."
  signature_method: "email_thread" # or recorded in Linear/decision log
```
