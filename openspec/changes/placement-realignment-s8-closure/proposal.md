# Placement Realignment S8 — Docs, ADRs, Deferrals, Closure

## Why

The S0–S7 slices realigned the placement vertical (op-owned decision logic,
policy-grounded resource planning, op-owned start selection, support pass,
artifact hygiene, viz + knob surface) but the canonical reference docs still
described the pre-realignment stage (audit-cited stale on 3 counts, further
outdated by every slice), the workstream's structural knob-taxonomy decision
had no ADR, eleven recorded deferral candidates had no durable
DEFERRALS.md entries with triggers, and the workstream record did not yet
label the achieved proof classes honestly (local stats GREEN, studio dumps
PARTIAL, live game NOT RUN). Diagnosis RC1 names unrecorded decisions as the
root cause of placement's regime accretion; S8 closes that loop for this
workstream and hands off the live milestones as an executable runbook.

## Target Authority Refs

- `docs/projects/placement-realignment/refactor-plan.md` (S8 slice scope; D5
  deferral declarations)
- `docs/projects/placement-realignment/evidence/s*-results-*.md` (per-slice
  evidence the docs refresh describes)
- `openspec/changes/placement-realignment-s{0..7}-*/proposal.md` decision
  logs + open items (deferral sources)
- `.agents/skills/civ7-systematic-workstream/assets/closure-checklist.md`
  (closure gate)
- `AGENTS.md` (ADR/DEFERRALS recording rules; docs architecture)

## What Changes

Docs-only; no runtime/build behavior change.

- **`docs/system/libs/mapgen/reference/domains/PLACEMENT.md` rewritten** to
  the as-built placement vertical: 11 steps in the
  plan→starts→support-adjust→stamp order, op-owned decision logic,
  domain/resources ownership (ADR-008), typed reconciliation + the three
  declared engine reads (ADR-009), six knob groups with derived schemas,
  artifact inventory with validators, viz coverage, verification surfaces.
- **`GAMEPLAY.md` + `STANDARD-RECIPE.md` minimal stale-claim fixes:** the
  Gameplay-absorption carve-out for `domain/resources` (ADR-008); the
  placement config posture paragraph (derived knob groups, no runtime
  start-sector inputs, S5 step order).
- **`docs/system/ADR.md`: ADR-010 added** — placement knobs are semantic
  groups derived from op schemas; density+sparsity+relationship controls
  first-class; Earth-like defaults with declared min/max expansion.
  ADR-008/009 verified to already cover ownership, reconciliation posture,
  and readback-evidence-only (no edits needed).
- **`docs/system/DEFERRALS.md`: DEF-004…DEF-014 added** (each with an
  explicit trigger, owned by the placement-realignment project): terrain
  readback retirement, resolveActiveResourceAge adapter routing, viz
  emitted-key registry, E1.4 pedology contrast, engine landMask visibility,
  SILVER tile budget, capacity-derived hemisphere split, submodule refresh
  (D4), DLC resource balancing, independent peoples/minor placements,
  map-size scaling curves (D5).
- **Workstream closure:**
  `docs/projects/placement-realignment/workstream/workstream-record.md`
  status → gates 8–9 complete with a slice/commit/proof-class ledger and
  honestly-labeled proof gates (live NOT RUN, with the exact Milestone A/B
  probe list); `docs/projects/placement-realignment/MILESTONE-PROOFS.md`
  added (zero-context live-proof runbook);
  `workstream/closure-checklist.md` filled (live-proof rows explicitly
  unchecked).
- Start-placement system card verified: the corpus-ledger as-built closure
  section from S4 is current; no target-card edits.

## Decision Log

- **Prior interrupted S8 attempt left a clean tree** (read-only calls only);
  nothing to adopt or reset — fresh implementation.
- **Docs-only OpenSpec change created** (this one): repo convention supports
  docs/skill-scoped changes (e.g. archived
  `2026-05-30-add-civ7-operational-debugging-skill`).
- **DEFERRALS placement:** new entries live in the system-level
  `docs/system/DEFERRALS.md` (AGENTS.md rule: intentional deferrals with
  triggers go there), grouped under a project-ownership note rather than a
  new project-local deferrals doc, because most triggers outlive the project
  (adapter surfaces, viz registry, map sizes).
- **No system-card as-built note file added:** the start-placement card
  folder has no README/index expecting one; the corpus-ledger already
  carries the S4 as-built closure section.
- **PLACEMENT.md keeps the legacy-naming note** (Gameplay absorption) but
  reframed per ADR-008: absorption may consolidate orchestration, never
  re-own resource planning.

## Requires

- `placement-realignment-s7-viz` (describes the surface this slice
  documents).

## Affected Owners

- `docs/system/**` (ADR, DEFERRALS, mapgen reference docs).
- `docs/projects/placement-realignment/**` (record, runbook, checklist).

## Forbidden Owners

- No code, schema, config, or generated-file changes.
- No target-card (`system-card-target.html`) edits.
- No live-proof claims anywhere.

## Verification Gates

- `bun --cwd mods/mod-swooper-maps test` (unchanged from S7).
- `bun run --cwd mods/mod-swooper-maps check`,
  `bun run --cwd apps/mapgen-studio check`.
- `bun run verify:placement-metrics -- --seed 1337 --seeds 5 --size standard`
  — unchanged vs S7 (docs-only).
- `bun run openspec -- validate placement-realignment-s8-closure --strict`;
  `bun run openspec:validate`.
- `git diff --check`; clean tree after commit.
