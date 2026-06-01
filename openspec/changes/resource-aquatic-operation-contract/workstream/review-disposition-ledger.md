# Review Disposition Ledger

| Finding | Severity | Disposition | Notes |
| --- | --- | --- | --- |
| Configurable coverage can hide missing aquatic resources | P1 | accepted, repaired, repair-cleared | Removed `requiredResourceTypes` from strategy config and made the canonical six-resource set strategy-owned. Added regression test rejecting config omission. Darwin repair review cleared the finding with no new P1/P2 issues. |
| Initial advisory agents did not return before closure | P2 | superseded | Curie and Boole were closed after a scoped Darwin post-implementation review plus repair review supplied the blocking review loop needed for this slice. |
