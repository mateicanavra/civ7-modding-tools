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

- Last updated: 2026-06-09
- Current gate: 8 (implement slices; S0 next). Gates 3–6 complete (evidence
  register + diagnosis + expectations), gate 7 complete (refactor-plan.md),
  gate 11 plan-review complete (review-ledger.md, all findings repaired).
- Next gate: 9–10 per slice (stats + studio-dump verification; live-game proof
  at Milestones A/B).
- Blocked by: —
- Stop condition: implemented slices verified against predeclared Earth-like
  benchmarks; studio layers correct; live-game proof recorded at milestones;
  clean Graphite closure.

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

## Proof Gates

- Local stats: predeclared Earth-like expected ranges per entity/group BEFORE
  tuning; observed-vs-expected over stable seeds.
- Generated/deploy proof: build + deploy of the mod via canonical scripts.
- Studio proof: data dumps inspected in studio for distribution/scoring layers.
- Runtime proof: live game verification at milestone boundaries (bounded: branch,
  commit, command path, timestamps, parsed payload) — not per-small-change.
- Product proof: studio↔live parity for placement layers; policy legality checks
  against official tables.
- Closure boundary: per-slice closure via Graphite; workstream closes only with
  all proof classes labeled separately.

## Team

- Owner: Claude session (synthesis, dispositions, closure).
- Evidence agents: A1 stage-anatomy, A2 player-starts, A3 resources, A4
  policy-grounding, A5 studio-viz, A6 history/docs, A7 inputs/artifacts.
- Review agents: adversarial verifiers on P1 diagnosis claims; gap critic; per-slice
  reviewer lanes during implementation (spec, code, stats, viz).
- Open findings: —
