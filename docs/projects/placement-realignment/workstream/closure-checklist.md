# Closure Checklist — Placement Realignment Workstream (S8, 2026-06-10)

Filled from `.agents/skills/civ7-systematic-workstream/assets/closure-checklist.md`.
Live-proof rows are explicitly NOT checked: Milestones A+B have not run
(runbook: `../MILESTONE-PROOFS.md`).

## Records

This workstream's per-slice records live in each OpenSpec change
(`openspec/changes/placement-realignment-s{0..8}-*/tasks.md` + proposal
decision logs); the workstream-level record is
`workstream-record.md` (slice/commit/proof-class ledger). The
civ7-open-spec-workstream template files map as noted per row.

- [x] `tasks.md` reflects actual task state — all nine slice changes' tasks.md
  are fully checked and match shipped content.
- [x] `phase-record.md` reflects branch, commit, proof, and closure state —
  served by `workstream-record.md` (Repo State + Slice ledger + Proof Gates);
  no separate phase-record file exists in this workstream's layout.
- [x] `review-disposition-ledger.md` has no open accepted P1/P2 blockers —
  `review-ledger.md` (plan review, gate 11): all findings accepted + repaired,
  none open; per-slice review findings were dispositioned inside each change's
  decision log.
- [x] `downstream-realignment-ledger.md` records patch/no-patch/deferred state —
  no separate ledger file; downstream realignment was recorded inline per
  slice: RDP project ledger closed (S3), Gameplay-absorption appendix updated
  (S3/ADR-008), start-placement corpus-ledger as-built (S4), studio guard
  tests repinned (S7), canonical docs (S8). Remaining downstream work is
  DEF-004…DEF-014 (deferred, with triggers).
- [x] `next-packet.md` is absent, accurate, or explicitly marks remaining
  work — absent; remaining work is explicitly `../MILESTONE-PROOFS.md`
  (Milestones A+B) plus the DEFERRALS entries.
- [x] Watcher notes are acknowledged or preserved until their boundary is
  met — none outstanding; the evidence-gated changes named in the plan risks
  (`earthlike-live-feature-resource-legality-repair`,
  `earthlike-starts-discoveries-readback-proof`) keep their proof surfaces
  (verified in S3/S4/S6 decision logs); the 106/6996 corpus disposition is a
  named Milestone A step.

## Gates

- [x] Focused tests or checks passed — `bun --cwd mods/mod-swooper-maps test`
  511 pass / 0 fail; `bun run --cwd mods/mod-swooper-maps check` clean;
  `bun run --cwd apps/mapgen-studio check` clean;
  `verify:placement-metrics` (seeds 1337–1341, standard) bit-identical to S7
  (recursive diff: 0 differing fields).
- [x] OpenSpec strict validation passed —
  `openspec validate placement-realignment-s8-closure --strict` valid.
- [x] All OpenSpec validation passed — `bun run openspec:validate`:
  89 passed, 0 failed.
- [x] `git diff --check` passed.
- [ ] Runtime proof is recorded when the closure claim needs runtime
  evidence — NOT checked: no runtime proof exists. The closure claim
  explicitly excludes live behavior (Proof Gates: live NOT RUN); any claim
  needing runtime evidence is deferred to Milestones A+B.

## Proof Labels

- [x] Local commit, Graphite submit, PR state, local stats proof, runtime
  proof, and product proof are labeled separately — workstream-record Proof
  Gates: local stats GREEN, generated/build GREEN, studio dumps PARTIAL
  (headless verified / interactive pending), live NOT RUN; repo state below
  labels commit/submit/PR separately.
- [ ] Runtime records include branch, commit, deploy command/path, … —
  NOT checked: no runtime records exist yet; the required fields are
  pre-listed in `../MILESTONE-PROOFS.md` so Milestone evidence files include
  them.
- [ ] Product proof records required conditions, covered scope, uncovered
  scope, authority refs, evidence per condition, and excluded claims —
  NOT checked: product proof (studio↔live parity E4.1, interactive viz QA)
  is Milestone B; conditions + exclusions are predeclared in
  `../MILESTONE-PROOFS.md`.
- [x] No stronger proof claim is made than the evidence supports — every
  evidence doc and the record label live items NOT RUN; E1.4 amendment and
  E2.7/E2.5 exceptions recorded, not faked.

## Repo State

- [x] Worktree clean or explicitly handed off — clean after the S8 commit
  (verified at commit time).
- [x] Graphite branch/stack state inspected — `placement-realignment` is a
  plain local git branch off `main` @ 90c47d45f (18 commits S0–S7 + S8); it
  is NOT a Graphite-tracked stack branch (`gt log` shows it untracked).
  Graphite tracking/submit is a delivery step for the user, not claimed here.
- [x] External Graphite submission/PR delivery unclaimed unless evidence
  exists — unclaimed: no submit, no PR.
