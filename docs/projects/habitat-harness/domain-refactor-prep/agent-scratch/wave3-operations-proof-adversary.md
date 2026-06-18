# Wave 3 Scratch: Operations / Proof Adversary

Role lane: Operations/Proof Adversary.
Worktree: `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame`.
Branch: `codex/habitat-fast-lint-checks`.

This is adversarial review scratch only. It does not author Phase 2 packets and does not authorize implementation.

## Preflight Evidence

- `/bin/pwd` in `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame` returned `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame`.
- `/usr/bin/git branch --show-current` returned `codex/habitat-fast-lint-checks`.
- `/usr/bin/git status --short --branch` before review returned only `## codex/habitat-fast-lint-checks` and `?? docs/projects/habitat-harness/domain-refactor-prep/`.
- `/bin/test -f docs/projects/habitat-harness/domain-refactor-prep/README.md && /bin/echo README_EXISTS` returned `README_EXISTS`.

## Required Skill Reads

Read in full before review:

- `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/civ7-systematic-workstream/SKILL.md`
- `/Users/mateicanavra/.codex/skills/investigation-design/SKILL.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/civ7-habitat-dra-workstream/SKILL.md`
- `/Users/mateicanavra/.agents/skills/domain-design/SKILL.md`
- `/Users/mateicanavra/.agents/skills/solution-design/SKILL.md`
- `/Users/mateicanavra/.agents/skills/system-design/SKILL.md`
- `/Users/mateicanavra/.agents/skills/api-design/SKILL.md`
- `/Users/mateicanavra/.agents/skills/typescript/SKILL.md`
- `/Users/mateicanavra/.agents/skills/team-design/SKILL.md`

Relevant supporting proof references also read:

- `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/civ7-habitat-dra-workstream/references/authority-map.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/civ7-habitat-dra-workstream/references/proof-classes.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/civ7-habitat-dra-workstream/references/review-and-realignment.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/civ7-systematic-workstream/references/evidence-and-proof.md`

## Corpus Files Read

Read in full:

- `docs/projects/habitat-harness/domain-refactor-prep/README.md`
- `docs/projects/habitat-harness/domain-refactor-prep/source-authority.md`
- `docs/projects/habitat-harness/domain-refactor-prep/scenario-corpus.md`
- `docs/projects/habitat-harness/domain-refactor-prep/code-topology-map.md`
- `docs/projects/habitat-harness/domain-refactor-prep/domain-responsibility-map.md`
- `docs/projects/habitat-harness/domain-refactor-prep/domino-candidate-ledger.md`
- `docs/projects/habitat-harness/domain-refactor-prep/agent-scratch-index.md`
- `docs/projects/habitat-harness/domain-refactor-prep/review-disposition-ledger.md`
- `docs/projects/habitat-harness/domain-refactor-prep/phase2-goal.md`

Accepted Wave 2 scratch read as bounded evidence:

- `docs/projects/habitat-harness/domain-refactor-prep/agent-scratch/wave2-build-nx-tooling.md`
- `docs/projects/habitat-harness/domain-refactor-prep/agent-scratch/wave2-simplification-reviewer.md`
- `docs/projects/habitat-harness/domain-refactor-prep/agent-scratch/wave2-domino-sequencer.md`
- `docs/projects/habitat-harness/domain-refactor-prep/agent-scratch/wave2-public-api-cli-contract.md`

## Commands Run During Review

- `/usr/bin/git status --short --branch`
- `/usr/bin/git log -1 --oneline`
- `/bin/zsh -lc 'command -v gt'`
- `/opt/homebrew/bin/gt log --no-interactive`
- `/usr/bin/git status --short --branch --untracked-files=all`

No build, lint, Habitat command, Nx target, or package test validation commands were rerun during this review. This review evaluates whether the corpus records sufficient validation and closure gates before goal attachment.

## Findings

### P1-OPS-001: Accepted P1 proof risks are not actually dispositioned into consolidated stop conditions

The review ledger says accepted P1/P2 findings block goal attachment until fixed, deferred with trigger and owner, rejected with evidence, or converted into a Phase 2 packet stop condition. It then marks the full-suite Habitat test reliability risk and the false-green `habitat:rule:biome-ci` alias risk as "Tracked" and claims they are listed as future stop conditions. The consolidated domino stop conditions do not include either risk.

Evidence:

- `docs/projects/habitat-harness/domain-refactor-prep/review-disposition-ledger.md:5` through `docs/projects/habitat-harness/domain-refactor-prep/review-disposition-ledger.md:12` defines the disposition standard and blocking rule.
- `docs/projects/habitat-harness/domain-refactor-prep/review-disposition-ledger.md:21` marks full-suite Habitat test reliability as "Tracked" rather than fixed, deferred with trigger and owner, rejected, or converted into an explicit consolidated stop condition.
- `docs/projects/habitat-harness/domain-refactor-prep/review-disposition-ledger.md:22` does the same for the `habitat:rule:biome-ci` false-green alias risk.
- `docs/projects/habitat-harness/domain-refactor-prep/domino-candidate-ledger.md:94` through `docs/projects/habitat-harness/domain-refactor-prep/domino-candidate-ledger.md:102` lists both as known P1 risks.
- `docs/projects/habitat-harness/domain-refactor-prep/domino-candidate-ledger.md:111` through `docs/projects/habitat-harness/domain-refactor-prep/domino-candidate-ledger.md:120` omits both from the actual consolidated stop conditions.
- `docs/projects/habitat-harness/domain-refactor-prep/phase2-goal.md:13` through `docs/projects/habitat-harness/domain-refactor-prep/phase2-goal.md:17` requires accepted P1/P2 findings to be dispositioned before attaching the goal.

Required fix before goal attachment:

- Update the consolidated corpus so the full-suite test reliability risk and false-green alias risk have one valid disposition each.
- If converted into stop conditions, add explicit stop-condition text with owner and trigger to `docs/projects/habitat-harness/domain-refactor-prep/domino-candidate-ledger.md` and mirror the disposition in `docs/projects/habitat-harness/domain-refactor-prep/review-disposition-ledger.md`.
- Do not attach the Phase 2 goal while these P1s are only "Tracked."

Goal attachment impact: blocks.

### P1-OPS-002: The validation command gate is a list of future commands, not a goal-attachment proof record

The Phase 2 goal requires validation command results in the final handoff before attachment, but the corpus only records a "current proof commands" list that "should be rerun during packet design." It does not record current results for the consolidated prep corpus, does not label proof classes per command, and omits the exact high-risk commands that found the full-suite failure and false-green alias.

Evidence:

- `docs/projects/habitat-harness/domain-refactor-prep/phase2-goal.md:16` requires validation command results in the final handoff before goal attachment.
- `docs/projects/habitat-harness/domain-refactor-prep/code-topology-map.md:151` through `docs/projects/habitat-harness/domain-refactor-prep/code-topology-map.md:162` provides a command list, but frames it as commands that should be rerun during packet design, not attachment proof.
- `docs/projects/habitat-harness/domain-refactor-prep/code-topology-map.md:158` uses `--cwd tools/habitat-harness`, which is not an absolute path argument.
- `docs/projects/habitat-harness/domain-refactor-prep/code-topology-map.md:163` records full-suite reliability as a proof concern but does not add a blocking validation gate.
- `docs/projects/habitat-harness/domain-refactor-prep/agent-scratch/wave2-build-nx-tooling.md:78` through `docs/projects/habitat-harness/domain-refactor-prep/agent-scratch/wave2-build-nx-tooling.md:79` reports `@internal/habitat-harness:check` passed but `@internal/habitat-harness:test` failed twice.
- `docs/projects/habitat-harness/domain-refactor-prep/agent-scratch/wave2-build-nx-tooling.md:94` through `docs/projects/habitat-harness/domain-refactor-prep/agent-scratch/wave2-build-nx-tooling.md:97` gives the concrete failure and false-green alias evidence.
- `docs/projects/habitat-harness/domain-refactor-prep/agent-scratch/wave2-build-nx-tooling.md:114` through `docs/projects/habitat-harness/domain-refactor-prep/agent-scratch/wave2-build-nx-tooling.md:124` contains a stronger future packet proof command set than the consolidated corpus, including `@internal/habitat-harness:test` and `@internal/habitat-harness:habitat:rule:biome-ci`.

Required fix before goal attachment:

- Add a goal-attachment validation record or final handoff section that records exact command, branch, commit, result, proof class, cache/freshness caveat, and non-claims.
- Include at minimum the full Nx harness test target and the false-green alias proof commands from `docs/projects/habitat-harness/domain-refactor-prep/agent-scratch/wave2-build-nx-tooling.md:118` through `docs/projects/habitat-harness/domain-refactor-prep/agent-scratch/wave2-build-nx-tooling.md:124`.
- Do not let `/Users/mateicanavra/.bun/bin/bun run --cwd tools/habitat-harness test` substitute for `/Users/mateicanavra/.bun/bin/nx run @internal/habitat-harness:test --outputStyle=static`; those prove different things.

Goal attachment impact: blocks until validation results are recorded or explicitly marked unresolved with owner and trigger.

### P2-OPS-003: Graphite stack readiness is not recorded, and current stack evidence shows a needs-restack ancestor

The corpus records the worktree and branch, but the attachment condition requires the expected Graphite branch and a clean worktree after commit. The current stack evidence is absent from the corpus, and fresh `gt log` evidence shows an ancestor branch marked `needs restack`.

Evidence:

- `docs/projects/habitat-harness/domain-refactor-prep/source-authority.md:5` through `docs/projects/habitat-harness/domain-refactor-prep/source-authority.md:10` records worktree and branch, but not Graphite stack health.
- `docs/projects/habitat-harness/domain-refactor-prep/phase2-goal.md:17` requires the worktree to be on the expected Graphite branch and clean after commit.
- `/opt/homebrew/bin/gt log --no-interactive` in `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame` showed `06-13-keep_things (needs restack)` above current branch `codex/habitat-fast-lint-checks`.
- `/usr/bin/git log -1 --oneline` in `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame` returned `ca4db1e86 build(habitat): make root lint fast Route root lint to the repo-wide Biome CI hygiene target instead of fanning out full Habitat owner checks. Add a single aggregate Habitat graph target for explicit full structural proof, update the command-surface docs, and keep the enforcement-surface tests aligned with the separated proof classes.`

Required fix before goal attachment:

- Record Graphite stack state in the final handoff or review ledger with the exact `/opt/homebrew/bin/gt log --no-interactive` result, whether the needs-restack ancestor affects this prep branch, and whether local commit only or Graphite submission is the intended closure class.
- If the needs-restack marker affects submission or review, block attachment until the owner dispositions it as stack repair or explicitly moves it outside the prep closure claim.

Goal attachment impact: should block if Graphite submission or clean stack closure is claimed; otherwise requires explicit disposition before attachment.

### P2-OPS-004: Domino proof cells are too broad to prevent proof-class substitution during packet authoring

The scenario corpus correctly requires every future packet to name proof classes and non-claims, but the domino ledger proof cells remain broad labels such as "command behavior," "schema tests," "baseline proof," and "safe-write" without per-domino command gates, injected-bad-case requirements, cache policy, or non-claim text. This is sufficient for prep sequencing but weak as an operations-safe packet design handoff.

Evidence:

- `docs/projects/habitat-harness/domain-refactor-prep/scenario-corpus.md:61` through `docs/projects/habitat-harness/domain-refactor-prep/scenario-corpus.md:73` requires proof classes, non-claims, downstream records, and stop conditions for every later packet.
- `docs/projects/habitat-harness/domain-refactor-prep/domain-responsibility-map.md:36` through `docs/projects/habitat-harness/domain-refactor-prep/domain-responsibility-map.md:52` lists separate proof classes that must not substitute for one another.
- `docs/projects/habitat-harness/domain-refactor-prep/domino-candidate-ledger.md:41` through `docs/projects/habitat-harness/domain-refactor-prep/domino-candidate-ledger.md:58` contains the domino proof cells, but most are proof-family names rather than exact proof gates.
- `docs/projects/habitat-harness/domain-refactor-prep/agent-scratch/wave2-build-nx-tooling.md:126` through `docs/projects/habitat-harness/domain-refactor-prep/agent-scratch/wave2-build-nx-tooling.md:132` shows the sharper stop-condition shape needed for operations-safe proof gates.

Required fix before Phase 2 packet writing:

- Add a per-domino proof-gate checklist or packet template requirement: exact commands, expected fresh/cached behavior, injected violation requirements where relevant, clean sample proof where relevant, safe-write rollback requirements where relevant, and explicit non-claims.
- Keep this as a prep-to-packet requirement; the consolidated corpus does not need to run all per-domino commands now.

Goal attachment impact: does not need to block if `docs/projects/habitat-harness/domain-refactor-prep/phase2-goal.md` or the review ledger makes this a required Phase 2 packet-template condition.

## Optional Improvements

- Add a final handoff template under `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame/docs/projects/habitat-harness/domain-refactor-prep/` that records preflight, validation commands, `git status`, `git log -1`, `/opt/homebrew/bin/gt log --no-interactive`, commit hash, and proof-class labels.
- Normalize command examples so every path argument is absolute, including `--cwd /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame/tools/habitat-harness`.
- In `docs/projects/habitat-harness/domain-refactor-prep/domino-candidate-ledger.md`, split "Proof Class" into "Minimum proof gates" and "Non-claims" so packet authors cannot read broad proof names as closure.
- Add a short "cached Nx result is not fresh command behavior" reminder next to any Nx proof command list.

## Attachment Recommendation

Do not attach the Phase 2 goal yet. `P1-OPS-001` and `P1-OPS-002` block because the corpus currently has accepted P1 proof risks without valid consolidated disposition and lacks the validation command result record required by `docs/projects/habitat-harness/domain-refactor-prep/phase2-goal.md`.
