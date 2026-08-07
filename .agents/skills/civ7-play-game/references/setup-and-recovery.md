# Play Setup And Recovery

Use this when the live session is unavailable, not mutation-ready, not the
player's turn, blocked, or uncertain. Default posture: observe, reconcile, and
stop rather than guess.

## Readiness

Select the foundational readiness read through `game --help`. Interpret its
typed result rather than relying on a copied command name or readiness enum.

Proceed only when the fresh Play situation, grounded in controller facts,
reports:

- the Civ7 application and game are available for the requested observation;
- the session is playable;
- mutation is admitted for the current state;
- the observation is current for its controller realm/boot and host-access
  epoch.

If the game is at shell/setup/loading, unavailable, stale, partial, or
read-only, do not send a play request. Report the observed state and current
next action. The human owns launching/loading unless the user explicitly opens
a separate app-lifecycle task.

## Connection Failure

Separate three layers:

1. **App composition:** did the CLI app select/acquire the Tuner provider and
   bind the controller/Play clients for this command?
2. **Resource:** did the provider return a ready epoch or a typed acquisition,
   health, interruption, or release failure?
3. **Controller:** did the current realm/boot return the required native facts?
4. **Play:** did actor policy admit the current situation as playable and the
   requested mutation as lawful?

Use `civ7-operational-debugging` for layers 1-2. Repeatedly polling play will
not repair a missing provider or closed Civ7 process.

If the CLI itself cannot start, inspect the `civ7-cli` Nx project, its build
target, dependencies, and native help path. Do not assume a remembered global
link command.

## Waiting Through Other Turns

After turn completion:

1. Re-read the public play situation or use the current watch projection if it
   exists.
2. Resume only when the fresh situation says it is the actor's turn and exposes
   decisions or lawful turn completion.
3. If progress stalls, re-read the Play situation and underlying controller
   identity. A modal, age transition, loading state, lost realm/boot, or changed
   access epoch may require separate recovery.

Elapsed time and command completion do not prove the next turn is ready.

## Blocked Turn Completion

1. Run the current end-turn **check**, not another request.
2. Read every play-owned blocker and next-action descriptor.
3. Route blockers to the owning play module: attention/notifications,
   progression, city, diplomacy, planning, turn, or unit.
4. Resolve one blocker, then re-read the situation.
5. Request turn completion only after a fresh check admits it.

Do not repeatedly request turn completion against a known blocker.

## Refused Action

When play says no dispatch occurred:

1. Re-read the source situation/options.
2. Confirm every id, type, coordinate, and option came from that fresh read.
3. Re-run the named check.
4. Correct the input and retry at most once if the procedure says retry is
   lawful.
5. On a second refusal, stop and report the check/request envelopes.

## Uncertain Action

When dispatch may have occurred:

1. Preserve the operation/no-repeat identity.
2. Do not send again.
3. Follow play's returned reconciliation or next-action guidance.
4. Acquire fresh foundational facts through the play service's public
   dependency path.
5. Resume only when play classifies the outcome and makes repetition lawful.

An uncertain mutation is not the same as a refusal.

## Missing Named Action

If play can observe a lawful native operation but no actor-facing request exists:

1. stop the turn loop;
2. record the current situation, exact operation descriptor, and actor goal;
3. report the capability gap;
4. do not use raw execution or private control as a substitute.

## When To Stop

Stop and report when:

- status is not playable/mutation-capable;
- the controller realm/boot or host-access epoch changed during a decision;
- the same action is refused twice;
- dispatch is uncertain and reconciliation cannot close it;
- a high-impact decision requires human consultation;
- a modal or transition has no named play action;
- the requested target turn has been reached.

Report the current situation, last check/request, identities, evidence,
blocker, next action, and retry law.

## Launching Is Separate

Starting Civ7 or beginning/loading a game is an app/controller task, not normal
turn play. When explicitly requested, route it through the qualified app and
public controller game capability, with Tuner acquisition and process
lifetime owned by the app. Keep that workflow separate from actor-facing play.
