# Failure Patterns

Use this reference when a systematic workstream looks busy but is not
converging.

| Signal | Likely failure | Repair |
| --- | --- | --- |
| The corpus is described as "all the things" but no row ledger exists | skipped corpus gate | create the corpus ledger before strategy work |
| Current output defines the expected range | backfilled expectation | write the physical/domain baseline first, then compare output |
| Groups are green but individual entities disappear | group hides obligations | add per-entity rows for blocked, proxy, missing, and unverified cases |
| A resource example controls every section | seed-domain lock-in | rewrite around entities, actions, materialization surfaces, and proof roles |
| A brushing/stamping task cannot name a corpus | wrong corpus shape | define action/mutation/readback surfaces as the corpus |
| Stage promotion is assumed because the domain is important | fake architecture split | require artifacts, consumers, trace identity, and verification boundaries |
| Green OpenSpec validation is called behavior proof | proof inflation | relabel as OpenSpec-shape proof and run source/runtime gates as needed |
| Runtime proof cites old log lines | stale evidence | bound logs by timestamp/mtime after the action |
| FireTuner returned true but no MapGeneration log exists | command proof mistaken for runtime proof | record the response separately and continue to bounded runtime logs |
| Committed branch still says "ready to commit" | stale closure record | repair task and phase records before stacking new closure claims |
| Primary worktree dirty files are silently mixed in | ownership drift | isolate a worktree and protect unrelated paths |
| Review findings live only in chat | compaction risk | write a review-disposition ledger before moving on |

## Redesign Triggers

Redesign this skill if:

- future agents use it as generic project management;
- future agents cannot apply it to brushing, biomes, or terrain without
  rewriting resource terms;
- `SKILL.md` grows into a long process essay instead of a router;
- it duplicates `civ7-open-spec-workstream` rather than composing with it;
- proof-boundary mistakes continue after the closure matrix is followed.
