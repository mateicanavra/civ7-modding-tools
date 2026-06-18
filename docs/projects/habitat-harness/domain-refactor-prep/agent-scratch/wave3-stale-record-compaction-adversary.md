# Wave 3 Stale-Record / Compaction Adversary Review

## Scope

- Role lane: Stale-Record/Compaction Adversary.
- Worktree: `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame`.
- Branch: `codex/habitat-fast-lint-checks`.
- Review target: `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame/docs/projects/habitat-harness/domain-refactor-prep/`.
- Constraint: review only; no implementation.

## Preflight

- `/bin/pwd` in `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame` returned `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame`.
- `/usr/bin/git -C /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame branch --show-current` returned `codex/habitat-fast-lint-checks`.
- `/usr/bin/git -C /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame status --short --branch` returned `## codex/habitat-fast-lint-checks` plus only `?? docs/projects/habitat-harness/domain-refactor-prep/`.
- `/bin/test -f /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame/docs/projects/habitat-harness/domain-refactor-prep/README.md` passed.

## Required Reads

Read in full before review:

- `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/civ7-systematic-workstream/SKILL.md`.
- `/Users/mateicanavra/.codex/skills/investigation-design/SKILL.md`.
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/civ7-habitat-dra-workstream/SKILL.md`.
- `/Users/mateicanavra/.agents/skills/domain-design/SKILL.md`.
- `/Users/mateicanavra/.agents/skills/solution-design/SKILL.md`.
- `/Users/mateicanavra/.agents/skills/system-design/SKILL.md`.
- `/Users/mateicanavra/.agents/skills/api-design/SKILL.md`.
- `/Users/mateicanavra/.agents/skills/typescript/SKILL.md`.
- `/Users/mateicanavra/.agents/skills/team-design/SKILL.md`.

Read in full before findings:

- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame/docs/projects/habitat-harness/domain-refactor-prep/README.md`.
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame/docs/projects/habitat-harness/domain-refactor-prep/source-authority.md`.
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame/docs/projects/habitat-harness/domain-refactor-prep/scenario-corpus.md`.
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame/docs/projects/habitat-harness/domain-refactor-prep/code-topology-map.md`.
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame/docs/projects/habitat-harness/domain-refactor-prep/domain-responsibility-map.md`.
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame/docs/projects/habitat-harness/domain-refactor-prep/domino-candidate-ledger.md`.
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame/docs/projects/habitat-harness/domain-refactor-prep/agent-scratch-index.md`.
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame/docs/projects/habitat-harness/domain-refactor-prep/review-disposition-ledger.md`.
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame/docs/projects/habitat-harness/domain-refactor-prep/phase2-goal.md`.

## Findings

### P1: Wave 3 scratch on disk is not indexed or dispositioned, so the corpus cannot yet survive compaction as the authoritative review record.

Evidence:

- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame/docs/projects/habitat-harness/domain-refactor-prep/agent-scratch-index.md:37` through `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame/docs/projects/habitat-harness/domain-refactor-prep/agent-scratch-index.md:46` lists Wave 3 lanes as expected, not actual, and includes no scratch path or status rows.
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame/docs/projects/habitat-harness/domain-refactor-prep/review-disposition-ledger.md:25` through `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame/docs/projects/habitat-harness/domain-refactor-prep/review-disposition-ledger.md:27` leaves Wave 3 findings pending.
- `/bin/ls -la /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame/docs/projects/habitat-harness/domain-refactor-prep/agent-scratch` showed `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame/docs/projects/habitat-harness/domain-refactor-prep/agent-scratch/wave3-product-adversary.md` exists on disk.
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame/docs/projects/habitat-harness/domain-refactor-prep/agent-scratch/wave3-product-adversary.md:1` identifies the unindexed file as `# Wave 3 Product Adversary Review`.
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame/docs/projects/habitat-harness/domain-refactor-prep/phase2-goal.md:14` requires adversarial review before attachment, and `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame/docs/projects/habitat-harness/domain-refactor-prep/phase2-goal.md:15` requires accepted P1/P2 findings to be dispositioned.

Why this matters:

- After context compaction, a Phase 2 owner following the README and index would not know the product adversary review exists. The review disposition ledger would still appear pending, making the attachment state ambiguous and risking lost or duplicated review work.

Required fix before goal attachment:

- Add actual Wave 3 rows to `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame/docs/projects/habitat-harness/domain-refactor-prep/agent-scratch-index.md` with scratch path, lane, status, and synthesis use for every Wave 3 scratch file on disk.
- Add Wave 3 findings and dispositions to `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame/docs/projects/habitat-harness/domain-refactor-prep/review-disposition-ledger.md`.
- Reconcile the text that currently says Wave 3 is pending with the actual review state.

Attachment impact:

- Blocks goal attachment as P1 until fixed or explicitly rejected with evidence.

### P1: Validation command results are required for goal attachment, but the corpus gives no durable result location or minimum result schema.

Evidence:

- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame/docs/projects/habitat-harness/domain-refactor-prep/phase2-goal.md:16` requires `validation command results are recorded in the final handoff`.
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame/docs/projects/habitat-harness/domain-refactor-prep/code-topology-map.md:151` through `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame/docs/projects/habitat-harness/domain-refactor-prep/code-topology-map.md:161` lists current proof commands to rerun, but not where their outputs, exit codes, timestamps, commit, branch, cwd, or failure interpretation should be recorded.
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame/docs/projects/habitat-harness/domain-refactor-prep/code-topology-map.md:163` records a known full-suite reliability risk, and `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame/docs/projects/habitat-harness/domain-refactor-prep/domino-candidate-ledger.md:100` and `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame/docs/projects/habitat-harness/domain-refactor-prep/domino-candidate-ledger.md:101` list proof risks, but the corpus has no result ledger to bind future validation runs to those known risks.

Why this matters:

- `final handoff` is not a durable file path. If Phase 2 is attached after compaction, the next owner cannot know whether validation was skipped, run elsewhere, or summarized in a lost conversational turn. This is exactly the stale-record failure mode the preparation corpus is supposed to avoid.

Required fix before goal attachment:

- Add a named validation-results location under `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame/docs/projects/habitat-harness/domain-refactor-prep/`, or add a required section to an existing corpus file.
- Define the minimum row schema: command, cwd, branch, commit, timestamp, exit code, result summary, log/output path or bounded excerpt, proof class, non-claims, and disposition against known risks.
- Update `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame/docs/projects/habitat-harness/domain-refactor-prep/phase2-goal.md` so the attachment condition names that durable location instead of only `final handoff`.

Attachment impact:

- Blocks goal attachment as P1 until fixed or explicitly rejected with evidence.

### P2: Provenance for Wave 1 and several broad source-read claims is summary-only, so a compacted Phase 2 owner cannot audit accepted input without rediscovery.

Evidence:

- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame/docs/projects/habitat-harness/domain-refactor-prep/agent-scratch-index.md:14` through `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame/docs/projects/habitat-harness/domain-refactor-prep/agent-scratch-index.md:24` accepts five Wave 1 agents but provides only truncated IDs, lane names, and synthesis use. It gives no scratch path, prompt path, output path, preflight evidence, or rejection/disposition record.
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame/docs/projects/habitat-harness/domain-refactor-prep/source-authority.md:25` says `The main DRA owner and fresh agents used the following skills`, and `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame/docs/projects/habitat-harness/domain-refactor-prep/source-authority.md:75` says `The owner and agents read current Habitat source and tests under`, but those claims are not connected to per-agent records.
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame/docs/projects/habitat-harness/domain-refactor-prep/review-disposition-ledger.md:18` says each Wave 2 scratch has preflight. A targeted scan found explicit preflight evidence in `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame/docs/projects/habitat-harness/domain-refactor-prep/agent-scratch/wave2-build-nx-tooling.md:10` through `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame/docs/projects/habitat-harness/domain-refactor-prep/agent-scratch/wave2-build-nx-tooling.md:14`, `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame/docs/projects/habitat-harness/domain-refactor-prep/agent-scratch/wave2-public-api-cli-contract.md:8` through `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame/docs/projects/habitat-harness/domain-refactor-prep/agent-scratch/wave2-public-api-cli-contract.md:13`, and `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame/docs/projects/habitat-harness/domain-refactor-prep/agent-scratch/wave2-simplification-reviewer.md:5`; no comparable explicit preflight record was found for `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame/docs/projects/habitat-harness/domain-refactor-prep/agent-scratch/wave2-domino-sequencer.md` by searching for `## Preflight`, `Preflight Evidence`, `/bin/pwd`, `git branch`, or `git status`.

Why this matters:

- The consolidated corpus is allowed to be the authority, but the stale-record lane needs enough provenance to reject contamination without redoing the investigation. Summary-only agent rows and broad `owner and agents read` assertions force rediscovery when a later reviewer challenges one synthesis point.

Required fix before goal attachment:

- Either add durable Wave 1 source records with paths and preflight evidence, or explicitly mark Wave 1 as owner-synthesized summary evidence that is not independently auditable after compaction.
- Replace broad `owner and agents` read claims with an evidence matrix keyed by agent/lane or by synthesized corpus file.
- Repair or qualify the Wave 2 preflight claim for `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame/docs/projects/habitat-harness/domain-refactor-prep/agent-scratch/wave2-domino-sequencer.md`.

Attachment impact:

- Should block goal attachment as P2 unless the DRA owner explicitly accepts summary-only Wave 1 provenance as sufficient and records that as a disposition.

### P3: Historical/archive authority is correctly demoted, but the corpus does not provide a conflict-disposition trail for project records already named as bounded evidence.

Evidence:

- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame/docs/projects/habitat-harness/domain-refactor-prep/source-authority.md:20` through `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame/docs/projects/habitat-harness/domain-refactor-prep/source-authority.md:21` demotes active OpenSpec/project ledgers and historical archives unless they match the frame and packet.
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame/docs/projects/habitat-harness/domain-refactor-prep/source-authority.md:65` through `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame/docs/projects/habitat-harness/domain-refactor-prep/source-authority.md:71` names project records used as bounded evidence.
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame/docs/projects/habitat-harness/domain-refactor-prep/source-authority.md:96` through `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame/docs/projects/habitat-harness/domain-refactor-prep/source-authority.md:100` gives conflict rules, but no table records whether the named project records matched, conflicted, were ignored, or were converted into downstream realignment.

Why this matters:

- The authority order is sound, but a compacted Phase 2 owner cannot tell which project records are safe to quote and which are known stale. This is lower severity because the corpus already warns that these records are not target authority.

Optional improvement:

- Add a compact conflict-disposition table for every project record listed in `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame/docs/projects/habitat-harness/domain-refactor-prep/source-authority.md:65` through `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame/docs/projects/habitat-harness/domain-refactor-prep/source-authority.md:71`, with `matched`, `conflicted`, `bounded-use`, `downstream-record-to-update`, and `do-not-use-for` columns.

Attachment impact:

- Does not block goal attachment by itself.

## Required Fixes Before Goal Attachment

- Fix and disposition the unindexed Wave 3 review state in `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame/docs/projects/habitat-harness/domain-refactor-prep/agent-scratch-index.md` and `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame/docs/projects/habitat-harness/domain-refactor-prep/review-disposition-ledger.md`.
- Define a durable validation-results location and minimum result schema under `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame/docs/projects/habitat-harness/domain-refactor-prep/`.
- Repair or explicitly disposition the summary-only provenance gaps for Wave 1 and the missing explicit Wave 2 domino-sequencer preflight record.

## Optional Improvements

- Add a conflict-disposition table for bounded project records listed in `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame/docs/projects/habitat-harness/domain-refactor-prep/source-authority.md`.
- Add a short `compaction handoff checklist` to `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame/docs/projects/habitat-harness/domain-refactor-prep/README.md` that names the authoritative index, review ledger, validation-results file, and Phase 2 attachment gate.

## Attachment Recommendation

Do not attach the Phase 2 goal yet. The P1 findings above should block attachment because the current review and validation state cannot be reconstructed from the durable corpus alone after compaction.
