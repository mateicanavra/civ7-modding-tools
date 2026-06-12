# Systematic Workstream Record — Placement Vertical Realignment

> Active goal (framed objective, controlling scope):
>
> Realign the standard recipe's **placement stage** end-to-end — diagnosis → significant
> refactor plan → implementation — covering player starts, resources, and the full
> vertical slice (algorithm → inputs/artifacts → knob-vs-config surface → studio
> visualization). The refactor must make placement coherent, streamlined, robust,
> simple, flexible, and leverageable; refactoring or migrating responsibilities
> up/down the pipeline is explicitly allowed when done correctly and verified.
> Grounding: (a) **Earth-like is the baseline** — default algorithms produce what an
> Earth-like planet would, then knobs expand outward to mins/maxes; (b) **official
> Civ 7 policy/resources** constrain everything — player starts lean more heavily on
> Civ 7 game mechanics; resources are game mechanics with stronger Earth-realism
> emphasis; starts must respect factors like fertility and water access in a way
> that honors both mechanics and Earth-like expectations. Verification ladder:
> predeclared physical expectations → local stats/tests → studio data dumps →
> **live game** proof at the right milestones (not every small change — it's
> expensive). Studio↔live-game **parity** is part of the target (a separate
> "rivers" stack relates to this parity gap; peek allowed). User impressions to
> verify, not assume: placement is "kind of screwed up"; starts seem to have "two
> different layers" and it's unclear when they work; studio shows extra/broken/
> missing placement visualizations; resource knobs don't map to wanted controls
> (sparsity, resource↔resource, resource↔start), not just density.

## Frame

- Objective: see Active goal above.
- Future state: placement reads like foundation/morphology — explicit sub-stages
  (starts vs resources vs wonders/discoveries), physically grounded scoring from
  named pipeline artifacts, Earth-like defaults with min/max expansion knobs,
  correct studio layers backed by real artifacts, studio output at parity with the
  live game, all constrained by official Civ 7 policy data.
- Non-goals: redesigning foundation/morphology beyond what placement needs
  (pattern baseline + permitted upstream migrations only); touching the in-flight
  `mapgen-studio-server-orpc` change; fine gameplay balance tuning beyond the
  Earth-like benchmark ranges.
- Hard core: placement stays policy-constrained by official Civ 7 resources
  (`.civ7/outputs/resources` submodule + CLI sync/inspection); changes are expressed
  within the established stage/step/artifact architecture (engine-refactor-v1
  normalization baseline); Earth-like baseline + predeclared expected ranges before
  tuning; every claim labeled with its proof class (stats vs studio dump vs live).
- Exterior: non-mapgen game systems; multiplayer; perf work beyond keeping
  generation times reasonable.
- Falsifier: if evidence shows placement's problems are predominantly upstream
  (insufficient ecology/hydrology artifacts), the plan shifts to "extend upstream
  artifacts + thin placement consumer" — allowed under the migration freedom.
- Redesign trigger: if fixes cannot map onto the stage/step/artifact architecture
  without violating it, escalate to architecture-authority review before forcing.

## Status

- Last updated: 2026-06-10
- Current gate: gates 8–9 COMPLETE (all slices S0–S8 implemented + verified at
  their declared proof classes; slice table below). Gates 3–7 + plan review
  (gate 11) were complete on 2026-06-09.
- Remaining: live-game proof at Milestones A+B (gate 10 live rungs) — NOT run;
  exact runbook in `../MILESTONE-PROOFS.md`. The workstream is otherwise
  closed (closure checklist in this directory).
- Blocked by: Milestones A+B need the game install + tuner socket (user
  environment).
- Stop condition: implemented slices verified against predeclared Earth-like
  benchmarks (done, stats class); studio layers correct (headless emission
  done; interactive QA = Milestone B); live-game proof recorded at milestones
  (pending); clean Graphite closure.

### Slice ledger (gates 8–9)

| Slice | Commits | Proof class achieved |
| --- | --- | --- |
| S0 metrics + baseline | eb20aad83 | stats (harness self-test + recorded broken baseline, 5 seeds) |
| S1 correctness hotfixes | 00c9aebdb | stats vs S0 baseline (E1.1 0%, studio probe 8/8) |
| S2 policy table chain | aa30ec396 | generated-output (byte-stable V0) + tests; metrics deep-equal to S1 |
| S3 resources cutover | ecdf193c7 + b8b30eadd + 2e41b45fc (fixups fbf199fe0, 0ba554d08, 0cdde184d) | stats (E2.1–E2.9 + E3.4 gates green; E2.7 SILVER + E1.8 regression recorded) |
| S4 starts realignment | 5c799c382 + dd6ffd091 | stats (E1.1–E1.8 green over 20 seeds, E1.4 amended) + studio-mapinfo probe |
| S5 support pass | 4225d52a7 + 11f9c213d | stats (E3.1–E3.3 green 20/20; E1/E2 hold) |
| S6 inputs/artifact hygiene | 48404e6ce + 5329a625a | tests (506 pass) + bit-identical metrics vs S5 |
| S7 viz + knob surface | ddb5aea0d + 0580638fd | studio dump, headless half (29 artifact-backed layers, coverage test, studio build green); interactive visual QA pending (Milestone B) |
| S8 docs/ADRs/closure | this slice | docs + clean state (PLACEMENT.md refresh, ADR-010, DEF-004..014, closure checklist, milestone runbook) |

### Decision log (S8)

- The interrupted prior S8 attempt left a clean tree (read-only calls only) —
  nothing to adopt or reset; S8 is a fresh implementation.
- ADR coverage verified, no rewrite needed: deterministic-reconciliation
  posture = ADR-009(a); domain/resources ownership = ADR-008;
  readback-evidence-only = ADR-009(b); sector divergence = ADR-008 S4
  amendment. New ADR-010 records the knob taxonomy.
- A docs-only OpenSpec change (`placement-realignment-s8-closure`) IS the repo
  convention (archived docs/skill-scoped changes exist, e.g.
  `2026-05-30-add-civ7-operational-debugging-skill`).
- Start-placement system card: the corpus-ledger as-built closure section
  (added in S4) is verified current; the card folder has no README/index
  expecting a separate as-built note, so none was added and the target card
  stays untouched as the prescriptive reference.

## Repo State

- Worktree: `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-placement-realignment`
  (editing), branch `placement-realignment` off `main` @ 90c47d45f.
- Read-only evidence checkout: `/tmp/civ7-main-placement-audit` (main, for the
  audit workflow agents).
- User's primary checkout: detached HEAD with in-flight `mapgen-studio-server-orpc`
  merge — protected, untouched.
- Related stack to peek for parity context: `wt-agent-mapgen-physical-rivers`.
- Protected paths: user's primary checkout; generated outputs.
- Generated/read-only paths: `packages/civ7-map-policy/src/civ7-tables.gen.ts`
  (regen via script only), `.civ7/outputs/resources` (submodule), `mods/**/dist`.

## Corpus Gate

- Corpus source(s): placement stage steps + domain/placement + domain/resources;
  `@civ7/map-policy` tables; official resources submodule (incl. base-game
  resource/start generator scripts); studio layer registry; project docs
  (resource-distribution-policy, pipeline-realism, mapgen-studio system-cards,
  engine-refactor-v1 packet, morphology-4stage-split).
- Corpus shape: mixed — action surfaces (steps), entities (resources, start slots,
  wonders), materialization targets (engine calls), viz layers, knobs.
- Coverage ledger: to be filled from evidence wave.
- Open uncertainty: which CLI is canonical for policy inspection; the "two layers"
  of player starts; studio layer-system expectations; studio↔game parity mechanics.

## Proof Gates (final state, labeled honestly)

- **Local stats: GREEN.** Every E1/E2/E3 gate verified over the 20-seed
  window (seeds 1337–1356, standard 84x54, mock adapter) with recorded
  amendments (E1.4) and recorded structural exceptions (E2.7 SILVER,
  E2.5 seed-1353 note). Evidence: `../evidence/s*-results-*.md`;
  regenerate via `bun run verify:placement-metrics`.
- **Generated/build proof: GREEN.** Policy tables byte-stable + idempotent
  (S2); mod + studio builds and full test suites green at S7 head.
- **Studio dumps: PARTIAL.** Headless emission VERIFIED (29 artifact-backed
  layers across 10/11 steps, pinned by `viz-coverage.test.ts`; studio worker
  bundle builds; same emission path as the studio worker). Interactive
  browser visual QA (colors, point sizing, overlay composites, landMask
  visibility call) NOT done — Milestone B item.
- **Live game: NOT RUN.** Milestones A+B pending; no live claim is made
  anywhere in this workstream. Exactly what each must probe:
  - **Milestone A (resources + identity):** full-grid
    `bun run verify:final-surface-parity` with delta classification (not
    sampled probes) + disposition of the
    `earthlike-live-feature-resource-legality-repair` 106/6996
    resource-mismatch corpus (refreshed, not orphaned); `civ7 game` probes
    for E2.2/E2.4 live counts; E4.4 mock-vs-live `canHaveResource` agreement
    (≥95% sampled plots) incl. `ignoreWeight` semantics;
    `isResourceRequiredForAge` live semantics (engine filters to leaders in
    the running game — static table is an approximation); alive-major id
    semantics (ordering/contiguity/humans-first — finalizes the
    `seat-identity.ts` mapping, D3); per-civ StartBias resolution
    (player→civ rows + engine id projection); E1.2 engine-id half.
  - **Milestone B (parity + viz):** E4.1 studio↔live parity (same
    seed/config: seat count + plots identical); live drift window for the
    reconstructed planning surfaces (does live `validateAndFixTerrain`
    rebind biomes/strip features between ecology projection and placement
    planning — S6's reconstruction equivalence is proven on mock maintenance
    only); E4.4 agreement re-checked on the stamped surface (live rejections
    of adjusted intents could drop a start below the E3.1 floor post-stamp);
    interactive studio visual QA of the placement layer set.
  - Runbook with exact commands: `../MILESTONE-PROOFS.md`.
- **Closure boundary:** per-slice closure via Graphite; all proof classes
  labeled separately above — no stronger claim than evidence supports.

## Team

- Owner: Claude session (synthesis, dispositions, closure).
- Evidence agents: A1 stage-anatomy, A2 player-starts, A3 resources, A4
  policy-grounding, A5 studio-viz, A6 history/docs, A7 inputs/artifacts.
- Review agents: adversarial verifiers on P1 diagnosis claims; gap critic; per-slice
  reviewer lanes during implementation (spec, code, stats, viz).
- Open findings: —
