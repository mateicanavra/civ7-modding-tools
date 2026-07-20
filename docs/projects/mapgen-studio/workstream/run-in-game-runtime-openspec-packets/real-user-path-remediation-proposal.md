# Run In Game Real User Path Remediation Proposal

Status: draft execution proposal

Worktree:
`/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-agent-codex-mapgen-studio-runtime-openspec-packets`

## Intent

The packet train moved the runtime architecture toward the right topology, but
the current stack still fails the thing the product exists to do: a user clicks
Run in Game in Studio and Civ7 starts the generated map they requested. The
remaining work is not another local cleanup. It is a remediation pass over the
real user path, with live verification as the closing gate.

The target is intentionally boring:

```text
visible Studio selection
  -> one normalized public authoring config
  -> one browser-originated Run in Game request
  -> one generated Studio-run mod
  -> one deployed mod snapshot
  -> one Civ7 setup row visible for that generated map
  -> one started game using that generated content
  -> one public terminal status
  -> one private diagnostics lookup for detailed evidence
```

The user-facing outcome is that Run in Game either starts the selected generated
map or reaches a terminal safe failure state that tells the user what class of
recovery is available. It must not hang, silently do nothing, reuse stale
generated artifacts, or expose internal paths/envelopes through public UI state.

## What Failed

The final packet matrix exercised real Studio `/rpc` endpoints and live Civ7
state, but it did not close the rendered browser-click path with the saved setup
configuration the user actually uses. The user's current attempts created real
Run in Game operations, generation and deployment completed, and diagnostics
showed the failing boundary:

- `studio.operations.current` recorded terminal failed operations.
- The public failure category was `runtime-control`.
- Private diagnostics reported
  `Civ7 setup map row is not visible for {mod-swooper-studio-run}/maps/run-*.js`.
- The request used saved setup config `ToT_BasicModsEnabled.Civ7Cfg`, Huge map,
  `10` players, and current Studio editor/catalog selections.
- The generated mod files and deployed mod snapshot existed, but direct-control
  setup row readback could not see the generated `mod-swooper-studio-run` row.
- Current investigation found the sharpest runtime thesis: the generated mod can
  be known to Civ7 after restart, then the saved setup configuration load can
  reconcile the active target mod set without the request-local
  `mod-swooper-studio-run` mod. In that state `{swooper-maps}` catalog rows stay
  visible, but `{mod-swooper-studio-run}` generated rows are absent.

That means the failure is after source resolution/generation/deployment and
before game start. It is not explained by Studio being down, not explained by
the daemon `/rpc` mount being unavailable, and not explained by a missing
generated map file alone.

## Root Cause Map

### 1. Endpoint Matrix And UI Path Diverged

The accepted live matrix was endpoint-originated. It verified that controlled
`runInGame.start` payloads can complete through Civ7, but it did not verify
that the rendered Studio button builds the same effective request under realistic
browser state.

The rendered path has extra inputs and state transitions:

- persisted Studio preset/editor state;
- current materialization mode;
- current saved Civ7 setup config;
- browser event-stream adoption;
- visible setup controls and selected preset application;
- terminal status adoption after reload, reconnect, or missed events.

When that path is not tested directly, the code can be correct at the contract
edge while still failing the user's click.

### 2. Saved Config And Generated Mod Visibility Are Coupled

The runtime assumes that copying the generated `mod-swooper-studio-run` tree and
restarting or focusing Civ7 is enough for setup control to see the generated
map row. The current failure shows that assumption is false in at least one
realistic case: the generated script is present, the mod appears to load, but
the setup map catalog does not expose the generated row.

The saved Test of Time config with basic mods enabled is not a passive option.
It participates in the same setup state that must expose the generated map row.
`prepareCiv7SinglePlayerSetup()` loads the saved config before reading setup
rows; `runCiv7SinglePlayerFromSetup()` also prepares setup as part of start.
If one phase observes a row before the saved-config reconciliation and a later
phase loads the saved config again, the workflow can invalidate its own row
check.

The remediation must determine whether `ToT_BasicModsEnabled.Civ7Cfg` excludes
the generated mod, whether Studio/direct-control should clone or patch that
setup state, whether direct-control needs an explicit generated-mod enablement
primitive, or whether the workflow should generate a dedicated saved setup
configuration that composes "basic mods enabled" with the request-local
Studio-run mod.

### 3. Failure Classification Is Too Blunt

The current terminal category is safe for the UI, but the private failure
summary overstates the problem as direct-control start unavailability. Direct
control is available enough to reach shell/setup state and read rows. The real
failure is generated setup row invisibility after deployment/config mutation.
Private diagnostics should preserve that distinction so the next operator is
not sent hunting for a dead tuner socket when the setup mod set is the suspect.

### 4. Public UI State Can Appear Running After The Daemon Terminalizes

The app now relies on `studio.events.watch` plus mount-time
`studio.operations.current` adoption for operation freshness. That is the right
direction for avoiding browser polling as the source of truth, but it leaves a
specific product hazard: if the stream disconnects, misses a terminal event, or
the user lands on stale browser state, the UI can keep presenting the action as
in progress after the daemon has already recorded a terminal state.

This is not a reason to reintroduce ambient polling as a second runtime owner.
It is a reason to make terminal adoption explicit at the UI boundary: event
stream recovery, mount/reconnect reconciliation, and visible terminal status
must be tested as part of the user path.

### 5. Public Config Still Leaks An Internal Operation Envelope

`foundation-orogeny` currently falls back to the internal-step-as-public stage
surface. That exposes `crust-evolution.computeCrustEvolution.strategy/config`
shape through the Studio/default config path, and at least one current config
artifact contains that internal envelope.

That is the same class of smell the packet train was meant to remove: internal
runtime operation details crossing into public authoring config. It also makes
preset application hard to reason about because Studio can appear to inject
weird values when it is really carrying an internal envelope that never should
have been public.

### 6. Evidence Retention Did Not Preserve The User-Path Chain

The retained packet evidence is strong at individual runtime layers, but it does
not preserve a single chain that starts with the rendered button and ends with
post-start Civ7 readback for the user's exact scenario. The next closure record
must include the browser-originated request id and connect it through public
status, private diagnostics lookup, generated/deployed artifact identity, setup
row readback, and live game readback.

## Solution Units

### Unit A: Real Browser-Originated Run Contract

Make the browser click path a first-class acceptance surface, not a side effect
of endpoint tests.

The live harness should drive Studio through the rendered UI, select the
scenario exactly as a user would, click Run in Game, and capture the admitted
request id from the public status/operations surface. It should then follow the
same request through:

- `runInGame.status`;
- `studio.events.watch`;
- `studio.operations.current`;
- explicit `runInGame.diagnostics({ diagnosticsId })`;
- `civ7.live.status`;
- `civ7.live.snapshot`.

Correctness oracle: the UI reaches terminal `completed` for successful cases,
or terminal `failed/cancelled` with a safe public category for failure cases.
The UI must not remain indefinitely running after the daemon has a terminal
operation.

### Unit B: Generated Map Row Visibility And Saved Config Integration

Treat setup-row visibility as the live launch boundary. Deployment is not enough
until Civ7 setup control can read back the generated Studio-run map row that
matches the current request.

The implementation work should investigate and then repair the exact row-missing
boundary:

- whether `mod-swooper-studio-run` is enabled in `ToT_BasicModsEnabled.Civ7Cfg`;
- whether the saved config load changes the target mod set after an earlier
  generated-row check passed;
- whether the generated mod's `modinfo`, shell action group, config rows, and
  localized text are sufficient for Civ7 setup catalog discovery;
- whether generated `mod-swooper-studio-run` action-group ids are unique enough
  to avoid ambiguous logs and shell/game action resolution;
- whether Civ7 needs a different restart, reload, or setup-state transition to
  discard cached map rows;
- whether direct-control is reading too early or from the wrong UI state;
- whether saved-config application overwrites or omits the generated map row
  after deployment.

The repaired runtime should have one coherent setup/start sequence:

1. load or compose the saved setup config;
2. ensure the request-local generated mod is in the active target mod set;
3. read back the generated setup row after that config/mod reconciliation;
4. apply generated map script, Huge map, seed, 10 players, and options;
5. read back those setup values;
6. start the game without reloading a different setup state.

Correctness oracle: after deployment and before Begin, direct-control and the
public `/rpc` run diagnostics can read back the generated row for
`{mod-swooper-studio-run}/maps/run-*.js`, and that row matches the admitted
request's run artifact id.

### Unit B2: Specific Runtime Failure Projection

Keep the UI category safe, but make private diagnostics and recovery vocabulary
specific. A missing generated row should be classified internally as
`setup-map-row-not-visible`, `generated-map-mod-not-enabled`, or equivalent
direct-control details with a bounded row/mod-set sample. It should not collapse
to a generic "direct-control unavailable" summary unless the tuner connection
itself is unavailable.

### Unit C: Terminal Adoption And User Recovery

Keep daemon state as authoritative, but harden the browser's adoption of
terminal state.

The intended shape is:

- event stream remains the push path for fresh operation status;
- hello/reconnect/mount adoption reads `studio.operations.current`;
- terminal events mark the request toast/status handled exactly once;
- stream failure surfaces as recoverable UI state, not as a silent spinner;
- a missed event is recovered by an explicit current-operation reconciliation
  path, not by replaying a mutation.

Correctness oracle: when the daemon records terminal failed/completed/cancelled,
the UI adopts that terminal state across reload, stream reconnect, and stale
local state. The status copy remains public and safe; private details remain
behind diagnostics lookup.

### Unit D: Public Config Surface Repair

Remove internal runtime operation envelopes from public/default/preset config.
This should be solved at the owning stage authoring surface, not by masking
values in Studio.

The likely fix is to give `foundation-orogeny` a semantic public surface and a
compile function, even if the first public surface is only the existing high
level knobs plus an author-facing `crustCharacter` group for the
`compute-crust-evolution` defaults. Presets and Studio should carry
author-facing config only; internal `strategy/config` objects belong behind
compile.

Do not solve this with a Studio scrubber. The correct owner is the Swooper
standard recipe stage surface, alongside the other Foundation public config
helpers. Existing persisted/imported configs that contain
`foundation-orogeny.crust-evolution.computeCrustEvolution` need migration
coverage, but new Studio authoring state should never generate that shape.

Correctness oracle:

- `STANDARD_RECIPE_CONFIG` validates against the recipe schema;
- built-in config JSONs validate;
- applying built-in presets in Studio does not introduce any raw
  `{ strategy, config }` operation envelope;
- the existing special-case allowance for `foundation-orogeny` is removed;
- the existing Habitat public-authoring-surface rule is updated in place, not
  bypassed by a new ad hoc script;
- comments describe why the public surface exists, not how individual lines
  assign fields.

### Unit E: Evidence Chain And Closure Gate

Produce one retained live evidence chain per required user scenario. The chain
must be bounded and safe to publish in workstream docs: public records redacted,
private diagnostics referenced by diagnostics id/request id, and internal paths
kept out of public status/event payloads.

Correctness oracle: every scenario has one row in the evidence ledger with the
visible UI action, request id, terminal public status, diagnostics id, generated
artifact id, deployed snapshot identity, setup-row readback, and post-start live
game readback.

## Required Live Scenario Matrix

All successful scenario runs use:

- saved setup config: `ToT_BasicModsEnabled.Civ7Cfg`;
- basic mods enabled through that saved config;
- map size: `MAPSIZE_HUGE`;
- player count: `10`;
- resources: `balanced` unless the UI selection explicitly says otherwise;
- seed: `1538316415` for each first-pass row unless a row records a different
  explicit seed before execution;
- Studio server and daemon running from this worktree/stack;
- the visible Studio button path, not direct endpoint-only starts.

Required map configurations:

| Scenario | Expected Source | Required User Path |
| --- | --- | --- |
| Swooper Earthlike | `swooper-earthlike` / Swooper Earthlike | Select the saved setup config, select Swooper Earthlike in Studio, seed `1538316415`, Huge, 10 players, click Run in Game, verify generated content in started Civ7 game. |
| Latest Juicy | `latest-juicy` / Latest Juicy | Select the saved setup config, select Latest Juicy in Studio, seed `1538316415`, Huge, 10 players, click Run in Game, verify generated content in started Civ7 game. |
| Desert Mountains | `swooper-desert-mountains` / Swooper Desert Mountains | Select the saved setup config, select Desert Mountains in Studio, seed `1538316415`, Huge, 10 players, click Run in Game, verify generated content in started Civ7 game. |

For each row, the live record must include these checks:

1. Studio page is rendered from the expected worktree and daemon identity.
2. Saved setup config shown/selected is `ToT_BasicModsEnabled.Civ7Cfg`.
3. Studio authoring config has no raw internal operation envelope.
4. Run in Game is started by clicking the visible control.
5. Public operation status exposes only public fields.
6. `studio.events.watch` and `studio.operations.current` agree on the active or
   terminal request.
7. Explicit diagnostics lookup returns the private runtime chain for the same
   request id.
8. Generated mod and deployed snapshot identities match the request.
9. Setup-row readback sees the generated map row before Begin.
10. Setup readback confirms seed `1538316415`, map size `MAPSIZE_HUGE`, and
    player count `10` after saved-config load and before Begin.
11. Fresh scripting-log markers include the request id, run artifact, config
    hash/envelope hash, and `[mapgen-complete]` without a reject-pattern match.
12. Post-start live status/snapshot show Civ7 in-game on the generated content;
    Huge map dimensions are expected to read back as `106x66`.

## Failure-Mode Checks

These checks prevent another endpoint-green/browser-red handoff:

- missed terminal event: interrupt or drop the event stream and verify the UI
  adopts terminal state from `studio.operations.current`;
- row missing: force or reproduce the generated-row-missing condition and verify
  the operation terminalizes with public `runtime-control` or
  `runtime-observation`, not a spinner;
- stale saved config: select a saved config that does not enable the generated
  mod and verify the UI/diagnostics explain the enabled-mod mismatch safely;
- saved-config mutation ordering: verify row visibility after, not before, the
  saved-config load and any target-mod reconciliation;
- preset application: apply each required built-in map config and verify no
  internal operation envelope appears in the resulting authoring config;
- repeat run: run the same scenario twice and verify fresh request/workspace/
  deployment identities even when deterministic config digests match.
- missed terminal event or browser reload: the UI recovers terminal state from
  `studio.operations.current` and never replays Begin automatically.
- Vite/server restart while active: explicitly bounded as not recoverable unless
  durable operation storage is added; it must not be accidentally counted as a
  green user-path case.

## Claims Not Yet Supported

The remediation should not claim any of the following until the live work proves
them:

- generation or deployment is the root defect;
- Civ7 or direct-control generally cannot launch games;
- a full process restart alone fixes the row-missing failure;
- `ToT_BasicModsEnabled.Civ7Cfg` currently enables `mod-swooper-studio-run`;
- duplicate generated mod action-group ids are causal;
- the Huge/10-player Swooper Earthlike, Latest Juicy, and Desert Mountains
  paths are verified from the rendered Studio button.

## Execution Slices

1. **Proposal and authority alignment.** Land this remediation proposal in the
   workstream, classify whether the current packets need amendments or a new
   OpenSpec remediation change, and update the evidence ledger vocabulary to
   distinguish endpoint-originated, browser-originated, and in-game observed
   records.
2. **Config surface repair.** Add semantic `foundation-orogeny` public config
   and compile behavior; remove the test exception; repair affected preset or
   generated config artifacts through normal generation commands; add behavior
   tests that apply presets without leaking internal envelopes.
3. **Generated row visibility investigation and repair.** Reproduce the
   generated-row-missing failure with `ToT_BasicModsEnabled.Civ7Cfg`, classify
   the boundary, and repair the smallest correct owner: generated mod metadata,
   saved-config/generated-mod composition, setup reload sequencing, or
   direct-control row observation timing. The core design question is whether
   direct-control should patch/clone the saved config, expose an explicit mod
   enablement primitive, or generate a request-specific setup config that
   composes the user's basic mods with `mod-swooper-studio-run`.
4. **Browser terminal adoption hardening.** Add targeted tests for missed events,
   reconnect/current reconciliation, and stale local operation state. Preserve
   daemon ownership; do not reintroduce a browser-owned runtime polling loop.
5. **Live user-path harness.** Build a deterministic harness around the rendered
   Studio page plus public `/rpc` follow-up calls. It should capture screenshots
   only where useful, but the durable record is the request/evidence chain.
6. **Required scenario execution.** Run Swooper Earthlike, Latest Juicy, and
   Desert Mountains using `ToT_BasicModsEnabled.Civ7Cfg`, Huge map, 10 players,
   and basic mods enabled. Record terminal status and live game readback for
   each.
7. **Review and closure.** Run the declared behavior tests, OpenSpec validation,
   Habitat classify-reported checks, live endpoint checks, and dedicated review
   lanes. Close only when reviewers have dispositioned findings and the live
   user-path matrix is green.

## Review Lanes

The remediation changeset requires the normal three lanes plus two focused
adjacent lanes:

- TypeScript refactoring: source/request state modeling, type-level config
  surface guarantees, terminal adoption state, and absence of type escape
  hatches.
- Code quality/structure: ownership boundaries, no masking in Studio for a
  stage-authoring defect, no random scripts for topology, and no brittle
  duplicate assertions.
- Library correctness: oRPC public/private error semantics, Effect cleanup and
  resource ownership where touched, direct-control setup/runtime state use, and
  TypeBox/schema correctness.
- Testing design: falsification-first matrix, clear oracles, event-drop and
  row-missing failure checks, and no endpoint-only substitution for UI path.
- Habitat/authority: positive structural assertions only where the invariant is
  a class of topology, not code-shape duplication; retire stale guardrails
  through Habitat records rather than waiving them.

All reviewers inspect JSDoc and anchor comments for purpose/why content. The
right comments explain boundary ownership or operational intent; they do not
narrate simple assignments.

## Exit Criteria

The remediation is closed only when:

- `nx run mapgen-studio:test` is green;
- targeted config/preset tests are green;
- targeted Run in Game terminal-adoption tests are green;
- OpenSpec strict validation is green for the remediation change and the packet
  train remains valid;
- Habitat classify-reported checks are green;
- the live browser-originated matrix is green for Swooper Earthlike, Latest
  Juicy, and Desert Mountains with `ToT_BasicModsEnabled.Civ7Cfg`, Huge map, and
  10 players;
- each successful run has matching public terminal status, explicit private
  diagnostics lookup, setup-row readback, and post-start in-game readback;
- public status/event/current payload scans show no private paths or internal
  diagnostic sections;
- review lanes are complete and material findings are dispositioned.

Until those are true, the initiative remains open.

## Review Inputs Incorporated

This draft incorporated three read-only advisor lanes:

- Runtime/Civ7 launch realism: sharpened the row-missing diagnosis into saved
  config and target-mod-set coupling, flagged the prepare/start sequencing
  mismatch, and cautioned against blaming generation/deploy or generic
  direct-control availability.
- Testing design: converted the acceptance surface from endpoint-originated
  runs to rendered browser-originated rows, added explicit seeds, Huge `106x66`
  readback, player-count readback, event-drop/reload recovery, and
  double-click/stale-state checks.
- Public config/authority: confirmed the `foundation-orogeny` internal envelope
  leak, identified the stage authoring surface as the owner, and required
  updating existing Habitat authority rather than adding one-off topology
  scripts.
