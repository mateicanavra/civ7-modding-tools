# Phase Record — H4 `habitat-biome-hygiene`

## Phase

- Project: habitat-harness (FRAME.md controlling)
- Phase: H4 — Biome hygiene, Prettier retirement, blame-shielded reformat
- Owner: workstream owner agent (Codex continuation)
- Branch/Graphite stack: `agent-F-habitat-biome-hygiene` -> `agent-F-habitat-boundary-tags` -> `agent-F-habitat-harness-scaffold` -> `agent-F-habitat-nx-adoption` -> `agent-F-habitat-harness-workstream` -> `main`
- Started: 2026-06-13
- Status: OPEN — continuity records reconciled; implementation tasks not started

## Objective

- Target movement: make Biome the single owner of the hygiene layer, retire Prettier, land a dedicated blame-shielded repo-wide reformat, and wire Biome through the Habitat harness, Nx targets, `habitat fix`, `habitat check`, and CI.
- Non-goals: no product/runtime behavior changes, no Grit/file-layer rules, no changes to `eslint.config.js` except later H6 retirement, no generated-output hand edits, no semantic codemods, no out-of-scope red-test fixes.
- Done condition: H4 tasks 1.1-4.3 complete; Biome configuration and lint lane ratcheted; dedicated format-only commit recorded in `.git-blame-ignore-revs`; build-output parity verified per the proposal; habitat integration and OpenSpec validation green; Graphite branch committed cleanly.

## Authority

- Root/subtree `AGENTS.md`: root AGENTS.md governs root config, docs, package metadata, generated-output hygiene, and Graphite workflow; no closer router applies to current H4 setup files.
- Product refs: N/A (structure-only hygiene/enforcement workstream; no product behavior claim)
- Architecture refs: `docs/projects/habitat-harness/FRAME.md` hard core #1-#5, settled D3, trade-offs table, degeneration trigger; `docs/projects/habitat-harness/invariant-corpus.md` §F DL-12 formatting enforcement gap; `docs/projects/habitat-harness/review-disposition-ledger.md` F1 and F23.
- Project refs: `openspec/changes/habitat-biome-hygiene/{proposal.md,tasks.md,specs/habitat-harness/spec.md}`
- Excluded/stale inputs: stale top-level workstream-record claims that execution had not started; chat-only task state; suggested red-test triage tasks unless explicitly promoted.

## Current State

- Repo/Graphite state: clean worktree on empty H4 branch `agent-F-habitat-biome-hygiene`, stacked above restacked H3 (`agent-F-habitat-boundary-tags`).
- Dirty files and owner: this phase will first own only `docs/projects/habitat-harness/workstream-record.md` and this phase record; implementation write set begins after setup.
- Current code evidence: H1/H2/H3 locally closed; `openspec list` shows `habitat-biome-hygiene` at 0/11 tasks; `.prettierrc` exists and formatting enforcement is still absent by DL-12.
- Generated outputs affected: none yet. H4 parity will hash formatting-independent `mod/**` artifacts before reformat; generated outputs remain protected and are not hand-edited.
- Tests/guards affected: future H4 implementation will add Biome targets/rules and CI wiring; existing `nx-boundaries` and H2 harness rules remain authoritative.

## Scope

- Write set: root Biome/Prettier config and package metadata; `.git-blame-ignore-revs`; repo-wide format-only diff; `tools/habitat-harness/**` rule pack/plugin/CLI docs for Biome targets and `habitat fix`; `.github/workflows/ci.yml`; H4 OpenSpec tasks/phase record and affected project docs.
- Protected files: generated `dist/**`, `mod/**`, `.civ7/outputs/**`, `.nx/**`, `docs/_archive/**`, official resources, and product/runtime behavior files except mechanical formatting in the dedicated reformat commit.
- Owners: Biome owns formatting, ordinary lint hygiene, import organization, and safe assists; Habitat owns rule orchestration/ratchet; Nx owns target inference/affected execution.
- Forbidden owners: no ESLint hygiene role; no Grit syntax rules; no project-plane boundary changes; no silent baseline weakening; no formatter touching generated zones.
- Consumer impact: one large blame-shielded format-only change, then deterministic hygiene enforcement through `biome:ci`, `habitat check`, and `habitat fix`.
- Downstream assumptions: H5 depends on Biome formatting for grit-apply rewrites; H7 depends on Biome staged formatting; H6 keeps ESLint boundaries-only until retirement.

## Spec/Tasks

- Spec/proposal: `openspec/changes/habitat-biome-hygiene/proposal.md` and `specs/habitat-harness/spec.md`
- Tasks: `openspec/changes/habitat-biome-hygiene/tasks.md` (0/11 at phase open)
- Validation status: `bun run openspec -- validate habitat-biome-hygiene --strict` PASS after phase-record setup

## Review

- Review lanes: pre-execution spec review CLOSED with accepted repairs; H4-specific evidence review must focus on reformat diff class, build-output parity, blame-ignore proof, ratchet baselines, and no Prettier residue.
- Blocking findings: none known at phase open.
- Accepted findings repaired: F1 serialized H4 after H3; F23 clarified H4 parity/format-diff stop condition.
- Rejected/invalidated/waived/deferred findings: none.

## Agent Fleet State

N/A - solo phase setup. Add agents before implementation review/evidence review if delegated.

## Implementation

- Completed tasks: none.
- Remaining tasks: 1.1-4.3.
- Stop conditions triggered: none at phase open.

## Verification

- Commands run:
  - `git status --short --branch`
  - `gt status`
  - `gt log short --stack`
  - `bun run openspec -- list`
  - `gt create agent-F-habitat-biome-hygiene --no-interactive`
  - `git diff --check`
  - `bun run openspec -- validate habitat-biome-hygiene --strict`
- Results: H4 branch opened cleanly above H3; OpenSpec list shows H1/H2/H3 complete and H4 at 0/11 tasks.
- Skipped gates and rationale: implementation gates not run yet; this record opens the slice before code.
- Evidence boundary: phase setup only; no Biome implementation or formatting proof claimed.

## Realignment

- Downstream docs/specs/issues updated: top-level workstream record reconciled from stale pre-execution state to H4-active state.
- Tests/guards updated: none yet.
- Deferrals/triage updated: none; known red-test triage tasks remain outside H4 unless explicitly promoted.
- Downstream realignment ledger: N/A at phase open.

## Next Action

- Exact next step: validate the H4 OpenSpec shape, then start task 1.1 by adding exact-pinned Biome and configuring `biome.json` from `.prettierrc` without enabling overlapping boundary/syntax concerns.
- First files to inspect: `.prettierrc`, `package.json`, `tools/habitat-harness/src/plugin.js`, `tools/habitat-harness/src/bin/habitat.ts`, `tools/habitat-harness/src/rules/rules.json`, `.github/workflows/ci.yml`.
- Stop condition: Biome config would format generated/protected zones, create non-format semantic diff, or require hygiene ownership that overlaps Nx/Grit.
