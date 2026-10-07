# Civ7 Tuner Runtime

Use this reference when live evidence depends on the Civ7 Tuner capability.
Tuner is a managed foreign resource, not the product-control API.

## Ownership

| Concern | Owner |
| --- | --- |
| Provider-neutral session, health, epoch, raw-command, and failure vocabulary | `resources/civ7-tuner` |
| Endpoint discovery, socket framing, state discovery, reconnect, command execution, and release | `resources/civ7-tuner/providers/local-socket` |
| Provider selection, acquisition scope, client binding, and disposal | qualified app |
| Closed typed native operations executed inside Civ7 | `services/civ7-controller` through the controller mod |
| Gameplay policy and next action | `services/civ7-play` |
| Typed controller-client transport binding | qualified host app over the selected Tuner provider |
| Raw diagnostic presentation | an explicitly qualified CLI/API diagnostic projection |

A service or ordinary command never opens its own socket. A caller consumes an
app-bound resource value for raw diagnostics or an app-bound controller/Play
client for semantic work. The host transport sends typed envelopes to the
deployed controller; it never sends a mature operation implementation body.

## Connection And Epoch

- Tuner support must be enabled in the user's Civ7 configuration before the
  local-socket provider can acquire it.
- Host, port, connection timeouts, and endpoint discovery come from provider
  configuration. Inspect the selected app composition and provider source
  rather than hard-coding them in a task.
- Acquisition returns a resource epoch. Reconnect creates a new epoch; every
  observation tied to the previous epoch is stale.
- Release closes admission, socket/session state, and any provider-owned work.
  Post-release commands must be refused.

Use current app/CLI discovery for health or bounded raw execution:

```bash
bun apps/cli/bin/run.js game --help
```

Only use command leaves present in that output, and ask the leaf for `--help`
before recording flags.

## Scripting States

Civ7 exposes named scripting states whose availability changes across main
menu, loading, game start, restart, and exit. Treat state inventory as runtime
evidence:

1. Discover states after acquisition.
2. Refresh after every game lifecycle transition or provider epoch change.
3. Execute a raw probe only in the named state that owns the inspected global.
4. Record the state and epoch with the result.

A successful state listing does not prove that gameplay globals are ready.
The controller owns native readiness facts inside Civ7. The host binding keeps
Tuner state and epoch evidence distinct from controller realm and boot identity.

## Raw Execution Boundary

Raw execution is a maintainer diagnostic. It may establish that one exact
global or native primitive exists in one state at one epoch. It does not prove:

- a gameplay request was lawful;
- an uncertain mutation was accepted;
- another scripting state exposes the same API;
- the CLI, Studio, or a mod should publish the primitive directly.

If a native primitive is needed by a product capability, add a closed typed
operation to the appropriate controller module, compile it into the controller
mod, and prove its admission, dispatch, and readback through the public client.
Actor-facing checks, no-repeat policy, and next-action meaning then belong to
Play.

An authorized, bounded maintainer recovery is still a diagnostic use. For full
application exit, the existing App UI `game exec` surface can invoke Civ's own
`engine.call("exitToDesktop")`; independently verify process exit afterward.
Follow [graceful-exit.md](graceful-exit.md) for restart selection, one-shot
dispatch, uncertain shutdown results and the private inspector alternative.
This is not a new product lifecycle API or a reason to extend frozen control
implementations.

## Runtime Evidence

For each probe record:

- qualified app/process identity;
- resource epoch and scripting state;
- command/request identity and input;
- raw disposition or typed controller result;
- pre-action log boundary and fresh matching lines;
- whether mutation may have occurred;
- required reconciliation before retry.

For MapGen, pair host-access/controller evidence with the exact MapGen-runs operation and
realization receipt. Fresh `Scripting.log` context creation, authored completion,
context destruction, and absence of a matching failure in the bounded window
are useful log facts. They do not by themselves prove surface parity or a
gameplay outcome.

## Native Primitive Discovery

When an actor-facing blocker lacks a public operation:

1. Find the official UI handler and the native game mutation it invokes.
2. Find the corresponding UI/display closeout or observation primitive.
3. Determine which scripting state owns each primitive.
4. Decide whether this is a native controller operation or actor-facing Play
   policy.
5. Add one closed typed operation at the correct owner, then expose it through
   play and the caller projection only when a concrete actor task requires it.
6. Prove the controller leaf's exact check, single dispatch, and same-evaluation
   readback. Then prove actor-facing postcondition, uncertainty, and no-repeat
   policy in Play rather than adding them to the native leaf.

Do not leave users with a raw script recipe as the permanent workflow for a
product or actor-facing capability. Keep bounded maintainer diagnostics
explicitly labeled and separate from those public operations.
