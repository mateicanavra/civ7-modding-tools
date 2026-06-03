# RHQ Reference

This reference records what the local RHQ mod appears to do and how it should
be used by the intelligence-layer workstream. It is evidence for the static AI
profile surface, not the solution architecture itself.

## Local Location

```text
/Users/mateicanavra/Library/Application Support/Civilization VII/Mods/civmods-rhq-39525
```

The active manifest is `ai.modinfo`. In this local copy, `modinfo.xml` and
`ui/change_banner.js` are zero-byte files.

## Manifest Shape

RHQ declares saved-game impact, depends on base plus all three ages, and uses
age criteria for Antiquity, Exploration, and Modern action groups.

Loaded files observed from the active manifest:

| Load group | Files |
| --- | --- |
| Always, order 0 | `modules/behaviortrees/ai_trees.xml` |
| Always, order 1 | `modules/data/art_intelligence_core.sql`, `modules/ops/all_ops.sql`, `modules/diplomacy/all_diplomacy.sql`, `modules/settlers/all_settlers.sql` |
| Always, order 2 | `modules/vict/all_vict.sql` |
| Antiquity, order 3 | `modules/settlers/ant_settlers.sql`, `modules/ops/ant_ops.sql`, `modules/tactical/ant_tactical.sql` |
| Exploration, order 4 | `modules/tactical/exploration_tactical.sql`, `modules/vict/exploration_vict.sql`, `modules/vict/sovereign_and_above/exploration_vict_sovereign_plus.sql`, `modules/ops/exploration_ops.sql` |
| Modern, order 5 | `modules/vict/modern_vict.sql`, `modules/vict/sovereign_and_above/modern_vict_sovereign_plus.sql`, `modules/ops/modern_ops.sql` |

Present but not loaded by this manifest:

- `modules/data/city_strategies.sql`
- `modules/behaviortrees/ant_ai_trees.xml`
- `modules/vict/ant_vict.sql`
- `modules/vict/sovereign_and_above/ant_vict_sovereign_plus.sql`

`Mods.sqlite` matched the registered action items and did not show those
inactive files as loaded action items.

## Lever Map

| Area | Files | Shape | Time scale |
| --- | --- | --- | --- |
| Core profile/biases | `art_intelligence_core.sql` | `AiLists`, `AiListTypes`, `AiFavoredItems`, `TypeTags` | Load-time |
| Behavior trees | `ai_trees.xml` | `BehaviorTrees`, `BehaviorTreeNodes`, `TreeData` | Load-time |
| Operations | `all_ops.sql`, `ant_ops.sql`, age ops | `AiOperationDefs`, `AiOperationTeams`, `AllowedOperations`, `OpTeamRequirements`, `AiUnitEfficiencyBonuses` | Static, age-bound |
| Diplomacy | `all_diplomacy.sql` | `AiListTypes`, `AiLists`, `AiFavoredItems`, `PseudoYields` | Load-time |
| Settlement | `all_settlers.sql`, `ant_settlers.sql` | `AiFavoredItems`, `PlotEvalConditions` | Static rows, native rescoring |
| Tactical priorities | `ant_tactical.sql`, `exploration_tactical.sql` | Default tactical list replacement | Age-bound |
| Victory/legacy | `all_vict.sql`, exploration/modern victory files | `Strategies`, `StrategyConditions`, `Strategy_Priorities`, `AiFavoredItems`, `PseudoYields`, `LeaderCivPriorities` | Static, age-bound |
| Script/runtime | `ui/change_banner.js` | zero-byte script | No active runtime bridge |

## Behavior Tree Findings

Loaded `ai_trees.xml` inserts `Naval Superiority Tree v2` and
`Simple City Defense v2`, with `BehaviorTreeNodes` and `TreeData` for both.

The active loaded files do not clearly wire those new trees into an operation.
The only local source assigning `Naval Superiority Tree v2` to an operation was
found in unloaded `ant_ai_trees.xml`. No active RHQ module was found inserting
`TriggeredBehaviorTrees`.

This matters because RHQ proves behavior-tree authoring syntax, but this local
copy does not prove that those new trees affect active native AI behavior.

## What RHQ Actually Is

RHQ is mostly a static native-AI profile overhaul. It is not a live controller:

- no active runtime JavaScript bridge;
- no external message reader;
- no direct-control integration;
- no proven live AI mutation surface.

Reusable patterns:

- small `AiFavoredItems` list attachments;
- operation team and operation limit tuning;
- settlement scoring tweaks;
- strategy condition rewrites;
- behavior-tree authoring syntax as load-time data;
- age-specific tactical/victory/operation changes.

Patterns to avoid copying wholesale:

- broad deletes and reinserts of default lists;
- very large global war/diplomacy values without isolated measurement;
- unscoped replacement of operation requirements;
- inactive source files treated as active evidence;
- difficulty gating inferred only from filenames;
- any assumption that RHQ behavior-tree additions are active without loaded-row
  and behavior proof.

## Product Use

Treat RHQ as a recipe library:

1. Map each RHQ delta to an official AI lever family.
2. Reduce a broad change into the smallest measurable recipe.
3. Add an intent label and expected metric.
4. Generate an equivalent compiler recipe.
5. Verify loaded rows.
6. Run fixed-seed A/B comparison.
7. Promote only recipes that produce interpretable behavior or outcome deltas.

Do not fork RHQ first. Import from it only after mapping and measurement.

## Public Sources

- [RHQ CivFanatics resource](https://forums.civfanatics.com/resources/rhq-artificially-intelligent-ai-mod.31881/)
- [RHQ CivFanatics thread](https://forums.civfanatics.com/threads/rhq-artificially-intelligent-ai-mod.695214/)
- [CivMods RHQ install page](https://civmods.com/install?modId=g4j7p6n66683m8c)
