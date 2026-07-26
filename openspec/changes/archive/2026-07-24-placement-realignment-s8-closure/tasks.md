# Tasks — Placement Realignment S8 (Docs, ADRs, Deferrals, Closure)

## 1. Canonical docs refresh

- [x] 1.1 Rewrite `docs/system/libs/mapgen/reference/domains/PLACEMENT.md`
  to the as-built vertical (11 steps, ownership, ADR-008/009 regime, knob
  groups, artifact inventory + validators, viz coverage, verification
  surfaces, anchors).
- [x] 1.2 `GAMEPLAY.md`: ADR-008 carve-out on the absorption posture
  (minimal edit).
- [x] 1.3 `STANDARD-RECIPE.md`: placement config-posture paragraph updated
  (derived knob groups; starts/support; S5 step order; no runtime
  start-sector inputs; floodplains removed — no such public group exists).

## 2. ADRs

- [x] 2.1 Verify ADR-008 (+S4 amendment) and ADR-009 cover ownership,
  deterministic-reconciliation posture, and readback-evidence-only — they
  do; no edits.
- [x] 2.2 Add ADR-010 (knob taxonomy: semantic groups derived from op
  schemas; density+sparsity+relationships first-class; Earth-like defaults
  with declared min/max expansion).

## 3. Deferrals

- [x] 3.1 Add DEF-004…DEF-014 to `docs/system/DEFERRALS.md`, each with an
  explicit trigger + project ownership note: terrain-readback retirement,
  resolveActiveResourceAge adapter routing, viz emitted-key registry, E1.4
  pedology contrast, engine landMask visibility, SILVER tile budget,
  capacity-derived hemisphere split, submodule refresh (D4), DLC resource
  balancing, independent peoples/minors, map-size scaling curves (D5).

## 4. System cards

- [x] 4.1 Verify the start-placement corpus-ledger as-built closure section
  (S4) is current; no README/index expects a separate as-built note; target
  card untouched.

## 5. Workstream closure

- [x] 5.1 Update `workstream/workstream-record.md`: gates 8–9 complete,
  slice/commit/proof-class ledger, honest proof-gate labels (live NOT RUN
  with exact Milestone A/B probe lists), S8 decision log.
- [x] 5.2 Write `docs/projects/placement-realignment/MILESTONE-PROOFS.md`
  (zero-context Milestone A+B runbook: deploy, parity, probes, gates,
  evidence destinations).
- [x] 5.3 Fill `workstream/closure-checklist.md` from the
  civ7-systematic-workstream asset; live-proof rows explicitly unchecked.

## 6. Verification

- [x] 6.1 `bun --cwd mods/mod-swooper-maps test`
- [x] 6.2 `bun run --cwd mods/mod-swooper-maps check`
- [x] 6.3 `bun run --cwd apps/mapgen-studio check`
- [x] 6.4 `bun run openspec -- validate placement-realignment-s8-closure --strict`
  + `bun run openspec:validate`
- [x] 6.5 `bun run verify:placement-metrics -- --seed 1337 --seeds 5 --size
  standard` unchanged vs S7
- [x] 6.6 `git diff --check`; clean tree after commit
