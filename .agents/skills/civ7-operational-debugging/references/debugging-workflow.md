# Debugging Workflows

Choose the workflow by the fact under review. Do not run every gate by habit.

## Common Setup

1. Read the nearest `AGENTS.md` and the sealed Civ7 capability packet.
2. Name the product capability and the exact fact that looks wrong.
3. Locate its owner with `operational-paths.md`.
4. Inspect the owning Nx project and, for CLI work, native `--help`.
5. Record inputs and a fresh evidence boundary before the action.

## Definition And Deterministic Generation

Use when asking whether the portable Swooper definition produced the expected
artifact, metric, trace, or diagnostic values.

1. Run the smallest target on `swooper-physics` or the MapGen CLI leaf selected
   through native help.
2. Record recipe/config identity, map and game seeds, map size, and output/run
   identity.
3. Inspect typed artifacts or diagnostic layer values, not only rendered pixels.
4. Compare against a declared expectation or baseline cohort.
5. Label the result as contract/semantics/execution/generated evidence. It is
   not Civ7 loader or live-game proof.

## Realization And Installation

Use when asking whether the exact mod artifact was built and installed.

1. Inspect `swooper-physics-mod` targets and outputs with Nx.
2. Invoke the owning build or deploy target; do not call an internal script
   directly unless that target explicitly delegates to it for debugging.
3. Record generated-tree and installed-tree identities plus the install
   adapter's receipt.
4. Compare exact files/digests only within the selected receipt.
5. Label build, generated, and installed claims separately. Proceed to loader
   or live evidence only if the question requires it.

## Tuner Resource

Use when acquisition, connection, epoch, health, raw execution, or release is
in question.

1. Verify the qualified app selected the local-socket provider.
2. Observe the resource-owned health/epoch result through the app-bound
   diagnostic projection.
3. If raw execution is required, use the current bounded diagnostic command
   discovered from `game --help`; name the scripting state and epoch.
4. After reconnect, treat all prior observations as stale and rediscover states.
5. Do not infer Civ7 gameplay success from a raw command result.

## Window Capture

Use when capture is blank, stale, denied, or targets the wrong window.

1. Keep generic provider facts (platform, permission, selected window,
   helper/process result, image receipt) separate from controller and gameplay
   claims.
2. Confirm acquisition and capture occur inside the qualified app scope.
3. Record provider interruption or timeout explicitly; do not hang waiting for
   an unbounded child process.
4. Validate the captured file/image receipt and any qualified app
   interpretation separately. The controller neither selects the window nor
   consumes the frame.

## Civ7 Controller

Use when Civ7 readiness, setup, game, map, UI, dispatch, or readback is wrong.

1. Start from the public controller client bound by the host app, never the
   provider or private router.
2. Select the official runtime realm/API group that owns the native operation.
3. Record host-access epoch plus controller realm/boot and request/operation
   correlation.
4. Distinguish admission, dispatch, readback, stale/partial/unavailable, and
   uncertain results.
5. If the desired result is a gameplay recommendation or next action, move to
   the Play workflow instead of adding policy to the controller.

## Actor-Facing Play

Use when a lawful gameplay choice is refused, uncertain, repeated, or gives a
bad next action.

1. Re-read the situation from the public play client/CLI projection.
2. Preserve the check/request/no-repeat identity and exact candidate values.
3. If the request may have dispatched, reconcile through fresh controller facts;
   do not retry blindly.
4. Classify refusal, postcondition, uncertainty, and next action as play-owned
   outcomes.

## MapGen-runs

Use when Save & Deploy or Run in Game is stuck, stale, canceled, or disagrees
with receipts.

1. Record the operation/request id and current MapGen-runs phase/state.
2. Inspect each dependency result separately: authored-config write,
   materialization, installation, setup/controller, run-files, and fresh-log
   evidence.
3. Keep app-adapter physical receipts distinct from the service's semantic
   outcome.
4. Adopt, cancel, or reconcile only through the public operation contract.
5. Preserve failure, cancellation, stale adoption, and uncertainty in the
   final projection rather than collapsing them into a generic error.

## Projection

Use when owner facts are correct but CLI/API/web output is wrong.

1. Compare the projection's caller contract with the bound public result.
2. Verify translation, presentation, auth/request context, stream ordering, or
   browser interaction without reaching into private service source.
3. Fix the projection only if the underlying owner fact is already correct.

## Closeout

Report:

- claim and owner;
- exact input and correlation identities;
- command/target discovered and run;
- evidence boundary;
- strongest supported proof label;
- what remains unproved;
- whether retry is lawful.
