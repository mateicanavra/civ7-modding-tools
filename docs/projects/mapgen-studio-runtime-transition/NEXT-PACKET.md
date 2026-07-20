# Next Packet: Close The Studio Product Outcome

Status: Packet A closed-passed; A.1 test-topology preparation next

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
  -> codex/mapgen-studio-complete-config-admission (Packet A, closed-passed)
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
  reproduced. The remaining generic defect is that current admission can accept
  a partial 16-stage default object because it mistakes normalization no-op for
  completeness.
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
- `mods/mod-swooper-maps/test/config/maps-schema-valid.test.ts`
- `mods/mod-swooper-maps/test/config/standard-complete-config-boundary.test.ts`
- `apps/mapgen-studio/src/features/configAuthoring/canonicalConfig.ts`
- `apps/mapgen-studio/test/config/standardRecipeArtifactGuards.test.ts`

Close only after all nine configs pass through the shared boundary, focused and
classify-reported gates pass, and fresh TypeScript refactoring, code quality,
and TypeBox/library-correctness reviewers clear the change. Commit it as one
Graphite child above the census branch.

### A.1. Restore The Intended Test Topology

Reapply the already-chosen Swooper test moves under the small set of
domain-oriented test roots. Keep this branch mechanical: tracked moves,
import-path repair, current-reference repair, and unchanged behavior only.

The closed inventory admits exactly 106 moves:

- the historical 82 tests from `ecology`, `foundation`, `hydrology`,
  `map-elevation`, `map-hydrology`, `map-morphology`, `map-rivers`,
  `morphology`, and `placement` into their matching `test/domains/*` roots;
- all ten `test/resources/*.test.ts` files into `test/domains/resources`;
- all fourteen root `test/hydrology-*.test.ts` files into
  `test/domains/hydrology`.

Keep `standard-recipe.test.ts` and `standard-run.test.ts` as package-level
sentinels. Defer `layers/callsite-fixes.test.ts` to A.3 because it mixes
behavioral and structural concerns. Defer `m11-config-knobs-and-presets.test.ts`
to A.4 because the preset ontology decision may rename, rewrite, or delete it.
Keep build, config, diagnostics, fixtures, pipeline, and support at their
current roots.

A.1 also creates `mods/mod-swooper-maps/test/README.md` as the standing,
normative guide for this test corpus and links it from
`mods/mod-swooper-maps/AGENTS.md` and `docs/system/TESTING.md`. This scoped guide
is the only non-mechanical addition to the branch. It must distinguish rules
that apply now from the later harness destination rather than describing
unimplemented tooling as current capability.

The guide must establish these current laws:

- `test/domains/<domain>` expresses behavioral ownership, not a test category;
- unit and integration describe scope, while conformance, metrics regression,
  build/package smoke, offline runtime, and live describe distinct oracles or
  environments; they become directories or Nx targets only when execution
  policy actually differs;
- meaningful algorithm units and domain behavior remain domain-owned tests;
  framework-derivable contract and composition laws are enforced centrally;
- structural and import authority belongs to Habitat, not source-string tests;
- headless recipe execution never substitutes for rendered browser or Civ7
  observation.

The guide must also record the later test-harness destination and its re-entry
gates:

- one operation-case kernel executes a real operation with explicit input and
  complete strategy envelope, test-only contract validation, and independent
  domain assertions;
- one recipe-case kernel invokes real recipe compilation and execution with a
  caller-supplied runtime/context;
- strategy cases select through the operation kernel, while step and stage
  cases compose through the recipe kernel and public production factories;
- no harness may copy normalization, op binding, dependency satisfaction,
  artifact publication, plan compilation, or execution logic;
- no global fixture registry, generated operation-input defaults, copied
  config inventory, domain switch, or production runtime-validation path is
  admitted;
- the pilot begins only after operation topology and test TypeScript authority
  are stable, and broad migration begins only if the pilot removes duplicated
  setup while preserving or strengthening independent behavioral oracles.

The guide should name the current seams that motivate later work without
blessing them as architecture: `runOpValidated` does not currently validate
operation output, `buildTestDeps` duplicates part of production recipe
assembly, and the normal Swooper TypeScript check excludes tests. It must also
record that TypeBox's current `Type.Unsafe(Type.Any(...))` typed-array schemas
require explicit `x-runtime` constructor and shape interpretation in any
test-only contract validator.

The move requires relative import repairs in the moved files and one additional
parent segment in the five tests that derive source or fixture paths from
`import.meta.dir`: ecology baseline fixtures, ecology feature-planner policies,
ecology static structural scans, the Foundation contract guard, and placement
contracts. Preserve their existing behavior and source-string assertions.
Update only live current-path references in Studio and evergreen system docs;
historical OpenSpec and project records retain the paths actually used.

Close A.1 only when the tracked test-file count remains 142, the rename-aware
diff contains exactly 106 moves, and, apart from the scoped test guide and its
two routing links, the diff contains no assertion, fixture, config, runtime,
Nx, TypeScript-project, or Habitat-rule change. Required gates are
`git diff --check`, link/current-path review, the Habitat
`require_public_domain_surfaces_in_tests` rule, the Swooper lint target, and the
full Swooper test target with the Packet A oracle of 534 passed, 2 intentionally
skipped, and 0 failed. Bun and Habitat already discover the destination
recursively; add no new topology script or rule.

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
