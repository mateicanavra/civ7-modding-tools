# Design

## Report Shape

`RunAttributionReport` contains:

- request id and run artifact id;
- launch source digest and envelope digest;
- generation manifest digest;
- generated mod digest and file summary;
- deployed snapshot digest and file summary;
- scripting-log observation;
- setup-row readback;
- bounded post-start loaded-game readback;
- terminal operation result.

The report is private and lives under the request workspace. It can be included
in copy-diagnostics output by explicit lookup.

## Completion Semantics

Attribution report status is `complete` when all required sections are present.
It is `incomplete` when a required section is absent. Required sections are
defined in `target-vocabulary.md`: source, manifest, generation, deployment,
scripting-log observation, setup-row readback, bounded post-start loaded-game
readback, and terminal result.

If the missing section belongs to a step required for launch success, the
operation also fails with that step's public failure category. Correlation
mismatch that shows the wrong artifact ran fails the operation. Runtime map
readback is excluded from this packet train.
