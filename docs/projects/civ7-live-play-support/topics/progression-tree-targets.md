# Progression Tree Targets

Status: `active-reference`.

## Frame

Technology and culture blockers use runtime `ProgressionTreeNodeType` values.
Agents must use the node type hash from the live GameInfo/progression-tree data,
not a visible row index, UI list position, or notification id.

There are two related operation families:

- Start current research:
  - `SET_TECH_TREE_NODE { ProgressionTreeNodeType }`
  - `SET_CULTURE_TREE_NODE { ProgressionTreeNodeType }`
- Set a full-tree target:
  - `SET_TECH_TREE_TARGET_NODE { ProgressionTreeNodeType }`
  - `SET_CULTURE_TREE_TARGET_NODE { ProgressionTreeNodeType }`

Use `game play choose-tech` and `game play choose-culture` first when the live
chooser is asking for the next current node. `game play choose-tech --send`
asks the control service for one complete technology selection workflow: start
the selected research node, clear the temporary chooser target with the runtime
`NO_NODE`, and observe the resulting progression and blocker state. Culture
uses the same service-owned workflow. Tree commands do not expose
`--closeout`; use `game play set-tech-target` or
`game play set-culture-target` only to deliberately plan a full-tree target,
not as a manual chooser closeout.

For technology blockers, read `game play choose-tech --options --json` before
sending if the node id is not already proven. For culture blockers, read
`game play choose-culture --options --json` first for the same reason. The tech
and culture option surfaces are read-only service projections of the ambient
local player's live chooser evidence. With `--node` and no `--send`, each
command calls the corresponding service `check`; with `--send`, it calls the
service `request`, whose fresh admission is authoritative for mutation.

For a new chooser selection, the service sends the chosen
`SET_*_TREE_NODE`, obtains fresh state, then unconditionally dispatches
`SET_*_TREE_TARGET_NODE { ProgressionTreeNodeType: NO_NODE }`. If the current
node is already selected but its temporary target is still pending, the service
resumes at the clear without repeating the choice. It then performs bounded
progression and blocker observation and returns a semantic postcondition.

A full-tree target request has a different sequence. The service checks the
requested `SET_*_TREE_TARGET_NODE` first, optionally performs the same-node
`SET_*_TREE_NODE` choice, rechecks the target against fresh state, and only
then sends the target. The service also owns bounded target observation,
semantic classification, and no-repeat behavior.

At every layer, raw `sent` evidence means dispatch, not confirmation. Callers
must use the service result's `postcondition.classification`,
`postcondition.confidence`, and `postcondition.confirmed`; an unverified result
with a `do-not-repeat` next step must not be retried blindly. The CLI owns
neither chooser-notification activation nor postcondition verification.

## Official UI Evidence

The tech and culture full-tree screens share the same pattern:

1. Build `args = { ProgressionTreeNodeType: nodeIndex }`.
2. Probe `SET_*_TREE_NODE`.
3. If the local player already has a target, route to `onTarget*listItem`.
4. Probe `SET_*_TREE_TARGET_NODE`.
5. If `SET_*_TREE_NODE` also validates, send it first.
6. Send `SET_*_TREE_TARGET_NODE`.

Local anchors:

- `.civ7/outputs/resources/Base/modules/base-standard/ui/tech-tree/screen-tech-tree.js`
  uses `SET_TECH_TREE_NODE` and `SET_TECH_TREE_TARGET_NODE`.
- `.civ7/outputs/resources/Base/modules/base-standard/ui/culture-tree/screen-culture-tree.js`
  uses `SET_CULTURE_TREE_NODE` and `SET_CULTURE_TREE_TARGET_NODE`.
- `.civ7/outputs/resources/Base/modules/base-standard/ui-next/screens/choosers/tech-chooser/tech-chooser.js`
  clears the target with `SET_TECH_TREE_TARGET_NODE { ProgressionTreeNodeType:
  NO_NODE }` after chooser selection; live enum probe: `NO_NODE = -1`.
- `.civ7/outputs/resources/Base/modules/base-standard/ui-next/screens/choosers/culture-chooser/culture-chooser.js`
  clears the target with `SET_CULTURE_TREE_TARGET_NODE { ProgressionTreeNodeType:
  NO_NODE }` after chooser selection.

## Live Proof

The active play thread hit a turn-58 culture blocker where row index `224`
validated but did not advance the turn. The blocker cleared only after using
the actual runtime node hash:

```json
{ "ProgressionTreeNodeType": -1677668973 }
```

Both `SET_CULTURE_TREE_NODE` and `SET_CULTURE_TREE_TARGET_NODE` validated for
that value, and the turn advanced afterward. A later turn-23 culture blocker
proved the complementary boundary: the two-step culture sequence can return
from the runtime while `NOTIFICATION_CHOOSE_CULTURE_NODE` remains
end-turn-blocking. A generic expired-notification dismissal also failed to clear
that blocker. The durable lesson is not that every culture choice needs UI
activation or repeated sends; target-node clear is the native chooser path,
while fresh blocker observation is separate evidence the service must retain
before calling the workflow successful.

The same owner boundary appeared immediately afterward for technology on turn
23: `SET_TECH_TREE_NODE` changed current research to Writing while
`NOTIFICATION_CHOOSE_TECH` stayed end-turn-blocking. The current service uses
the exact native choice and target-clear atoms, then treats
`technology-state-changed-blocker-still-live` as an unverified
stop-and-diagnose result rather than activating or dismissing the UI surface.

## CLI Use

Start current culture research and close the matching chooser surface as
one caller-level workflow:

```bash
civ7 game play choose-culture --options --json

civ7 game play choose-culture \
  --node -1677668973 \
  --json

civ7 game play choose-culture \
  --node -1677668973 \
  --send \
  --json
```

These modes call the service's `options`, `check`, and `request` procedures,
respectively. The JSON result includes service-owned semantic status,
postcondition, and next steps. A sent status records dispatch; only a confirmed
postcondition proves the culture choice and target clear. Treat
`culture-state-changed-blocker-still-live`,
`choice-selected-target-clear-unverified`, `no-state-change`, and
`missing-postcondition` as stop-and-diagnose outcomes, not as reasons to repeat
the request blindly.

Request a deliberate culture full-tree target:

```bash
civ7 game play set-culture-target \
  --node -1677668973 \
  --send \
  --json
```

Omit `--send` to call the service target `check`. With `--send`, the service
validates the target first, optionally performs the same-node choice,
revalidates the target, sends it, and observes the target postcondition. The
same distinction applies to technology with `game play choose-tech` for the
chooser workflow and `game play set-tech-target` for deliberate full-tree
planning. All paths use the ambient local player; there is no caller-owned
player id.
