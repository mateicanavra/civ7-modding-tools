# Next Packet: Close The Studio Product Outcome

Status: Packets A, A.1, and A.1a closed-passed; lifecycle-helper alignment is the next bounded child

Normative frame:
`docs/projects/mapgen-studio-runtime-transition/WORKSTREAM.md`

Live state:
`docs/projects/mapgen-studio-runtime-transition/verification-ledger.md`

## Objective

Make the rendered Studio Run in Game flow complete the requested launch from
current source to request-correlated in-game content. Use existing repository
checks and lightweight records. Do not build custom progress-tracking tools.

## Current Stack

```text
codex/studio-run-live-playability@4f501fabfdc6
  -> codex/mapgen-studio-runtime-transition-planning@ca6a06d24fff
  -> codex/mapgen-studio-config-envelope-runtime-cutover@3f5ed12e81a5
  -> codex/mapgen-studio-manifest-parity-replay@b2367c50d6ae
  -> codex/mapgen-studio-runtime-stage-0-census@76bfbcaa434d
  -> codex/mapgen-studio-complete-config-admission@9b082bac2434 (Packet A)
  -> codex/mapgen-swooper-test-topology@ceb6832e329d (Packet A.1)
  -> codex/mapgen-studio-dev-contract-freshness (Packet A.1a)
```

The historical source recovery is verified. The config and parity branches
passed isolated static and behavior checks, but no current-tree rendered
browser/Civ7 matrix has closed. Those branches are implementation evidence, not
the product result. Packet A is committed and closed-passed; it establishes the
complete-config boundary but does not claim the Run in Game product outcome.

## Prepared Findings

- The prior rendered `Resolving source` stall was orphaned browser state served
  against a daemon that predated the config-envelope branches. After a clean
  rebuild and restart, the browser, oRPC client, `/rpc` host, and current
  operation projection all resolve through the same current source tree. Do not
  add a second endpoint or UI path to repair that stale-process failure.
- All nine checked-in configs pass current schema admission, exact envelope
  round-trip, complete 22-stage materialization, four-seed generation,
  deterministic repeat, and fresh artifact rendering. No all-water output was
  reproduced. Packet A removed the partial-config admission path and requires
  the recipe-produced complete config at every public boundary.
- Studio still owns setup/start orchestration by importing direct-control
  functions in `Civ7WorkflowControl.ts`. The control oRPC surface has no
  setup/lifecycle family. That is the next larger ownership defect after config
  completeness is closed.
- One read-only investigation accidentally sent request
  `studio-run-in-game-mrgo592d-a58-2`. It generated and deployed the Studio run
  mod, then failed during `preparing-civ7` under Tuner backoff. It did not start
  Civ7 and is not an accepted runtime row; account for the replaced deployment
  before the next live attempt.

## Packet Sequence

### A. Complete Config Admission

Establish complete recipe config as the sole persisted and public runtime
contract:

- recipe-owned default construction uses TypeBox `Value.Create` on the
  executable public schema and validates the result before publishing it;
- every complete-config property is required, every author-controlled leaf has
  a deliberate default, and object schemas do not use `default: {}` as a
  structural seed;
- semantic absence is represented by a required discriminated mode rather than
  `Type.Optional`;
- Studio, Swooper source admission, browser execution, SDK calls, and runtime
  envelopes clone and validate the exact complete JSON value without defaulting,
  cleaning, merging, migration, or reconstruction;
- the generic compiler may materialize only recipe-produced internal step
  envelopes after complete public stage admission;
- tests assert these laws by walking supplied schemas and exercising every
  catalog config, never by freezing Standard stage or property inventories.

Primary files:

- `packages/mapgen-core/src/compiler/normalize.ts`
- `packages/mapgen-core/src/compiler/recipe-compile.ts`
- `packages/mapgen-core/src/authoring/`
- `packages/mapgen-core/test/compiler/normalize.test.ts`
- `mods/mod-swooper-maps/src/recipes/standard/artifacts.ts`
- `mods/mod-swooper-maps/src/maps/configs/canonical.ts`
- `mods/mod-swooper-maps/test/maps/map-config-schema.test.ts`
- `mods/mod-swooper-maps/test/recipes/swooper-physics-standard/recipe/standard-complete-config-boundary.test.ts`
- `apps/mapgen-studio/src/features/configAuthoring/canonicalConfig.ts`
- `apps/mapgen-studio/test/config/standardRecipeArtifactGuards.test.ts`

Close only after all nine configs pass through the shared boundary, focused and
classify-reported gates pass, and fresh TypeScript refactoring, code quality,
and TypeBox/library-correctness reviewers clear the change. Commit it as one
Graphite child above the census branch.

### A.1. Restore The Intended Test Topology

The initial move-only frame was falsified by semantic review. The accepted A.1
candidate instead performs one bounded ownership cleanup:

- domain tests own algorithms, rules, invariants, metrics, and benchmarks;
- `recipes/swooper-physics-standard` owns recipe, stage, and step authorship and
  orchestration;
- maps, diagnostics, build behavior, and non-owning support data have explicit
  roots;
- MapGen Core owns generic authoring, compiler, engine, and library laws;
- Civ7 adapter tests are reachable through a real Nx test target;
- source-text topology tests are deleted after their durable invariants are
  either confirmed in Habitat, retained as behavior, or recorded with an
  activation trigger for positive authority;
- one generic artifact-satisfaction law removed with the old Swooper pipeline
  test is retained in MapGen Core;
- the standing test guides define the future strategy/operation/step/stage/
  recipe harness family without claiming that it exists today.

A.1 does not create a harness, TypeScript test project, topology script, or new
Grit authority. Its remaining 281 test/dev/tool diagnostics stay owned by A.3:
280 independent diagnostics plus the existing unresolved MapGen trace export.

Close A.1 only after its three dedicated review lanes clear, all integrated and
classify-reported gates rerun, the Graphite child is committed, and a regular
Git worktree reproduces the committed project checks and tests.

### A.1a. Restore Serve-Mode Contract Freshness

The development browser and daemon currently use different freshness models:
the daemon resolves `@civ7/studio-contract` from source through `bun-source`,
while Vite resolves the same package from its one-time-built `dist`. A frontend
source change can therefore import a contract export that the live Vite graph
cannot link even though Vite still returns HTML and daemon health remains green.

Repair this on one dedicated child before A.2:

- add an exact `@civ7/studio-contract` source alias only when Vite runs in
  serve mode;
- keep production builds and generated recipe runtime imports on their owned
  built artifacts;
- bind the frontend explicitly to `127.0.0.1`;
- extend the existing `enforce_studio_dev_runner_topology` Habitat owner to
  assert the serve alias, its build-mode absence, and loopback binding as
  durable development-topology invariants;
- verify browser module evaluation and a nonempty React root in addition to
  frontend reachability and daemon `/healthz`.

Do not add a watcher, supervisor, broad package alias, export-specific test, or
second lifecycle path. Align the Codex worktree helper with its existing
environment handoff on a separate bounded child after this freshness repair;
retain its private tmux socket, per-worktree ports, and ownership-only teardown.

A.1a is closed-passed. Development serve resolves the exact bare Studio
contract import from source, production build has no matching alias, Vite binds
to `127.0.0.1`, and the existing Habitat owner validates the resolved serve and
build configurations. A clean restart from this worktree produced a healthy
daemon whose reported repository root matched this worktree; real browser
navigation evaluated the contract source module, retained generated recipe
artifact imports from `dist`, and mounted a nonempty React root without a
module-link error.

### A.2. Normalize Domain Operation Topology

Before repairing the static consumer corpus, normalize every MapGen domain
operation to the operation blueprint so type and import repairs bind to the
destination structure rather than transitional modules. The target operation
root is closed:

```text
<operation>/
  contract.ts
  index.ts
  rules/
    index.ts
    <rule>.ts
  strategies/
    index.ts
    <strategy>.ts
```

`contract.ts` owns the operation contract. `index.ts` binds the contract to its
strategies. A strategy owns assembly plus its algorithm. Reusable pure domain
rules or policies used in computation live as named modules under `rules/`.
No operation-local catch-all helper, policy, schema, or implementation file may
sit beside those four surfaces merely because the current corpus does so.

Begin with a semantic corpus and authority pass, not mechanical file shuffling:

1. bind the target to the active domain-operation and strategy blueprint docs,
   the authority ledger, and the successful `pedology-classify`,
   `refine-biome-edges`, and `plan-volcanoes` exemplars;
2. resolve the current generic structure allowance for `types.ts` and `policy/`
   against this stricter destination through Habitat's normal authority
   mechanism before treating either shape as accepted;
3. classify each operation's declarations and logic as contract, operation
   binding, strategy-owned algorithm, or reusable operation-local rule;
4. normalize operations in bounded domain slices without changing behavior or
   weakening established import rules;
5. once the corpus conforms, enable or strengthen the positive Habitat
   structure authority at the owning blueprint instead of adding bespoke
   scripts or exact-code assertions.

Each slice closes with production typecheck, affected behavior tests, domain
Habitat checks, and TypeScript refactoring, code-structure, and blueprint
authority review. This stage may delete helpers made redundant by honest
ownership, but it must not redesign algorithms, configuration semantics, or
runtime behavior.

### A.3. Close Static Test And Tool Coverage

The current production checks exclude Swooper tests, `src/dev`, most scripts,
and Studio tests. Bun and Vitest transpile and execute tests without invoking
the TypeScript checker, so passing behavior tests can coexist with editor
diagnostics. Close that execution-versus-static-authority gap before changing
the config ontology again:

The completed inventory found five source-local compile-time tests. Retain them
through A.2 because production `tsc` is currently their only oracle. During
A.3, move them atomically with green owner-local `tsconfig.test.json` projects
and independently runnable Nx `check:test` targets:

| Current source-local test | Destination |
| --- | --- |
| Swooper `maps/__type_tests__/authoring-sdk.multi-strategy.inference.ts` | split into MapGen Core operation, step, and recipe `.type-test.ts` files under their existing semantic test roots |
| Swooper `maps/__type_tests__/createMap-config.inference.ts` | Swooper `test/maps/create-map-config.type-test.ts` |
| Swooper `recipes/standard/__type_tests__/config-boundaries.ts` | Swooper Standard-recipe `standard-complete-config-boundary.type-test.ts` |
| MapGen Core `authoring/__type_tests__/artifact-readonly.ts` | MapGen Core `test/authoring/artifact/artifact-readonly.type-test.ts` |
| Studio browser-runner `__type_tests__/recipeRuntime.inference.ts` | Studio `test/browserRunner/recipeRuntime.type-test.ts` |

Static tests live under the semantic owner they constrain and use the
`.type-test.ts` suffix. Do not create a top-level `types` or `type-tests` root.
Make each move only in the same change that proves the destination compiler
project includes it and the production project no longer does.

1. retain the closed Packet A base-versus-tip comparison as the boundary between
   its repaired diagnostics and the independent historical corpus;
2. after A.1 settles test paths and A.2 settles production module paths, repair
   pre-existing shared `src/dev` and script contract bridges first, then
   Swooper test fixtures/consumers, then Studio tests on separate semantic
   Graphite children;
3. add the smallest separate `tsconfig.test.json` and `tsconfig.tools.json`
   projects and Nx targets only after each admitted scope is green;
4. make normal project checks depend on those green static surfaces without
   mixing browser, game-runtime, and tooling environments.

Do not restore partial config types, add suppression baselines, or silence
diagnostics with casts. Use recipe-produced complete configs, operation
`defaultConfig`, and behavior-specific mutation. A read-only reachability scan
may inform deletion decisions; new JUnit, coverage, mutation-testing, or Knip
infrastructure is not a prerequisite for this runtime train.

### A.4. Collapse The Redundant Preset Ontology

After Packet A is committed, inventory Studio and recipe consumers of the
current `preset` vocabulary. Unless an active consumer applies a genuinely
partial recipe-owned behavioral transformation, collapse the runtime and
browser model to one concept: **config**.

Catalog entries carry complete canonical config envelopes. Selection replaces
the immutable editor config. Save, Save As, import, export, browser execution,
Deploy, and Run in Game carry that complete value. Remove the redundant preset
state, lifecycle, dialogs, persistence, and `applyPresetConfig` path rather than
renaming them or preserving aliases. Civ7 map-size presets are unrelated and
out of scope.

Close with real config selection, editing, persistence, import/export,
Save/Deploy, browser execution, and Run in Game behavior checks. Commit this as
its own Graphite child before Packet B.

### B. Control oRPC Setup And Start Ownership

Design and implement the missing typed setup/lifecycle capability under
`packages/civ7-control-orpc`, using the daemon-owned Tuner session and in-process
server client. Move Studio off caller-local direct-control orchestration. The
operation must exit only an active game when necessary, load and reconcile the
saved setup and generated map, start the game, and retain request correlation
without restarting the Civilization VII application.

Close with contract/router/client behavior tests, dedicated TypeScript,
structure, oRPC, Effect, and direct-control reviews, and one rendered Swooper
Earthlike run with unchanged Civ7 application PID.

### C. Rendered Acceptance And Matrix

Exercise the actual button and establish exactly one request from browser
admission through public status, explicit diagnostics, manifest, deployment,
setup, start, and request-correlated in-game observation. Then run Latest Juicy,
Swooper Desert Mountains, and every declared freshness, failure, cancellation,
conflict, recovery, and redaction row. Reconcile packets and records, run the
full static gate set, submit and merge the accepted stack, and return to Habitat.

## Product Loop

1. Restart Studio from this worktree and confirm frontend, daemon health, and
   reported repo root all match the current committed tree.
2. Run the existing all-config admission and generation checks for every one of
   the nine built-in configs. Repair shared source/default/materialization
   defects only; no per-config migration, merge, or property special case.
3. Exercise the rendered Run in Game button and follow one request through the
   oRPC client, public status/current operation, explicit private diagnostics,
   generation manifest, generated mod, deployment snapshot, direct-control
   setup, and game start.
4. At the first real failure, diagnose the owning boundary, make the smallest
   architectural repair, run its behavior/static/library reviews, and repeat
   the rendered flow. Do not substitute a direct endpoint call for the button.
5. Close the first success row with Swooper Earthlike,
   `ToT_BasicModsEnabled.Civ7Cfg`, Huge, 10 players, balanced resources, and
   seed `1538316415`.
6. Run Latest Juicy and Swooper Desert Mountains plus the declared freshness,
   recovery, cancellation, conflict, validation, and redaction rows.
7. Reconcile OpenSpec/task/evidence records, run full static gates, submit and
   merge the accepted Graphite stack, then return the parked follow-up work to
   Habitat.

## Runtime Law

- Studio carries one complete admitted JSON config envelope without browser or
  server migration, deep merge, scrubbing, or property-level rescue.
- One rendered request owns one source, manifest, generated mod, deployment,
  setup reconciliation, and launched game.
- Ordinary Run in Game uses the canonical direct-control oRPC capability to
  soft-restart the Civ7 game. It does not restart the whole application.
- Public status stays redacted. Private diagnostics require explicit lookup.
- Endpoint, unit, browser, setup, and in-game observations are separate gates;
  none substitutes for another.

## Stop Conditions

Do not mutate unrelated worktrees or the readiness stack. Serialize live Civ7
mutation. If Civ7/Tuner is externally unavailable, record the exact state and
continue every non-live repair and check that remains possible; availability is
not a reason to stop diagnosis or implementation.
