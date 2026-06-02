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
is one complete technology selection workflow: it starts the selected research
node and clears the temporary chooser target behind the scenes. Use
`game play set-tech-target` directly only when the full tree UI should
deliberately target a later node or when diagnostics prove the primary chooser
operation already applied. Culture still accepts `--closeout` for the same
two-operation chooser workflow until it receives the same default-send contract.

For technology blockers, read `game play choose-tech --options --json` before
sending if the node id is not already proven. For culture blockers, read
`game play choose-culture --options --json` first for the same reason. The tech
surface is populated from `GameInfo.ProgressionTrees`,
`Game.ProgressionTrees`, and official `PlayerOperations.canStart` checks; the
culture surface is populated from the official
`Players.Culture.getAllAvailableNodeTypes()` chooser list plus the same
validator checks. Enabled technology options include ready-to-send `--send`
templates; disabled options are evidence, not safe sends.

For chooser notifications, the complete workflow mirrors the official chooser
screens: send the chosen `SET_*_TREE_NODE`, then clear the temporary chooser
target with `SET_*_TREE_TARGET_NODE { ProgressionTreeNodeType: NO_NODE }`.
Culture closeout runs this through the App UI owner route: activate the current
`NOTIFICATION_CHOOSE_CULTURE_NODE` when present, send the node choice, then
clear the temporary chooser target. That sequence is necessary but not proof by
itself. The caller command must re-read the live notification state and report
whether the blocker cleared, changed, unblocked the turn, or remained live after
state changed. Use `game play set-tech-target` or
`game play set-culture-target` only when the full tree should deliberately
target a later node or when diagnostics already prove the primary chooser state
was applied.

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
- `.civ7/outputs/resources/Base/modules/base-standard/ui/tech-tree-chooser/screen-tech-tree-chooser.js`
  clears the target with `SET_TECH_TREE_TARGET_NODE { ProgressionTreeNodeType:
  NO_NODE }` after chooser selection; live enum probe: `NO_NODE = -1`.
- `.civ7/outputs/resources/Base/modules/base-standard/ui/culture-tree-chooser/screen-culture-tree-chooser.js`
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
that blocker, so the active closeout route now follows the official App UI
culture chooser owner instead of treating a raw operation send as enough. The
durable lesson is not that every culture choice needs repeated sends; it is that
target-node closeout is an official path, and the CLI must still verify the
blocker postcondition before calling the workflow successful.

## CLI Use

Start current culture research and close the matching chooser surface as
one caller-level workflow:

```bash
civ7 game play choose-culture \
  --player-id 0 \
  --node -1677668973 \
  --send \
  --closeout \
  --reason "choose live culture node and set matching target" \
  --json
```

The JSON result includes `operationSent` and a `postcondition` when sent with
`--closeout`. `operationSent:true` means the App UI route returned successful
operation-send evidence; it is not proof that the culture blocker cleared.
Treat `culture-choice-sticky-blocker` and
`culture-state-changed-blocker-still-live` as stop-and-diagnose outcomes, not as
reasons to repeat `choose-culture` or `set-culture-target` blindly.

Set only the culture target when the primary choice was already applied:

```bash
civ7 game play set-culture-target \
  --player-id 0 \
  --node -1677668973 \
  --send \
  --reason "set culture target from live tree node hash" \
  --json
```

The same distinction applies to technology with `game play choose-tech --send`
for the complete chooser workflow and `game play set-tech-target` for deliberate
full-tree target planning.
