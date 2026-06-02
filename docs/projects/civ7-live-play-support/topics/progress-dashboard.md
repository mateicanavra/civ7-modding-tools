# Progress Dashboard

Status: `live-command-surface`.

## Frame

`game play progress-dashboard` is the compact reward, legacy, victory, and age
progress read for each turn. It exists so the play agent can keep score lanes in
view without opening raw `GameInfo` tables or inventing reward math.

The command is read-only. It does not choose research, civics, production,
policies, settlement targets, war targets, or victory strategy.

## Command

```bash
civ7 game play progress-dashboard --compact --json
```

Use plain JSON only when debugging raw path and milestone evidence:

```bash
civ7 game play progress-dashboard --json
```

## What It Reads

The live wrapper uses official runtime APIs exposed to App UI:

- `GameInfo.LegacyPaths` for current-age path definitions;
- `player.LegacyPaths.getScore(...)` for local path scores;
- `GameInfo.AgeProgressionMilestones` for thresholds;
- `Game.AgeProgressManager` for age progress, milestone completion, and
  historical legacy points;
- `GameInfo.Victories` for victory row context;
- `GameInfo.Triumphs` for runtime triumph rows when available.

The official victory progress UI imports a module-local `VictoryManager`.
Direct App UI eval does not currently expose that manager as a global, so this
command labels that proof boundary and uses the lower-level official APIs that
are available.

## Compact Contract

`--compact --json` returns:

- `summary`: one-line current-age score summary;
- `age`: age type, age progress points, percent, and end/final flags;
- `player`: inspected player/team and historical legacy points;
- `legacyPaths`: current-age class, score, final threshold, percent, and next
  milestone;
- `victories`: available runtime victory row count/classes;
- `triumphs`: runtime triumph row count and first rows if present;
- `warnings`: proof gaps such as module-local `VictoryManager` or empty triumph
  rows;
- `omitted`: raw milestone/victory row sections hidden from compact output;
- `proof`: exact runtime source family used.

## Norm

Run this once per turn or before a multi-turn planning note:

```bash
civ7 game play progress-dashboard --compact --json
civ7 game play priorities --compact --json
```

Use it to decide what to inspect next, not what to mutate. A useful follow-up is
specific and verifiable, such as:

- read settlement recommendations before pursuing an expansion-scoring path;
- inspect ready-city production before chasing a military tempo target;
- inspect tech/culture options before assuming a science or culture milestone is
  reachable.

Empty `GameInfo.Triumphs` means no runtime triumph rows were available from this
read. It does not prove that reward systems are absent from other tables,
events, progression data, or metaprogression resources.

## Proof Boundary

This command proves local-player runtime progress and static runtime row context.
It does not prove rival rankings unless a future relationship-safe public
rankings surface is added, and it does not prove hidden rewards, operation
legality, city yields, or production ETA.
